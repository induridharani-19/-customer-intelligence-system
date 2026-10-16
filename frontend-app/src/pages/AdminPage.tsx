import { useState } from 'react';
import { ShieldCheck, Users, Database, Activity, Settings, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const adminUsers = [
  { name: 'Admin User', email: 'admin@ais.demo', role: 'Administrator', lastLogin: '2024-11-30 09:15', status: 'Active' },
  { name: 'Sarah Williams', email: 'sarah.w@retail.com', role: 'Analyst', lastLogin: '2024-11-29 14:30', status: 'Active' },
  { name: 'James Rodriguez', email: 'j.rodriguez@corp.net', role: 'Viewer', lastLogin: '2024-11-28 11:00', status: 'Active' },
  { name: 'Demo Account', email: 'demo@ais.local', role: 'Viewer', lastLogin: '2024-11-10 08:22', status: 'Inactive' },
];

const systemLogs = [
  { level: 'INFO', message: 'FastAPI backend health check: OK', timestamp: '2024-11-30 09:16:42', source: 'System' },
  { level: 'SUCCESS', message: 'Dataset retail_transactions_nov2024.csv imported (45,231 rows)', timestamp: '2024-11-30 09:10:15', source: 'Data Import' },
  { level: 'INFO', message: 'K-Means segmentation completed. Silhouette score: 0.68', timestamp: '2024-11-29 22:45:31', source: 'ML Engine' },
  { level: 'WARNING', message: 'Prediction API fallback to heuristic mode (backend timeout)', timestamp: '2024-11-29 18:23:07', source: 'API' },
  { level: 'ERROR', message: 'BERT sentiment model training failed: CUDA out of memory', timestamp: '2024-11-10 14:12:55', source: 'ML Engine' },
  { level: 'INFO', message: 'Monthly report generated: November 2024 Customer Intelligence Report', timestamp: '2024-11-28 08:00:00', source: 'Reports' },
  { level: 'INFO', message: 'New user registered: sarah.w@retail.com', timestamp: '2024-11-25 10:30:00', source: 'Auth' },
  { level: 'SUCCESS', message: 'Churn prediction batch completed: 11,684 customers processed', timestamp: '2024-11-20 16:45:00', source: 'ML Engine' },
];

const LOG_COLORS: Record<string, string> = { INFO: '#6366f1', SUCCESS: '#10b981', WARNING: '#f59e0b', ERROR: '#ef4444' };

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const TABS = ['Overview', 'Users', 'System Logs', 'Maintenance'];

  const systemStats = {
    cpuUsage: 23, memoryUsage: 41, diskUsage: 67, apiLatency: 124,
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={22} color="var(--accent)" /> Admin Panel
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>System administration and user management</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === t ? 600 : 400, color: activeTab === t ? 'var(--accent)' : 'var(--text-muted)', borderBottom: `2px solid ${activeTab === t ? 'var(--accent)' : 'transparent'}`, marginBottom: -1 }}>{t}</button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* System metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[
              { label: 'CPU Usage', value: systemStats.cpuUsage, unit: '%', color: systemStats.cpuUsage > 80 ? 'var(--danger)' : 'var(--success)' },
              { label: 'Memory Usage', value: systemStats.memoryUsage, unit: '%', color: systemStats.memoryUsage > 85 ? 'var(--danger)' : 'var(--warning)' },
              { label: 'Disk Usage', value: systemStats.diskUsage, unit: '%', color: systemStats.diskUsage > 90 ? 'var(--danger)' : 'var(--warning)' },
              { label: 'API Latency', value: systemStats.apiLatency, unit: 'ms', color: systemStats.apiLatency > 500 ? 'var(--danger)' : 'var(--success)' },
            ].map(m => (
              <div key={m.label} className="card" style={{ padding: 16 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{m.label}</p>
                <p style={{ margin: '4px 0 6px', fontSize: 24, fontWeight: 800, color: m.color }}>{m.value}{m.unit}</p>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--border)' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: m.color, width: `${m.unit === 'ms' ? (m.value / 10) : m.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[
              { label: 'Total Users', value: adminUsers.length, icon: Users, color: '#6366f1' },
              { label: 'Active Sessions', value: 2, icon: Activity, color: '#10b981' },
              { label: 'Datasets', value: 5, icon: Database, color: '#8b5cf6' },
              { label: 'Error Logs', value: 1, icon: AlertTriangle, color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={20} color={s.color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Backend status */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Backend Services</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { name: 'FastAPI Backend', url: 'http://127.0.0.1:8000', status: 'Connected' },
                { name: 'ML Model API', url: '/api/predict', status: 'Simulated' },
                { name: 'Segmentation Engine', url: '/api/segments', status: 'Connected' },
                { name: 'Database', url: 'SQLite (local)', status: 'N/A - Frontend Only' },
              ].map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg)', borderRadius: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{s.url}</p>
                  </div>
                  <span className={`badge ${s.status === 'Connected' ? 'badge-success' : s.status === 'Simulated' ? 'badge-warning' : 'badge-neutral'}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Users' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>User Management</h3>
            <button onClick={() => toast.info('User creation requires backend integration')} className="btn btn-primary btn-sm">+ Invite User</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {['User', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {adminUsers.map((u, i) => (
                <tr key={i} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${u.role === 'Administrator' ? 'badge-danger' : u.role === 'Analyst' ? 'badge-accent' : 'badge-neutral'}`}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{u.lastLogin}</td>
                  <td style={{ padding: '12px 14px' }}><span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{u.status}</span></td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => toast.info('Edit requires backend')} className="btn btn-ghost btn-sm">Edit</button>
                      {u.role !== 'Administrator' && <button onClick={() => toast.success('User removed (Simulated)')} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}><Trash2 size={12} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'System Logs' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>System Logs</h3>
            <button onClick={() => toast.success('Logs exported!')} className="btn btn-ghost btn-sm">Export Logs</button>
          </div>
          {systemLogs.map((log, i) => (
            <div key={i} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${LOG_COLORS[log.level]}20`, color: LOG_COLORS[log.level], flexShrink: 0, marginTop: 1 }}>{log.level}</span>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{log.message}</p>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{log.source}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{log.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Maintenance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { title: 'Clear Session Cache', desc: 'Remove all cached session data and force re-authentication', icon: '🗑️', action: 'Clear Cache', color: 'var(--warning)' },
            { title: 'Backup Data', desc: 'Export all application data as a backup file', icon: '💾', action: 'Create Backup', color: 'var(--accent)' },
            { title: 'Reset ML Models', desc: 'Clear all trained model weights and force re-training', icon: '🔄', action: 'Reset Models', color: 'var(--danger)' },
            { title: 'System Health Check', desc: 'Run diagnostics on all connected services', icon: '🩺', action: 'Run Check', color: 'var(--success)' },
          ].map(a => (
            <div key={a.title} className="card" style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 28 }}>{a.icon}</span>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{a.title}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</p>
                </div>
              </div>
              <button onClick={() => toast.info(`${a.action} requires backend integration`)} style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${a.color}`, background: `${a.color}15`, color: a.color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{a.action}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
