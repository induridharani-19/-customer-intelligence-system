import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { mockCustomers, type Customer } from '@/data/mockCustomers';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const TABS = ['Overview', 'Transactions', 'Analytics', 'Predictions', 'Activity'];

const SEGMENT_COLORS: Record<string, string> = {
  'High-Value': '#6366f1', 'Loyal': '#8b5cf6', 'Potential Loyalist': '#06b6d4',
  'New Customer': '#10b981', 'Occasional': '#f59e0b', 'At-Risk': '#ef4444', 'Inactive': '#6b7280',
};
const RISK_COLORS: Record<string, string> = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

const mockTransactions = (id: string) => Array.from({ length: 10 }, (_, i) => ({
  orderId: `ORD-${id}-${1000 + i}`,
  date: new Date(Date.now() - i * 12 * 86400000).toLocaleDateString(),
  items: Math.floor(Math.random() * 5) + 1,
  category: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'][i % 5],
  amount: +(Math.random() * 300 + 50).toFixed(2),
  status: i === 2 ? 'Refunded' : 'Completed',
}));

const mockSpending = (c: Customer[]) => Array.from({ length: 6 }, (_, i) => ({
  month: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][i],
  spending: +(c[0]?.avgOrderValue * (0.7 + Math.random() * 0.7) || 100).toFixed(0),
}));

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');

  const customer = mockCustomers.find(c => c.id === id);

  if (!customer) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <AlertTriangle size={48} color="var(--warning)" style={{ marginBottom: 16 }} />
        <h2 style={{ color: 'var(--text-primary)' }}>Customer not found</h2>
        <button onClick={() => navigate('/customers')} className="btn btn-primary" style={{ marginTop: 16 }}>Back to Customers</button>
      </div>
    );
  }

  const transactions = mockTransactions(customer.id);
  const spendingHistory = mockSpending([customer]);
  const segColor = SEGMENT_COLORS[customer.segment] || '#6366f1';
  const riskColor = RISK_COLORS[customer.churnRisk];
  const probData = [
    { name: 'High-Value', value: customer.segment === 'High-Value' ? 0.72 : 0.12, color: '#6366f1' },
    { name: 'Loyal', value: customer.segment === 'Loyal' ? 0.68 : 0.15, color: '#8b5cf6' },
    { name: 'Potential', value: 0.09, color: '#06b6d4' },
    { name: 'At-Risk', value: customer.churnScore / 200, color: '#ef4444' },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Back */}
      <button onClick={() => navigate('/customers')} className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Customers
      </button>

      {/* Header */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${segColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: segColor }}>
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{customer.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 8px' }}>{customer.id} • {customer.email}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 99, background: `${segColor}20`, color: segColor }}>{customer.segment}</span>
                <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 99, background: `${riskColor}20`, color: riskColor }}>{customer.churnRisk} Risk</span>
                <span className={`badge ${customer.status === 'Active' ? 'badge-success' : customer.status === 'At-Risk' ? 'badge-danger' : 'badge-neutral'}`}>{customer.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginTop: 24 }}>
          {[
            { label: 'Total Spending', value: `$${customer.totalSpending.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: ShoppingBag, color: '#6366f1' },
            { label: 'Total Orders', value: customer.totalOrders.toString(), icon: ShoppingBag, color: '#10b981' },
            { label: 'Avg Order Value', value: `$${customer.avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: '#8b5cf6' },
            { label: 'Lifetime Value', value: `$${customer.lifetimeValue.toLocaleString()}`, icon: TrendingUp, color: '#f59e0b' },
          ].map(k => (
            <div key={k.label} style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: 10, borderLeft: `3px solid ${k.color}` }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{k.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{k.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--accent)' : 'var(--text-muted)', borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`, marginBottom: -1 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>Contact Information</h3>
            {[
              { icon: Mail, label: 'Email', value: customer.email },
              { icon: Phone, label: 'Phone', value: customer.phone },
              { icon: MapPin, label: 'Location', value: customer.location },
              { icon: Calendar, label: 'Member Since', value: customer.firstPurchase },
              { icon: Clock, label: 'Last Purchase', value: customer.lastPurchase },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <row.icon size={14} color="var(--accent)" />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 90 }}>{row.label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>RFM Metrics</h3>
            {[
              { label: 'Recency (days)', value: customer.recency, max: 200, color: '#6366f1' },
              { label: 'Frequency (orders/month)', value: customer.frequency, max: 10, color: '#10b981' },
              { label: 'Monetary (log scale)', value: customer.monetaryValue, max: 15, color: '#8b5cf6' },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: 'var(--border)' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: m.color, width: `${Math.min(100, (m.value / m.max) * 100)}%`, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '12px', background: 'var(--accent-light)', borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Churn Score: {customer.churnScore}/100</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>* Simulated sample score</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'Transactions' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Transaction History</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                  {['Order ID', 'Date', 'Items', 'Category', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.orderId} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>{t.orderId}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{t.date}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{t.items}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{t.category}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>${t.amount}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${t.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>Spending History (6 months)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={spendingHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `$${v}`} />
                <Tooltip />
                <Line type="monotone" dataKey="spending" stroke={segColor} strokeWidth={2} dot={{ fill: segColor, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { category: 'Electronics', amount: 340 }, { category: 'Clothing', amount: 180 },
                { category: 'Home', amount: 220 }, { category: 'Sports', amount: 120 }, { category: 'Books', amount: 85 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip />
                <Bar dataKey="amount" fill={segColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'Predictions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Segment Prediction</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 20px' }}>* Simulated prediction based on sample RFM data</p>
            <div style={{ padding: '16px', background: `${segColor}10`, border: `1px solid ${segColor}40`, borderRadius: 10, marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Predicted Segment</p>
              <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: segColor }}>{customer.segment}</p>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={probData} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11 }} tickFormatter={v => `${(v*100).toFixed(0)}%`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={80} />
                <Tooltip formatter={(v: any) => `${(v*100).toFixed(1)}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {probData.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Churn Risk Profile</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 20px' }}>* Simulated churn score</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart width={160} height={160}>
                <Pie data={[{ value: customer.churnScore }, { value: 100 - customer.churnScore }]} cx={80} cy={80} innerRadius={50} outerRadius={70} startAngle={90} endAngle={-270} dataKey="value">
                  <Cell fill={riskColor} />
                  <Cell fill="var(--border)" />
                </Pie>
              </PieChart>
            </div>
            <div style={{ textAlign: 'center', marginTop: -100 + 16 }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: riskColor, margin: 0 }}>{customer.churnScore}%</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Churn Probability</p>
            </div>
            <div style={{ marginTop: 80, padding: '12px', background: 'var(--bg)', borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Recommended Action</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                {customer.churnRisk === 'High' ? 'Send win-back offer with 25% discount and free shipping.' :
                 customer.churnRisk === 'Medium' ? 'Send re-engagement email with personalized recommendations.' :
                 'Maintain engagement with loyalty rewards and early access to new products.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'Activity' && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>Activity Timeline</h3>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
            {[
              { event: 'Purchase completed', detail: '$234.50 — Electronics', time: '2 days ago', color: '#10b981' },
              { event: 'Segment upgraded', detail: 'Moved to High-Value from Loyal', time: '1 week ago', color: '#6366f1' },
              { event: 'Email opened', detail: 'Black Friday Campaign', time: '1 week ago', color: '#8b5cf6' },
              { event: 'Purchase completed', detail: '$178.20 — Clothing', time: '2 weeks ago', color: '#10b981' },
              { event: 'Loyalty milestone', detail: '40 total orders reached', time: '3 weeks ago', color: '#f59e0b' },
              { event: 'Account registered', detail: `Member since ${customer.firstPurchase}`, time: customer.firstPurchase, color: '#06b6d4' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20, paddingLeft: 36, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 8, top: 4, width: 14, height: 14, borderRadius: '50%', background: a.color, border: '2px solid var(--bg-card)' }} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{a.event}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{a.detail}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
