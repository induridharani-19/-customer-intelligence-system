import { useState } from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Cpu, Info } from 'lucide-react';
import { toast } from 'sonner';
import { predictCustomer } from '@/services/predictionService';

const SEGMENTS = ['High-Value Customers', 'Loyal Customers', 'Potential Loyalists', 'At-Risk Customers'];
const SEG_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#ef4444'];
const EXAMPLES = [
  { label: 'High-Value', recency: 10, frequency: 4.9, monetary_value: 10.2, total_quantity: 8.1, avg_unit_price: 22.5 },
  { label: 'Loyal', recency: 25, frequency: 3.2, monetary_value: 7.8, total_quantity: 6.5, avg_unit_price: 16.0 },
  { label: 'Occasional', recency: 65, frequency: 0.8, monetary_value: 4.1, total_quantity: 3.2, avg_unit_price: 12.0 },
  { label: 'At-Risk', recency: 120, frequency: 0.5, monetary_value: 3.5, total_quantity: 2.8, avg_unit_price: 9.5 },
];

function heuristicPredict(recency: number, frequency: number, monetary: number, quantity: number, unitPrice: number) {
  const scores = [
    (1 / (1 + recency / 90)) + frequency * 0.12 + monetary * 0.08,
    frequency * 0.28 + monetary * 0.34 + quantity * 0.2,
    monetary * 0.22 + quantity * 0.08 + unitPrice / 250,
    recency * 0.02 + Math.max(0, 2.5 - frequency) + Math.max(0, 5 - monetary) * 0.2,
  ];
  const total = scores.reduce((a, b) => a + b, 0) || 1;
  const probs = scores.map(s => s / total);
  const best = probs.indexOf(Math.max(...probs));
  return { cluster_id: best, cluster_name: SEGMENTS[best], probabilities: probs, model_status: 'heuristic fallback', isSimulated: true };
}

