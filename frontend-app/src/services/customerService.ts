/**
 * customerService.ts
 * -------------------
 * Pure mock service — all data comes from '../data/mockCustomers'.
 * NO real backend calls are made from this file.
 *
 * Provides pagination, filtering, sorting, CSV export, and a mock
 * transaction history for individual customers.
 */

import { mockCustomers, Customer } from '../data/mockCustomers';

// ---------------------------------------------------------------------------
// Exported interfaces
// ---------------------------------------------------------------------------

export interface CustomerFilters {
  /** Free-text search across name, email, company */
  search?: string;
  /** Filter by segment name (e.g. 'High-Value Customers') */
  segment?: string;
  /** Filter by account status: 'active' | 'inactive' | 'churned' */
  status?: string;
  /** Filter by churn risk: 'low' | 'medium' | 'high' | 'critical' */
  churnRisk?: string;
  /** Minimum lifetime spending (£) */
  minSpending?: number;
  /** Maximum lifetime spending (£) */
  maxSpending?: number;
  /** 1-based page number */
  page?: number;
  /** Records per page */
  pageSize?: number;
  /** Field name to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  date: string;           // ISO date string
  invoiceNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  country: string;
  status: 'completed' | 'refunded' | 'pending';
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Simulate async I/O latency */
const delay = (ms = 120) => new Promise<void>((r) => setTimeout(r, ms));

/** Case-insensitive string match */
const ci = (a: string, b: string) =>
  a.toLowerCase().includes(b.toLowerCase());

/** Safe string access for nested paths used in sorting */
function getField(obj: Customer, field: string): string | number {
  return (obj as unknown as Record<string, string | number>)[field] ?? '';
}

/** Sort comparator for Customer rows */
function compare(a: Customer, b: Customer, sortBy: string, sortOrder: 'asc' | 'desc'): number {
  const av = getField(a, sortBy);
  const bv = getField(b, sortBy);
  if (av < bv) return sortOrder === 'asc' ? -1 : 1;
  if (av > bv) return sortOrder === 'asc' ? 1 : -1;
  return 0;
}

/** Deterministic pseudo-random number from a string seed */
function seededRandom(seed: string, index: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  h = (h + index * 2654435761) | 0;
  return ((h >>> 0) / 0xffffffff);
}

// ---------------------------------------------------------------------------
// Mock transaction data generator
// ---------------------------------------------------------------------------

const PRODUCT_NAMES = [
  'Ceramic Mug Set',
  'Hand-Painted Candles',
  'Vintage Lamp',
  'Silk Cushion Cover',
  'Bamboo Storage Box',
  'Wicker Basket',
  'Glass Vase',
  'Scented Diffuser',
  'Linen Table Runner',
  'Copper Lantern',
  'Embroidered Throw',
  'Porcelain Bowl',
  'Rattan Tray',
  'Beeswax Wraps Pack',
  'Terracotta Planter',
  'Jute Shopping Bag',
  'Soy Wax Candle',
  'Handmade Soap Bar',
  'Wooden Serving Board',
  'Cotton Hammam Towel',
];

const INVOICE_PREFIXES = ['INV', 'ORD', 'PO', 'REC'];

function generateTransactions(customerId: string, count: number): CustomerTransaction[] {
  const txns: CustomerTransaction[] = [];
  const customer = mockCustomers.find((c) => c.id === customerId);
  const country = customer?.country ?? 'United Kingdom';

  for (let i = 0; i < count; i++) {
    const r = seededRandom(customerId, i);
    const r2 = seededRandom(customerId + 'b', i);
    const r3 = seededRandom(customerId + 'c', i);

    const daysAgo = Math.floor(r * 365 * 2);         // up to 2 years ago
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const quantity = Math.floor(r2 * 24) + 1;
    const unitPrice = parseFloat((r3 * 48 + 1.5).toFixed(2));
    const total = parseFloat((quantity * unitPrice).toFixed(2));

    const prefix = INVOICE_PREFIXES[Math.floor(r * INVOICE_PREFIXES.length)];
    const invoiceNo = `${prefix}-${100000 + Math.floor(r2 * 900000)}`;

    const productIndex = Math.floor(r3 * PRODUCT_NAMES.length);
    const description = PRODUCT_NAMES[productIndex];

    const statusRoll = seededRandom(customerId + 'd', i);
    const status: CustomerTransaction['status'] =
      statusRoll > 0.92 ? 'refunded' : statusRoll > 0.85 ? 'pending' : 'completed';

    txns.push({
      id: `${customerId}-txn-${i}`,
      customerId,
      date: date.toISOString().split('T')[0],
      invoiceNo,
      description,
      quantity,
      unitPrice,
      total,
      country,
      status,
    });
  }

  // Sort newest first
  return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve a paginated, filtered, sorted list of customers.
 * Data source: mockCustomers (no backend call).
 */
export async function getCustomers(
  filters: CustomerFilters = {},
): Promise<PaginatedResult<Customer>> {
  await delay(80);

  const {
    search,
    segment,
    status,
    churnRisk,
    minSpending,
    maxSpending,
    page = 1,
    pageSize = 20,
    sortBy = 'name',
    sortOrder = 'asc',
  } = filters;

  let results = [...mockCustomers];

  // --- Filters ---
  if (search) {
    results = results.filter(
      (c) =>
        ci(c.name, search) ||
        ci(c.email, search) ||
        (c.company && ci(c.company, search)) ||
        ci(c.id, search),
    );
  }

  if (segment) {
    results = results.filter((c) =>
      ci(c.segment ?? '', segment),
    );
  }

  if (status) {
    results = results.filter((c) =>
      (c.status ?? '').toLowerCase() === status.toLowerCase(),
    );
  }

  if (churnRisk) {
    results = results.filter((c) =>
      (c.churnRisk ?? '').toLowerCase() === churnRisk.toLowerCase(),
    );
  }

  if (minSpending !== undefined) {
    results = results.filter((c) => (c.totalSpending ?? 0) >= minSpending);
  }

  if (maxSpending !== undefined) {
    results = results.filter((c) => (c.totalSpending ?? 0) <= maxSpending);
  }

  // --- Sort ---
  results = results.sort((a, b) => compare(a, b, sortBy, sortOrder));

  // --- Paginate ---
  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const start = (clampedPage - 1) * pageSize;
  const data = results.slice(start, start + pageSize);

  return { data, total, page: clampedPage, pageSize, totalPages };
}

/**
 * Retrieve a single customer by ID.
 * Data source: mockCustomers (no backend call).
 * Returns null if not found.
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  await delay(60);
  return mockCustomers.find((c) => c.id === id) ?? null;
}

/**
 * Full-text search across customer name, email, company and ID.
 * Returns up to 10 results for autocomplete / quick-search use cases.
 * Data source: mockCustomers (no backend call).
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  await delay(40);
  if (!query.trim()) return [];

  return mockCustomers
    .filter(
      (c) =>
        ci(c.name, query) ||
        ci(c.email, query) ||
        (c.company && ci(c.company, query)) ||
        ci(c.id, query),
    )
    .slice(0, 10);
}

/**
 * Generate a CSV string for the currently filtered customer list.
 * Synchronous — returns the CSV string directly (no await needed).
 * Data source: mockCustomers (no backend call).
 */
export function exportCustomersCSV(filters: CustomerFilters = {}): string {
  const {
    search,
    segment,
    status,
    churnRisk,
    minSpending,
    maxSpending,
  } = filters;

  let results = [...mockCustomers];

  if (search)
    results = results.filter(
      (c) => ci(c.name, search) || ci(c.email, search),
    );
  if (segment)
    results = results.filter((c) => ci(c.segment ?? '', segment));
  if (status)
    results = results.filter(
      (c) => (c.status ?? '').toLowerCase() === status.toLowerCase(),
    );
  if (churnRisk)
    results = results.filter(
      (c) => (c.churnRisk ?? '').toLowerCase() === churnRisk.toLowerCase(),
    );
  if (minSpending !== undefined)
    results = results.filter((c) => (c.totalSpending ?? 0) >= minSpending);
  if (maxSpending !== undefined)
    results = results.filter((c) => (c.totalSpending ?? 0) <= maxSpending);

  const headers = [
    'ID',
    'Name',
    'Email',
    'Company',
    'Country',
    'Segment',
    'Status',
    'Churn Risk',
    'Total Spending (£)',
    'Frequency',
    'Recency (days)',
    'Joined Date',
    'Last Purchase',
  ];

  const escape = (val: string | number | undefined | null): string => {
    const s = String(val ?? '');
    // Wrap in quotes if the value contains commas, quotes, or newlines
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const rows = results.map((c) =>
    [
      c.id,
      c.name,
      c.email,
      c.company ?? '',
      c.country ?? '',
      c.segment ?? '',
      c.status ?? '',
      c.churnRisk ?? '',
      c.totalSpending ?? 0,
      c.frequency ?? 0,
      c.recency ?? 0,
      c.joinedDate ?? '',
      c.lastPurchase ?? '',
    ]
      .map(escape)
      .join(','),
  );

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Fetch mocked transaction history for a customer.
 * The number of transactions scales with the customer's frequency field.
 * Data source: deterministic mock generator (no backend call).
 */
export async function getCustomerTransactions(
  customerId: string,
): Promise<CustomerTransaction[]> {
  await delay(100);
  const customer = mockCustomers.find((c) => c.id === customerId);
  if (!customer) return [];

  // Scale transaction count to frequency, capped at 60
  const count = Math.min(Math.max(Math.round((customer.frequency ?? 5) * 1.5), 3), 60);
  return generateTransactions(customerId, count);
}
