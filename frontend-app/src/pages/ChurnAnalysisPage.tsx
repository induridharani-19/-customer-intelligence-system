import { useState } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TrendingDown, Search, Download, AlertTriangle } from 'lucide-react';
import { churnRiskDistribution } from '@/data/mockAnalytics';
import { toast } from 'sonner';

const highRisk = [
  { name: 'Andre Dupont', segment: 'At-Risk', lastPurchase: '2024-08-20', score: 82, daysInactive: 102, action: 'Send 25% win-back offer' },
  { name: 'Aisha Patel', segment: 'At-Risk', lastPurchase: '2024-09-14', score: 78, daysInactive: 77, action: 'Personal outreach call' },
  { name: 'Ben Okafor', segment: 'At-Risk', lastPurchase: '2024-08-10', score: 76, daysInactive: 112, action: 'Send re-engagement campaign' },
  { name: 'Ana Costa', segment: 'At-Risk', lastPurchase: '2024-09-02', score: 71, daysInactive: 89, action: 'Send special discount' },
  { name: 'Omar Hassan', segment: 'Inactive', lastPurchase: '2024-05-12', score: 91, daysInactive: 202, action: 'Final win-back attempt' },
  { name: 'Tony Nguyen', segment: 'Inactive', lastPurchase: '2024-04-05', score: 94, daysInactive: 239, action: 'Remove from active lists' },
  { name: 'Zoe Anderson', segment: 'Inactive', lastPurchase: '2024-03-28', score: 88, daysInactive: 246, action: 'Final email campaign' },
  { name: 'James Peters', segment: 'At-Risk', lastPurchase: '2024-09-25', score: 73, daysInactive: 66, action: 'Personalized product recs' },
  { name: 'Linda Murray', segment: 'At-Risk', lastPurchase: '2024-10-02', score: 68, daysInactive: 59, action: 'Send loyalty reminder' },
  { name: 'Chris Davis', segment: 'Occasional', lastPurchase: '2024-08-28', score: 65, daysInactive: 94, action: 'Targeted promotion' },
];

const activityData = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  highValue: 847 - i * 12,
  atRisk: 700 + i * 16,
}));

const retentionActions = [
  { title: 'Re-engagement Email Campaign', desc: 'Personalized emails with product recommendations for at-risk customers', target: 892, recovery: '24%', color: '#6366f1' },
  { title: 'Special Discount Offer', desc: '20% discount for customers who have not purchased in 60+ days', target: 634, recovery: '31%', color: '#10b981' },
  { title: 'Personal Outreach', desc: 'Direct calls from account managers for high-LTV at-risk customers', target: 124, recovery: '45%', color: '#8b5cf6' },
  { title: 'Win-Back Program', desc: '30% comeback discount + free shipping for customers inactive 90+ days', target: 456, recovery: '19%', color: '#f59e0b' },
];

export default function ChurnAnalysisPage() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const filtered = highRisk.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.name.toLowerCase().includes(q)) && (riskFilter === 'All' || c.score >= (riskFilter === 'High' ? 70 : 40));
  });

  const exportCSV = () => {
    const csv = ['Name,Segment,Last Purchase,Risk Score,Days Inactive,Action', ...filtered.map(c => `${c.name},${c.segment},${c.lastPurchase},${c.score},${c.daysInactive},"${c.action}"`)].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = 'churn_risk.csv'; a.click();
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingDown size={22} color="var(--danger)" /> Churn Analysis
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Risk distribution • All scores are simulated sample data</p>
        </div>
        <button onClick={exportCSV} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download size={14} /> Export High-Risk List
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Customers', value: '11,684', color: 'var(--accent)' },
          { label: 'Low Risk', value: '8,201 (70.2%)', color: 'var(--success)' },
          { label: 'Medium Risk', value: '2,591 (22.2%)', color: 'var(--warning)' },
          { label: 'High Risk', value: '892 (7.6%)', color: 'var(--danger)' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: 16, borderLeft: `3px solid ${c.color}` }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{c.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={churnRiskDistribution} dataKey="count" nameKey="risk" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                {churnRiskDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => [v.toLocaleString(), 'Customers']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Customer Activity Trend</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 14px' }}>High-value vs at-risk active customers over time • Sample</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="highValue" fill="#6366f120" stroke="#6366f1" strokeWidth={2} name="High-Value Active" />
              <Area type="monotone" dataKey="atRisk" fill="#ef444420" stroke="#ef4444" strokeWidth={2} name="At-Risk Customers" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Retention Actions */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px', color: 'var(--text-primary)' }}>Recommended Retention Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
          {retentionActions.map(a => (
            <div key={a.title} className="card" style={{ padding: 18, borderTop: `3px solid ${a.color}` }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>{a.title}</h4>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>{a.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div><p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>Target</p><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{a.target.toLocaleString()}</p></div>
                <div style={{ textAlign: 'right' }}><p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>Recovery Rate</p><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>{a.recovery}</p></div>
              </div>
              <button onClick={() => toast.success('Campaign created!')} className="btn btn-sm" style={{ width: '100%', background: `${a.color}20`, color: a.color, border: `1px solid ${a.color}40`, borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Implement →</button>
            </div>
          ))}
        </div>
      </div>

      {/* High-risk table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, flex: 1 }}>High-Risk Customers</h3>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ padding: '6px 10px 6px 28px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 13 }} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {['Customer', 'Segment', 'Last Purchase', 'Risk Score', 'Days Inactive', 'Recommended Action'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</td>
                  <td style={{ padding: '10px 14px' }}><span className="badge badge-danger">{c.segment}</span></td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)' }}>{c.lastPurchase}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ height: 6, width: 60, borderRadius: 99, background: 'var(--border)' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: c.score > 80 ? 'var(--danger)' : 'var(--warning)', width: `${c.score}%` }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c.score > 80 ? 'var(--danger)' : 'var(--warning)' }}>{c.score}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{c.daysInactive}d</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{c.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
