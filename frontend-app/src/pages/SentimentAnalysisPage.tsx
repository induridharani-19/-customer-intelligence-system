import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MessageSquare, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

const sentimentSummary = { positive: 848, neutral: 175, negative: 224, total: 1247 };

const sentimentTrend = [
  { month: 'Jun', positive: 68, neutral: 17, negative: 15 },
  { month: 'Jul', positive: 71, neutral: 15, negative: 14 },
  { month: 'Aug', positive: 69, neutral: 16, negative: 15 },
  { month: 'Sep', positive: 65, neutral: 18, negative: 17 },
  { month: 'Oct', positive: 67, neutral: 15, negative: 18 },
  { month: 'Nov', positive: 68, neutral: 14, negative: 18 },
];

const topicSentiment = [
  { topic: 'Product Quality', positive: 82, negative: 8 },
  { topic: 'Shipping Speed', positive: 54, negative: 34 },
  { topic: 'Customer Service', positive: 45, negative: 41 },
  { topic: 'Price Value', positive: 71, negative: 15 },
  { topic: 'Website UX', positive: 76, negative: 12 },
  { topic: 'Returns Process', positive: 38, negative: 52 },
];

const feedback = [
  { id: 'F001', name: 'Emma Johnson', text: 'Love the product quality! Fast shipping and the packaging was beautiful. Will definitely order again.', sentiment: 'Positive', score: 0.92, category: 'Product', topics: ['Quality', 'Shipping'], date: '2024-11-28' },
  { id: 'F002', name: 'James Rodriguez', text: 'The website is very user-friendly. Found exactly what I was looking for. Customer service was helpful.', sentiment: 'Positive', score: 0.85, category: 'UX', topics: ['Website', 'Service'], date: '2024-11-25' },
  { id: 'F003', name: 'Aisha Patel', text: 'My order arrived 2 weeks late with no updates. Very frustrating experience. Had to contact support 3 times.', sentiment: 'Negative', score: -0.87, category: 'Shipping', topics: ['Delivery', 'Support'], date: '2024-11-20' },
  { id: 'F004', name: 'Michael Chen', text: 'The product is okay. Nothing special but does the job. Shipping was average.', sentiment: 'Neutral', score: 0.05, category: 'Product', topics: ['Quality', 'Value'], date: '2024-11-18' },
  { id: 'F005', name: 'Sarah Williams', text: 'Absolutely fantastic! Best purchase this year. The quality exceeded my expectations.', sentiment: 'Positive', score: 0.95, category: 'Product', topics: ['Quality', 'Value'], date: '2024-11-15' },
  { id: 'F006', name: 'Andre Dupont', text: 'Returns process is a nightmare. Took 3 weeks to process my refund and had to follow up 5 times.', sentiment: 'Negative', score: -0.91, category: 'Returns', topics: ['Returns', 'Support'], date: '2024-11-12' },
  { id: 'F007', name: 'Priya Singh', text: 'Great prices compared to competitors. Good selection of products. Loyal customer for 2 years.', sentiment: 'Positive', score: 0.78, category: 'Price', topics: ['Value', 'Selection'], date: '2024-11-10' },
  { id: 'F008', name: 'Carlos Mendez', text: 'Mixed experience. Product was good but shipping was slow and packaging damaged.', sentiment: 'Neutral', score: -0.12, category: 'Shipping', topics: ['Shipping', 'Packaging'], date: '2024-11-08' },
  { id: 'F009', name: 'Yuki Tanaka', text: 'Excellent loyalty program! The points system is very rewarding. Keep up the great work!', sentiment: 'Positive', score: 0.88, category: 'Service', topics: ['Loyalty', 'Service'], date: '2024-11-05' },
  { id: 'F010', name: 'Ben Okafor', text: 'Customer service was unhelpful. Waited 4 days for a response and the issue is still not resolved.', sentiment: 'Negative', score: -0.82, category: 'Service', topics: ['Support', 'Service'], date: '2024-11-02' },
];

