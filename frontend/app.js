/* ============================================================
   CUSTOMER INTELLIGENCE SYSTEM — App Logic v2.0
   ============================================================ */

"use strict";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── DOM Refs ── */
const form            = $("#predict-form");
const healthPill      = $("#health-pill");
const clusterId       = $("#cluster-id");
const clusterName     = $("#cluster-name");
const summary         = $("#summary");
const businessAction  = $("#business-action");
const modelStatus     = $("#model-status");
const probabilityBars = $("#probability-bars");
const segmentList     = $("#segment-list");
const kpiRail         = $("#kpi-rail");
const saveState       = $("#save-state");
const toast           = $("#toast");
const confidenceCanvas = $("#confidence-canvas");
const metricsCanvas   = $("#metrics-chart");
const metricsEmpty    = $("#metrics-empty");
const embeddingPlot   = $("#embedding-plot");
const embeddingEmpty  = $("#embedding-empty");
const pageTitle       = $("#page-title");
const sidebarEl       = $("#sidebar");
const appShell        = $("#app-shell");
const refreshBtn      = $("#refresh-btn");
const segmentSearch   = $("#segment-search");

const featureKeys = [
  "recency",
  "frequency",
  "monetary_value",
  "total_quantity",
  "avg_unit_price",
];

const featureMeta = {
  recency:       { label: "Recency",    min: 0,  max: 500,  step: 1 },
  frequency:     { label: "Frequency",  min: 0,  max: 10,   step: 0.1 },
  monetary_value:{ label: "Monetary",   min: 0,  max: 15,   step: 0.1 },
  total_quantity:{ label: "Quantity",   min: 0,  max: 15,   step: 0.1 },
  avg_unit_price:{ label: "Avg Price",  min: 0,  max: 3000, step: 0.1 },
};

const segmentPalette = ["#00e5c7", "#6ea8ff", "#ff6b6b", "#ffc86a", "#b07fff"];
const SEGMENT_NAMES  = ["Premium", "Regular", "Bulk", "Dormant", "Emerging"];

let dashboardCache = { kmeans: [], segments: [], artifacts: {} };
let predictionTimer = null;
let toastTimer = null;
let currentView = "predictor";
let compareResultA = null;
let compareResultB = null;

/* ============================================================
   TOAST
   ============================================================ */
function showToast(message, type = "info") {
  toast.textContent = message;
  toast.className = "toast show" + (type !== "info" ? ` toast-${type}` : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3600);
}

/* ============================================================
   FETCH HELPER
   ============================================================ */
async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 10000);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

/* ============================================================
   HEALTH INDICATOR
   ============================================================ */
function setHealth(state, label) {
  healthPill.classList.remove("ready", "offline");
  if (state) healthPill.classList.add(state);
  $(".health-text", healthPill).textContent = label;
}

/* ============================================================
   SIDEBAR & NAVIGATION
   ============================================================ */
function initSidebar() {
  const toggle = $("#sidebar-toggle");
  toggle.addEventListener("click", () => {
    const collapsed = sidebarEl.classList.toggle("collapsed");
    const open      = sidebarEl.classList.toggle("open");
    appShell.classList.toggle("full", collapsed);
  });

  $$(".sidebar-link").forEach(link => {
    link.addEventListener("click", (e) => {
      const view = link.dataset.view;
      if (view) {
        e.preventDefault();
        navigateTo(view);
      }
      // On small screens: close sidebar
      if (window.innerWidth < 820) {
        sidebarEl.classList.remove("open");
      }
    });
  });
}

const VIEW_TITLES = {
  predictor: "Customer Predictor",
  segments:  "Customer Segments",
  analytics: "Analytics",
  model:     "Model Evaluation",
  compare:   "Compare Profiles",
};

function navigateTo(view) {
  currentView = view;
  $$(".view-section").forEach(s => s.classList.remove("active"));
  const target = $(`#view-${view}`);
  if (target) target.classList.add("active");

  $$(".sidebar-link").forEach(l => l.classList.toggle("active", l.dataset.view === view));
  pageTitle.textContent = VIEW_TITLES[view] || "Customer Intelligence";

  if (view === "analytics") renderAnalytics();
  if (view === "model") {
    drawMetrics(dashboardCache.kmeans || []);
    renderArtifacts(dashboardCache.artifacts || {});
    renderOptimalK(dashboardCache.kmeans || []);
  }
}

/* ============================================================
   CLOCK
   ============================================================ */
function startClock() {
  const el = $("#sidebar-clock");
  if (!el) return;
  const tick = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString("en-IN", { hour12: false });
  };
  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   INPUT BINDING
   ============================================================ */
