import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, Brain, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = async (data: FormData) => {
    clearError();
    const ok = await login(data.email, data.password);
    if (ok) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials. Try admin@ais.demo / admin123');
    }
  };

  const fillDemo = () => {
    setValue('email', 'admin@ais.demo');
    setValue('password', 'admin123');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel */}
      <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed,#a21caf)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20 }}>CustomerIQ</span>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>AI-Powered Customer Intelligence</h2>
        <p style={{ opacity: 0.85, fontSize: 15, lineHeight: 1.7, margin: '0 0 40px' }}>Understand your customers like never before. Segment, predict, and act with ML-driven insights.</p>
        {['Predict customer churn before it happens', 'Segment 11,000+ customers automatically', 'Generate actionable business recommendations'].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 14, opacity: 0.9 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', background: 'var(--bg)' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>Welcome back</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 32px' }}>Sign in to your CustomerIQ account</p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 380 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input {...register('email')} type="email" placeholder="you@company.com" style={{ width: '100%', padding: '10px 12px 10px 38px', border: `1px solid ${errors.email ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            {errors.email && <p style={{ color: 'var(--danger)', fontSize: 12, margin: '4px 0 0' }}>{errors.email.message}</p>}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" style={{ width: '100%', padding: '10px 40px 10px 38px', border: `1px solid ${errors.password ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color: 'var(--danger)', fontSize: 12, margin: '4px 0 0' }}>{errors.password.message}</p>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input {...register('remember')} type="checkbox" id="remember" style={{ cursor: 'pointer' }} />
            <label htmlFor="remember" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>Remember me</label>
          </div>

          {error && <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)' }}>{error}</div>}

          <button type="submit" disabled={isLoading} style={{ padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'white', fontSize: 15, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {isLoading ? <><span className="spinner" style={{ borderTopColor: 'white' }} />Signing in...</> : 'Sign In'}
          </button>
        </form>

        {/* Demo hint */}
        <div onClick={fillDemo} style={{ marginTop: 20, maxWidth: 380, padding: '12px 16px', background: 'var(--accent-light)', border: '1px dashed var(--accent)', borderRadius: 8, cursor: 'pointer' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', margin: '0 0 2px' }}>🚀 Demo Credentials (click to fill)</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>admin@ais.demo / admin123</p>
        </div>

        <p style={{ marginTop: 24, fontSize: 14, color: 'var(--text-muted)', maxWidth: 380 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
