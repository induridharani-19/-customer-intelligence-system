/**
 * analyticsService.ts
 * --------------------
 * Analytics data service for the Customer Intelligence System.
 *
 * Call priority:
 *   1. GET /api/dashboard   (REAL backend) — getDashboardData, getKMeansMetrics, getSegmentMetrics
 *   2. Mock data from '../data/mockAnalytics' — used when backend is unavailable
 *
 * getRevenueData() and getAcquisitionData() are always mock — no backend endpoint exists.
 */

import {
  fetchDashboard,
  fetchMetrics,
  isApiError,
  SegmentData,
  KMeansMetric,
  DashboardResponse,
} from './api';

// ---------------------------------------------------------------------------
// Supplementary types
// ---------------------------------------------------------------------------

export interface RevenueDataPoint {
  month: string;         // e.g. 'Jan 2025'
  revenue: number;       // £
  orders: number;
  avgOrderValue: number; // £
  newCustomers: number;
  returningCustomers: number;
}

export interface AcquisitionDataPoint {
  channel: string;
  customers: number;
  revenue: number;
  conversionRate: number; // 0–1
  avgCac: number;         // Cost-per-acquisition £
}

export interface SegmentMetric extends SegmentData {
  /** Percentage share of total customer base */
  percentageShare: number;
  /** Estimated segment revenue contribution £ */
  estimatedRevenue: number;
  /** Month-on-month growth rate (-1 to +1) */
  growthRate: number;
  /** Churn risk label */
  churnRisk: 'low' | 'medium' | 'high' | 'critical';
  /** Primary colour used in charts */
  color: string;
}

export interface DashboardSummary {
  totalCustomers: number;
  totalRevenue: number;
  avgOrderValue: number;
  churnRate: number;
  segments: SegmentMetric[];
  kmeans: KMeansMetric[];
  bestK: number;
  lastUpdated: string;
  isLive: boolean; // true when data came from the real backend
}

// ---------------------------------------------------------------------------
// Segment colour palette
// ---------------------------------------------------------------------------

const SEGMENT_COLORS: Record<number, string> = {
  0: '#6366f1', // indigo  — High-Value
  1: '#10b981', // emerald — Loyal
  2: '#f59e0b', // amber   — Potential Loyalists
  3: '#ef4444', // red     — At-Risk
};

const CHURN_RISK_MAP: Record<number, SegmentMetric['churnRisk']> = {
  0: 'low',
  1: 'low',
  2: 'medium',
  3: 'critical',
};

// ---------------------------------------------------------------------------
// Mock data (used when backend is unavailable)
// ---------------------------------------------------------------------------

const MOCK_SEGMENTS: SegmentData[] = [
  {
    cluster_id: 0,
    cluster_name: 'High-Value Customers',
    customer_count: 312,
    avg_recency: 18,
    avg_frequency: 21.4,
    avg_monetary: 17.9,
    avg_total_quantity: 165,
    avg_unit_price: 14.6,
    description: 'Frequent, high-spend buyers who purchased recently.',
    business_action: 'Offer VIP loyalty rewards and early product access.',
  },
  {
    cluster_id: 1,
    cluster_name: 'Loyal Customers',
    customer_count: 487,
    avg_recency: 35,
    avg_frequency: 13.8,
    avg_monetary: 11.1,
    avg_total_quantity: 108,
    avg_unit_price: 12.4,
    description: 'Consistently active with solid repeat purchase behaviour.',
    business_action: 'Provide personalised bundle offers and tiered discounts.',
  },
  {
    cluster_id: 2,
    cluster_name: 'Potential Loyalists',
    customer_count: 654,
    avg_recency: 72,
    avg_frequency: 5.2,
    avg_monetary: 6.3,
    avg_total_quantity: 42,
    avg_unit_price: 19.1,
    description: 'Promising customers beginning to show loyalty signals.',
    business_action: 'Launch targeted email campaigns with loyalty card offers.',
  },
  {
    cluster_id: 3,
    cluster_name: 'At-Risk Customers',
    customer_count: 289,
    avg_recency: 198,
    avg_frequency: 2.1,
    avg_monetary: 2.4,
    avg_total_quantity: 17,
    avg_unit_price: 8.7,
    description: 'Previously active, now showing declining engagement.',
    business_action: 'Deploy win-back campaigns with time-limited discounts.',
  },
];

