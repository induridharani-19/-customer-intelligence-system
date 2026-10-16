import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Brain, BarChart3, PieChart, TrendingUp, Database, MessageSquare, Lightbulb,
  CheckCircle, ChevronDown, ChevronUp, Sun, Moon, ArrowRight, Sparkles, Shield,
  Zap, Users, Star, Menu, X
} from 'lucide-react';

const features = [
  { icon: PieChart, title: 'Customer Segmentation', desc: 'Automatically cluster customers into 7 meaningful segments using K-Means and neural embedding algorithms.', color: '#6366f1' },
  { icon: TrendingUp, title: 'Predictive Analytics', desc: 'Predict churn risk, customer lifetime value, and purchase probability with production ML models.', color: '#8b5cf6' },
  { icon: MessageSquare, title: 'Sentiment Analysis', desc: 'Understand customer feedback at scale with NLP-powered sentiment classification across all channels.', color: '#06b6d4' },
  { icon: BarChart3, title: 'Real-time Dashboard', desc: 'Monitor KPIs, trends, and anomalies with live interactive dashboards and drill-down analytics.', color: '#10b981' },
  { icon: Lightbulb, title: 'Smart Recommendations', desc: 'AI-generated business recommendations tailored to each customer segment and business objective.', color: '#f59e0b' },
  { icon: Database, title: 'Data Management', desc: 'Import, clean, and manage customer datasets with an intuitive drag-and-drop interface and validation tools.', color: '#ef4444' },
];

const stats = [
  { value: '98.2%', label: 'Prediction Accuracy', note: 'Sample' },
  { value: '7', label: 'Customer Segments' },
  { value: '40%', label: 'Avg Churn Reduction', note: 'Sample' },
  { value: '3×', label: 'Revenue Growth', note: 'Sample' },
];

const testimonials = [
  { name: 'Alexandra Moore', role: 'VP of Marketing', company: 'RetailPro Inc.', text: 'CustomerIQ transformed how we understand our customer base. We reduced churn by 38% in just 90 days after implementing the AI recommendations. The segmentation is incredibly accurate.', rating: 5 },
  { name: 'David Park', role: 'Head of Analytics', company: 'TechCommerce Ltd.', text: 'The prediction studio alone is worth the investment. Being able to predict which customers are at risk of churning — before they actually leave — has been a game changer for our retention team.', rating: 5 },
  { name: 'Priya Sharma', role: 'CTO', company: 'GrowthBrands Co.', text: 'Implementation was seamless. The FastAPI backend connected to our data pipeline in hours, and the dashboard was immediately delivering insights our leadership team could act on.', rating: 5 },
];

