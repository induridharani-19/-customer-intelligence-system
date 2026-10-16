/**
 * segmentService.ts
 * ------------------
 * Segment data service for the Customer Intelligence System.
 *
 * Call priority:
 *   1. GET /api/segments  (REAL backend) — getSegments
 *   2. Mock segment data                 — used when backend is unavailable
 *
 * getSegmentCustomers() and runSegmentation() are always mock — no
 * corresponding backend endpoints exist yet.
 */

import { fetchSegments, isApiError, SegmentData } from './api';
import { mockCustomers, Customer } from '../data/mockCustomers';

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export interface Segment extends SegmentData {
  /** Unique string identifier (mirrors cluster_id as string) */
  id: string;
  /** Hex colour for charts and badges */
  color: string;
  /** Churn risk classification */
  churnRisk: 'low' | 'medium' | 'high' | 'critical';
  /** Percentage share of total customer base */
  percentageShare: number;
  /** Estimated revenue contribution (£) */
  estimatedRevenue: number;
  /** Month-on-month growth rate (-1 to +1) */
  growthRate: number;
  /** Icon name / identifier for UI rendering */
  icon: string;
  /** Tag list for segment characteristics */
  tags: string[];
}

export interface SegmentationConfig {
  /** Number of clusters to form */
  clusters: number;
  /** Feature columns to use (e.g. ['recency', 'frequency', 'monetary_value']) */
  features: string[];
  /** Optional: normalisation strategy */
  normalisation?: 'standard' | 'minmax' | 'none';
}

export interface SimulatedSegmentResult {
  /** Resulting segments after re-segmentation */
  segments: Segment[];
  /** Silhouette score of the new clustering */
  silhouetteScore: number;
  /** Inertia of the new clustering */
  inertia: number;
  /** Number of clusters used */
  k: number;
  /** Duration of the simulated run in ms */
  durationMs: number;
  /** Always true — this is a client-side simulation */
  isSimulated: true;
}

// ---------------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------------

const SEGMENT_COLORS: Record<number, string> = {
  0: '#6366f1',
  1: '#10b981',
  2: '#f59e0b',
  3: '#ef4444',
};

const CHURN_RISK: Record<number, Segment['churnRisk']> = {
  0: 'low',
  1: 'low',
  2: 'medium',
  3: 'critical',
};

const SEGMENT_ICONS: Record<number, string> = {
  0: 'crown',
  1: 'heart',
  2: 'trending-up',
  3: 'alert-triangle',
};

const SEGMENT_TAGS: Record<number, string[]> = {
  0: ['high-spend', 'frequent', 'recent', 'vip'],
  1: ['repeat-buyer', 'consistent', 'engaged'],
  2: ['growing', 'mid-tier', 'nurture', 'potential'],
  3: ['inactive', 'lapsing', 'win-back', 'churned'],
};

// ---------------------------------------------------------------------------
// Mock segments
// ---------------------------------------------------------------------------

