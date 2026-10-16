import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Brain } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm: z.string(),
  terms: z.boolean().refine(v => v === true, 'You must accept the terms'),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const ok = await registerUser(data.name, data.email, data.password);
    if (ok) {
      toast.success('Account created! Welcome to CustomerIQ.');
      navigate('/dashboard');
    }
  };

  const inputStyle = (err?: { message?: string }) => ({
    width: '100%', padding: '10px 12px 10px 38px', border: `1px solid ${err ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' as const,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 24px', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>CustomerIQ</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 32px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>Create your account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' }}>Start your AI customer intelligence journey</p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('name')} type="text" placeholder="Your full name" style={inputStyle(errors.name)} />
              </div>
              {errors.name && <p style={{ color: 'var(--danger)', fontSize: 12, margin: '4px 0 0' }}>{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('email')} type="email" placeholder="you@company.com" style={inputStyle(errors.email)} />
              </div>
              {errors.email && <p style={{ color: 'var(--danger)', fontSize: 12, margin: '4px 0 0' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" style={{ ...inputStyle(errors.password), padding: '10px 40px 10px 38px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ color: 'var(--danger)', fontSize: 12, margin: '4px 0 0' }}>{errors.password.message}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('confirm')} type="password" placeholder="Repeat your password" style={inputStyle(errors.confirm)} />
              </div>
              {errors.confirm && <p style={{ color: 'var(--danger)', fontSize: 12, margin: '4px 0 0' }}>{errors.confirm.message}</p>}
            </div>

            {/* Terms */}
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <input {...register('terms')} type="checkbox" id="terms" style={{ marginTop: 2, cursor: 'pointer' }} />
                <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
                  I agree to the <a href="#" style={{ color: 'var(--accent)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--accent)' }}>Privacy Policy</a>
                </label>
              </div>
              {errors.terms && <p style={{ color: 'var(--danger)', fontSize: 12, margin: '4px 0 0' }}>{errors.terms.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} style={{ padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'white', fontSize: 15, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {isLoading ? <><span className="spinner" style={{ borderTopColor: 'white' }} />Creating account...</> : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