function bindInputs() {
  featureKeys.forEach(key => {
    const range  = form.elements[key];
    const number = form.elements[`${key}_number`];

    range.addEventListener("input", () => {
      number.value = range.value;
      queuePrediction();
    });

    number.addEventListener("input", () => {
      const val = Math.min(Number(number.max), Math.max(Number(number.min), Number(number.value)));
      number.value = isFinite(val) ? val : Number(range.value);
      range.value  = number.value;
      queuePrediction();
    });
  });
}

function payloadFromForm(formEl = form) {
  return Object.fromEntries(
    featureKeys.map(key => [key, Number(formEl.elements[key]?.value ?? formEl.elements[`${key}_number`]?.value)])
  );
}

/* ============================================================
   PREDICTION QUEUE
   ============================================================ */
function queuePrediction() {
  saveState.textContent = "Updating…";
  clearTimeout(predictionTimer);
  predictionTimer = setTimeout(() => {
    predict().catch(() => {
      saveState.textContent = "Retry needed";
      showToast("Prediction service didn't respond.", "error");
    });
  }, 380);
}

/* ============================================================
   CONFIDENCE CHART
   ============================================================ */
function drawConfidence(probabilities) {
  const canvas  = confidenceCanvas;
  const context = canvas.getContext("2d");
  const rect    = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const ratio  = window.devicePixelRatio || 1;
  const values = probabilities?.[0] || [];
  const max    = Math.max(...values, 0.01);

  canvas.width  = rect.width * ratio;
  canvas.height = rect.height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, rect.width, rect.height);

  const cx = rect.width  / 2;
  const cy = rect.height / 2;
  const R  = Math.min(rect.width, rect.height) * 0.38;

  /* Subtle rings */
  for (let ring = 1; ring <= 3; ring++) {
    context.strokeStyle = `rgba(255,255,255,${0.05 + ring * 0.03})`;
    context.lineWidth   = 1;
    context.beginPath();
    context.arc(cx, cy, (R / 3) * ring, 0, Math.PI * 2);
    context.stroke();
  }

  /* Arcs */
  values.forEach((v, i) => {
    const gapAngle = 0.1;
    const arcSpan  = (Math.PI * 2) / values.length - gapAngle;
    const start    = -Math.PI / 2 + (Math.PI * 2 * i) / values.length;
    const end      = start + arcSpan;
    const r        = R * (0.42 + (v / max) * 0.65);

    const grad = context.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, segmentPalette[i % segmentPalette.length]);
    grad.addColorStop(1, segmentPalette[(i + 2) % segmentPalette.length]);
    context.strokeStyle = grad;
    context.lineWidth   = 18;
    context.lineCap     = "round";
    context.beginPath();
    context.arc(cx, cy, r, start, end);
    context.stroke();
  });
}

/* ============================================================
   RENDER PREDICTION
   ============================================================ */
function renderPrediction(result) {
  const confidence = Math.max(...(result.probabilities?.[0] || [0]));
  const color      = segmentPalette[result.cluster_id % segmentPalette.length];

  clusterId.textContent   = result.cluster_id;
  clusterName.textContent = result.cluster_name;
  summary.textContent     = result.summary;
  businessAction.textContent = result.business_action;
  modelStatus.textContent = result.model_status;

  const scoreEl = $("#confidence-score");
  const pct     = Math.round(confidence * 100);
  scoreEl.textContent = `${pct}%`;
  scoreEl.style.color = pct > 65 ? "var(--green)" : pct > 40 ? "var(--gold)" : "var(--coral)";

  const chip = $("#cluster-chip");
  chip.classList.add("lit");
  chip.querySelector("strong").style.color = color;

  saveState.textContent = "Synced ✓";

  /* Probability bars */
  probabilityBars.innerHTML = "";
  (result.probabilities?.[0] || []).forEach((v, i) => {
    const row = document.createElement("div");
    row.className = "prob-row";
    const label = dashboardCache.segments.find(s => s.Cluster === i)?.ClusterName || `Cluster ${i}`;
    row.innerHTML = `
      <span title="${label}">Cluster ${i}</span>
      <div class="prob-track"><div class="prob-fill" style="background: linear-gradient(90deg, ${segmentPalette[i % segmentPalette.length]}, ${segmentPalette[(i+1) % segmentPalette.length]})"></div></div>
      <span class="prob-pct">${Math.round(v * 100)}%</span>
    `;
    probabilityBars.appendChild(row);
    requestAnimationFrame(() => {
      row.querySelector(".prob-fill").style.width = `${Math.max(v * 100, 1.5)}%`;
    });
  });

  drawConfidence(result.probabilities);
}

