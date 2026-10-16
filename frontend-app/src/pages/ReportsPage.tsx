import { useState } from 'react';
import { FileText, Download, Plus, Calendar, Filter, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const reportTemplates = [
  { id: 'rt1', name: 'Customer Segmentation Report', desc: 'Detailed breakdown of all 7 customer segments with metrics', icon: '📊', category: 'Segmentation' },
  { id: 'rt2', name: 'Churn Risk Analysis', desc: 'High-risk customers, churn drivers, and retention recommendations', icon: '⚠️', category: 'Churn' },
  { id: 'rt3', name: 'Revenue Performance Report', desc: 'Monthly revenue trends, growth rates, and segment contributions', icon: '💰', category: 'Revenue' },
  { id: 'rt4', name: 'Customer Lifetime Value', desc: 'CLV estimates across segments with acquisition cost analysis', icon: '📈', category: 'CLV' },
  { id: 'rt5', name: 'Campaign Performance', desc: 'Open rates, click rates, conversions for all active campaigns', icon: '📣', category: 'Campaigns' },
  { id: 'rt6', name: 'Sentiment Analysis Summary', desc: 'Aggregated sentiment scores by category and time period', icon: '💬', category: 'Sentiment' },
];

const history = [
  { name: 'Customer Segmentation Report — November 2024', category: 'Segmentation', generatedAt: '2024-11-30 09:15', size: '2.4 MB', format: 'PDF' },
  { name: 'Churn Risk Analysis — Week 48', category: 'Churn', generatedAt: '2024-11-28 14:30', size: '1.1 MB', format: 'Excel' },
  { name: 'Q4 Revenue Performance Report', category: 'Revenue', generatedAt: '2024-11-25 10:00', size: '3.8 MB', format: 'PDF' },
  { name: 'CLV Analysis — All Segments', category: 'CLV', generatedAt: '2024-11-20 16:45', size: '1.6 MB', format: 'Excel' },
  { name: 'Black Friday Campaign Performance', category: 'Campaigns', generatedAt: '2024-11-18 08:00', size: '0.9 MB', format: 'CSV' },
  { name: 'October Sentiment Analysis', category: 'Sentiment', generatedAt: '2024-11-01 11:30', size: '2.1 MB', format: 'PDF' },
  { name: 'Customer Segmentation Report — October 2024', category: 'Segmentation', generatedAt: '2024-10-31 09:00', size: '2.2 MB', format: 'PDF' },
  { name: 'Q3 Revenue Performance Report', category: 'Revenue', generatedAt: '2024-09-30 10:00', size: '3.5 MB', format: 'PDF' },
];

const FORMAT_COLORS: Record<string, string> = { PDF: '#ef4444', Excel: '#10b981', CSV: '#6366f1' };
const CATEGORY_COLORS: Record<string, string> = { Segmentation: '#6366f1', Churn: '#ef4444', Revenue: '#10b981', CLV: '#8b5cf6', Campaigns: '#f59e0b', Sentiment: '#06b6d4' };

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('30D');
  const [format, setFormat] = useState('PDF');

  const generate = async (id: string, name: string) => {
    setGenerating(id);
    await new Promise(r => setTimeout(r, 1800));
    setGenerating(null);
    setGenerated(prev => [...prev, id]);
    toast.success(`${name} generated successfully!`);
  };

  const downloadCSV = (name: string) => {
    const csv = `Report: ${name}\nGenerated: ${new Date().toLocaleString()}\nNote: Sample data - connect backend for real report data\nCustomer ID,Segment,Revenue,Churn Risk\nC001,High-Value,$8432,Low\nC002,Loyal,$5234,Low`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = `${name.replace(/\s/g, '_')}.csv`; a.click();
  };

  const selectStyle = { padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={22} color="var(--accent)" /> Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Generate and export data reports • All data is sample</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={selectStyle}>
            {['7D', '30D', '90D', '1Y'].map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={format} onChange={e => setFormat(e.target.value)} style={selectStyle}>
            {['PDF', 'Excel', 'CSV'].map(f => <option key={f}>{f}</option>)}
          </select>
          <button onClick={() => toast.info('Scheduled reporting requires backend integration')} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} /> Schedule Report
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Reports Generated', value: '47', color: 'var(--accent)' },
          { label: 'This Month', value: '12', color: '#10b981' },
          { label: 'Templates Available', value: reportTemplates.length.toString(), color: '#8b5cf6' },
          { label: 'Scheduled Reports', value: '3', color: '#f59e0b' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: 16, borderLeft: `3px solid ${c.color}` }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{c.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Report templates */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px', color: 'var(--text-primary)' }}>Report Templates</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {reportTemplates.map(t => {
            const isGen = generating === t.id;
            const isDone = generated.includes(t.id);
            return (
              <div key={t.id} className="card" style={{ padding: 18, borderTop: `3px solid ${CATEGORY_COLORS[t.category]}` }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{t.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{t.name}</h3>
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, background: `${CATEGORY_COLORS[t.category]}15`, color: CATEGORY_COLORS[t.category] }}>{t.category}</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>{t.desc}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => generate(t.id, t.name)} disabled={!!generating} className="btn btn-primary btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    {isGen ? <><span className="spinner" style={{ borderTopColor: 'white', width: 12, height: 12 }} />Generating...</> : isDone ? <><CheckCircle size={12} />Generated</> : <><Plus size={12} />Generate</>}
                  </button>
                  {isDone && (
                    <button onClick={() => downloadCSV(t.name)} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Download size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Report Builder */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Custom Report Builder</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>Select specific metrics and segments to include in your report</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 8px' }}>Segments</p>
            {['High-Value', 'Loyal', 'At-Risk', 'Inactive', 'All Segments'].map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={s === 'All Segments'} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s}</span>
              </label>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 8px' }}>Metrics</p>
            {['Revenue', 'Churn Rate', 'Retention', 'LTV', 'Order Count'].map(m => (
              <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m}</span>
              </label>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 8px' }}>Date Range</p>
            <select style={{ ...selectStyle, width: '100%', marginBottom: 10 }}>
              {['Last 7 days', 'Last 30 days', 'Last 90 days', 'Last year', 'Custom range'].map(d => <option key={d}>{d}</option>)}
            </select>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 8px' }}>Format</p>
            <select style={{ ...selectStyle, width: '100%', marginBottom: 16 }}>
              <option>PDF</option><option>Excel</option><option>CSV</option>
            </select>
            <button onClick={() => toast.success('Custom report generated! (Simulated)')} className="btn btn-primary" style={{ width: '100%' }}>
              Generate Custom Report
            </button>
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Report History</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{history.length} reports</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            {['Report Name', 'Category', 'Generated', 'Size', 'Format', 'Actions'].map(h => (
              <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {history.map((r, i) => (
              <tr key={i} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={14} color="var(--accent)" />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{r.name}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${CATEGORY_COLORS[r.category]}15`, color: CATEGORY_COLORS[r.category] }}>{r.category}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{r.generatedAt}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{r.size}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: `${FORMAT_COLORS[r.format]}20`, color: FORMAT_COLORS[r.format] }}>{r.format}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => downloadCSV(r.name)} className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Download size={12} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