export default function PredictionStudioPage() {
  const [tab, setTab] = useState('Individual');
  const [inputs, setInputs] = useState({ recency: 34, frequency: 2.5, monetary_value: 6.0, total_quantity: 5.0, avg_unit_price: 15.0 });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  const handlePredict = async () => {
    setLoading(true); setResult(null);
    try {
      const prediction = await predictCustomer(inputs);
      setResult({
        ...prediction,
        probabilities: prediction.probabilities.map((entry, index) =>
          Array.isArray(entry) ? entry[entry.length - 1] ?? 0 : prediction.probabilities[index],
        ),
      });
    } catch {
      // predictCustomer has its own offline heuristic, so this is only a
      // final guard for unexpected client-side failures.
      setResult(heuristicPredict(inputs.recency, inputs.frequency, inputs.monetary_value, inputs.total_quantity, inputs.avg_unit_price));
    }
    setLoading(false);
  };

  const handleBatch = async () => {
    if (!batchFile) return;
    setBatchLoading(true); setBatchProgress(0);
    const text = await batchFile.text();
    const lines = text.trim().split('\n').slice(1);
    const mockResults = lines.map((line, i) => {
      const [r, f, m, q, u] = line.split(',').map(Number);
      const pred = heuristicPredict(r || 30, f || 2, m || 5, q || 4, u || 12);
      return { row: i + 1, recency: r, frequency: f, monetary: m, segment: pred.cluster_name, confidence: (Math.max(...pred.probabilities) * 100).toFixed(1), valid: !isNaN(r) };
    });
    for (let p = 0; p <= 100; p += 5) { setBatchProgress(p); await new Promise(r => setTimeout(r, 60)); }
    setBatchResults(mockResults); setBatchLoading(false);
    toast.success(`Batch prediction complete for ${mockResults.length} customers`);
  };

  const downloadBatchCSV = () => {
    const csv = ['Row,Recency,Frequency,Monetary,Predicted Segment,Confidence', ...batchResults.map(r => `${r.row},${r.recency},${r.frequency},${r.monetary},${r.segment},${r.confidence}%`)].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = 'predictions.csv'; a.click();
  };

  const probData = result ? SEGMENTS.map((name, i) => ({ name, prob: result.probabilities[i] || 0, color: SEG_COLORS[i] })) : [];

  const sliderField = (key: keyof typeof inputs, label: string, min: number, max: number, step = 0.1) => (
    <div key={key}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{inputs[key]}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={inputs[key]} onChange={e => setInputs(p => ({ ...p, [key]: +e.target.value }))} style={{ width: '100%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}><span>{min}</span><span>{max}</span></div>
    </div>
  );

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cpu size={22} color="var(--accent)" /> Prediction Studio
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Customer segment prediction • Connects to FastAPI /api/predict • Falls back to heuristic</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' }}>
        {['Individual', 'Batch'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--accent)' : 'var(--text-muted)', borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`, marginBottom: -1 }}>{t} Prediction</button>
        ))}
      </div>

      {tab === 'Individual' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>Customer Features</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>Adjust RFM features to predict customer segment</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {EXAMPLES.map(ex => (
                <button key={ex.label} onClick={() => setInputs(ex)} className="btn btn-secondary btn-sm">{ex.label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sliderField('recency', 'Recency (days since last purchase)', 0, 365, 1)}
              {sliderField('frequency', 'Frequency (orders/month)', 0, 10, 0.1)}
              {sliderField('monetary_value', 'Monetary Value (log scale)', 0, 15, 0.1)}
              {sliderField('total_quantity', 'Total Quantity (units/order)', 0, 15, 0.1)}
              {sliderField('avg_unit_price', 'Avg Unit Price ($)', 0, 100, 0.5)}
            </div>
            <button onClick={handlePredict} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} />Predicting...</> : '🔮 Predict Segment'}
            </button>
          </div>

          <div>
            {!result && !loading && (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <Cpu size={40} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Adjust the sliders and click Predict to see the segment prediction</p>
              </div>
            )}
            {loading && (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Running prediction...</p>
              </div>
            )}
            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ padding: 20, borderTop: `3px solid ${SEG_COLORS[result.cluster_id]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Predicted Segment</p>
                      <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 900, color: SEG_COLORS[result.cluster_id] }}>{result.cluster_name}</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <span className={`badge ${result.isSimulated ? 'badge-warning' : 'badge-success'}`}>{result.model_status}</span>
                      {result.isSimulated && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>* Simulated result</span>}
                    </div>
                  </div>
                  {result.summary && <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: '0 0 10px' }}>{result.summary}</p>}
                  {result.business_action && (
                    <div style={{ background: 'var(--accent-light)', borderRadius: 8, padding: '10px 14px' }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Recommended Action</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{result.business_action}</p>
                    </div>
                  )}
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Probability Distribution</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={probData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} />
                      <Tooltip formatter={(v: any) => [`${(v * 100).toFixed(1)}%`, 'Probability']} />
                      <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
                        {probData.map((p, i) => <Cell key={i} fill={p.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Batch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>Upload Batch CSV</h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 16, padding: '10px 14px', background: 'var(--accent-light)', borderRadius: 8 }}>
              <Info size={14} color="var(--accent)" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--accent)' }}>Required columns: <strong>recency, frequency, monetary_value, total_quantity, avg_unit_price</strong></p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="file" accept=".csv" onChange={e => setBatchFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: 'var(--text-secondary)' }} />
              <button onClick={handleBatch} disabled={!batchFile || batchLoading} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {batchLoading ? <><span className="spinner" style={{ borderTopColor: 'white' }} />Processing...</> : '⚡ Run Batch Prediction'}
              </button>
              {batchResults.length > 0 && <button onClick={downloadBatchCSV} className="btn btn-secondary btn-sm">Download Results CSV</button>}
            </div>
            {batchLoading && (
              <div style={{ marginTop: 16 }}>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--border)' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: 'var(--accent)', width: `${batchProgress}%`, transition: 'width 0.1s' }} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Processing... {batchProgress}%</p>
              </div>
            )}
          </div>

          {batchResults.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Batch Results ({batchResults.length} customers) • Simulated</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                    {['Row', 'Recency', 'Frequency', 'Monetary', 'Predicted Segment', 'Confidence', 'Valid'].map(h => (
                      <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {batchResults.slice(0, 20).map(r => (
                      <tr key={r.row} className="table-row" style={{ borderBottom: '1px solid var(--border)', background: !r.valid ? 'var(--danger-light)' : undefined }}>
                        <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-muted)' }}>#{r.row}</td>
                        <td style={{ padding: '8px 14px', fontSize: 12 }}>{r.recency}</td>
                        <td style={{ padding: '8px 14px', fontSize: 12 }}>{r.frequency}</td>
                        <td style={{ padding: '8px 14px', fontSize: 12 }}>{r.monetary}</td>
                        <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: SEG_COLORS[SEGMENTS.indexOf(r.segment)] || 'var(--text-primary)' }}>{r.segment}</td>
                        <td style={{ padding: '8px 14px', fontSize: 12 }}>{r.confidence}%</td>
                        <td style={{ padding: '8px 14px' }}><span className={`badge ${r.valid ? 'badge-success' : 'badge-danger'}`}>{r.valid ? '✓' : '✗'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