/* ============================================================
   PREDICT API CALL
   ============================================================ */
async function predict(payload = null) {
  saveState.textContent = "Running…";
  const result = await fetchJson("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || payloadFromForm()),
    timeout: 20000,
  });
  renderPrediction(result);
  return result;
}

/* ============================================================
   KPI RAIL
   ============================================================ */
function renderKpis(segments, metrics) {
  const best    = metrics.length ? metrics.reduce((w, m) => Number(m.SilhouetteScore) > Number(w.SilhouetteScore) ? m : w) : null;
  const premium = segments.find(s => s.ClusterName?.includes("Premium")) || segments[0];
  const dormant = segments.find(s => s.ClusterName?.includes("Dormant")) || segments.at(-1);

  const cards = [
    { label: "Segment families",   value: segments.length || "--",    detail: "Labeled customer groups",              accent: "var(--teal)" },
    { label: "Best silhouette",    value: best ? Number(best.SilhouetteScore).toFixed(3) : "--", detail: best ? `Optimal at K=${best.K}` : "No metrics yet", accent: "var(--coral)" },
    { label: "Premium frequency",  value: premium ? Number(premium.Frequency).toFixed(1) : "--", detail: premium ? premium.ClusterName : "N/A",              accent: "var(--blue)" },
    { label: "Dormant recency",    value: dormant ? `${Math.round(Number(dormant.Recency))}d` : "--", detail: dormant ? dormant.ClusterName : "N/A",           accent: "var(--gold)" },
  ];

  kpiRail.innerHTML = "";
  cards.forEach((card, i) => {
    const el = document.createElement("article");
    el.className = "metric-card";
    el.id = `kpi-${i}`;
    el.style.setProperty("--accent", card.accent);
    el.style.animationDelay = `${i * 60}ms`;
    el.innerHTML = `
      <span class="kpi-label">${card.label}</span>
      <strong class="kpi-value">${card.value}</strong>
      <p class="kpi-detail">${card.detail}</p>
    `;
    kpiRail.appendChild(el);
  });
}

/* ============================================================
   SEGMENTS
   ============================================================ */
function renderSegments(segments, filter = "") {
  segmentList.innerHTML = "";
  const filtered = filter
    ? segments.filter(s => (s.ClusterName + s.Summary).toLowerCase().includes(filter.toLowerCase()))
    : segments;

  if (!filtered.length) {
    const msg = document.createElement("p");
    msg.className = "empty-state";
    msg.textContent = filter
      ? `No segments match "${filter}".`
      : "No segment summaries yet. Run the analytics pipeline.";
    segmentList.appendChild(msg);
    return;
  }

  filtered.forEach((seg, i) => {
    const item = document.createElement("article");
    item.className = "segment-item";
    item.style.animationDelay = `${i * 70}ms`;
    item.style.setProperty("--accent", segmentPalette[seg.Cluster % segmentPalette.length]);
    item.innerHTML = `
      <h3>Cluster ${seg.Cluster}: ${seg.ClusterName}</h3>
      <p>${seg.Summary}</p>
      <div class="stat-row">
        <span>Recency ${Number(seg.Recency).toFixed(1)}</span>
        <span>Frequency ${Number(seg.Frequency).toFixed(1)}</span>
        <span>Value ${Number(seg.MonetaryValue).toFixed(1)}</span>
        <span>Qty ${Number(seg.TotalQuantity).toFixed(1)}</span>
      </div>
    `;
    segmentList.appendChild(item);
  });
}

/* ============================================================
   METRICS CHART (K-Means)
   ============================================================ */
