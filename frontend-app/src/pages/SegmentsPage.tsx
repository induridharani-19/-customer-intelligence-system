import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { PieChart as PieIcon, Play, Loader, CheckCircle } from 'lucide-react';

const segments = [
  { id: 'high-value', name: 'High-Value', count: 847, avgSpend: 4230, avgOrders: 28, avgRecency: 14, avgLTV: 8400, churnRate: 3.2, color: '#6366f1', desc: 'Top spenders with high frequency. Treat as VIPs.' },
  { id: 'loyal', name: 'Loyal', count: 1234, avgSpend: 2180, avgOrders: 19, avgRecency: 21, avgLTV: 4100, churnRate: 5.8, color: '#8b5cf6', desc: 'Consistent buyers with strong brand loyalty.' },
  { id: 'potential', name: 'Potential Loyalist', count: 2156, avgSpend: 1340, avgOrders: 11, avgRecency: 35, avgLTV: 2680, churnRate: 12.4, color: '#06b6d4', desc: 'Growing customers with upside potential.' },
  { id: 'new', name: 'New Customer', count: 1678, avgSpend: 234, avgOrders: 2, avgRecency: 18, avgLTV: 468, churnRate: 28.7, color: '#10b981', desc: 'Recently acquired. Focus on onboarding and second purchase.' },
  { id: 'occasional', name: 'Occasional', count: 3421, avgSpend: 678, avgOrders: 5, avgRecency: 67, avgLTV: 1020, churnRate: 22.1, color: '#f59e0b', desc: 'Infrequent buyers. Activation campaigns recommended.' },
  { id: 'at-risk', name: 'At-Risk', count: 892, avgSpend: 1890, avgOrders: 14, avgRecency: 95, avgLTV: 1890, churnRate: 78.4, color: '#ef4444', desc: 'Previously active, now declining. Needs win-back campaigns.' },
  { id: 'inactive', name: 'Inactive', count: 1456, avgSpend: 456, avgOrders: 4, avgRecency: 187, avgLTV: 456, churnRate: 94.2, color: '#6b7280', desc: 'Dormant for 6+ months. Low recovery probability.' },
];

const stages = ['Preprocessing data', 'Training K-Means', 'Evaluating clusters', 'Generating labels', 'Complete!'];

export default function SegmentsPage() {
  const [showConfig, setShowConfig] = useState(false);
  const [clusters, setClusters] = useState(7);
  const [features, setFeatures] = useState(['Recency', 'Frequency', 'Monetary', 'Quantity', 'Unit Price']);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(-1);
  const [done, setDone] = useState(false);

  const toggleFeature = (f: string) => setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const runSegmentation = async () => {
    setRunning(true); setDone(false);
    for (let i = 0; i < stages.length; i++) {
      setStage(i);
      await new Promise(r => setTimeout(r, 900));
    }
    setRunning(false); setDone(true);
  };

  const total = segments.reduce((s, x) => s + x.count, 0);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieIcon size={22} color="var(--accent)" /> Customer Segments
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>{total.toLocaleString()} customers across {segments.length} segments • Sample data</p>
        </div>
        <button onClick={() => setShowConfig(!showConfig)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Play size={14} /> Run Segmentation
        </button>
      </div>

      {showConfig && (
        <div className="card" style={{ padding: 20, borderColor: 'var(--accent)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Segmentation Configuration</h3>
          <p style={{ fontSize: 12, color: 'var(--danger)', margin: '0 0 16px' }}>⚠ Simulated run — connect ML API for real segmentation</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Number of Clusters: <strong style={{ color: 'var(--accent)' }}>{clusters}</strong></label>
              <input type="range" min={2} max={10} value={clusters} onChange={e => setClusters(+e.target.value)} style={{ width: 200 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Features</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Recency', 'Frequency', 'Monetary', 'Quantity', 'Unit Price'].map(f => (
                  <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={features.includes(f)} onChange={() => toggleFeature(f)} />
                    {f}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {running ? (
            <div style={{ marginTop: 16 }}>
              {stages.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {i < stage ? <CheckCircle size={14} color="var(--success)" /> : i === stage ? <Loader size={14} color="var(--accent)" className="animate-spin" /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--border)' }} />}
                  <span style={{ fontSize: 13, color: i <= stage ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</span>
                </div>
              ))}
            </div>
          ) : done ? (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)' }}>
              <CheckCircle size={16} /> <span style={{ fontSize: 13, fontWeight: 600 }}>Segmentation complete! (Simulated result)</span>
            </div>
          ) : (
            <button onClick={runSegmentation} className="btn btn-primary" style={{ marginTop: 16 }}>Start Segmentation</button>
          )}
        </div>
      )}

      {/* Segment cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
        {segments.map(s => (
          <div key={s.id} className="card" style={{ padding: 18, borderTop: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{s.name}</h3>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: `${s.color}20`, color: s.color }}>{s.count.toLocaleString()}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>{s.desc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Avg Spend', value: `$${s.avgSpend.toLocaleString()}` },
                { label: 'Avg Orders', value: s.avgOrders },
                { label: 'Avg Recency', value: `${s.avgRecency}d` },
                { label: 'Churn Rate', value: `${s.churnRate}%` },
              ].map(m => (
                <div key={m.label} style={{ background: 'var(--bg)', borderRadius: 6, padding: '6px 10px' }}>
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>{m.label}</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>Segment Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={segments} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} paddingAngle={2}>
                {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => [v.toLocaleString(), 'Customers']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>Avg Spending by Segment</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={segments} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `$${v.toLocaleString()}`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={110} />
              <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, 'Avg Spend']} />
              <Bar dataKey="avgSpend" radius={[0, 4, 4, 0]}>
                {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Cluster Comparison Table</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                {['Segment', 'Customers', 'Avg Spend', 'Avg Orders', 'Avg Recency', 'Avg LTV', 'Churn Rate'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {segments.map(s => (
                <tr key={s.id} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{s.count.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>${s.avgSpend.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{s.avgOrders}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{s.avgRecency} days</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>${s.avgLTV.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: s.churnRate > 50 ? 'var(--danger-light)' : s.churnRate > 20 ? 'var(--warning-light)' : 'var(--success-light)', color: s.churnRate > 50 ? 'var(--danger)' : s.churnRate > 20 ? 'var(--warning)' : 'var(--success)' }}>{s.churnRate}%</span>
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
