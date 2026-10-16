import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Users } from 'lucide-react';
import { mockCustomers, Customer } from '@/data/mockCustomers';

const SEGMENT_COLORS: Record<string, string> = {
  'High-Value': '#6366f1', 'Loyal': '#8b5cf6', 'Potential Loyalist': '#06b6d4',
  'New Customer': '#10b981', 'Occasional': '#f59e0b', 'At-Risk': '#ef4444', 'Inactive': '#6b7280',
};
const RISK_COLORS: Record<string, string> = { Low: 'badge-success', Medium: 'badge-warning', High: 'badge-danger' };
const STATUS_COLORS: Record<string, string> = { Active: 'badge-success', Inactive: 'badge-neutral', 'At-Risk': 'badge-danger' };

function exportCSV(data: Customer[]) {
  const headers = ['ID', 'Name', 'Email', 'Segment', 'Total Spending', 'Orders', 'Last Purchase', 'Churn Risk', 'Status'];
  const rows = data.map(c => [c.id, c.name, c.email, c.segment, c.totalSpending.toFixed(2), c.totalOrders, c.lastPurchase, c.churnRisk, c.status]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = 'customers.csv'; a.click();
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortBy, setSortBy] = useState<keyof Customer>('totalSpending');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let data = mockCustomers.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      return matchSearch && (segmentFilter === 'All' || c.segment === segmentFilter) && (statusFilter === 'All' || c.status === statusFilter) && (riskFilter === 'All' || c.churnRisk === riskFilter);
    });
    data = [...data].sort((a, b) => {
      const av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return data;
  }, [search, segmentFilter, statusFilter, riskFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (col: keyof Customer) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: keyof Customer }) => sortBy === col ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : <ChevronUp size={13} style={{ opacity: 0.3 }} />;

  const selectStyle = { padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={22} color="var(--accent)" /> Customer Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>
            {filtered.length} customers found • Sample dataset
          </p>
        </div>
        <button onClick={() => exportCSV(filtered)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, ID, or email..." style={{ width: '100%', padding: '7px 12px 7px 32px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        <select value={segmentFilter} onChange={e => { setSegmentFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="All">All Segments</option>
          {['High-Value','Loyal','Potential Loyalist','New Customer','Occasional','At-Risk','Inactive'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="All">All Statuses</option>
          {['Active','Inactive','At-Risk'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="All">All Risk Levels</option>
          {['Low','Medium','High'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                {[
                  { label: 'Customer', col: 'name' as keyof Customer },
                  { label: 'Segment', col: 'segment' as keyof Customer },
                  { label: 'Total Spending', col: 'totalSpending' as keyof Customer },
                  { label: 'Orders', col: 'totalOrders' as keyof Customer },
                  { label: 'Last Purchase', col: 'lastPurchase' as keyof Customer },
                  { label: 'Churn Risk', col: 'churnRisk' as keyof Customer },
                  { label: 'Status', col: 'status' as keyof Customer },
                ].map(h => (
                  <th key={h.label} onClick={() => toggleSort(h.col)} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{h.label} <SortIcon col={h.col} /></span>
                  </th>
                ))}
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No customers match your filters</td></tr>
              ) : pageData.map(c => (
                <tr key={c.id} className="table-row" style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate(`/customers/${c.id}`)}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 8px', borderRadius: 99, background: `${SEGMENT_COLORS[c.segment]}20`, color: SEGMENT_COLORS[c.segment] }}>{c.segment}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>${c.totalSpending.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{c.totalOrders}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{c.lastPurchase}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${RISK_COLORS[c.churnRisk]}`}>{c.churnRisk} ({c.churnScore})</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => navigate(`/customers/${c.id}`)} className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ChevronLeft size={13} /> Prev
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '6px 12px' }}>Page {page} of {totalPages || 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