function drawMetrics(metrics) {
  const canvas  = metricsCanvas;
  const context = canvas.getContext("2d");
  const rect    = canvas.getBoundingClientRect();
  const ratio   = window.devicePixelRatio || 1;

  if (!metrics.length || !rect.width) {
    canvas.hidden = true;
    metricsEmpty.hidden = false;
    return;
  }

  canvas.hidden = false;
  metricsEmpty.hidden = true;

  canvas.width  = rect.width * ratio;
  canvas.height = rect.height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, rect.width, rect.height);

  const pad = { top: 30, right: 40, bottom: 46, left: 60 };
  const W   = rect.width  - pad.left - pad.right;
  const H   = rect.height - pad.top  - pad.bottom;
  const maxI = Math.max(...metrics.map(m => Number(m.Inertia)), 1);
  const maxS = Math.max(...metrics.map(m => Number(m.SilhouetteScore)), 0.01);

  /* Grid lines */
  context.strokeStyle = "rgba(255,255,255,0.07)";
  context.lineWidth   = 1;
  context.font        = "11px 'JetBrains Mono', monospace";
  context.fillStyle   = "rgba(120,136,168,0.9)";
  context.textAlign   = "right";

  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (H / 4) * i;
    context.beginPath();
    context.moveTo(pad.left, y);
    context.lineTo(rect.width - pad.right, y);
    context.stroke();
    context.fillText(`${Math.round(maxI - (maxI / 4) * i)}`, pad.left - 10, y + 4);
  }

  /* Bars */
  metrics.forEach((m, i) => {
    const x  = pad.left + (metrics.length === 1 ? W / 2 : (W / (metrics.length - 1)) * i);
    const bH = (Number(m.Inertia) / maxI) * H;
    const bW = Math.max(14, W / metrics.length / 2.2);
    const y  = pad.top + H - bH;

    const grad = context.createLinearGradient(0, y, 0, pad.top + H);
    grad.addColorStop(0, "#00e5c7");
    grad.addColorStop(0.6, "#6ea8ff");
    grad.addColorStop(1, "rgba(110,168,255,0.12)");
    context.fillStyle = grad;

    const r = Math.min(bW / 2, 6);
    context.beginPath();
    context.moveTo(x - bW / 2 + r, y);
    context.lineTo(x + bW / 2 - r, y);
    context.arcTo(x + bW / 2, y, x + bW / 2, y + r, r);
    context.lineTo(x + bW / 2, pad.top + H);
    context.lineTo(x - bW / 2, pad.top + H);
    context.arcTo(x - bW / 2, y + r, x - bW / 2 + r, y, r);
    context.closePath();
    context.fill();

    context.fillStyle = "rgba(240,244,255,0.8)";
    context.textAlign = "center";
    context.fillText(`K${m.K}`, x, rect.height - pad.bottom + 18);
  });

  /* Silhouette line */
  context.beginPath();
  metrics.forEach((m, i) => {
    const x = pad.left + (metrics.length === 1 ? W / 2 : (W / (metrics.length - 1)) * i);
    const y = pad.top + H - (Number(m.SilhouetteScore) / maxS) * H;
    if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
  });
  context.strokeStyle = "#ff6b6b";
  context.lineWidth   = 2.5;
  context.stroke();

  /* Dots on silhouette */
  metrics.forEach((m, i) => {
    const x = pad.left + (metrics.length === 1 ? W / 2 : (W / (metrics.length - 1)) * i);
    const y = pad.top + H - (Number(m.SilhouetteScore) / maxS) * H;
    context.fillStyle = "#ffc86a";
    context.beginPath();
    context.arc(x, y, 5, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(6,8,16,0.9)";
    context.lineWidth = 1.5;
    context.stroke();
  });
}

/* ============================================================
   EMBEDDING
   ============================================================ */
function renderEmbedding(artifacts) {
  if (!artifacts?.embedding_tsne) {
    embeddingPlot.hidden = true;
    embeddingPlot.removeAttribute("src");
    embeddingEmpty.hidden = false;
    return;
  }
  embeddingPlot.onerror = () => { embeddingPlot.hidden = true; embeddingEmpty.hidden = false; };
  embeddingPlot.src     = "/api/plots/embedding_tsne.png";
  embeddingPlot.hidden  = false;
  embeddingEmpty.hidden = true;
}

/* ============================================================
   ARTIFACT INVENTORY
   ============================================================ */
function renderArtifacts(artifacts) {
  const list = $("#artifact-list");
  if (!list) return;

  const items = [
    { name: "Neural Model (.keras)", key: "trained_model" },
    { name: "t-SNE Embedding Plot",   key: "embedding_tsne" },
  ];

  list.innerHTML = items.map(it => {
    const ok = artifacts?.[it.key];
    return `
      <div class="artifact-row">
        <span class="artifact-name">${it.name}</span>
        <span class="artifact-badge ${ok ? "ok" : "missing"}">${ok ? "Ready" : "Missing"}</span>
      </div>
    `;
  }).join("");
}

/* ============================================================
   OPTIMAL K DISPLAY
   ============================================================ */
function renderOptimalK(metrics) {
  const kEl    = $("#optimal-k-display");
  const sEl    = $("#optimal-score-display");
  const noteEl = $("#optimal-note");
  if (!kEl || !sEl) return;

  if (!metrics.length) {
    kEl.textContent = "--";
    sEl.textContent = "--";
    if (noteEl) noteEl.textContent = "Run the pipeline to compute K-Means metrics.";
    return;
  }

  const best = metrics.reduce((w, m) => Number(m.SilhouetteScore) > Number(w.SilhouetteScore) ? m : w);
  kEl.textContent = best.K;
  sEl.textContent = Number(best.SilhouetteScore).toFixed(3);
  if (noteEl) noteEl.textContent = `K=${best.K} gives the best cluster separation with silhouette score ${Number(best.SilhouetteScore).toFixed(4)}.`;
}