const MOCK_KMEANS: KMeansMetric[] = [
  { k: 2, inertia: 18540.2, silhouette_score: 0.412, calinski_harabasz: 342.1, davies_bouldin: 0.98 },
  { k: 3, inertia: 12830.7, silhouette_score: 0.481, calinski_harabasz: 428.6, davies_bouldin: 0.82 },
  { k: 4, inertia: 9245.1,  silhouette_score: 0.527, calinski_harabasz: 512.3, davies_bouldin: 0.71 },
  { k: 5, inertia: 7382.4,  silhouette_score: 0.498, calinski_harabasz: 489.7, davies_bouldin: 0.75 },
  { k: 6, inertia: 6114.9,  silhouette_score: 0.463, calinski_harabasz: 445.2, davies_bouldin: 0.84 },
  { k: 7, inertia: 5203.8,  silhouette_score: 0.431, calinski_harabasz: 408.1, davies_bouldin: 0.90 },
  { k: 8, inertia: 4527.3,  silhouette_score: 0.408, calinski_harabasz: 372.4, davies_bouldin: 0.97 },
];

const MOCK_REVENUE: RevenueDataPoint[] = [
  { month: 'Nov 2024', revenue: 142800, orders: 1284, avgOrderValue: 111.2, newCustomers: 87,  returningCustomers: 1197 },
  { month: 'Dec 2024', revenue: 198400, orders: 1762, avgOrderValue: 112.6, newCustomers: 134, returningCustomers: 1628 },
  { month: 'Jan 2025', revenue: 118500, orders: 1064, avgOrderValue: 111.4, newCustomers: 62,  returningCustomers: 1002 },
  { month: 'Feb 2025', revenue: 131200, orders: 1187, avgOrderValue: 110.5, newCustomers: 71,  returningCustomers: 1116 },
  { month: 'Mar 2025', revenue: 154700, orders: 1398, avgOrderValue: 110.7, newCustomers: 94,  returningCustomers: 1304 },
  { month: 'Apr 2025', revenue: 162300, orders: 1461, avgOrderValue: 111.1, newCustomers: 102, returningCustomers: 1359 },
  { month: 'May 2025', revenue: 178900, orders: 1601, avgOrderValue: 111.7, newCustomers: 118, returningCustomers: 1483 },
  { month: 'Jun 2025', revenue: 171400, orders: 1537, avgOrderValue: 111.5, newCustomers: 109, returningCustomers: 1428 },
  { month: 'Jul 2025', revenue: 185600, orders: 1672, avgOrderValue: 111.0, newCustomers: 125, returningCustomers: 1547 },
  { month: 'Aug 2025', revenue: 192100, orders: 1724, avgOrderValue: 111.4, newCustomers: 131, returningCustomers: 1593 },
  { month: 'Sep 2025', revenue: 207300, orders: 1861, avgOrderValue: 111.4, newCustomers: 148, returningCustomers: 1713 },
  { month: 'Oct 2025', revenue: 224800, orders: 2016, avgOrderValue: 111.5, newCustomers: 162, returningCustomers: 1854 },
];

