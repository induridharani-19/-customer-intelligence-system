/**
 * reportService.ts
 * -----------------
 * Report generation and history service for the Customer Intelligence System.
 *
 * All functions in this file are MOCK — no backend calls are made.
 * Reports are generated from in-memory data and returned as strings or objects.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReportType =
  | 'customer_summary'
  | 'segment_analysis'
  | 'revenue_breakdown'
  | 'churn_risk'
  | 'acquisition_funnel'
  | 'rfm_analysis'
  | 'cohort_retention'
  | 'product_performance';

export type ReportFormat = 'csv' | 'json' | 'html';
export type ReportStatus = 'completed' | 'failed' | 'pending' | 'processing';

export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  segment?: string;
  status?: string;
  churnRisk?: string;
  country?: string;
  minSpending?: number;
  maxSpending?: number;
}

export interface ReportColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'currency' | 'percentage' | 'date';
}

export interface ReportData {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
  generatedAt: string;
  filters: ReportFilter;
  summary: Record<string, string | number>;
}

export interface SavedReport {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  createdAt: string;
  completedAt: string | null;
  fileSize: number | null; // bytes
  downloadUrl: string | null;
  createdBy: string;
  description: string;
  rowCount: number | null;
  filters: ReportFilter;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const delay = (ms = 80) => new Promise<void>((r) => setTimeout(r, ms));

let reportIdCounter = 1000;
function nextId(): string {
  return `RPT-${++reportIdCounter}`;
}

/** Escape a CSV cell value */
function csvCell(val: string | number | undefined | null): string {
  const s = String(val ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCSV(
  columns: ReportColumn[],
  rows: Record<string, string | number>[],
): string {
  const header = columns.map((c) => csvCell(c.label)).join(',');
  const body = rows.map((row) =>
    columns.map((c) => csvCell(row[c.key])).join(','),
  );
  return [header, ...body].join('\r\n');
}

// ---------------------------------------------------------------------------
// Report data templates
// ---------------------------------------------------------------------------

function buildCustomerSummaryData(filters: ReportFilter): ReportData {
  const columns: ReportColumn[] = [
    { key: 'segment',       label: 'Segment',               type: 'string'     },
    { key: 'customers',     label: 'Customer Count',         type: 'number'     },
    { key: 'share',         label: 'Share (%)',              type: 'percentage' },
    { key: 'avgSpend',      label: 'Avg. Lifetime Spend (£)', type: 'currency'  },
    { key: 'avgFrequency',  label: 'Avg. Frequency',         type: 'number'     },
    { key: 'avgRecency',    label: 'Avg. Recency (days)',    type: 'number'     },
    { key: 'churnRisk',     label: 'Churn Risk',             type: 'string'     },
    { key: 'estRevenue',    label: 'Est. Revenue (£)',       type: 'currency'   },
  ];

  const rows = [
    { segment: 'High-Value Customers', customers: 312, share: 18.0, avgSpend: 382.1, avgFrequency: 21.4, avgRecency: 18,  churnRisk: 'Low',      estRevenue: 119215 },
    { segment: 'Loyal Customers',      customers: 487, share: 28.0, avgSpend: 153.2, avgFrequency: 13.8, avgRecency: 35,  churnRisk: 'Low',      estRevenue: 74584  },
    { segment: 'Potential Loyalists',  customers: 654, share: 37.6, avgSpend: 32.8,  avgFrequency: 5.2,  avgRecency: 72,  churnRisk: 'Medium',   estRevenue: 21434  },
    { segment: 'At-Risk Customers',    customers: 289, share: 16.6, avgSpend: 5.0,   avgFrequency: 2.1,  avgRecency: 198, churnRisk: 'Critical', estRevenue: 1444   },
  ];

  return {
    id: nextId(),
    type: 'customer_summary',
    title: 'Customer Summary Report',
    description: 'Breakdown of all customer segments with key RFM metrics.',
    columns,
    rows,
    generatedAt: new Date().toISOString(),
    filters,
    summary: { totalCustomers: 1742, totalSegments: 4, avgChurnRate: '15.6%' },
  };
}

function buildSegmentAnalysisData(filters: ReportFilter): ReportData {
  const columns: ReportColumn[] = [
    { key: 'cluster_id',      label: 'Cluster ID',           type: 'number'   },
    { key: 'segment',         label: 'Segment Name',         type: 'string'   },
    { key: 'customers',       label: 'Customers',            type: 'number'   },
    { key: 'avgMonetary',     label: 'Avg. Monetary (£)',    type: 'currency' },
    { key: 'avgFrequency',    label: 'Avg. Frequency',       type: 'number'   },
    { key: 'avgRecency',      label: 'Avg. Recency (days)',  type: 'number'   },
    { key: 'avgUnitPrice',    label: 'Avg. Unit Price (£)',  type: 'currency' },
    { key: 'avgQuantity',     label: 'Avg. Quantity',        type: 'number'   },
    { key: 'growthRate',      label: 'MoM Growth (%)',       type: 'percentage'},
  ];

  const rows = [
    { cluster_id: 0, segment: 'High-Value Customers', customers: 312, avgMonetary: 17.9, avgFrequency: 21.4, avgRecency: 18,  avgUnitPrice: 14.6, avgQuantity: 165, growthRate: 8.0  },
    { cluster_id: 1, segment: 'Loyal Customers',      customers: 487, avgMonetary: 11.1, avgFrequency: 13.8, avgRecency: 35,  avgUnitPrice: 12.4, avgQuantity: 108, growthRate: 5.0  },
    { cluster_id: 2, segment: 'Potential Loyalists',  customers: 654, avgMonetary: 6.3,  avgFrequency: 5.2,  avgRecency: 72,  avgUnitPrice: 19.1, avgQuantity: 42,  growthRate: 12.0 },
    { cluster_id: 3, segment: 'At-Risk Customers',    customers: 289, avgMonetary: 2.4,  avgFrequency: 2.1,  avgRecency: 198, avgUnitPrice: 8.7,  avgQuantity: 17,  growthRate: -6.0 },
  ];

  return {
    id: nextId(),
    type: 'segment_analysis',
    title: 'Segment Analysis Report',
    description: 'Detailed RFM metrics and growth rates for each customer segment.',
    columns,
    rows,
    generatedAt: new Date().toISOString(),
    filters,
    summary: { bestK: 4, silhouetteScore: 0.527, totalSegments: 4 },
  };
}

function buildRevenueBreakdownData(filters: ReportFilter): ReportData {
  const columns: ReportColumn[] = [
    { key: 'month',              label: 'Month',              type: 'date'     },
    { key: 'revenue',            label: 'Revenue (£)',        type: 'currency' },
    { key: 'orders',             label: 'Orders',             type: 'number'   },
    { key: 'avgOrderValue',      label: 'Avg Order Value (£)',type: 'currency' },
    { key: 'newCustomers',       label: 'New Customers',      type: 'number'   },
    { key: 'returningCustomers', label: 'Returning',          type: 'number'   },
    { key: 'revenueGrowth',      label: 'Revenue Growth (%)', type: 'percentage'},
  ];

  const monthlyData = [
    { month: 'Nov 2024', revenue: 142800, orders: 1284, avgOrderValue: 111.2, newCustomers: 87,  returningCustomers: 1197, revenueGrowth: null   },
    { month: 'Dec 2024', revenue: 198400, orders: 1762, avgOrderValue: 112.6, newCustomers: 134, returningCustomers: 1628, revenueGrowth: 38.9   },
    { month: 'Jan 2025', revenue: 118500, orders: 1064, avgOrderValue: 111.4, newCustomers: 62,  returningCustomers: 1002, revenueGrowth: -40.3  },
    { month: 'Feb 2025', revenue: 131200, orders: 1187, avgOrderValue: 110.5, newCustomers: 71,  returningCustomers: 1116, revenueGrowth: 10.7   },
    { month: 'Mar 2025', revenue: 154700, orders: 1398, avgOrderValue: 110.7, newCustomers: 94,  returningCustomers: 1304, revenueGrowth: 17.9   },
    { month: 'Apr 2025', revenue: 162300, orders: 1461, avgOrderValue: 111.1, newCustomers: 102, returningCustomers: 1359, revenueGrowth: 4.9    },
    { month: 'May 2025', revenue: 178900, orders: 1601, avgOrderValue: 111.7, newCustomers: 118, returningCustomers: 1483, revenueGrowth: 10.2   },
    { month: 'Jun 2025', revenue: 171400, orders: 1537, avgOrderValue: 111.5, newCustomers: 109, returningCustomers: 1428, revenueGrowth: -4.2   },
    { month: 'Jul 2025', revenue: 185600, orders: 1672, avgOrderValue: 111.0, newCustomers: 125, returningCustomers: 1547, revenueGrowth: 8.3    },
    { month: 'Aug 2025', revenue: 192100, orders: 1724, avgOrderValue: 111.4, newCustomers: 131, returningCustomers: 1593, revenueGrowth: 3.5    },
    { month: 'Sep 2025', revenue: 207300, orders: 1861, avgOrderValue: 111.4, newCustomers: 148, returningCustomers: 1713, revenueGrowth: 7.9    },
    { month: 'Oct 2025', revenue: 224800, orders: 2016, avgOrderValue: 111.5, newCustomers: 162, returningCustomers: 1854, revenueGrowth: 8.4    },
  ];

  const rows = monthlyData.map((d) => ({
    ...d,
    revenueGrowth: d.revenueGrowth ?? 'N/A',
  }));

  return {
    id: nextId(),
    type: 'revenue_breakdown',
    title: 'Monthly Revenue Breakdown',
    description: 'Month-by-month revenue, orders, and customer acquisition.',
    columns,
    rows,
    generatedAt: new Date().toISOString(),
    filters,
    summary: { totalRevenue: 2068000, totalOrders: 18567, avgMoMGrowth: '6.0%' },
  };
}

function buildChurnRiskData(filters: ReportFilter): ReportData {
  const columns: ReportColumn[] = [
    { key: 'riskLevel',   label: 'Churn Risk',           type: 'string'     },
    { key: 'customers',   label: 'Customers',            type: 'number'     },
    { key: 'share',       label: 'Share (%)',             type: 'percentage' },
    { key: 'avgRecency',  label: 'Avg. Recency (days)',  type: 'number'     },
    { key: 'avgSpend',    label: 'Avg. Spend (£)',       type: 'currency'   },
    { key: 'lostRevenue', label: 'At-Risk Revenue (£)',  type: 'currency'   },
    { key: 'action',      label: 'Recommended Action',   type: 'string'     },
  ];

  const rows = [
    { riskLevel: 'Low',      customers: 799, share: 45.9, avgRecency: 27,  avgSpend: 268.4, lostRevenue: 0,      action: 'Maintain engagement with loyalty rewards'      },
    { riskLevel: 'Medium',   customers: 654, share: 37.5, avgRecency: 72,  avgSpend: 32.8,  lostRevenue: 21434,  action: 'Nurture with personalised email campaigns'      },
    { riskLevel: 'High',     customers: 147, share: 8.4,  avgRecency: 140, avgSpend: 18.2,  lostRevenue: 2675,   action: 'Reactivation offers with urgency messaging'     },
    { riskLevel: 'Critical', customers: 142, share: 8.1,  avgRecency: 220, avgSpend: 5.0,   lostRevenue: 710,    action: 'Last-chance win-back campaign or mark churned'  },
  ];

  return {
    id: nextId(),
    type: 'churn_risk',
    title: 'Churn Risk Analysis Report',
    description: 'Customer distribution by churn risk level with revenue impact.',
    columns,
    rows,
    generatedAt: new Date().toISOString(),
    filters,
    summary: { overallChurnRate: '15.6%', atRiskRevenue: '£24,819', totalAtRisk: 289 },
  };
}

function buildRFMAnalysisData(filters: ReportFilter): ReportData {
  const columns: ReportColumn[] = [
    { key: 'rfmScore',    label: 'RFM Score',            type: 'string'     },
    { key: 'customers',   label: 'Customers',            type: 'number'     },
    { key: 'recency',     label: 'Recency (days)',        type: 'number'     },
    { key: 'frequency',   label: 'Frequency',            type: 'number'     },
    { key: 'monetary',    label: 'Monetary (£)',         type: 'currency'   },
    { key: 'segment',     label: 'Mapped Segment',       type: 'string'     },
    { key: 'clv',         label: 'Est. CLV (£)',         type: 'currency'   },
  ];

  const rows = [
    { rfmScore: '555', customers: 48,  recency: 8,   frequency: 28.2, monetary: 21.4, segment: 'High-Value Customers', clv: 1842 },
    { rfmScore: '554', customers: 71,  recency: 12,  frequency: 24.1, monetary: 19.8, segment: 'High-Value Customers', clv: 1602 },
    { rfmScore: '544', customers: 89,  recency: 16,  frequency: 21.7, monetary: 17.2, segment: 'High-Value Customers', clv: 1374 },
    { rfmScore: '445', customers: 124, recency: 28,  frequency: 15.4, monetary: 13.8, segment: 'Loyal Customers',      clv: 982  },
    { rfmScore: '444', customers: 187, recency: 34,  frequency: 13.2, monetary: 11.0, segment: 'Loyal Customers',      clv: 798  },
    { rfmScore: '434', customers: 176, recency: 42,  frequency: 11.8, monetary: 9.6,  segment: 'Loyal Customers',      clv: 652  },
    { rfmScore: '334', customers: 198, recency: 58,  frequency: 6.8,  monetary: 7.2,  segment: 'Potential Loyalists',  clv: 368  },
    { rfmScore: '333', customers: 241, recency: 74,  frequency: 5.1,  monetary: 6.1,  segment: 'Potential Loyalists',  clv: 294  },
    { rfmScore: '322', customers: 215, recency: 92,  frequency: 3.9,  monetary: 4.8,  segment: 'Potential Loyalists',  clv: 196  },
    { rfmScore: '211', customers: 142, recency: 165, frequency: 2.4,  monetary: 2.8,  segment: 'At-Risk Customers',    clv: 82   },
    { rfmScore: '111', customers: 147, recency: 228, frequency: 1.8,  monetary: 1.9,  segment: 'At-Risk Customers',    clv: 38   },
    { rfmScore: '100', customers: 104, recency: 252, frequency: 1.1,  monetary: 1.1,  segment: 'At-Risk Customers',    clv: 14   },
  ];

  return {
    id: nextId(),
    type: 'rfm_analysis',
    title: 'RFM Score Analysis',
    description: 'Customer distribution across RFM score bands with CLV estimates.',
    columns,
    rows,
    generatedAt: new Date().toISOString(),
    filters,
    summary: { avgRFMScore: '3.8/5', topSegmentShare: '18%', avgCLV: '£482' },
  };
}

// ---------------------------------------------------------------------------
// Saved report history (mock — 10 records)
// ---------------------------------------------------------------------------

const SAVED_REPORTS_HISTORY: SavedReport[] = [
  {
    id: 'RPT-0991',
    name: 'Q3 2025 Customer Summary',
    type: 'customer_summary',
    format: 'csv',
    status: 'completed',
    createdAt: '2025-10-01T09:14:22Z',
    completedAt: '2025-10-01T09:14:31Z',
    fileSize: 48320,
    downloadUrl: '/reports/RPT-0991.csv',
    createdBy: 'Sarah Mitchell',
    description: 'Full customer summary for Q3 2025 with segment breakdown.',
    rowCount: 1742,
    filters: { dateFrom: '2025-07-01', dateTo: '2025-09-30' },
  },
  {
    id: 'RPT-0990',
    name: 'At-Risk Churn Report — October',
    type: 'churn_risk',
    format: 'csv',
    status: 'completed',
    createdAt: '2025-10-03T14:02:11Z',
    completedAt: '2025-10-03T14:02:19Z',
    fileSize: 12840,
    downloadUrl: '/reports/RPT-0990.csv',
    createdBy: 'James Liu',
    description: 'Customers flagged as high or critical churn risk in October.',
    rowCount: 289,
    filters: { churnRisk: 'critical', dateFrom: '2025-10-01' },
  },
  {
    id: 'RPT-0989',
    name: 'Revenue Breakdown — Sep 2025',
    type: 'revenue_breakdown',
    format: 'csv',
    status: 'completed',
    createdAt: '2025-10-02T08:30:00Z',
    completedAt: '2025-10-02T08:30:09Z',
    fileSize: 8192,
    downloadUrl: '/reports/RPT-0989.csv',
    createdBy: 'Priya Sharma',
    description: 'Monthly revenue breakdown for September 2025.',
    rowCount: 12,
    filters: { dateFrom: '2025-09-01', dateTo: '2025-09-30' },
  },
  {
    id: 'RPT-0988',
    name: 'Segment Analysis — All Segments',
    type: 'segment_analysis',
    format: 'csv',
    status: 'completed',
    createdAt: '2025-09-28T11:45:07Z',
    completedAt: '2025-09-28T11:45:18Z',
    fileSize: 6240,
    downloadUrl: '/reports/RPT-0988.csv',
    createdBy: 'Sarah Mitchell',
    description: 'Full segment analysis with RFM stats and growth rates.',
    rowCount: 4,
    filters: {},
  },
  {
    id: 'RPT-0987',
    name: 'High-Value Customer Export',
    type: 'customer_summary',
    format: 'csv',
    status: 'completed',
    createdAt: '2025-09-20T16:12:33Z',
    completedAt: '2025-09-20T16:12:44Z',
    fileSize: 29184,
    downloadUrl: '/reports/RPT-0987.csv',
    createdBy: 'Tom Henderson',
    description: 'Export of all High-Value Customers for CRM import.',
    rowCount: 312,
    filters: { segment: 'High-Value Customers' },
  },
  {
    id: 'RPT-0986',
    name: 'RFM Score Distribution',
    type: 'rfm_analysis',
    format: 'csv',
    status: 'completed',
    createdAt: '2025-09-15T10:08:54Z',
    completedAt: '2025-09-15T10:09:02Z',
    fileSize: 9728,
    downloadUrl: '/reports/RPT-0986.csv',
    createdBy: 'Priya Sharma',
    description: 'Full RFM score banding and CLV estimation.',
    rowCount: 12,
    filters: {},
  },
  {
    id: 'RPT-0985',
    name: 'Acquisition Funnel — Q2 2025',
    type: 'acquisition_funnel',
    format: 'csv',
    status: 'completed',
    createdAt: '2025-07-05T09:00:00Z',
    completedAt: '2025-07-05T09:00:14Z',
    fileSize: 4096,
    downloadUrl: '/reports/RPT-0985.csv',
    createdBy: 'James Liu',
    description: 'Customer acquisition by channel for Q2 2025.',
    rowCount: 8,
    filters: { dateFrom: '2025-04-01', dateTo: '2025-06-30' },
  },
  {
    id: 'RPT-0984',
    name: 'Cohort Retention — 2025',
    type: 'cohort_retention',
    format: 'csv',
    status: 'completed',
    createdAt: '2025-08-14T13:22:09Z',
    completedAt: '2025-08-14T13:22:28Z',
    fileSize: 18432,
    downloadUrl: '/reports/RPT-0984.csv',
    createdBy: 'Sarah Mitchell',
    description: 'Monthly cohort retention rates from Jan–Aug 2025.',
    rowCount: 64,
    filters: { dateFrom: '2025-01-01', dateTo: '2025-08-31' },
  },
  {
    id: 'RPT-0983',
    name: 'Churn Risk — UK Customers',
    type: 'churn_risk',
    format: 'csv',
    status: 'failed',
    createdAt: '2025-08-10T07:55:00Z',
    completedAt: null,
    fileSize: null,
    downloadUrl: null,
    createdBy: 'Tom Henderson',
    description: 'Churn risk report filtered to United Kingdom — generation failed.',
    rowCount: null,
    filters: { country: 'United Kingdom' },
  },
  {
    id: 'RPT-0982',
    name: 'Product Performance — H1 2025',
    type: 'product_performance',
    format: 'csv',
    status: 'completed',
    createdAt: '2025-07-02T15:40:00Z',
    completedAt: '2025-07-02T15:40:22Z',
    fileSize: 72704,
    downloadUrl: '/reports/RPT-0982.csv',
    createdBy: 'James Liu',
    description: 'Top-selling products and category revenue for H1 2025.',
    rowCount: 387,
    filters: { dateFrom: '2025-01-01', dateTo: '2025-06-30' },
  },
];

// ---------------------------------------------------------------------------
// Report data factory
// ---------------------------------------------------------------------------

function buildReportData(type: ReportType, filters: ReportFilter): ReportData {
  switch (type) {
    case 'customer_summary':
      return buildCustomerSummaryData(filters);
    case 'segment_analysis':
      return buildSegmentAnalysisData(filters);
    case 'revenue_breakdown':
      return buildRevenueBreakdownData(filters);
    case 'churn_risk':
      return buildChurnRiskData(filters);
    case 'rfm_analysis':
      return buildRFMAnalysisData(filters);
    default:
      // Generic fallback for types without a dedicated builder
      return {
        id: nextId(),
        type,
        title: `${type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} Report`,
        description: `Generated report for type: ${type}.`,
        columns: [
          { key: 'label', label: 'Label', type: 'string' },
          { key: 'value', label: 'Value', type: 'number' },
        ],
        rows: [{ label: 'No data available', value: 0 }],
        generatedAt: new Date().toISOString(),
        filters,
        summary: {},
      };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a CSV string for the given report type and optional filters.
 * Synchronous — returns the CSV string immediately.
 *
 * @mock  Always uses in-memory mock data.
 */
export function generateCSVReport(type: string, filters: ReportFilter = {}): string {
  const data = buildReportData(type as ReportType, filters);
  return rowsToCSV(data.columns, data.rows);
}

/**
 * Generate a full ReportData object for the given type.
 * Useful when building in-app report preview tables.
 *
 * @mock  Always uses in-memory mock data.
 */
export async function generateReportData(
  type: string,
  filters: ReportFilter = {},
): Promise<ReportData> {
  await delay(150); // simulate generation latency
  return buildReportData(type as ReportType, filters);
}

/**
 * Retrieve the history of previously generated reports (10 records).
 *
 * @mock  Always returns the static SAVED_REPORTS_HISTORY list.
 */
export async function getReportHistory(): Promise<SavedReport[]> {
  await delay(80);
  // Return a copy sorted newest first
  return [...SAVED_REPORTS_HISTORY].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Simulate scheduling a new report generation.
 * Returns a new SavedReport record with status 'processing'.
 *
 * @mock  Always simulated — no backend call.
 */
export async function scheduleReport(
  name: string,
  type: ReportType,
  format: ReportFormat,
  filters: ReportFilter = {},
  createdBy = 'Current User',
): Promise<SavedReport> {
  await delay(200);

  const id = nextId();
  const now = new Date().toISOString();

  return {
    id,
    name,
    type,
    format,
    status: 'processing',
    createdAt: now,
    completedAt: null,
    fileSize: null,
    downloadUrl: null,
    createdBy,
    description: `User-scheduled ${type.replace(/_/g, ' ')} report.`,
    rowCount: null,
    filters,
  };
}

/**
 * Return the human-readable label for a report type.
 */
export function getReportTypeLabel(type: ReportType): string {
  const labels: Record<ReportType, string> = {
    customer_summary:     'Customer Summary',
    segment_analysis:     'Segment Analysis',
    revenue_breakdown:    'Revenue Breakdown',
    churn_risk:           'Churn Risk Analysis',
    acquisition_funnel:   'Acquisition Funnel',
    rfm_analysis:         'RFM Analysis',
    cohort_retention:     'Cohort Retention',
    product_performance:  'Product Performance',
  };
  return labels[type] ?? type;
}
