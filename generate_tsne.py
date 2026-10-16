"""
generate_tsne.py
----------------
Fast standalone t-SNE plot generator.

Reads outputs/metrics/cluster_summary.csv, generates synthetic customer
samples around each cluster centroid (no TensorFlow / no data download
required), runs scikit-learn TSNE, and saves a publication-quality dark-
themed scatter plot to outputs/plots/embedding_tsne.png.
"""

from __future__ import annotations

import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")          # headless – no display needed

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import pandas as pd
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler

# ── Paths ─────────────────────────────────────────────────────────────────
ROOT          = Path(__file__).resolve().parent
CLUSTER_CSV   = ROOT / "outputs" / "metrics" / "cluster_summary.csv"
PLOT_DIR      = ROOT / "outputs" / "plots"
OUT_PNG       = PLOT_DIR / "embedding_tsne.png"

# ── Brand palette (matches frontend CSS) ─────────────────────────────────
PALETTE = ["#00e5c7", "#6ea8ff", "#ff6b6b", "#ffc86a", "#b07fff"]

FEATURE_COLS  = ["Recency", "Frequency", "MonetaryValue",
                 "TotalQuantity", "AvgUnitPrice"]

SAMPLES_PER_CLUSTER = 180   # synthetic points per cluster
NOISE_SCALE         = 0.18  # relative noise (fraction of std)
TSNE_PERPLEXITY     = 40
RANDOM_STATE        = 42


def load_cluster_summary() -> pd.DataFrame:
    if not CLUSTER_CSV.exists():
        print(f"[ERROR] cluster_summary.csv not found at:\n  {CLUSTER_CSV}")
        sys.exit(1)
    df = pd.read_csv(CLUSTER_CSV)
    missing = [c for c in FEATURE_COLS if c not in df.columns]
    if missing:
        print(f"[ERROR] Missing columns in CSV: {missing}")
        sys.exit(1)
    return df


def generate_synthetic_points(summary: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
    """Create Gaussian samples around each cluster centroid."""
    rng    = np.random.default_rng(RANDOM_STATE)
    points = []
    labels = []

    # Global std across all cluster means → scale noise
    all_means = summary[FEATURE_COLS].values.astype(float)
    global_std = all_means.std(axis=0).clip(min=1e-6)

    for _, row in summary.iterrows():
        centroid = row[FEATURE_COLS].values.astype(float)
        noise    = rng.normal(
            loc=0.0,
            scale=global_std * NOISE_SCALE,
            size=(SAMPLES_PER_CLUSTER, len(FEATURE_COLS)),
        )
        cluster_points = centroid + noise
        points.append(cluster_points)
        labels.extend([int(row["Cluster"])] * SAMPLES_PER_CLUSTER)

    return np.vstack(points), np.array(labels)


def run_tsne(points: np.ndarray) -> np.ndarray:
    scaler = StandardScaler()
    scaled = scaler.fit_transform(points)

    n_samples     = len(scaled)
    perplexity    = min(TSNE_PERPLEXITY, n_samples // 4)
    perplexity    = max(5, perplexity)

    print(f"[INFO] Running t-SNE on {n_samples} points "
          f"(perplexity={perplexity}) …")

    tsne = TSNE(
        n_components=2,
        perplexity=perplexity,
        n_iter=1000,
        random_state=RANDOM_STATE,
        init="pca",
        learning_rate="auto",
    )
    return tsne.fit_transform(scaled)


def make_segment_name(cluster_id: int, summary: pd.DataFrame) -> str:
    """Derive a short readable name from the cluster's RFM centroid."""
    row = summary[summary["Cluster"] == cluster_id]
    if row.empty:
        return f"Cluster {cluster_id}"

    recency  = float(row["Recency"].iloc[0])
    freq     = float(row["Frequency"].iloc[0])
    monetary = float(row["MonetaryValue"].iloc[0])

    if recency < 60 and freq > 4 and monetary > 7:
        return "Premium"
    if recency < 100 and freq > 3:
        return "Regular"
    if recency > 180:
        return "Dormant"
    if monetary > 7:
        return "High-Value"
    return f"Segment {cluster_id}"


def save_plot(
    reduced: np.ndarray,
    labels: np.ndarray,
    summary: pd.DataFrame,
) -> None:
    unique_clusters = sorted(set(labels))
    n_clusters      = len(unique_clusters)

    # ── Figure ────────────────────────────────────────────────────────────
    fig, ax = plt.subplots(figsize=(12, 8))
    fig.patch.set_facecolor("#060810")
    ax.set_facecolor("#0c0f18")

    # Subtle grid
    ax.grid(color="#ffffff", linewidth=0.3, alpha=0.07, zorder=0)
    ax.set_axisbelow(True)

    # ── Scatter per cluster ───────────────────────────────────────────────
    legend_patches = []
    for cluster_id in unique_clusters:
        mask  = labels == cluster_id
        color = PALETTE[cluster_id % len(PALETTE)]
        name  = make_segment_name(cluster_id, summary)

        # Glow layer (large, very transparent)
        ax.scatter(
            reduced[mask, 0], reduced[mask, 1],
            c=color, s=120, alpha=0.06, zorder=1,
        )
        # Main dots
        ax.scatter(
            reduced[mask, 0], reduced[mask, 1],
            c=color, s=28, alpha=0.72, edgecolors="none",
            zorder=2, label=f"Cluster {cluster_id}: {name}",
        )
        # Centroid marker
        cx, cy = reduced[mask, 0].mean(), reduced[mask, 1].mean()
        ax.scatter(
            cx, cy,
            c=color, s=220, marker="*", edgecolors="#060810",
            linewidths=1.2, zorder=4,
        )

        legend_patches.append(
            mpatches.Patch(color=color, label=f"Cluster {cluster_id}: {name}")
        )

    # ── Labels & title ────────────────────────────────────────────────────
    ax.set_title(
        "t-SNE Visualization · Learned Customer Space",
        color="#f0f4ff", fontsize=14, fontweight="bold",
        pad=16, loc="left",
    )
    ax.set_xlabel("t-SNE Component 1", color="#7888a8", fontsize=11)
    ax.set_ylabel("t-SNE Component 2", color="#7888a8", fontsize=11)
    ax.tick_params(colors="#7888a8", labelsize=9)
    for spine in ax.spines.values():
        spine.set_edgecolor("#1e2434")

    # ── Legend ────────────────────────────────────────────────────────────
    legend = ax.legend(
        handles=legend_patches,
        loc="upper right",
        frameon=True,
        framealpha=0.65,
        facecolor="#0c0f18",
        edgecolor="#1e2434",
        labelcolor="#c8d4f0",
        fontsize=10,
        markerscale=1.2,
    )

    # ── Annotation ───────────────────────────────────────────────────────
    ax.annotate(
        f"{n_clusters} clusters · {len(labels)} synthetic customer samples · t-SNE perplexity={min(TSNE_PERPLEXITY, len(labels)//4)}",
        xy=(0.01, 0.01), xycoords="axes fraction",
        color="#4a5568", fontsize=8,
    )

    plt.tight_layout()
    PLOT_DIR.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUT_PNG, dpi=150, bbox_inches="tight",
                facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"[OK] Plot saved → {OUT_PNG}")


def main() -> None:
    print("[INFO] Loading cluster summary …")
    summary = load_cluster_summary()
    print(f"       {len(summary)} clusters found: {summary['Cluster'].tolist()}")

    print("[INFO] Generating synthetic customer distribution …")
    points, labels = generate_synthetic_points(summary)

    reduced = run_tsne(points)
    save_plot(reduced, labels, summary)


if __name__ == "__main__":
    main()