/* ============================================================
   ANALYTICS VIEW: RADAR + REVENUE + HEATMAP
   ============================================================ */
function renderAnalytics() {
  const segs = dashboardCache.segments || [];
  drawRadar(segs);
  drawRevenueBars(segs);
  drawHeatmap(segs);
}

function drawRadar(segments) {
  const canvas  = $("#radar-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const W = 500, H = 350;
  canvas.width  = W;
  canvas.height = H;
  context.clearRect(0, 0, W, H);

  const axes   = ["Recency", "Frequency", "MonetaryValue", "TotalQuantity", "AvgUnitPrice"];
  const labels = ["Recency", "Frequency", "Monetary", "Quantity", "Avg Price"];
  const cx = W / 2, cy = H / 2;
  const R  = Math.min(W, H) * 0.36;
  const N  = axes.length;

  /* Web */
  for (let ring = 1; ring <= 4; ring++) {
    context.strokeStyle = "rgba(255,255,255,0.07)";
    context.lineWidth   = 1;
    context.beginPath();
    for (let i = 0; i < N; i++) {
      const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
      const x = cx + Math.cos(angle) * (R / 4) * ring;
      const y = cy + Math.sin(angle) * (R / 4) * ring;
      if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
    }
    context.closePath();
    context.stroke();
  }

  /* Axis lines */
  for (let i = 0; i < N; i++) {
    const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
    context.strokeStyle = "rgba(255,255,255,0.1)";
    context.beginPath();
    context.moveTo(cx, cy);
    context.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
    context.stroke();

    const lx = cx + Math.cos(angle) * (R + 22);
    const ly = cy + Math.sin(angle) * (R + 22);
    context.fillStyle = "rgba(120,136,168,0.9)";
    context.font      = "11px Inter, sans-serif";
    context.textAlign = "center";
    context.fillText(labels[i], lx, ly + 4);
  }

  if (!segments.length) {
    context.fillStyle = "rgba(120,136,168,0.5)";
    context.font      = "14px Inter, sans-serif";
    context.textAlign = "center";
    context.fillText("No segment data yet", cx, cy);
    return;
  }

  /* Legend */
  const legendWrap = $("#radar-legend");
  if (legendWrap) {
    legendWrap.innerHTML = segments.map((s, i) =>
      `<span class="legend-dot" style="--color:${segmentPalette[i % segmentPalette.length]}">${s.ClusterName || `Cluster ${s.Cluster}`}</span>`
    ).join("");
  }

  /* Per-segment overlay */
  segments.forEach((seg, si) => {
    const maxVals = { Recency: 500, Frequency: 10, MonetaryValue: 15, TotalQuantity: 15, AvgUnitPrice: 3000 };
    const color   = segmentPalette[si % segmentPalette.length];

    context.beginPath();
    axes.forEach((ax, i) => {
      const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
      const norm  = Math.min(Number(seg[ax]) / (maxVals[ax] || 1), 1);
      const x = cx + Math.cos(angle) * R * norm;
      const y = cy + Math.sin(angle) * R * norm;
      if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
    });
    context.closePath();
    context.fillStyle   = color + "22";
    context.strokeStyle = color;
    context.lineWidth   = 2;
    context.fill();
    context.stroke();
  });
}

function drawRevenueBars(segments) {
  const canvas  = $("#revenue-canvas");
  const emptyEl = $("#revenue-empty");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const rect    = canvas.getBoundingClientRect();
  const ratio   = window.devicePixelRatio || 1;

  if (!segments.length) {
    canvas.hidden = true;
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  canvas.hidden = false;
  if (emptyEl) emptyEl.hidden = true;

  canvas.width  = rect.width * ratio;
  canvas.height = rect.height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, rect.width, rect.height);

  const W = rect.width, H = rect.height;
  const maxMV = Math.max(...segments.map(s => Number(s.MonetaryValue)), 1);
  const bW    = (W * 0.7) / segments.length;
  const gap   = (W * 0.3 + bW) / (segments.length + 1);

  segments.forEach((seg, i) => {
    const norm = Number(seg.MonetaryValue) / maxMV;
    const x    = gap + i * (bW + gap);
    const bH   = norm * (H * 0.72);
    const y    = H * 0.12 + (H * 0.72 - bH);
    const color = segmentPalette[i % segmentPalette.length];

    const grad = context.createLinearGradient(0, y, 0, H);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + "22");
    context.fillStyle = grad;

    const r = Math.min(bW / 2, 8);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + bW - r, y);
    context.arcTo(x + bW, y, x + bW, y + r, r);
    context.lineTo(x + bW, H * 0.84);
    context.lineTo(x, H * 0.84);
    context.arcTo(x, y + r, x + r, y, r);
    context.closePath();
    context.fill();

    context.fillStyle = "rgba(240,244,255,0.85)";
    context.font      = "11px 'JetBrains Mono', monospace";
    context.textAlign = "center";
    context.fillText(Number(seg.MonetaryValue).toFixed(1), x + bW / 2, y - 7);
    context.fillStyle = "rgba(120,136,168,0.8)";
    context.font      = "10px Inter, sans-serif";
    context.fillText(seg.ClusterName?.split(" ")[0] || `C${seg.Cluster}`, x + bW / 2, H * 0.84 + 16);
  });
}

