import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Brain, Info } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 24px', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>CustomerIQ</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px' }}>
          {!submitted ? (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>Reset your password</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              {/* Prototype notice */}
              <div style={{ display: 'flex', gap: 8, background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
                <Info size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: 'var(--accent)', margin: 0, lineHeight: 1.5 }}>
                  <strong>Prototype notice:</strong> No real email is sent in this demo. Password reset requires backend integration.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                      style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'white', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Mail size={24} color="var(--success)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px', color: 'var(--text-primary)' }}>Check your inbox</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }}>
                If an account exists for <strong>{email}</strong>, you will receive reset instructions shortly.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>* No real email is sent in this prototype.</p>
            </div>
          )}
        </div>

        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 20, fontSize: 14, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  );
}
