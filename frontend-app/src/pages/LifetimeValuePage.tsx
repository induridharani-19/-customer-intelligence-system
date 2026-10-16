import { useState } from 'react';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { DollarSign, Info } from 'lucide-react';
import { clvData } from '@/data/mockAnalytics';

const clvBySegment = [
  { segment: 'High-Value', historical: 8400, predicted: 12600 },
  { segment: 'Loyal', historical: 4100, predicted: 5740 },
  { segment: 'Potential', historical: 2680, predicted: 3480 },
  { segment: 'New Customer', historical: 468, predicted: 1170 },
  { segment: 'Occasional', historical: 1020, predicted: 1326 },
  { segment: 'At-Risk', historical: 1890, predicted: 945 },
  { segment: 'Inactive', historical: 456, predicted: 228 },
];

const topCustomers = [
  { name: 'Marcus Brown', segment: 'High-Value', historical: 14200, predicted: 21300, confidence: 92 },
  { name: 'Sarah Williams', segment: 'High-Value', historical: 11230, predicted: 16845, confidence: 89 },
  { name: 'Priya Singh', segment: 'High-Value', historical: 9876, predicted: 14814, confidence: 88 },
  { name: 'Hana Park', segment: 'High-Value', historical: 10234, predicted: 15351, confidence: 91 },
  { name: 'Emma Johnson', segment: 'High-Value', historical: 8432, predicted: 12648, confidence: 87 },
  { name: 'Isabella Ferrari', segment: 'High-Value', historical: 7654, predicted: 11481, confidence: 85 },
  { name: 'Yuki Tanaka', segment: 'Loyal', historical: 6789, predicted: 9504, confidence: 82 },
  { name: 'Kevin O\'Sullivan', segment: 'Loyal', historical: 5678, predicted: 7949, confidence: 80 },
  { name: 'Michael Chen', segment: 'Loyal', historical: 5234, predicted: 7327, confidence: 79 },
  { name: 'Lisa Thompson', segment: 'Loyal', historical: 4120, predicted: 5768, confidence: 76 },
];

const valueDistribution = [
  { range: '$0–500', count: 3245 }, { range: '$500–1K', count: 2876 },
  { range: '$1K–2K', count: 2341 }, { range: '$2K–5K', count: 1987 },
  { range: '$5K–10K', count: 876 }, { range: '$10K+', count: 359 },
];

export default function LifetimeValuePage() {
  const [horizon, setHorizon] = useState('12M');

  const multiplier = { '3M': 0.25, '6M': 0.5, '12M': 1, '24M': 2 }[horizon] ?? 1;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={22} color="var(--accent)" /> Customer Lifetime Value
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>CLV analytics • Predictions are estimated sample data</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Horizon:</span>
          {['3M', '6M', '12M', '24M'].map(h => (
            <button key={h} onClick={() => setHorizon(h)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${horizon === h ? 'var(--accent)' : 'var(--border)'}`, background: horizon === h ? 'var(--accent-light)' : 'var(--bg-card)', color: horizon === h ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>{h}</button>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 8 }}>
        <Info size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 12, color: 'var(--accent)' }}>Predictions are <strong>estimated sample data</strong>. Historical values come from transaction records. Future CLV requires a trained CLV model connected to the backend.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Avg Estimated CLV', value: `$${(2847 * multiplier).toFixed(0)}`, color: '#6366f1', note: `${horizon} estimate` },
          { label: 'Total Predicted Revenue', value: `$${(33.2 * multiplier).toFixed(1)}M`, color: '#10b981', note: `Next ${horizon}` },
          { label: 'High-Value Customers', value: '847', color: '#8b5cf6', note: 'CLV > $8,000' },
          { label: 'CLV Growth Rate', value: '+18.3%', color: '#f59e0b', note: 'Year over year' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: 16, borderLeft: `3px solid ${c.color}` }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{c.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{c.note}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Historical vs Predicted Revenue</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            <span style={{ color: '#6366f1', fontWeight: 600 }}>━━</span> Historical (actual) &nbsp;
            <span style={{ color: '#10b981', fontWeight: 600 }}>━━</span> Predicted (estimated sample)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={clvData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => v > 0 ? [`$${(v/1000).toFixed(0)}K`] : ['N/A']} />
              <Legend />
              <Area type="monotone" dataKey="historical" fill="#6366f120" stroke="#6366f1" strokeWidth={2} name="Historical" />
              <Area type="monotone" dataKey="predicted" fill="#10b98120" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" name="Predicted (Est.)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>CLV Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={valueDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="range" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={70} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CLV by Segment */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>CLV by Customer Segment</h3>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 16px' }}>Historical revenue vs estimated future CLV • Sample data</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={clvBySegment.map(d => ({ ...d, predicted: Math.round(d.predicted * multiplier) }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="segment" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`]} />
            <Legend />
            <Bar dataKey="historical" fill="#6366f1" name="Historical Revenue" radius={[4, 4, 0, 0]} />
            <Bar dataKey="predicted" fill="#10b981" name={`Predicted CLV (${horizon})`} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top customers */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Top Customers by Estimated CLV</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {['#', 'Customer', 'Segment', 'Historical Revenue', `Predicted CLV (${horizon})`, 'Confidence'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {topCustomers.map((c, i) => (
                <tr key={i} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)' }}>#{i+1}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                  <td style={{ padding: '10px 14px' }}><span className="badge badge-accent">{c.segment}</span></td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>${c.historical.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>${(c.predicted * multiplier).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ height: 6, width: 60, borderRadius: 99, background: 'var(--border)' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: 'var(--success)', width: `${c.confidence}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.confidence}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
