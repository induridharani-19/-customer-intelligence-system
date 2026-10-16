import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Settings2, Play, RefreshCw, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';

const models = [
  {
    id: 'kmeans', name: 'K-Means Segmentation', type: 'Clustering', status: 'Ready', version: 'v2.1.0', lastTrained: '2024-11-28',
    silhouetteScore: 0.68, dataset: 'retail_transactions_nov2024.csv', description: 'K-Means clustering algorithm for customer segmentation using RFM features.',
    features: ['Recency', 'Frequency', 'Monetary Value', 'Total Quantity', 'Avg Unit Price'], k: 7,
    trainingHistory: [{ date: 'Nov 14', score: 0.61 }, { date: 'Nov 21', score: 0.64 }, { date: 'Nov 28', score: 0.68 }],
  },
  {
    id: 'rf-churn', name: 'Random Forest Churn Predictor', type: 'Classification', status: 'Ready', version: 'v1.3.2', lastTrained: '2024-11-20',
    accuracy: 0.861, f1Score: 0.834, dataset: 'q3_transactions_2024.csv', description: 'Random Forest classifier for predicting customer churn probability within 90 days.',
    features: ['Recency', 'Frequency', 'Monetary', 'Order Trend', 'Days Since First Purchase'],
    trainingHistory: [{ date: 'Oct 15', score: 0.81 }, { date: 'Oct 30', score: 0.84 }, { date: 'Nov 20', score: 0.86 }],
  },
  {
    id: 'neural-embed', name: 'Neural Customer Embeddings', type: 'Representation Learning', status: 'Training', version: 'v0.9.1', lastTrained: '2024-11-29',
    accuracy: null, f1Score: null, dataset: 'retail_transactions_nov2024.csv', description: 'Deep neural network for learning dense customer representations from transaction sequences.',
    features: ['Purchase Sequences', 'Category Patterns', 'Time Intervals', 'Basket Composition'],
    trainingHistory: [{ date: 'Nov 01', score: 0.71 }, { date: 'Nov 15', score: 0.77 }, { date: 'Nov 29', score: null }],
  },
  {
    id: 'xgb-predict', name: 'Churn Prediction (XGBoost)', type: 'Classification', status: 'Ready', version: 'v1.0.0', lastTrained: '2024-11-15',
    accuracy: 0.892, f1Score: 0.871, dataset: 'retail_transactions_nov2024.csv', description: 'XGBoost model for high-accuracy churn prediction with SHAP explainability.',
    features: ['All RFM Features', 'Customer Age', 'Category Diversity', 'Seasonal Patterns'],
    trainingHistory: [{ date: 'Nov 01', score: 0.86 }, { date: 'Nov 08', score: 0.88 }, { date: 'Nov 15', score: 0.89 }],
  },
  {
    id: 'clv-estimator', name: 'CLV Estimator (BG/NBD)', type: 'Regression', status: 'Ready', version: 'v1.1.0', lastTrained: '2024-11-25',
    accuracy: 0.831, f1Score: null, dataset: 'q3_transactions_2024.csv', description: 'Beta Geometric / Negative Binomial Distribution model for customer lifetime value prediction.',
    features: ['Recency', 'Frequency', 'Monetary Value', 'Customer Tenure'],
    trainingHistory: [{ date: 'Oct 25', score: 0.79 }, { date: 'Nov 10', score: 0.81 }, { date: 'Nov 25', score: 0.83 }],
  },
  {
    id: 'sentiment-nlp', name: 'Sentiment Analyzer (BERT)', type: 'NLP', status: 'Failed', version: 'v0.5.0', lastTrained: '2024-11-10',
    accuracy: null, f1Score: null, dataset: 'customer_feedback_oct2024.xlsx', description: 'Fine-tuned BERT model for sentiment classification on customer reviews. Last training run failed due to memory error.',
    features: ['Review Text', 'Product Category', 'Customer Tier'],
    trainingHistory: [{ date: 'Oct 01', score: 0.82 }, { date: 'Oct 20', score: 0.84 }, { date: 'Nov 10', score: null }],
  },
];

const STATUS_ICONS: Record<string, any> = {
  Ready: { icon: CheckCircle, color: 'var(--success)' },
  Training: { icon: Loader, color: 'var(--warning)' },
  Failed: { icon: AlertCircle, color: 'var(--danger)' },
  Pending: { icon: Clock, color: 'var(--text-muted)' },
};

