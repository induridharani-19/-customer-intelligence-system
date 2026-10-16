/**
 * api.ts
 * -------
 * Central Axios instance for the Customer Intelligence System.
 * All calls in this file use VITE_API_URL when it is configured. This lets the
 * Vercel frontend call the Render API in production and still use the local
 * FastAPI server during development.
 * Individual services import from here and add their own fallback logic.
 */

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// ---------------------------------------------------------------------------
// Environment / base URL
// ---------------------------------------------------------------------------

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');

const BASE_URL = configuredApiUrl || 'http://127.0.0.1:8000';

// ---------------------------------------------------------------------------
// Shared domain types
// ---------------------------------------------------------------------------

/** A single customer segment as returned by /api/segments */
export interface SegmentData {
  /** Numeric cluster id (0-based) */
  cluster_id: number;
  /** Human-readable segment name */
  cluster_name: string;
  /** Total number of customers in this segment */
  customer_count: number;
  /** Average recency in days */
  avg_recency: number;
  /** Average purchase frequency */
  avg_frequency: number;
  /** Average monetary value (£) */
  avg_monetary: number;
  /** Average total quantity ordered */
  avg_total_quantity: number;
  /** Average unit price (£) */
  avg_unit_price: number;
  /** Short business description of the segment */
  description?: string;
  /** Suggested action for this segment */
  business_action?: string;
}

/** K-Means evaluation metric for a single value of k */
export interface KMeansMetric {
  k: number;
  inertia: number;
  silhouette_score: number;
  calinski_harabasz: number;
  davies_bouldin: number;
}

/** Model artifact paths/metadata returned by /api/dashboard */
export interface ArtifactInfo {
  model_path?: string;
  scaler_path?: string;
  encoder_path?: string;
  plot_elbow?: string;
  plot_silhouette?: string;
  plot_scatter?: string;
  trained_at?: string;
}

// ---------------------------------------------------------------------------
// Endpoint-specific response shapes
// ---------------------------------------------------------------------------

/** GET /api/health */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  prediction_mode: 'model' | 'heuristic';
  segments_available: boolean;
  metrics_available: boolean;
  version?: string;
  uptime_seconds?: number;
}

/** GET /api/segments */
export interface SegmentsResponse {
  segments: SegmentData[];
}

/** GET /api/metrics */
export interface MetricsResponse {
  kmeans: KMeansMetric[];
}

/** GET /api/dashboard */
export interface DashboardResponse {
  segments: SegmentData[];
  kmeans: KMeansMetric[];
  best_k: number;
  artifacts: ArtifactInfo;
}

/** POST /api/predict – request body */
export interface PredictRequest {
  recency: number;
  frequency: number;
  monetary_value: number;
  total_quantity: number;
  avg_unit_price: number;
}

/** POST /api/predict – response */
export interface PredictResponse {
  /** 0-based cluster index */
  cluster_id: number;
  /** Human-readable segment name */
  cluster_name: string;
  /** One-line summary of the customer profile */
  summary: string;
  /** Recommended business action */
  business_action: string;
  /**
   * Probability scores for each cluster.
   * Shape: [[cluster_id, probability], ...]  e.g. [[0, 0.72], [1, 0.18], …]
   */
  probabilities: number[][];
  /** 'model' | 'heuristic' */
  model_status: string;
}

/** GET /api/example?segment=N – response */
export interface ExampleInputResponse {
  recency: number;
  frequency: number;
  monetary_value: number;
  total_quantity: number;
  avg_unit_price: number;
}

// ---------------------------------------------------------------------------
// Typed error class
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly detail: string;
  public readonly isNetworkError: boolean;

  constructor(options: {
    message: string;
    status: number;
    code: string;
    detail: string;
    isNetworkError?: boolean;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.detail = options.detail;
    this.isNetworkError = options.isNetworkError ?? false;
  }
}

/** Returns `true` if the error is an `ApiError` instance */
export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach auth token when available
// ---------------------------------------------------------------------------

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('cis_auth_token')
        : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Helpful debug log in development only
    if (import.meta.env.DEV) {
      console.debug(
        `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        config.params ?? config.data ?? '',
      );
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor — normalise errors into ApiError
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ detail?: string; message?: string; code?: string }>) => {
    if (!error.response) {
      // Network / timeout / CORS
      return Promise.reject(
        new ApiError({
          message: 'Network error – unable to reach the backend server.',
          status: 0,
          code: 'NETWORK_ERROR',
          detail:
            error.message ||
            'Check that the backend is running on ' + BASE_URL,
          isNetworkError: true,
        }),
      );
    }

    const { status, data } = error.response;
    const detail =
      data?.detail || data?.message || error.message || 'Unknown error';

    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
      500: 'SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };

    return Promise.reject(
      new ApiError({
        message: `API ${status}: ${detail}`,
        status,
        code: data?.code || codeMap[status] || 'API_ERROR',
        detail,
      }),
    );
  },
);

// ---------------------------------------------------------------------------
// Typed endpoint helpers
// ---------------------------------------------------------------------------

/** GET /api/health — check backend liveness */
export async function fetchHealth(): Promise<HealthResponse> {
  const res = await api.get<HealthResponse>('/api/health');
  return res.data;
}

/** GET /api/segments — retrieve all customer segments */
export async function fetchSegments(): Promise<SegmentsResponse> {
  const res = await api.get<SegmentsResponse>('/api/segments');
  return res.data;
}

/** GET /api/metrics — retrieve K-Means evaluation metrics */
export async function fetchMetrics(): Promise<MetricsResponse> {
  const res = await api.get<MetricsResponse>('/api/metrics');
  return res.data;
}

/** GET /api/dashboard — full dashboard payload */
export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await api.get<DashboardResponse>('/api/dashboard');
  return res.data;
}

/** POST /api/predict — classify a single customer */
export async function postPredict(body: PredictRequest): Promise<PredictResponse> {
  const res = await api.post<PredictResponse>('/api/predict', body);
  return res.data;
}

/** GET /api/example?segment=N — fetch a sample RFM input for a given segment */
export async function fetchExample(segment?: number): Promise<ExampleInputResponse> {
  const res = await api.get<ExampleInputResponse>('/api/example', {
    params: segment !== undefined ? { segment } : undefined,
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Low-level escape hatch — raw Axios instance for ad-hoc calls
// ---------------------------------------------------------------------------
export default api;