function drawHeatmap(segments) {
  const wrap = $("#heatmap-wrap");
  if (!wrap) return;
  wrap.innerHTML = "";

  const features = [
    { key: "Recency",       label: "Recency",    max: 500 },
    { key: "Frequency",     label: "Frequency",  max: 10 },
    { key: "MonetaryValue", label: "Monetary",   max: 15 },
    { key: "TotalQuantity", label: "Quantity",   max: 15 },
  ];

  if (!segments.length) {
    wrap.innerHTML = `<p class="empty-state">No segment data to display.</p>`;
    return;
  }

  /* Header row */
  const headerRow = document.createElement("div");
  headerRow.className = "heatmap-row";
  headerRow.innerHTML = `<div class="heatmap-label"></div>` +
    segments.map(s =>
      `<div class="heatmap-cell" style="background:transparent;color:var(--muted);font-size:0.72rem;font-weight:700">
        ${s.ClusterName?.split(" ")[0] || `C${s.Cluster}`}
      </div>`
    ).join("");
  wrap.appendChild(headerRow);

  features.forEach(feat => {
    const row = document.createElement("div");
    row.className = "heatmap-row";
    const labelEl = document.createElement("div");
    labelEl.className = "heatmap-label";
    labelEl.textContent = feat.label;
    row.appendChild(labelEl);

    segments.forEach((seg, si) => {
      const norm  = Math.min(Number(seg[feat.key]) / feat.max, 1);
      const color = segmentPalette[si % segmentPalette.length];
      const cell  = document.createElement("div");
      cell.className = "heatmap-cell";
      cell.style.background = color + Math.round(norm * 180).toString(16).padStart(2, "0");
      cell.style.color = norm > 0.5 ? "#060810" : "#f0f4ff";
      cell.title = `${feat.label}: ${Number(seg[feat.key]).toFixed(2)}`;
      cell.textContent = Number(seg[feat.key]).toFixed(1);
      row.appendChild(cell);
    });

    wrap.appendChild(row);
  });
}

/* ============================================================
   COMPARE VIEW
   ============================================================ */
const compareKeys = ["recency", "frequency", "monetary_value", "total_quantity", "avg_unit_price"];

function buildCompareForm(containerId, formId) {
  const container = $(`#${containerId}`);
  if (!container) return;

  container.innerHTML = compareKeys.map(key => {
    const meta = featureMeta[key];
    return `
      <div class="compare-field">
        <label>${meta.label}</label>
        <input type="range" name="${key}" min="${meta.min}" max="${meta.max}" step="${meta.step}" value="${(meta.min + meta.max) / 2}" />
        <input type="number" name="${key}_number" min="${meta.min}" max="${meta.max}" step="${meta.step}" value="${(meta.min + meta.max) / 2}" />
      </div>
    `;
  }).join("");

  /* Wire inputs inside compare forms */
  const formEl = $(`#${formId}`);
  if (!formEl) return;

  compareKeys.forEach(key => {
    const range  = formEl.elements[key];
    const number = formEl.elements[`${key}_number`];
    if (!range || !number) return;
    range.addEventListener("input", () => { number.value = range.value; });
    number.addEventListener("input", () => {
      const val = Math.min(Number(number.max), Math.max(Number(number.min), Number(number.value)));
      range.value = number.value = isFinite(val) ? val : range.value;
    });
  });
}

