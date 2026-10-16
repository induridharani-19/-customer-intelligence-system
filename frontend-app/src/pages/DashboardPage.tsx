import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { Users, DollarSign, TrendingUp, TrendingDown, ShoppingCart, UserCheck, AlertTriangle, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, RefreshCw, Zap, FileText, Database, Activity } from 'lucide-react';
import { revenueData, acquisitionData, segmentDistribution, spendingDistribution } from '@/data/mockAnalytics';

const kpis = [
  { label: 'Total Customers', value: '11,684', change: '+12.3%', up: true, icon: Users, color: '#6366f1', sub: 'vs last month' },
  { label: 'Active Customers', value: '8,247', change: '+8.7%', up: true, icon: UserCheck, color: '#10b981', sub: 'vs last month' },
  { label: 'Total Revenue', value: '$4.23M', change: '+15.2%', up: true, icon: DollarSign, color: '#8b5cf6', sub: 'vs last month' },
  { label: 'Avg Order Value', value: '$127.40', change: '+5.1%', up: true, icon: ShoppingCart, color: '#06b6d4', sub: 'vs last month' },
  { label: 'Retention Rate', value: '82.4%', change: '+2.1%', up: true, icon: TrendingUp, color: '#10b981', sub: 'vs last month' },
  { label: 'High-Value Customers', value: '847', change: '+18.3%', up: true, icon: TrendingUp, color: '#f59e0b', sub: 'vs last month' },
  { label: 'At-Risk Customers', value: '892', change: '+58', up: false, icon: AlertTriangle, color: '#ef4444', sub: 'require attention' },
  { label: 'Segments', value: '7', change: 'Stable', up: true, icon: PieIcon, color: '#64748b', sub: 'K-Means clusters' },
];

const recentActivity = [
  { name: 'Emma Johnson', action: 'Made purchase ($234.50)', time: '2 min ago', segment: 'High-Value' },
  { name: 'Michael Chen', action: 'Segment upgraded to Loyal', time: '15 min ago', segment: 'Loyal' },
  { name: 'David Kim', action: 'First purchase completed', time: '32 min ago', segment: 'New Customer' },
  { name: 'Aisha Patel', action: 'Churn risk escalated to High', time: '1h ago', segment: 'At-Risk' },
  { name: 'Sarah Williams', action: 'Loyalty milestone reached (50 orders)', time: '2h ago', segment: 'High-Value' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, margin: '2px 0', fontSize: 12 }}>{p.name}: {typeof p.value === 'number' ? (p.value > 1000 ? `$${(p.value/1000).toFixed(0)}K` : p.value) : p.value}</p>
        ))}
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>* Sample data</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30D');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 12 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Overview Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>AI-powered customer intelligence insights • Sample data for illustration</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['7D', '30D', '90D', '1Y'].map(d => (
            <button key={d} onClick={() => setDateRange(d)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${dateRange === d ? 'var(--accent)' : 'var(--border)'}`, background: dateRange === d ? 'var(--accent-light)' : 'var(--bg-card)', color: dateRange === d ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {kpis.map(k => (
          <div key={k.label} className="card" style={{ padding: 18, borderLeft: `3px solid ${k.color}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${k.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={18} color={k.color} />
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: k.change === 'Stable' ? 'var(--text-muted)' : k.up ? 'var(--success)' : 'var(--danger)', background: k.change === 'Stable' ? 'var(--border)' : k.up ? 'var(--success-light)' : 'var(--danger-light)', padding: '2px 7px', borderRadius: 99 }}>
                {k.change !== 'Stable' && (k.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />)}
                {k.change}
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Revenue Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Revenue Trend</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>Current vs previous year • Sample data</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} name="Current" />
              <Line type="monotone" dataKey="prev" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Prior Year" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Donut */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>Segment Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={segmentDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {segmentDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            {segmentDistribution.slice(0, 4).map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{s.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Acquisition */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Customer Acquisition vs Churn</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>New vs churned customers • Sample data</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={acquisitionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="new" fill="#10b98120" stroke="#10b981" strokeWidth={2} name="New" />
              <Area type="monotone" dataKey="churned" fill="#ef444420" stroke="#ef4444" strokeWidth={2} name="Churned" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Customer Spending Distribution</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>Customers by spending range • Sample data</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={spendingDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="range" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={65} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Recent Activity */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="var(--accent)" /> Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                  {a.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{a.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{a.action}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Segments */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>Top Segments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {segmentDistribution.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{s.value.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--border)' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: s.color, width: `${(s.value / 3421) * 100}%`, transition: 'width 0.5s' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="var(--accent)" /> Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Run Segmentation', icon: RefreshCw, path: '/segments', color: '#6366f1' },
              { label: 'Generate Report', icon: FileText, path: '/reports', color: '#10b981' },
              { label: 'Export Data', icon: Database, path: '/data', color: '#8b5cf6' },
              { label: 'View Predictions', icon: Activity, path: '/prediction', color: '#f59e0b' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = a.color; (e.currentTarget as HTMLButtonElement).style.color = a.color; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}>
                <a.icon size={14} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