const faqs = [
  { q: 'Do I need a data science background to use CustomerIQ?', a: 'No. CustomerIQ is designed for business teams. The ML models run automatically in the background — you just upload your data, review the insights, and take action. Our guided workflows handle the complexity.' },
  { q: 'What data formats are supported?', a: 'We support CSV and Excel files. Your data needs customer transaction records with at minimum: customer ID, date, and transaction amount. Optional fields like product category and quantity unlock additional analytics.' },
  { q: 'How accurate are the predictions?', a: 'Accuracy depends on your data quality and volume. Our sample benchmarks show 94-98% segmentation accuracy and 86% churn prediction AUC-ROC on typical retail datasets. Always validate predictions against your business context.' },
  { q: 'Can I connect to my existing backend?', a: 'Yes. The frontend is designed with a documented API integration layer. The FastAPI backend exposes /api/predict, /api/segments, and /api/dashboard endpoints that connect directly to the React frontend.' },
  { q: 'Is the data secure?', a: 'Security architecture is ready for production hardening. The current prototype runs locally. For production, we recommend adding authentication middleware, HTTPS, and database encryption per your compliance requirements.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bg = theme === 'dark' ? '#0f172a' : '#f8fafc';
  const card = theme === 'dark' ? '#1e293b' : '#ffffff';
  const text = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const muted = theme === 'dark' ? '#94a3b8' : '#475569';
  const border = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div style={{ background: bg, color: text, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: `${card}ee`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>CustomerIQ</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: muted, borderRadius: 8 }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '8px 18px', borderRadius: 8, background: 'none', border: `1px solid ${border}`, color: text, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Login</button>
            <button onClick={() => navigate('/register')} style={{ padding: '8px 18px', borderRadius: 8, background: '#6366f1', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: theme === 'dark' ? '#312e81' : '#eef2ff', border: `1px solid #6366f1`, borderRadius: 99, padding: '4px 14px', marginBottom: 24, fontSize: 13, fontWeight: 500, color: '#6366f1' }}>
          <Sparkles size={13} />
          AI-Powered Customer Intelligence Platform
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-2px' }}>
          Turn Customer Data into<br />
          <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intelligent Decisions</span>
        </h1>
        <p style={{ fontSize: 18, color: muted, maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
          AI-powered platform that segments your customers, predicts churn, analyzes sentiment, and delivers actionable insights — all in one place.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/register')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
            Get Started Free <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'none', border: `1px solid ${border}`, borderRadius: 10, color: text, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Explore Dashboard
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 40, flexWrap: 'wrap' }}>
          {['500+ Companies', '99.9% Uptime', 'SOC 2 Ready'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, color: muted, fontSize: 13 }}>
              <CheckCircle size={14} color="#10b981" />
              {t}
            </div>
          ))}
        </div>

        {/* Dashboard Preview */}
        <div style={{ marginTop: 56, borderRadius: 16, border: `1px solid ${border}`, background: card, padding: 20, boxShadow: theme === 'dark' ? '0 25px 60px rgba(0,0,0,0.5)' : '0 25px 60px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[['11,684', 'Total Customers', '#6366f1'], ['82.4%', 'Retention Rate', '#10b981'], ['$4.23M', 'Revenue', '#8b5cf6'], ['892', 'At-Risk', '#ef4444']].map(([val, lbl, clr]) => (
              <div key={lbl} style={{ background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderRadius: 10, padding: '14px 16px', textAlign: 'left', borderLeft: `3px solid ${clr}` }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: text }}>{val}</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div style={{ background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderRadius: 10, padding: 16, height: 120, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, color: muted, fontWeight: 600 }}>Revenue Trend</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flex: 1 }}>
                {[40, 55, 48, 62, 58, 72, 68, 82, 79, 88, 85, 100].map((h, i) => (
                  <div key={i} style={{ flex: 1, background: `rgba(99,102,241,${0.3 + h / 200})`, borderRadius: 3, height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div style={{ background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 12, color: muted, fontWeight: 600, marginBottom: 8 }}>Segments</div>
              {[['High-Value', '#6366f1', 28], ['Loyal', '#8b5cf6', 42], ['At-Risk', '#ef4444', 30]].map(([n, c, w]) => (
                <div key={n as string} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: muted, marginBottom: 2 }}>{n}</div>
                  <div style={{ height: 6, borderRadius: 99, background: border }}>
                    <div style={{ height: '100%', borderRadius: 99, background: c as string, width: `${w}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px', letterSpacing: '-1px' }}>Everything You Need to Understand Your Customers</h2>
          <p style={{ color: muted, fontSize: 16 }}>Six powerful modules working together to drive customer intelligence</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 24, cursor: 'default', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 30px rgba(0,0,0,0.12)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ color: muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', padding: '60px 24px', margin: '0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 32, textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 42, fontWeight: 900, color: 'white', letterSpacing: '-2px' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>{s.label}{s.note && <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.7 }}>({s.note})</span>}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px', letterSpacing: '-1px' }}>How It Works</h2>
          <p style={{ color: muted, fontSize: 16 }}>From raw data to actionable insights in three steps</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
          {[
            { num: '01', icon: Database, title: 'Upload Data', desc: 'Connect your customer transaction data via CSV upload or API integration. Our validation engine checks data quality automatically.' },
            { num: '02', icon: Zap, title: 'Run AI Analysis', desc: 'Our ML pipeline automatically segments customers, computes RFM scores, predicts churn, and generates sentiment insights.' },
            { num: '03', icon: TrendingUp, title: 'Take Action', desc: 'Get targeted recommendations, create campaigns, export reports, and track business impact over time.' },
          ].map(step => (
            <div key={step.num} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 28, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 48, fontWeight: 900, color: border, lineHeight: 1 }}>{step.num}</div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#6366f120', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <step.icon size={22} color="#6366f1" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{step.title}</h3>
              <p style={{ color: muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: theme === 'dark' ? '#1e293b' : '#f1f5f9', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px', letterSpacing: '-1px' }}>Trusted by Analytics Teams</h2>
            <p style={{ color: muted, fontSize: 16 }}>* Sample testimonials for illustration purposes</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {testimonials.map(t => (
              <div key={t.name} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {Array(t.rating).fill(0).map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ color: muted, fontSize: 14, lineHeight: 1.7, margin: '0 0 20px', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: muted, fontSize: 12 }}>{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px', letterSpacing: '-1px' }}>Frequently Asked Questions</h2>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} style={{ border: `1px solid ${border}`, borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '18px 20px', background: card, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', color: text, fontSize: 15, fontWeight: 600 }}>
              {faq.q}
              {openFaq === i ? <ChevronUp size={18} color={muted} /> : <ChevronDown size={18} color={muted} />}
            </button>
            {openFaq === i && (
              <div style={{ padding: '0 20px 18px', background: card, color: muted, fontSize: 14, lineHeight: 1.7 }}>{faq.a}</div>
            )}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 16, padding: '60px 40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', margin: '0 0 12px', letterSpacing: '-1px' }}>Ready to Transform Your Customer Intelligence?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '0 0 32px' }}>Start understanding your customers at a deeper level today.</p>
          <button onClick={() => navigate('/register')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: 'white', border: 'none', borderRadius: 10, color: '#6366f1', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Get Started Free <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${border}`, background: card, padding: '40px 24px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={16} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>CustomerIQ</span>
          </div>
          <p style={{ color: muted, fontSize: 13 }}>© {new Date().getFullYear()} CustomerIQ. AI-Powered Customer Intelligence Platform. Sample / Prototype.</p>
        </div>
      </footer>
    </div>
  );
}
