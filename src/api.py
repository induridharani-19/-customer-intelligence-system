from __future__ import annotations

import os
from pathlib import Path
from typing import Annotated

import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from src.hierarchy.label_generator import generate_cluster_labels
from src.recommendation.recommender import generate_customer_recommendation

ROOT_DIR = Path(__file__).resolve().parents[1]
FRONTEND_DIR = ROOT_DIR / "frontend-app" / "dist"
METRICS_DIR = ROOT_DIR / "outputs" / "metrics"
PLOTS_DIR = ROOT_DIR / "outputs" / "plots"
MODELS_DIR = ROOT_DIR / "outputs" / "models"

FEATURE_NAMES = [
    "Recency",
    "Frequency",
    "MonetaryValue",
    "TotalQuantity",
    "AvgUnitPrice",
]


class CustomerFeatures(BaseModel):
    recency: Annotated[float, Field(ge=0, le=500)]
    frequency: Annotated[float, Field(ge=0, le=10)]
    monetary_value: Annotated[float, Field(ge=0, le=15)]
    total_quantity: Annotated[float, Field(ge=0, le=15)]
    avg_unit_price: Annotated[float, Field(ge=0, le=3000)]


class PredictionResponse(BaseModel):
    cluster_id: int
    cluster_name: str
    summary: str
    business_action: str
    probabilities: list[list[float]]
    model_status: str


app = FastAPI(
    title="Customer Intelligence System",
    description=(
        "FastAPI service for customer segmentation analytics and recommendations."
    ),
    version="0.2.0",
)

def get_cors_origins() -> list[str]:
    """Return the frontend origins allowed to call this API.

    Render receives the production value through ``CORS_ORIGINS``.  Keeping
    localhost defaults makes local development work without an env file while
    avoiding a wildcard origin when credentials are enabled.
    """
    configured_origins = os.getenv("CORS_ORIGINS", "")
    origins = [
        origin.strip().rstrip("/")
        for origin in configured_origins.split(",")
        if origin.strip()
    ]
    return origins or ["http://localhost:5173", "http://127.0.0.1:5173"]


# The deployed Vercel URL is supplied through CORS_ORIGINS on Render.
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve built React frontend (production)
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")


def read_cluster_summary() -> list[dict]:
    path = METRICS_DIR / "cluster_summary.csv"
    if not path.exists():
        return []

    try:
        df = pd.read_csv(path)
    except (OSError, pd.errors.ParserError):
        return []

    required_columns = {"Cluster", *FEATURE_NAMES}
    if not required_columns.issubset(df.columns):
        return []

    labels = generate_cluster_labels()
    records = []
    for record in df.to_dict(orient="records"):
        cluster_id = int(record["Cluster"])
        cluster_name = labels.get(cluster_id, f"Emerging Segment {cluster_id}")
        recommendation = generate_customer_recommendation(cluster_name)
        record["Cluster"] = cluster_id
        record["ClusterName"] = cluster_name
        record["Summary"] = recommendation["summary"]
        record["BusinessAction"] = recommendation["business_action"]
        records.append(record)

    return records


def read_kmeans_metrics() -> list[dict]:
    path = METRICS_DIR / "kmeans_metrics.csv"
    if not path.exists():
        return []

    try:
        df = pd.read_csv(path)
    except (OSError, pd.errors.ParserError):
        return []

    required_columns = {"K", "Inertia", "SilhouetteScore"}
    if not required_columns.issubset(df.columns):
        return []

    return df.to_dict(orient="records")


def has_trained_model() -> bool:
    return (
        (MODELS_DIR / "customer_segment_nn.keras").exists()
        and (MODELS_DIR / "scaler.pkl").exists()
    )