const MOCK_ACQUISITION: AcquisitionDataPoint[] = [
  { channel: 'Organic Search', customers: 482, revenue: 62840, conversionRate: 0.034, avgCac: 14.2 },
  { channel: 'Email Marketing', customers: 341, revenue: 49620, conversionRate: 0.121, avgCac: 8.7  },
  { channel: 'Paid Search',     customers: 287, revenue: 38540, conversionRate: 0.028, avgCac: 31.5 },
  { channel: 'Social Media',    customers: 214, revenue: 24810, conversionRate: 0.019, avgCac: 22.1 },
  { channel: 'Referral',        customers: 168, revenue: 31240, conversionRate: 0.087, avgCac: 6.4  },
  { channel: 'Direct',          customers: 129, revenue: 19870, conversionRate: 0.062, avgCac: 0.0  },
  { channel: 'Affiliate',       customers: 94,  revenue: 14120, conversionRate: 0.041, avgCac: 18.6 },
  { channel: 'Display Ads',     customers: 63,  revenue: 7840,  conversionRate: 0.009, avgCac: 41.3 },
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Enrich raw SegmentData with display-ready computed fields */
function enrichSegments(segments: SegmentData[]): SegmentMetric[] {
  const totalCustomers = segments.reduce((s, seg) => s + seg.customer_count, 0);

  return segments.map((seg) => {
    const estimatedRevenue =
      seg.avg_frequency * seg.avg_monetary * seg.customer_count;

    // Synthetic growth rate: higher-value clusters show positive growth
    const growthRateBase =
      seg.cluster_id === 0 ? 0.08 :
      seg.cluster_id === 1 ? 0.05 :
      seg.cluster_id === 2 ? 0.12 :
      -0.06;

    return {
      ...seg,
      percentageShare: totalCustomers > 0
        ? parseFloat(((seg.customer_count / totalCustomers) * 100).toFixed(1))
        : 0,
      estimatedRevenue: parseFloat(estimatedRevenue.toFixed(2)),
      growthRate: parseFloat(growthRateBase.toFixed(3)),
      churnRisk: CHURN_RISK_MAP[seg.cluster_id] ?? 'medium',
      color: SEGMENT_COLORS[seg.cluster_id] ?? '#94a3b8',
    };
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch the full dashboard payload.
 *
 * @real  GET /api/dashboard
 * @mock  MOCK_SEGMENTS + MOCK_KMEANS (when backend unavailable)
 */
export async function getDashboardData(): Promise<DashboardSummary> {
  let raw: DashboardResponse | null = null;
  let isLive = false;

  try {
    raw = await fetchDashboard();
    isLive = true;
  } catch (err) {
    if (isApiError(err)) {
      console.warn(`[AnalyticsService] Dashboard fetch failed (${err.code}), using mock data.`);
    } else {
      console.warn('[AnalyticsService] Dashboard fetch failed, using mock data.', err);
    }
  }

  const segments = enrichSegments(raw?.segments ?? MOCK_SEGMENTS);
  const kmeans = raw?.kmeans ?? MOCK_KMEANS;
  const bestK = raw?.best_k ?? 4;
  const totalCustomers = segments.reduce((s, seg) => s + seg.customer_count, 0);
  const totalRevenue = segments.reduce((s, seg) => s + seg.estimatedRevenue, 0);
  const totalOrders = segments.reduce(
    (s, seg) => s + seg.customer_count * seg.avg_frequency, 0
  );

  return {
    totalCustomers,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    avgOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0,
    churnRate: 0.156, // synthetic — no backend endpoint provides this yet
    segments,
    kmeans,
    bestK,
    lastUpdated: new Date().toISOString(),
    isLive,
  };
}

/**
 * Fetch K-Means evaluation metrics for the elbow / silhouette charts.
 *
 * @real  GET /api/metrics
 * @mock  MOCK_KMEANS (when backend unavailable)
 */
export async function getKMeansMetrics(): Promise<KMeansMetric[]> {
  try {
    const res = await fetchMetrics();
    return res.kmeans;
  } catch (err) {
    if (isApiError(err)) {
      console.warn(`[AnalyticsService] Metrics fetch failed (${err.code}), using mock.`);
    }
    return MOCK_KMEANS;
  }
}

/**
 * Fetch enriched segment metrics (uses /api/dashboard under the hood).
 *
 * @real  GET /api/dashboard
 * @mock  MOCK_SEGMENTS enriched (when backend unavailable)
 */
export async function getSegmentMetrics(): Promise<SegmentMetric[]> {
  try {
    const res = await fetchDashboard();
    return enrichSegments(res.segments);
  } catch (err) {
    if (isApiError(err)) {
      console.warn(`[AnalyticsService] Segment fetch failed (${err.code}), using mock.`);
    }
    return enrichSegments(MOCK_SEGMENTS);
  }
}

/**
 * Monthly revenue time-series data.
 *
 * @mock  Always returns mock data — no backend endpoint provides this.
 */
export async function getRevenueData(): Promise<RevenueDataPoint[]> {
  // Simulate async I/O
  await new Promise<void>((r) => setTimeout(r, 60));
  return MOCK_REVENUE;
}

/**
 * Customer acquisition breakdown by marketing channel.
 *
 * @mock  Always returns mock data — no backend endpoint provides this.
 */
export async function getAcquisitionData(): Promise<AcquisitionDataPoint[]> {
  await new Promise<void>((r) => setTimeout(r, 60));
  return MOCK_ACQUISITION;
}

/**
 * Convenience: all analytics data in a single call.
 * Parallel-fetches dashboard, revenue, and acquisition data.
 *
 * @real  GET /api/dashboard (for segments & kmeans)
 * @mock  Revenue & acquisition always use mock data.
 */
export async function getAllAnalytics(): Promise<{
  dashboard: DashboardSummary;
  revenue: RevenueDataPoint[];
  acquisition: AcquisitionDataPoint[];
}> {
  const [dashboard, revenue, acquisition] = await Promise.all([
    getDashboardData(),
    getRevenueData(),
    getAcquisitionData(),
  ]);
  return { dashboard, revenue, acquisition };
}
