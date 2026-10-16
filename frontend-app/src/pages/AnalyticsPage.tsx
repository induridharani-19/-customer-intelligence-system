import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { BarChart3, Download } from 'lucide-react';
import { toast } from 'sonner';
import { revenueData, acquisitionData, segmentDistribution, frequencyDistribution, categoryPerformance, retentionData, segmentRevenue, scatterData } from '@/data/mockAnalytics';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30D');

  const Tooltip2 = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((p: any) => <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? `$${(p.value / 1000).toFixed(0)}K` : p.value}</p>)}
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>* Sample data</p>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={22} color="var(--accent)" /> Analytics Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Advanced analytics • All data is sample for illustration</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['7D', '30D', '90D', '1Y'].map(d => (
            <button key={d} onClick={() => setDateRange(d)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${dateRange === d ? 'var(--accent)' : 'var(--border)'}`, background: dateRange === d ? 'var(--accent-light)' : 'var(--bg-card)', color: dateRange === d ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>{d}</button>
          ))}
        </div>
      </div>

      {/* Summary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Revenue', value: '$4.23M', change: '+15.2%', color: '#6366f1' },
          { label: 'Avg Order Value', value: '$127.40', change: '+5.1%', color: '#10b981' },
          { label: 'Customer LTV', value: '$2,847', change: '+8.3%', color: '#8b5cf6' },
          { label: 'Retention Rate', value: '82.4%', change: '+2.1%', color: '#f59e0b' },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: 16, borderLeft: `3px solid ${m.color}` }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{m.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{m.value}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--success)' }}>{m.change} vs prev period</p>
          </div>
        ))}
      </div>

      {/* Revenue Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Revenue Trend</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>Current vs prior year • Sample</p>
            </div>
            <button onClick={() => toast.info('Chart data exported')} className="btn btn-ghost btn-sm"><Download size={13} /></button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<Tooltip2 />} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} name="Current" />
              <Line type="monotone" dataKey="prev" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Prior Year" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Acquisition vs Churn</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>New vs lost customers • Sample</p>
            </div>
            <button onClick={() => toast.info('Chart data exported')} className="btn btn-ghost btn-sm"><Download size={13} /></button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={acquisitionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<Tooltip2 />} />
              <Legend />
              <Area type="monotone" dataKey="new" fill="#10b98120" stroke="#10b981" strokeWidth={2} name="New Customers" />
              <Area type="monotone" dataKey="churned" fill="#ef444420" stroke="#ef4444" strokeWidth={2} name="Churned" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Behavior */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Purchase Frequency Distribution</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 14px' }}>Orders per month • Sample</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={frequencyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<Tooltip2 />} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Customer Scatter: Recency vs Monetary</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 14px' }}>Sample data visualization</p>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="recency" name="Recency" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} label={{ value: 'Recency (days)', position: 'bottom', fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="monetary" name="Monetary" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Revenue & Retention */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Revenue by Segment (6 months)</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 14px' }}>Stacked bar chart • Sample</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={segmentRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<Tooltip2 />} />
              <Legend />
              {['High-Value', 'Loyal', 'Potential', 'Occasional', 'At-Risk'].map((seg, i) => (
                <Bar key={seg} dataKey={seg} stackId="a" fill={['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'][i]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Retention Rate Trend</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 14px' }}>Monthly retention • Sample</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis domain={[70, 90]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<Tooltip2 />} />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} name="Retention %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Category Performance</h3>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 14px' }}>Revenue by product category • Sample</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryPerformance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={100} />
            <Tooltip content={<Tooltip2 />} />
            <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