const MOCK_SEGMENT_DATA: SegmentData[] = [
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

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function enrichSegment(seg: SegmentData, totalCustomers: number): Segment {
  const estimatedRevenue = seg.avg_frequency * seg.avg_monetary * seg.customer_count;

  const growthRateMap: Record<number, number> = { 0: 0.08, 1: 0.05, 2: 0.12, 3: -0.06 };

  return {
    ...seg,
    id: String(seg.cluster_id),
    color: SEGMENT_COLORS[seg.cluster_id] ?? '#94a3b8',
    churnRisk: CHURN_RISK[seg.cluster_id] ?? 'medium',
    percentageShare:
      totalCustomers > 0
        ? parseFloat(((seg.customer_count / totalCustomers) * 100).toFixed(1))
        : 0,
    estimatedRevenue: parseFloat(estimatedRevenue.toFixed(2)),
    growthRate: parseFloat((growthRateMap[seg.cluster_id] ?? 0).toFixed(3)),
    icon: SEGMENT_ICONS[seg.cluster_id] ?? 'users',
    tags: SEGMENT_TAGS[seg.cluster_id] ?? [],
  };
}

function buildSegments(raw: SegmentData[]): Segment[] {
  const total = raw.reduce((s, seg) => s + seg.customer_count, 0);
  return raw.map((seg) => enrichSegment(seg, total));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve all customer segments.
 *
 * @real  GET /api/segments
 * @mock  MOCK_SEGMENT_DATA (when backend unavailable)
 */
export async function getSegments(): Promise<Segment[]> {
  try {
    const res = await fetchSegments();
    return buildSegments(res.segments);
  } catch (err) {
    if (isApiError(err)) {
      console.warn(`[SegmentService] Segments fetch failed (${err.code}), using mock data.`);
    } else {
      console.warn('[SegmentService] Segments fetch failed, using mock data.', err);
    }
    return buildSegments(MOCK_SEGMENT_DATA);
  }
}

/**
 * Retrieve a single segment by its string id (cluster_id as string).
 *
 * @real  GET /api/segments (fetches all, then filters)
 * @mock  MOCK_SEGMENT_DATA filtered (when backend unavailable)
 */
export async function getSegmentById(id: string): Promise<Segment | null> {
  const segments = await getSegments();
  return segments.find((s) => s.id === id) ?? null;
}

/**
 * Retrieve customers that belong to a specific segment.
 * Filters mockCustomers by the segment name associated with the given id.
 *
 * @mock  Always uses mockCustomers — no backend endpoint for this.
 */
export async function getSegmentCustomers(segmentId: string): Promise<Customer[]> {
  // Simulate network latency
  await new Promise<void>((r) => setTimeout(r, 80));

  const segmentNameMap: Record<string, string> = {
    '0': 'High-Value Customers',
    '1': 'Loyal Customers',
    '2': 'Potential Loyalists',
    '3': 'At-Risk Customers',
  };

  const segmentName = segmentNameMap[segmentId];
  if (!segmentName) return [];

  return mockCustomers.filter(
    (c) => c.segment?.toLowerCase() === segmentName.toLowerCase(),
  );
}

/**
 * Simulate running K-Means re-segmentation with a user-defined config.
 * Always a client-side simulation with a 2-second artificial delay to
 * replicate the backend training time.
 *
 * @mock  Always simulated — no backend training endpoint yet.
 *
 * @param config  Cluster count and feature columns to include.
 */
export async function runSegmentation(
  config: SegmentationConfig,
): Promise<SimulatedSegmentResult> {
  const start = Date.now();

  // Simulate model training time
  await new Promise<void>((r) => setTimeout(r, 2000));

  const k = Math.max(2, Math.min(config.clusters, 8));

  // Generate k synthetic segments deterministically from k
  const syntheticSegments: SegmentData[] = Array.from({ length: k }, (_, i) => {
    const decayFactor = 1 - i / k;
    return {
      cluster_id: i,
      cluster_name: `Cluster ${i} (k=${k})`,
      customer_count: Math.round(1742 * (decayFactor * 0.6 + 0.1)),
      avg_recency: Math.round(20 + i * 40),
      avg_frequency: parseFloat((20 - i * 3.5).toFixed(1)),
      avg_monetary: parseFloat((18 - i * 3).toFixed(1)),
      avg_total_quantity: Math.round(160 - i * 28),
      avg_unit_price: parseFloat((14 + i * 1.5).toFixed(1)),
      description: `Synthetic cluster ${i} generated with k=${k}.`,
      business_action: 'Review cluster composition and assign strategic action.',
    };
  });

  const segments = buildSegments(syntheticSegments);

  // Synthetic quality metrics that peak around k=4
  const silhouetteScore = parseFloat(
    Math.max(0.25, 0.53 - Math.abs(k - 4) * 0.04).toFixed(3),
  );
  const inertia = parseFloat((9500 - k * 600 + k * k * 30).toFixed(1));

  return {
    segments,
    silhouetteScore,
    inertia,
    k,
    durationMs: Date.now() - start,
    isSimulated: true,
  };
}
