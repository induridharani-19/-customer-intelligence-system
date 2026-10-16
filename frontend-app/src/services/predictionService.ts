/**
 * predictionService.ts
 * ---------------------
 * Prediction service for the Customer Intelligence System.
 *
 * Call priority:
 *   1. POST /api/predict  (REAL backend)  — marks `isSimulated: false`
 *   2. Client-side heuristic fallback      — marks `isSimulated: true`
 *
 * The heuristic replicates the Python backend scoring logic so the UI
 * remains functional when the backend is unavailable.
 */

import {
  postPredict,
  fetchExample,
  isApiError,
  PredictRequest,
  ExampleInputResponse,
} from './api';

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export interface PredictionInput {
  recency: number;
  frequency: number;
  monetary_value: number;
  total_quantity: number;
  avg_unit_price: number;
}

export interface PredictionResult {
  /** 0-based cluster index */
  cluster_id: number;
  /** Human-readable segment name */
  cluster_name: string;
  /** Short profile summary */
  summary: string;
  /** Recommended business action */
  business_action: string;
  /**
   * Probability-like scores per cluster.
   * Shape: [[cluster_id, normalised_score], …]
   */
  probabilities: number[][];
  /** 'model' | 'heuristic' */
  model_status: string;
  /** True when the result came from the client-side fallback heuristic */
  isSimulated: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEGMENT_NAMES: Record<number, string> = {
  0: 'High-Value Customers',
  1: 'Loyal Customers',
  2: 'Potential Loyalists',
  3: 'At-Risk Customers',
};

const SEGMENT_SUMMARIES: Record<number, string> = {
  0: 'Frequent, high-spend buyers who are recent and engaged — your most profitable cohort.',
  1: 'Consistently active customers with solid order volumes and strong repeat behaviour.',
  2: 'Promising customers who are beginning to show loyalty signals — worth nurturing.',
  3: 'Previously active customers now showing declining recency and spend — intervention needed.',
};

const SEGMENT_ACTIONS: Record<number, string> = {
  0: 'Offer exclusive VIP loyalty rewards, early product access, and premium support tiers.',
  1: 'Provide personalised bundle offers and tiered discount incentives to deepen engagement.',
  2: 'Launch targeted email campaigns with first-time loyalty card offers and product education.',
  3: 'Deploy win-back campaigns with time-limited discounts and personalised re-engagement messages.',
};

// ---------------------------------------------------------------------------
// Client-side heuristic (mirrors Python backend scoring)
// ---------------------------------------------------------------------------

/**
 * Compute raw scores for each of the 4 clusters based on RFM+ features.
 * Mirrors the Python heuristic in the FastAPI backend exactly.
 */
function computeRawScores(input: PredictionInput): number[] {
  const { recency, frequency, monetary_value, total_quantity, avg_unit_price } = input;

  return [
    // Cluster 0 — High-Value: recency-sensitive, moderate frequency/monetary weight
    1 / (1 + recency / 90) + frequency * 0.12 + monetary_value * 0.08,

    // Cluster 1 — Loyal: frequency and monetary dominate
    frequency * 0.28 + monetary_value * 0.34 + total_quantity * 0.2,

    // Cluster 2 — Potential Loyalists: monetary + quantity + avg price
    monetary_value * 0.22 + total_quantity * 0.08 + avg_unit_price / 250,

    // Cluster 3 — At-Risk: recency penalty, low frequency/monetary bonus
    recency * 0.02 +
      Math.max(0, 2.5 - frequency) +
      Math.max(0, 5 - monetary_value) * 0.2,
  ];
}

/** Softmax normalisation so scores sum to ~1 (probability-like output) */
function softmax(scores: number[]): number[] {
  const maxScore = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - maxScore));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => parseFloat((e / sum).toFixed(4)));
}

/** Run the client-side heuristic and return a fully typed PredictionResult */
function runHeuristic(input: PredictionInput): PredictionResult {
  const rawScores = computeRawScores(input);
  const normalised = softmax(rawScores);

  const cluster_id = normalised.indexOf(Math.max(...normalised));
  const probabilities = normalised.map((p, i) => [i, p]);

  return {
    cluster_id,
    cluster_name: SEGMENT_NAMES[cluster_id] ?? `Cluster ${cluster_id}`,
    summary: SEGMENT_SUMMARIES[cluster_id] ?? '',
    business_action: SEGMENT_ACTIONS[cluster_id] ?? '',
    probabilities,
    model_status: 'heuristic',
    isSimulated: true,
  };
}

