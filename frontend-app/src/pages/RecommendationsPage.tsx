import { useState } from 'react';
import { mockRecommendations, Recommendation } from '@/data/mockRecommendations';
import { Lightbulb, Filter, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const PRIORITY_COLORS: Record<string, string> = { High: 'badge-danger', Medium: 'badge-warning', Low: 'badge-neutral' };
const STATUS_COLORS: Record<string, string> = { Pending: 'badge-warning', 'In Progress': 'badge-accent', Completed: 'badge-success', Dismissed: 'badge-neutral' };
const CATEGORY_COLORS: Record<string, string> = {
  Retention: '#ef4444', 'Revenue Growth': '#10b981', 'Customer Engagement': '#6366f1',
  'Customer Experience': '#8b5cf6', 'Marketing Optimization': '#f59e0b',
};
const EFFORT_COLORS: Record<string, string> = { Low: 'var(--success)', Medium: 'var(--warning)', High: 'var(--danger)' };

export default function RecommendationsPage() {
  const [recs, setRecs] = useState(mockRecommendations);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = recs.filter(r =>
    (categoryFilter === 'All' || r.category === categoryFilter) &&
    (priorityFilter === 'All' || r.priority === priorityFilter) &&
    (statusFilter === 'All' || r.status === statusFilter)
  );

  const updateStatus = (id: string, status: Recommendation['status']) => {
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Status updated to ${status}`);
  };

  const stats = {
    total: recs.length,
    highPriority: recs.filter(r => r.priority === 'High').length,
    inProgress: recs.filter(r => r.status === 'In Progress').length,
    completed: recs.filter(r => r.status === 'Completed').length,
  };

  const selectStyle = { padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lightbulb size={22} color="var(--accent)" /> AI Recommendations
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Business intelligence recommendations • {stats.total} total insights</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Recommendations', value: stats.total, color: 'var(--accent)' },
          { label: 'High Priority', value: stats.highPriority, color: 'var(--danger)' },
          { label: 'In Progress', value: stats.inProgress, color: 'var(--warning)' },
          { label: 'Completed', value: stats.completed, color: 'var(--success)' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: 16, borderLeft: `3px solid ${c.color}` }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{c.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} color="var(--text-muted)" />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Categories</option>
          {['Retention', 'Revenue Growth', 'Customer Engagement', 'Customer Experience', 'Marketing Optimization'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Priorities</option>
          {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Statuses</option>
          {['Pending', 'In Progress', 'Completed', 'Dismissed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} recommendations</span>
      </div>

      {/* Recommendation cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(rec => {
          const isExpanded = expandedId === rec.id;
          const catColor = CATEGORY_COLORS[rec.category] || 'var(--accent)';
          return (
            <div key={rec.id} className="card" style={{ overflow: 'hidden', borderLeft: `3px solid ${catColor}` }}>
              <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }} onClick={() => setExpandedId(isExpanded ? null : rec.id)}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${catColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Lightbulb size={18} color={catColor} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: 1.4 }}>{rec.title}</h3>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <span className={`badge ${PRIORITY_COLORS[rec.priority]}`}>{rec.priority}</span>
                      <span className={`badge ${STATUS_COLORS[rec.status]}`}>{rec.status}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${catColor}15`, color: catColor }}>{rec.category}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target: {rec.targetSegment}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Effort: <span style={{ color: EFFORT_COLORS[rec.effort], fontWeight: 600 }}>{rec.effort}</span></span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rec.createdAt}</span>
                  </div>
                  {!isExpanded && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.description}</p>}
                </div>
                {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>

              {isExpanded && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                    <div>
                      <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Description</p>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.description}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Supporting Metric</p>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.supportingMetric}</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
                    <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 8, padding: '10px 14px' }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>Suggested Action</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{rec.suggestedAction}</p>
                    </div>
                    <div style={{ background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 8, padding: '10px 14px' }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}><TrendingUp size={11} /> Expected Impact</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{rec.impact}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    {rec.status !== 'In Progress' && rec.status !== 'Completed' && (
                      <button onClick={() => updateStatus(rec.id, 'In Progress')} className="btn btn-primary btn-sm">Mark In Progress</button>
                    )}
                    {rec.status !== 'Completed' && (
                      <button onClick={() => updateStatus(rec.id, 'Completed')} className="btn btn-sm" style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: 7, cursor: 'pointer', padding: '6px 14px', fontSize: 13 }}>Mark Complete</button>
                    )}
                    {rec.status !== 'Dismissed' && (
                      <button onClick={() => updateStatus(rec.id, 'Dismissed')} className="btn btn-ghost btn-sm">Dismiss</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No recommendations match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