const STATUS_BADGES: Record<string, string> = { Ready: 'badge-success', Training: 'badge-warning', Failed: 'badge-danger', Pending: 'badge-neutral' };
const TYPE_COLORS: Record<string, string> = { Clustering: '#6366f1', Classification: '#10b981', 'Representation Learning': '#8b5cf6', Regression: '#f59e0b', NLP: '#06b6d4' };

export default function ModelManagementPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [retraining, setRetraining] = useState<string | null>(null);

  const retrain = async (id: string) => {
    setRetraining(id);
    await new Promise(r => setTimeout(r, 2500));
    setRetraining(null);
    toast.success('Retraining complete! (Simulated)');
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings2 size={22} color="var(--accent)" /> Model Management
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>ML model registry and monitoring • Sample metrics for illustration</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Models', value: models.length, color: 'var(--accent)' },
          { label: 'Ready', value: models.filter(m => m.status === 'Ready').length, color: 'var(--success)' },
          { label: 'Training', value: models.filter(m => m.status === 'Training').length, color: 'var(--warning)' },
          { label: 'Failed', value: models.filter(m => m.status === 'Failed').length, color: 'var(--danger)' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: 16, borderLeft: `3px solid ${c.color}` }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{c.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Model cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
        {models.map(m => {
          const si = STATUS_ICONS[m.status];
          const isSelected = selected === m.id;
          const isRetraining = retraining === m.id;
          return (
            <div key={m.id} className="card" style={{ overflow: 'hidden', border: isSelected ? '1px solid var(--accent)' : undefined }}>
              {/* Header */}
              <div style={{ padding: '16px 18px', cursor: 'pointer' }} onClick={() => setSelected(isSelected ? null : m.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{m.name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>v{m.version} • {m.lastTrained}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${TYPE_COLORS[m.type]}20`, color: TYPE_COLORS[m.type] }}>{m.type}</span>
                    <span className={`badge ${STATUS_BADGES[m.status]}`} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <si.icon size={10} color={si.color} className={m.status === 'Training' ? 'animate-spin' : undefined} />
                      {m.status}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>{m.description}</p>

                {/* Metrics */}
                <div style={{ display: 'flex', gap: 12 }}>
                  {m.accuracy !== null && m.accuracy !== undefined && (
                    <div style={{ background: 'var(--bg)', padding: '6px 10px', borderRadius: 6 }}>
                      <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>Accuracy</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--success)' }}>{(m.accuracy * 100).toFixed(1)}%</p>
                    </div>
                  )}
                  {m.f1Score !== null && m.f1Score !== undefined && (
                    <div style={{ background: 'var(--bg)', padding: '6px 10px', borderRadius: 6 }}>
                      <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>F1 Score</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>{(m.f1Score * 100).toFixed(1)}%</p>
                    </div>
                  )}
                  {m.silhouetteScore !== null && m.silhouetteScore !== undefined && (
                    <div style={{ background: 'var(--bg)', padding: '6px 10px', borderRadius: 6 }}>
                      <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>Silhouette</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#8b5cf6' }}>{m.silhouetteScore.toFixed(2)}</p>
                    </div>
                  )}
                  {m.status === 'Training' && (
                    <div style={{ background: 'var(--warning-light)', padding: '6px 10px', borderRadius: 6 }}>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--warning)', fontWeight: 600 }}>⚙ Training in progress...</p>
                    </div>
                  )}
                  {m.status === 'Failed' && (
                    <div style={{ background: 'var(--danger-light)', padding: '6px 10px', borderRadius: 6 }}>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>❌ Training failed</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isSelected && (
                <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Features</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {m.features.map(f => <span key={f} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--accent-light)', color: 'var(--accent)' }}>{f}</span>)}
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Training History (Score)</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={m.trainingHistory.filter(h => h.score !== null)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <YAxis domain={[0.6, 1]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `${(v*100).toFixed(0)}%`} />
                      <Tooltip formatter={(v: any) => [`${(v * 100).toFixed(1)}%`, 'Score']} />
                      <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>Dataset: {m.dataset}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => retrain(m.id)} disabled={!!retraining} className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 7, cursor: retraining ? 'not-allowed' : 'pointer', padding: '6px 12px', fontSize: 12 }}>
                  {isRetraining ? <><Loader size={12} className="animate-spin" />Retraining...</> : <><RefreshCw size={12} />Retrain</>}
                </button>
                <button onClick={() => toast.info('Deploy functionality requires backend integration')} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Play size={12} />Deploy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