/**
 * The FastAPI model returns a single row of probabilities (``[[p0, ...]]``),
 * while this client uses ``[[clusterId, probability], ...]`` for charts.
 * Convert the API shape once at the boundary so both live and fallback data
 * are rendered consistently.
 */
function normaliseProbabilities(probabilities: number[][]): number[][] {
  if (probabilities.length === 1 && probabilities[0]?.length) {
    return probabilities[0].map((probability, clusterId) => [clusterId, probability]);
  }

  return probabilities;
}

// ---------------------------------------------------------------------------
// Fallback example inputs per segment (used when backend is unavailable)
// ---------------------------------------------------------------------------

const EXAMPLE_INPUTS: Record<number, PredictionInput> = {
  0: { recency: 14,  frequency: 22, monetary_value: 18.5, total_quantity: 180, avg_unit_price: 14.2 },
  1: { recency: 30,  frequency: 14, monetary_value: 11.2, total_quantity: 120, avg_unit_price: 12.8 },
  2: { recency: 60,  frequency: 5,  monetary_value: 6.4,  total_quantity: 45,  avg_unit_price: 18.5 },
  3: { recency: 200, frequency: 2,  monetary_value: 2.1,  total_quantity: 18,  avg_unit_price: 9.3 },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classify a single customer by their RFM+ features.
 *
 * Tries the real backend first (POST /api/predict).
 * Falls back to the client-side heuristic on any network or API error.
 *
 * @real   POST /api/predict
 * @mock   Client-side heuristic (when backend unavailable)
 */
export async function predictCustomer(
  input: PredictionInput,
): Promise<PredictionResult> {
  try {
    const payload: PredictRequest = { ...input };
    const res = await postPredict(payload);

    return {
      cluster_id: res.cluster_id,
      cluster_name: res.cluster_name,
      summary: res.summary,
      business_action: res.business_action,
      probabilities: normaliseProbabilities(res.probabilities),
      model_status: res.model_status,
      isSimulated: false,
    };
  } catch (err) {
    if (isApiError(err)) {
      console.warn(
        `[PredictionService] Backend unavailable (${err.code}), using heuristic fallback.`,
      );
    } else {
      console.warn('[PredictionService] Unknown error, using heuristic fallback.', err);
    }
    return runHeuristic(input);
  }
}

/**
 * Classify multiple customers in parallel.
 * Each call is attempted against the real backend first.
 *
 * @real   POST /api/predict (once per customer)
 * @mock   Client-side heuristic (per failed call)
 */
export async function batchPredict(
  customers: PredictionInput[],
): Promise<PredictionResult[]> {
  return Promise.all(customers.map((c) => predictCustomer(c)));
}

/**
 * Retrieve a representative sample input for a given segment.
 *
 * @real   GET /api/example?segment=N
 * @mock   Hardcoded example inputs (when backend unavailable)
 *
 * @param segment  0–3 cluster index; omit for a random example
 */
export async function getExampleInput(
  segment?: number,
): Promise<PredictionInput> {
  try {
    const res: ExampleInputResponse = await fetchExample(segment);
    return {
      recency: res.recency,
      frequency: res.frequency,
      monetary_value: res.monetary_value,
      total_quantity: res.total_quantity,
      avg_unit_price: res.avg_unit_price,
    };
  } catch (err) {
    if (isApiError(err)) {
      console.warn('[PredictionService] Could not fetch example from backend, using local fallback.');
    }

    // Choose a valid segment or fall back to segment 0
    const seg = segment !== undefined && segment >= 0 && segment <= 3 ? segment : 0;
    return EXAMPLE_INPUTS[seg];
  }
}

/**
 * Return the cluster name for a given cluster id.
 * Utility for display purposes.
 */
export function getSegmentName(clusterId: number): string {
  return SEGMENT_NAMES[clusterId] ?? `Cluster ${clusterId}`;
}

/**
 * Return the recommended business action for a cluster id.
 * Utility for display purposes.
 */
export function getSegmentAction(clusterId: number): string {
  return SEGMENT_ACTIONS[clusterId] ?? '';
}