function initCompare() {
  buildCompareForm("compare-inputs-a", "compare-form-a");
  buildCompareForm("compare-inputs-b", "compare-form-b");

  const formA = $("#compare-form-a");
  const formB = $("#compare-form-b");

  if (formA) {
    formA.addEventListener("submit", async e => {
      e.preventDefault();
      compareResultA = await predict(payloadFromForm(formA)).catch(() => null);
      if (compareResultA) renderCompareResult();
    });
  }

  if (formB) {
    formB.addEventListener("submit", async e => {
      e.preventDefault();
      compareResultB = await predict(payloadFromForm(formB)).catch(() => null);
      if (compareResultB) renderCompareResult();
    });
  }

  /* Preset buttons */
  $("#preset-a-btn")?.addEventListener("click", async () => {
    const ex = await fetchJson(`/api/example?segment=${Math.floor(Math.random() * 4)}`).catch(() => null);
    if (!ex) return;
    const formEl = $("#compare-form-a");
    compareKeys.forEach(k => {
      if (formEl.elements[k]) { formEl.elements[k].value = ex[k]; }
      if (formEl.elements[`${k}_number`]) { formEl.elements[`${k}_number`].value = ex[k]; }
    });
  });

  $("#preset-b-btn")?.addEventListener("click", async () => {
    const ex = await fetchJson(`/api/example?segment=${Math.floor(Math.random() * 4)}`).catch(() => null);
    if (!ex) return;
    const formEl = $("#compare-form-b");
    compareKeys.forEach(k => {
      if (formEl.elements[k]) { formEl.elements[k].value = ex[k]; }
      if (formEl.elements[`${k}_number`]) { formEl.elements[`${k}_number`].value = ex[k]; }
    });
  });
}

function renderCompareResult() {
  const aEl = $("#vs-a-badge"), bEl = $("#vs-b-badge");
  const aN  = $("#vs-a-name"),  bN  = $("#vs-b-name");
  const aC  = $("#vs-a-conf"),  bC  = $("#vs-b-conf");
  const insight = $("#compare-insight");

  if (compareResultA) {
    const color = segmentPalette[compareResultA.cluster_id % segmentPalette.length];
    aEl.textContent = compareResultA.cluster_id;
    aEl.style.borderColor = color;
    aEl.style.color = color;
    aN.textContent = compareResultA.cluster_name;
    aC.textContent = `Confidence: ${Math.round(Math.max(...(compareResultA.probabilities?.[0] || [0])) * 100)}%`;
  }

  if (compareResultB) {
    const color = segmentPalette[compareResultB.cluster_id % segmentPalette.length];
    bEl.textContent = compareResultB.cluster_id;
    bEl.style.borderColor = color;
    bEl.style.color = color;
    bN.textContent = compareResultB.cluster_name;
    bC.textContent = `Confidence: ${Math.round(Math.max(...(compareResultB.probabilities?.[0] || [0])) * 100)}%`;
  }

  if (compareResultA && compareResultB) {
    if (compareResultA.cluster_id === compareResultB.cluster_id) {
      insight.textContent = `Both profiles fall into the same segment: ${compareResultA.cluster_name}. They have similar behavioral patterns.`;
    } else {
      insight.textContent = `Profile A maps to "${compareResultA.cluster_name}" while Profile B maps to "${compareResultB.cluster_name}". Different strategies apply.`;
    }
    drawCompareChart();
  }
}

function drawCompareChart() {
  const canvas  = $("#compare-canvas");
  if (!canvas || !compareResultA || !compareResultB) return;
  const context = canvas.getContext("2d");
  const rect    = canvas.getBoundingClientRect();
  const ratio   = window.devicePixelRatio || 1;

  canvas.width  = rect.width * ratio;
  canvas.height = rect.height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, rect.width, rect.height);

  const W = rect.width, H = rect.height;
  const probsA = compareResultA.probabilities?.[0] || [];
  const probsB = compareResultB.probabilities?.[0] || [];
  const N      = Math.max(probsA.length, probsB.length);
  const bW     = (W * 0.6) / N;
  const half   = bW * 0.45;

  for (let i = 0; i < N; i++) {
    const x  = (W / (N + 1)) * (i + 1);
    const vA = probsA[i] || 0;
    const vB = probsB[i] || 0;
    const maxH = H * 0.72;

    /* Bar A */
    const gradA = context.createLinearGradient(0, H * 0.1, 0, H * 0.85);
    gradA.addColorStop(0, "#00e5c7");
    gradA.addColorStop(1, "rgba(0,229,199,0.1)");
    context.fillStyle = gradA;
    context.fillRect(x - half - 3, H * 0.85 - vA * maxH, half, vA * maxH);

    /* Bar B */
    const gradB = context.createLinearGradient(0, H * 0.1, 0, H * 0.85);
    gradB.addColorStop(0, "#6ea8ff");
    gradB.addColorStop(1, "rgba(110,168,255,0.1)");
    context.fillStyle = gradB;
    context.fillRect(x + 3, H * 0.85 - vB * maxH, half, vB * maxH);

    /* Label */
    context.fillStyle = "rgba(120,136,168,0.8)";
    context.font      = "10px Inter, sans-serif";
    context.textAlign = "center";
    context.fillText(`C${i}`, x, H * 0.94);
  }
}

