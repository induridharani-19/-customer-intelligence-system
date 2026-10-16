import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { Settings, User, Shield, Bell, Monitor, Key, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const TABS = ['Profile', 'Appearance', 'Notifications', 'Security', 'API Integration'];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('Profile');
  const [name, setName] = useState(user?.name || 'Admin User');
  const [email, setEmail] = useState(user?.email || 'admin@ais.demo');
  const [company, setCompany] = useState('CustomerIQ Demo');
  const [timezone, setTimezone] = useState('UTC+5:30');
  const [showKey, setShowKey] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    email: true, browser: true, datasets: true, models: true, reports: true, churnAlerts: true, weeklyDigest: false,
  });

  const inputStyle = {
    padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8,
    background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 13, width: '100%', boxSizing: 'border-box' as const,
  };

  const save = () => toast.success('Settings saved successfully!');

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={22} color="var(--accent)" /> Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Manage your account and system preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Sidebar tabs */}
        <div className="card" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TABS.map(t => {
            const icons: Record<string, any> = { Profile: User, Appearance: Monitor, Notifications: Bell, Security: Shield, 'API Integration': Key };
            const Icon = icons[t];
            return (
              <button key={t} onClick={() => setTab(t)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 7, border: 'none', background: tab === t ? 'var(--accent-light)' : 'none', color: tab === t ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textAlign: 'left' }}>
                <Icon size={15} /> {t}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="card" style={{ padding: 24 }}>
          {tab === 'Profile' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>Profile Settings</h3>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{email}</p>
                  <span className="badge badge-accent" style={{ marginTop: 4 }}>Administrator</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Full Name', value: name, setter: setName },
                  { label: 'Email Address', value: email, setter: setEmail },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input value={f.value} onChange={e => f.setter(e.target.value)} style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Company</label>
                  <input value={company} onChange={e => setCompany(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Timezone</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {['UTC-8:00', 'UTC-5:00', 'UTC+0:00', 'UTC+1:00', 'UTC+5:30', 'UTC+8:00', 'UTC+9:00'].map(tz => <option key={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={save} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={14} /> Save Profile
              </button>
            </div>
          )}

          {tab === 'Appearance' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>Appearance</h3>
              <div style={{ display: 'flex', gap: 14 }}>
                {['dark', 'light'].map(t => (
                  <div key={t} onClick={() => { if (theme !== t) toggleTheme(); }} style={{ border: `2px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: '14px 20px', cursor: 'pointer', background: t === 'dark' ? '#0f172a' : '#f8fafc', minWidth: 120, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{t === 'dark' ? '🌙' : '☀️'}</div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t === 'dark' ? '#f1f5f9' : '#0f172a', textTransform: 'capitalize' }}>{t} Mode</p>
                    {theme === t && <span style={{ fontSize: 11, color: 'var(--accent)' }}>Active</span>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 10px' }}>Language</p>
                <select style={{ ...inputStyle, maxWidth: 200 }}>
                  <option>English (US)</option>
                  <option>Español</option>
                  <option>Français</option>
                  <option>Deutsch</option>
                </select>
              </div>
            </div>
          )}

          {tab === 'Notifications' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>Notification Preferences</h3>
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'browser', label: 'Browser Notifications', desc: 'Push notifications in the browser' },
                { key: 'datasets', label: 'Dataset Alerts', desc: 'When datasets are uploaded or processed' },
                { key: 'models', label: 'Model Updates', desc: 'When models finish training or fail' },
                { key: 'reports', label: 'Report Ready', desc: 'When reports are generated' },
                { key: 'churnAlerts', label: 'Churn Risk Alerts', desc: 'When high-risk customer count changes significantly' },
                { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary email every Monday' },
              ].map(s => (
                <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 22, cursor: 'pointer' }}>
                    <input type="checkbox" checked={notifSettings[s.key as keyof typeof notifSettings]} onChange={e => setNotifSettings(prev => ({ ...prev, [s.key]: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', inset: 0, borderRadius: 22, background: notifSettings[s.key as keyof typeof notifSettings] ? 'var(--accent)' : 'var(--border)', transition: '0.2s', cursor: 'pointer' }}>
                      <span style={{ position: 'absolute', left: notifSettings[s.key as keyof typeof notifSettings] ? 22 : 2, top: 2, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: '0.2s' }} />
                    </span>
                  </label>
                </div>
              ))}
              <button onClick={save} className="btn btn-primary" style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={14} /> Save Preferences
              </button>
            </div>
          )}

          {tab === 'Security' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>Security Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                {['Current Password', 'New Password', 'Confirm New Password'].map(f => (
                  <div key={f}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{f}</label>
                    <input type="password" placeholder="••••••••" style={inputStyle} />
                  </div>
                ))}
                <button onClick={() => toast.success('Password updated! (Simulated)')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={14} /> Update Password
                </button>
              </div>
              <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg)', borderRadius: 10, borderLeft: '3px solid var(--warning)' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Two-Factor Authentication</p>
                <p style={{ margin: '4px 0 10px', fontSize: 12, color: 'var(--text-muted)' }}>2FA adds an extra layer of security. Requires backend integration to enable.</p>
                <button onClick={() => toast.info('2FA requires backend integration')} className="btn btn-secondary btn-sm">Enable 2FA</button>
              </div>
            </div>
          )}

          {tab === 'API Integration' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>API & Backend Integration</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>Configure your FastAPI backend connection</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Backend API URL</label>
                  <input defaultValue="http://127.0.0.1:8000" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>API Key</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showKey ? 'text' : 'password'} defaultValue="ais_demo_key_XXXXXXXXXXXXXXXX" style={{ ...inputStyle, paddingRight: 40 }} />
                    <button onClick={() => setShowKey(!showKey)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Available Endpoints</p>
                  {[['GET', '/api/health', 'Health check'], ['GET', '/api/segments', 'Get segments'], ['GET', '/api/metrics', 'K-Means metrics'], ['GET', '/api/dashboard', 'Dashboard data'], ['POST', '/api/predict', 'Predict segment']].map(([method, path, desc]) => (
                    <div key={path} style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: method === 'GET' ? '#10b98120' : '#6366f120', color: method === 'GET' ? '#10b981' : '#6366f1' }}>{method}</span>
                      <code style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{path}</code>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— {desc}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => toast.success('API settings saved!')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Save size={14} /> Save API Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