const COLORS = { Positive: '#10b981', Neutral: '#94a3b8', Negative: '#ef4444' };

export default function SentimentAnalysisPage() {
  const [filter, setFilter] = useState('All');
  const filtered = feedback.filter(f => filter === 'All' || f.sentiment === filter);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageSquare size={22} color="var(--accent)" /> Sentiment Analysis
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>NLP sentiment analysis of {sentimentSummary.total.toLocaleString()} customer reviews • Sample data</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Reviews', value: sentimentSummary.total.toLocaleString(), icon: MessageSquare, color: 'var(--accent)' },
          { label: 'Positive', value: `${sentimentSummary.positive} (${Math.round(sentimentSummary.positive/sentimentSummary.total*100)}%)`, icon: ThumbsUp, color: 'var(--success)' },
          { label: 'Neutral', value: `${sentimentSummary.neutral} (${Math.round(sentimentSummary.neutral/sentimentSummary.total*100)}%)`, icon: Minus, color: 'var(--text-muted)' },
          { label: 'Negative', value: `${sentimentSummary.negative} (${Math.round(sentimentSummary.negative/sentimentSummary.total*100)}%)`, icon: ThumbsDown, color: 'var(--danger)' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: 16, borderLeft: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon size={18} color={c.color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{c.label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: c.color }}>{c.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Overall Sentiment</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[
                { name: 'Positive', value: sentimentSummary.positive },
                { name: 'Neutral', value: sentimentSummary.neutral },
                { name: 'Negative', value: sentimentSummary.negative },
              ]} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                <Cell fill="#10b981" /><Cell fill="#94a3b8" /><Cell fill="#ef4444" />
              </Pie>
              <Tooltip formatter={(v: any) => [v.toLocaleString(), 'Reviews']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Sentiment Trend</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 16px' }}>Monthly % breakdown • Sample</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: any) => [`${v}%`]} />
              <Legend />
              <Bar dataKey="positive" stackId="a" fill="#10b981" name="Positive %" />
              <Bar dataKey="neutral" stackId="a" fill="#94a3b8" name="Neutral %" />
              <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topic analysis */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Sentiment by Topic</h3>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 16px' }}>% positive vs negative per topic • Sample</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topicSentiment.map(t => (
            <div key={t.topic}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{t.topic}</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--success)' }}>+{t.positive}%</span>
                  <span style={{ fontSize: 12, color: 'var(--danger)' }}>-{t.negative}%</span>
                </div>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'var(--border)', display: 'flex', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#10b981', width: `${t.positive}%` }} />
                <div style={{ height: '100%', background: 'var(--border)', width: `${100 - t.positive - t.negative}%` }} />
                <div style={{ height: '100%', background: '#ef4444', width: `${t.negative}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, flex: 1 }}>Customer Reviews</h3>
          {['All', 'Positive', 'Neutral', 'Negative'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: 99, border: `1px solid ${filter === f ? (COLORS[f as keyof typeof COLORS] || 'var(--accent)') : 'var(--border)'}`, background: filter === f ? `${COLORS[f as keyof typeof COLORS] || 'var(--accent)'}20` : 'none', color: filter === f ? (COLORS[f as keyof typeof COLORS] || 'var(--accent)') : 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>{f}</button>
          ))}
        </div>
        <div style={{ padding: '4px 0' }}>
          {filtered.map(f => (
            <div key={f.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${COLORS[f.sentiment as keyof typeof COLORS]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13, color: COLORS[f.sentiment as keyof typeof COLORS] }}>
                {f.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>• {f.category} • {f.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: `${COLORS[f.sentiment as keyof typeof COLORS]}20`, color: COLORS[f.sentiment as keyof typeof COLORS] }}>{f.sentiment}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: 'var(--accent-light)', color: 'var(--accent)' }}>Score: {f.score.toFixed(2)}</span>
                  </div>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.text}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {f.topics.map(t => <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--border)', color: 'var(--text-muted)' }}>{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
