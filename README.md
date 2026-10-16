# 🧠 Customer Intelligence System

<div align="center">

![Customer Intelligence System](https://img.shields.io/badge/AI-Customer%20Intelligence-blueviolet?style=for-the-badge&logo=brain&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)

**An end-to-end AI-powered customer segmentation & analytics platform combining K-Means clustering, neural networks, RFM feature engineering, and a real-time React dashboard.**

[🚀 Live Demo](#) • [📖 API Docs](#api-endpoints) • [🛠 Deploy Guide](#-deployment)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Customer Segmentation** | K-Means clustering with RFM-style feature engineering |
| 🧬 **Neural Network Prediction** | TensorFlow model for real-time segment prediction |
| 📊 **Analytics Dashboard** | React + Recharts with live segment metrics & visualizations |
| 🎯 **Prediction Studio** | Interactive tool to predict customer segment from input features |
| 💡 **Smart Recommendations** | Business-action recommendations per customer segment |
| 🔄 **Heuristic Fallback** | Fully functional without trained model artifacts |
| 🌐 **REST API** | FastAPI with OpenAPI docs, health checks, and CORS support |
| 🔐 **Auth Flow** | Login, Register, Forgot Password pages |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                    GitHub (main)                 │
│         Triggers auto-deploy on push             │
└───────────────┬─────────────────┬───────────────┘
                │                 │
                ▼                 ▼
   ┌────────────────────┐  ┌─────────────────────┐
   │    Vercel          │  │     Render           │
   │  React + Vite SPA  │  │  FastAPI + Uvicorn   │
   │  frontend-app/dist │  │  src/api.py          │
   │  VITE_API_URL=...  │  │  /api/health etc.    │
   └────────────────────┘  └─────────────────────┘
```

| Layer | Service | Tech |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | React 19, Vite, TypeScript, TailwindCSS |
| **Backend API** | [Render](https://render.com) | FastAPI, Uvicorn, Pandas |
| **ML Pipeline** | Local / CI | Python, scikit-learn, TensorFlow |
| **Source & CI** | GitHub | Git, GitHub Actions |

---

## 📁 Project Structure

```
customer-intelligence-system/
├── frontend-app/                  # ⚡ React + Vite dashboard
│   ├── src/
│   │   ├── pages/                 # Dashboard, Segments, Prediction, etc.
│   │   ├── components/            # Reusable UI components
│   │   ├── services/              # API service clients
│   │   ├── store/                 # Zustand state management
│   │   └── contexts/              # Theme, Auth contexts
│   ├── .env.example               # Frontend env template
│   └── vercel.json                # Vercel SPA routing
├── frontend/                      # Static HTML/CSS/JS version
├── src/                           # 🐍 Python backend
│   ├── api.py                     # FastAPI application
│   ├── clustering/                # K-Means & embedding clustering
│   ├── data/                      # Feature engineering & preprocessing
│   ├── hierarchy/                 # Cluster label generation
│   ├── models/                    # NN training & prediction
│   ├── pipeline/                  # End-to-end ML pipeline
│   ├── recommendation/            # Business-action recommender
│   └── utils/                     # Config, logger, seed
├── configs/                       # Pipeline YAML config
├── tests/                         # Pytest test suite
├── requirements.txt               # Full ML environment
├── requirements-api.txt           # Lean API-only dependencies
├── render.yaml                    # Render Blueprint config
├── vercel.json                    # Vercel build config
└── pyproject.toml                 # Python project metadata
```

---

## 🖥 Local Development

### Prerequisites

- **Python** 3.11+
- **Node.js** 20+ and npm
- **Git**

### 1. Clone the repository

```bash
git clone https://github.com/induridharani-19/-customer-intelligence-system.git
cd -customer-intelligence-system
```

### 2. Set up the Python backend

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate (macOS/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Start the API server

```bash
uvicorn src.api:app --reload --port 8000
```

API will be at: **http://127.0.0.1:8000**  
Interactive docs: **http://127.0.0.1:8000/docs**

### 4. Set up the React frontend

```bash
cd frontend-app

# Windows PowerShell
Copy-Item .env.example .env.local

# macOS/Linux
cp .env.example .env.local

# Edit .env.local and set:
# VITE_API_URL=http://127.0.0.1:8000

npm ci
npm run dev
```

Frontend will be at: **http://127.0.0.1:5173**

### 5. (Optional) Run the ML pipeline

```bash
# From project root, after full pip install
python -m src.pipeline.main_pipeline
```

This generates model artifacts, metrics CSVs, and plots into `outputs/` and `data/`.

---

## 🚀 Deployment

This project deploys using two free-tier cloud services:
- **Render** → hosts the Python FastAPI backend
- **Vercel** → hosts the React frontend

> **Important order**: Deploy backend first, then frontend.

---

## 🟢 Deploy Backend to Render

### Option A — Blueprint (Recommended, 1-click)

1. Push this repository to GitHub (if not done yet).
2. Sign in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Connect your GitHub account and select the repository `induridharani-19/-customer-intelligence-system`.
5. Select branch: **main**.
6. Render auto-detects `render.yaml`. Confirm the following settings:

   | Setting | Value |
   |---|---|
   | **Service Name** | `customer-intelligence-api` |
   | **Runtime** | Python |
   | **Region** | Singapore |
   | **Build Command** | `pip install -r requirements-api.txt` |
   | **Start Command** | `uvicorn src.api:app --host 0.0.0.0 --port $PORT` |
   | **Health Check Path** | `/api/health` |
   | **Plan** | Free |

7. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `PYTHON_VERSION` | `3.11.11` |
   | `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` *(update after Vercel deploy)* |

8. Click **Apply**. Wait for build & deploy (2–5 minutes).
9. Copy your Render service URL, e.g.: `https://customer-intelligence-api.onrender.com`
10. ✅ Test: Visit `https://your-render-url/api/health` → should return `{"status": "ready", ...}`

### Option B — Manual Web Service

1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect GitHub and select this repository.
4. Fill in the same settings from the table above.
5. Add environment variables manually.
6. Click **Create Web Service**.

---

## 🔵 Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com/new).
2. Click **Add New → Project**.
3. Import the GitHub repository: `induridharani-19/-customer-intelligence-system`.
4. Configure the project:

   | Setting | Value |
   |---|---|
   | **Framework Preset** | Vite |
   | **Root Directory** | `.` *(leave as repo root)* |
   | **Build Command** | `cd frontend-app && npm run build` |
   | **Output Directory** | `frontend-app/dist` |
   | **Install Command** | `cd frontend-app && npm ci` |

   > ✅ These are already set in `vercel.json` — Vercel will auto-detect them.

5. Before clicking Deploy, go to **Environment Variables** and add:

   | Name | Value | Environments |
   |---|---|---|
   | `VITE_API_URL` | `https://your-render-url.onrender.com` | Production, Preview, Development |

   > ⚠️ Replace `your-render-url` with your actual Render service URL. No trailing slash.

6. Click **Deploy**. Wait 2–3 minutes for the build to complete.
7. Copy your Vercel URL, e.g.: `https://customer-intelligence-system.vercel.app`
8. ✅ Test: Visit your Vercel URL and open the Prediction Studio.

---

## 🔗 Update CORS on Render (Final Step)

After deploying both services, update Render to allow the Vercel frontend:

1. Go to Render Dashboard → your `customer-intelligence-api` service → **Environment**.
2. Update `CORS_ORIGINS` to include your Vercel URL:

   ```
   http://localhost:5173,http://127.0.0.1:5173,https://customer-intelligence-system.vercel.app
   ```

3. Click **Save Changes** → Render will auto-redeploy.
4. If you add a custom domain to Vercel later, append it to `CORS_ORIGINS`.

---

## 🌐 API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Service readiness and prediction mode |
| `GET` | `/api/segments` | Cluster summary with names and recommendations |
| `GET` | `/api/metrics` | K-Means evaluation metrics |
| `GET` | `/api/dashboard` | Combined dashboard data |
| `POST` | `/api/predict` | Predict customer segment from RFM features |
| `GET` | `/api/example?segment=0` | Example feature values for a given cluster |
| `GET` | `/docs` | Interactive OpenAPI documentation |

### Prediction Request Body

```json
{
  "recency": 30,
  "frequency": 5,
  "monetary_value": 8.5,
  "total_quantity": 10,
  "avg_unit_price": 25.0
}
```

### Prediction Response

```json
{
  "cluster_id": 1,
  "cluster_name": "Loyal Customers",
  "summary": "High-frequency buyers with strong monetary contribution.",
  "business_action": "Offer loyalty rewards and early access to new products.",
  "probabilities": [[0.12, 0.65, 0.15, 0.08]],
  "model_status": "heuristic fallback"
}
```

---

## 🧪 Tests

```bash
# Python tests
pytest

# Frontend production build check
cd frontend-app
npm run build
```

---

## 🔧 Environment Variables Reference

### Frontend (`frontend-app/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ Yes | Full URL of the Render API (no trailing slash) |

### Backend (Render Environment)

| Variable | Required | Description |
|---|---|---|
| `CORS_ORIGINS` | ✅ Yes | Comma-separated list of allowed frontend origins |
| `PYTHON_VERSION` | Optional | Python version for Render runtime (default: `3.11.11`) |
| `PORT` | Auto-set | Port injected by Render — do not set manually |

---

## 📝 Notes

- **No model artifacts committed**: The trained `.keras` model and `scaler.pkl` are git-ignored. The API uses a built-in heuristic fallback when they're unavailable — all endpoints remain fully functional.
- **Training locally**: Run `python -m src.pipeline.main_pipeline` after installing `requirements.txt`. Model files are saved to `outputs/models/`.
- **Render free tier**: Free services spin down after inactivity. The first request may take ~30 seconds to wake up.
- **Vercel free tier**: Supports unlimited personal projects with automatic HTTPS and global CDN.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/induridharani-19">induridharani-19</a>
</div>
