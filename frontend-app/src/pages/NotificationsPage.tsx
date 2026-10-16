import { useState } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { toast } from 'sonner';

const CATEGORY_COLORS: Record<string, string> = {
  Dataset: '#6366f1', Processing: '#8b5cf6', Prediction: '#06b6d4',
  Model: '#10b981', Report: '#f59e0b', System: '#64748b',
};
const TYPE_ICONS: Record<string, string> = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllRead, removeNotification, clearAll } = useNotificationStore();
  const [activeCategory, setActiveCategory] = useState('All');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const categories = ['All', 'Dataset', 'Processing', 'Prediction', 'Model', 'Report', 'System'];

  const filtered = notifications.filter((n: any) => activeCategory === 'All' || n.category === activeCategory);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={22} color="var(--accent)" /> Notifications
            {unreadCount > 0 && <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--danger)', color: 'white' }}>{unreadCount}</span>}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>{notifications.length} notifications • {unreadCount} unread</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { markAllRead(); toast.success('All marked as read'); }} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCheck size={14} /> Mark All Read
          </button>
          <button onClick={() => { clearAll(); toast.success('All notifications cleared'); }} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}>
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)} style={{ padding: '6px 14px', borderRadius: 99, border: `1px solid ${activeCategory === c ? (CATEGORY_COLORS[c] || 'var(--accent)') : 'var(--border)'}`, background: activeCategory === c ? `${CATEGORY_COLORS[c] || 'var(--accent)'}15` : 'none', color: activeCategory === c ? (CATEGORY_COLORS[c] || 'var(--accent)') : 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Bell size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No notifications in this category</p>
          </div>
        ) : (
          filtered.map((n: any, i: number) => (
            <div key={n.id} onClick={() => markAsRead(n.id)} style={{ padding: '16px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', background: !n.isRead ? 'var(--accent-light)' : 'transparent', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'background 0.15s' }}>
              <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{TYPE_ICONS[n.type]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <h3 style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 700, margin: 0, color: 'var(--text-primary)' }}>{n.title}</h3>
                    <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 99, background: `${CATEGORY_COLORS[n.category]}20`, color: CATEGORY_COLORS[n.category] }}>{n.category}</span>
                    {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</span>
                    <button onClick={e => { e.stopPropagation(); removeNotification(n.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