def fallback_prediction(features: list[float]) -> dict:
    recency, frequency, monetary_value, total_quantity, avg_unit_price = features
    scores = {
        0: (1 / (1 + recency / 90)) + frequency * 0.12 + monetary_value * 0.08,
        1: frequency * 0.28 + monetary_value * 0.34 + total_quantity * 0.2,
        2: monetary_value * 0.22 + total_quantity * 0.08 + avg_unit_price / 250,
        3: recency * 0.02 + max(0, 2.5 - frequency) + max(0, 5 - monetary_value) * 0.2,
    }

    labels = generate_cluster_labels()
    total = sum(scores.values()) or 1
    probabilities = [[scores[i] / total for i in range(4)]]
    cluster_id = max(scores, key=scores.get)
    cluster_name = labels.get(cluster_id, f"Emerging Segment {cluster_id}")
    recommendation = generate_customer_recommendation(cluster_name)

    return {
        "cluster_id": cluster_id,
        "cluster_name": cluster_name,
        "summary": recommendation["summary"],
        "business_action": recommendation["business_action"],
        "probabilities": probabilities,
        "model_status": "heuristic fallback",
    }


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    index_path = FRONTEND_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Frontend not built. Run: cd frontend-app && npm run build"
        )
    return FileResponse(str(index_path))


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ready",
        "prediction_mode": (
            "trained neural model" if has_trained_model() else "heuristic fallback"
        ),
        "segments_available": bool(read_cluster_summary()),
        "metrics_available": bool(read_kmeans_metrics()),
    }


@app.get("/api/segments")
def segments() -> dict:
    return {"segments": read_cluster_summary()}


@app.get("/api/metrics")
def metrics() -> dict:
    return {"kmeans": read_kmeans_metrics()}


@app.get("/api/dashboard")
def dashboard() -> dict:
    segments_data = read_cluster_summary()
    metrics_data = read_kmeans_metrics()
    best_metric = None
    if metrics_data:
        best_metric = max(
            metrics_data,
            key=lambda item: float(item.get("SilhouetteScore", 0)),
        )

    return {
        "segments": segments_data,
        "kmeans": metrics_data,
        "best_k": best_metric,
        "artifacts": {
            "embedding_tsne": (PLOTS_DIR / "embedding_tsne.png").exists(),
            "trained_model": has_trained_model(),
        },
    }


@app.get("/api/plots/{plot_name}", include_in_schema=False)
def plot(plot_name: str) -> FileResponse:
    safe_name = Path(plot_name).name
    path = PLOTS_DIR / safe_name
    allowed_extensions = {".png", ".jpg", ".jpeg", ".webp"}
    if not path.exists() or path.suffix.lower() not in allowed_extensions:
        raise HTTPException(status_code=404, detail="Plot not found.")
    return FileResponse(str(path))


@app.post("/api/predict", response_model=PredictionResponse)
def predict(features: CustomerFeatures) -> PredictionResponse:
    ordered_features = [
        features.recency,
        features.frequency,
        features.monetary_value,
        features.total_quantity,
        features.avg_unit_price,
    ]

    if has_trained_model():
        try:
            from src.models.predict import predict_customer_segment
            prediction = predict_customer_segment(ordered_features)
            prediction["model_status"] = "trained neural model"
        except Exception:
            prediction = fallback_prediction(ordered_features)
    else:
        prediction = fallback_prediction(ordered_features)

    return PredictionResponse(**prediction)


@app.get("/api/example")
def example(
    segment: Annotated[int, Query(ge=0, le=10)] = 1
) -> dict:
    summaries = read_cluster_summary()
    selected = next((item for item in summaries if item["Cluster"] == segment), None)
    if selected is None and summaries:
        selected = summaries[0]
    if selected is None:
        return {
            "recency": 34.6,
            "frequency": 4.9,
            "monetary_value": 7.8,
            "total_quantity": 7.3,
            "avg_unit_price": 3.5,
        }

    return {
        "recency": round(float(selected["Recency"]), 2),
        "frequency": round(float(selected["Frequency"]), 2),
        "monetary_value": round(float(selected["MonetaryValue"]), 2),
        "total_quantity": round(float(selected["TotalQuantity"]), 2),
        "avg_unit_price": round(float(selected["AvgUnitPrice"]), 2),
    }
