import { useState } from 'react';
import { mockCampaigns, campaignSummary, Campaign } from '@/data/mockCampaigns';
import { Megaphone, Plus, BarChart3, Mail, Users, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLES: Record<string, string> = { Active: 'badge-success', Draft: 'badge-neutral', Completed: 'badge-accent', Paused: 'badge-warning' };
const STATUS_COLORS: Record<string, string> = { Active: '#10b981', Draft: '#64748b', Completed: '#6366f1', Paused: '#f59e0b' };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);

  const filtered = campaigns.filter(c => statusFilter === 'All' || c.status === statusFilter);

  const updateStatus = (id: string, status: Campaign['status']) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Campaign status updated to ${status}`);
  };

  const selectStyle = { padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Megaphone size={22} color="var(--accent)" /> Campaigns
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Manage marketing campaigns • {campaigns.length} total</p>
        </div>
        <button onClick={() => toast.info('Campaign builder — connect backend to enable creation')} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> New Campaign
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Budget', value: `$${(campaignSummary.totalBudget/1000).toFixed(0)}K`, icon: DollarSign, color: '#6366f1' },
          { label: 'Total Spent', value: `$${(campaignSummary.totalSpent/1000).toFixed(0)}K`, icon: DollarSign, color: '#f59e0b' },
          { label: 'Total Revenue', value: `$${(campaignSummary.totalRevenue/1000).toFixed(0)}K`, icon: TrendingUp, color: '#10b981' },
          { label: 'Conversions', value: campaignSummary.totalConversions.toLocaleString(), icon: Users, color: '#8b5cf6' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: 16, borderLeft: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon size={16} color={c.color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{c.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: c.color }}>{c.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status count row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { label: 'All', count: campaigns.length },
          { label: 'Active', count: campaignSummary.activeCampaigns },
          { label: 'Draft', count: campaignSummary.draftCampaigns },
          { label: 'Completed', count: campaignSummary.completedCampaigns },
          { label: 'Paused', count: campaignSummary.pausedCampaigns },
        ].map(s => (
          <button key={s.label} onClick={() => setStatusFilter(s.label)} style={{ padding: '7px 16px', borderRadius: 99, border: `1px solid ${statusFilter === s.label ? STATUS_COLORS[s.label] || 'var(--accent)' : 'var(--border)'}`, background: statusFilter === s.label ? `${STATUS_COLORS[s.label] || 'var(--accent)'}15` : 'none', color: statusFilter === s.label ? STATUS_COLORS[s.label] || 'var(--accent)' : 'var(--text-muted)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {s.label} <span style={{ fontWeight: 700 }}>{s.count}</span>
          </button>
        ))}
        <button onClick={() => setViewMode(v => v === 'cards' ? 'table' : 'cards')} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart3 size={14} /> {viewMode === 'cards' ? 'Table View' : 'Card View'}
        </button>
      </div>

      {/* Campaign grid */}
      {viewMode === 'cards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
          {filtered.map(c => {
            const budgetUsed = c.budget > 0 ? (c.spent / c.budget) * 100 : 0;
            const roi = c.revenue && c.spent ? ((c.revenue - c.spent) / c.spent * 100).toFixed(0) : null;
            return (
              <div key={c.id} className="card" style={{ padding: 18, cursor: 'pointer', borderTop: `3px solid ${STATUS_COLORS[c.status]}` }} onClick={() => setSelected(selected?.id === c.id ? null : c)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${STATUS_COLORS[c.status]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={16} color={STATUS_COLORS[c.status]} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{c.name}</h3>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{c.targetSegment} • {c.channel}</p>
                    </div>
                  </div>
                  <span className={`badge ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>{c.description}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Audience', value: c.audienceSize.toLocaleString() },
                    { label: 'Budget', value: `$${(c.budget/1000).toFixed(0)}K` },
                    { label: 'Spent', value: `$${(c.spent/1000).toFixed(0)}K` },
                    { label: roi !== null ? 'ROI' : 'Period', value: roi !== null ? `${roi}%` : `${c.startDate.slice(5)} – ${c.endDate.slice(5)}` },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'var(--bg)', borderRadius: 6, padding: '6px 10px' }}>
                      <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>{m.label}</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {c.openRate && (
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                    <div style={{ textAlign: 'center' }}><p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>Open Rate</p><p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>{c.openRate}%</p></div>
                    <div style={{ textAlign: 'center' }}><p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>Click Rate</p><p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{c.clickRate}%</p></div>
                    <div style={{ textAlign: 'center' }}><p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>Conversions</p><p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.conversions?.toLocaleString()}</p></div>
                  </div>
                )}

                {/* Budget bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Budget used</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{budgetUsed.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: 'var(--border)' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: budgetUsed > 90 ? 'var(--danger)' : 'var(--accent)', width: `${Math.min(100, budgetUsed)}%` }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  {c.status === 'Active' && <button onClick={() => updateStatus(c.id, 'Paused')} className="btn btn-ghost btn-sm">Pause</button>}
                  {c.status === 'Paused' && <button onClick={() => updateStatus(c.id, 'Active')} className="btn btn-sm" style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: 6, cursor: 'pointer', padding: '5px 12px', fontSize: 12 }}>Resume</button>}
                  {c.status === 'Draft' && <button onClick={() => updateStatus(c.id, 'Active')} className="btn btn-primary btn-sm">Launch</button>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Campaign', 'Segment', 'Channel', 'Status', 'Budget', 'Spent', 'Revenue', 'Open Rate', 'Conversions'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{c.targetSegment}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{c.channel}</td>
                    <td style={{ padding: '10px 14px' }}><span className={`badge ${STATUS_STYLES[c.status]}`}>{c.status}</span></td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>${c.budget.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>${c.spent.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>{c.revenue ? `$${c.revenue.toLocaleString()}` : '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{c.openRate ? `${c.openRate}%` : '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{c.conversions?.toLocaleString() || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