/* ============================================================
   LOAD EXAMPLE PRESET
   ============================================================ */
async function loadExample(segment = 1) {
  saveState.textContent = "Loading preset…";
  const ex = await fetchJson(`/api/example?segment=${segment}`);
  featureKeys.forEach(key => {
    form.elements[key].value            = ex[key];
    form.elements[`${key}_number`].value = ex[key];
  });
  await predict();
}

/* ============================================================
   DASHBOARD LOAD
   ============================================================ */
async function loadDashboard() {
  refreshBtn?.classList.add("spinning");
  try {
    const [health, dashboard] = await Promise.all([
      fetchJson("/api/health"),
      fetchJson("/api/dashboard"),
    ]);

    dashboardCache = dashboard;

    setHealth(
      "ready",
      health.prediction_mode === "trained neural model" ? "Model ready" : "Fallback"
    );

    renderKpis(dashboard.segments || [], dashboard.kmeans || []);
    renderSegments(dashboard.segments || []);
    renderEmbedding(dashboard.artifacts || {});

    if (currentView === "model") {
      drawMetrics(dashboard.kmeans || []);
      renderArtifacts(dashboard.artifacts || {});
      renderOptimalK(dashboard.kmeans || []);
    }

    if (currentView === "analytics") {
      renderAnalytics();
    }

    await predict();
  } finally {
    refreshBtn?.classList.remove("spinning");
  }
}

/* ============================================================
   SIGNAL CANVAS ANIMATION
   ============================================================ */
function animateSignals() {
  const canvas  = $("#signal-canvas");
  const context = canvas.getContext("2d");
  let W = 0, H = 0, tick = 0;

  const lanes = Array.from({ length: 20 }, (_, i) => ({
    y:      0.06 + i * 0.046,
    speed:  0.0015 + Math.random() * 0.003,
    offset: Math.random(),
    hue:    i % 5,
  }));

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * ratio;
    canvas.height = H * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function frame() {
    tick++;
    context.clearRect(0, 0, W, H);
    lanes.forEach(lane => {
      const colors = ["0,229,199", "110,168,255", "255,107,107", "255,200,106", "176,127,255"];
      const color  = colors[lane.hue];
      const y = lane.y * H + Math.sin(tick * 0.008 + lane.offset * 5) * 14;
      const x = ((lane.offset + tick * lane.speed) % 1.4) * W - W * 0.2;
      const grad = context.createLinearGradient(x - 160, y, x + 200, y);
      grad.addColorStop(0, `rgba(${color},0)`);
      grad.addColorStop(0.5, `rgba(${color},0.14)`);
      grad.addColorStop(1, `rgba(${color},0)`);
      context.strokeStyle = grad;
      context.lineWidth   = 1;
      context.beginPath();
      context.moveTo(x - 160, y);
      context.lineTo(x + 200, y);
      context.stroke();
    });
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", () => {
    resize();
    drawMetrics(dashboardCache.kmeans || []);
    drawConfidence([[0.3, 0.3, 0.2, 0.2]]);
    if (currentView === "analytics") renderAnalytics();
  });
  frame();
}

/* ============================================================
   BOOTSTRAP
   ============================================================ */
initSidebar();
startClock();
bindInputs();
animateSignals();
initCompare();

form.addEventListener("submit", e => {
  e.preventDefault();
  predict().catch(() => showToast("Prediction failed. Is the API running?", "error"));
});

$("#preset-bar").addEventListener("click", e => {
  const btn = e.target.closest("button[data-segment]");
  if (btn) loadExample(btn.dataset.segment).catch(() => showToast("Could not load preset."));
});

refreshBtn?.addEventListener("click", () => {
  loadDashboard().catch(() => showToast("Refresh failed.", "error"));
});

if (segmentSearch) {
  segmentSearch.addEventListener("input", () => {
    renderSegments(dashboardCache.segments || [], segmentSearch.value);
  });
}

/* Handle hash navigation */
function handleHash() {
  const hash = window.location.hash.slice(1);
  const valid = ["predictor", "segments", "analytics", "model", "compare"];
  if (valid.includes(hash)) navigateTo(hash);
}
window.addEventListener("hashchange", handleHash);
handleHash();

loadDashboard().catch(() => {
  setHealth("offline", "Offline");
  showToast("FastAPI is offline. Run: uvicorn src.api:app --reload", "error");
});
