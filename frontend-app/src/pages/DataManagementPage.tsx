import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, X, Database, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface DatasetRecord { name: string; date: string; rows: number; type: string; status: string; quality: string; }

const history: DatasetRecord[] = [
  { name: 'retail_transactions_nov2024.csv', date: '2024-11-28', rows: 45231, type: 'CSV', status: 'Processed', quality: 'Good' },
  { name: 'customer_feedback_oct2024.xlsx', date: '2024-10-30', rows: 1247, type: 'Excel', status: 'Processed', quality: 'Fair' },
  { name: 'q3_transactions_2024.csv', date: '2024-09-30', rows: 41890, type: 'CSV', status: 'Processed', quality: 'Good' },
  { name: 'customer_list_2024.csv', date: '2024-09-15', rows: 11684, type: 'CSV', status: 'Error', quality: '—' },
  { name: 'q2_orders_2024.xlsx', date: '2024-06-30', rows: 38765, type: 'Excel', status: 'Processed', quality: 'Good' },
];

const COLUMN_MAPPINGS = ['Customer ID', 'Order ID', 'Purchase Date', 'Quantity', 'Unit Price', 'Revenue', 'Product Category', 'Customer Feedback'];

export default function DataManagementPage() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [step, setStep] = useState(0); // 0=upload, 1=preview, 2=map, 3=done
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (!f.name.match(/\.(csv|xlsx?)$/i)) { toast.error('Only CSV and Excel files supported'); return; }
    setFile(f); setName(f.name); setUploading(true); setProgress(0);
    for (let i = 0; i <= 100; i += 10) { await new Promise(r => setTimeout(r, 80)); setProgress(i); }
    const text = await f.text();
    const lines = text.trim().split('\n').slice(0, 6);
    const h = lines[0].split(',').map(c => c.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim().replace(/"/g, '')));
    setHeaders(h); setPreview(rows); setUploading(false); setStep(1);
    toast.success('File uploaded and parsed successfully!');
  };

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };

  const inputStyle = { padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={22} color="var(--accent)" /> Data Management
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Import, validate, and manage your customer datasets</p>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 0 }}>
        {['Upload', 'Preview', 'Map Columns', 'Done'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= step ? 'var(--accent)' : 'var(--border)', color: i <= step ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
              <span style={{ fontSize: 11, color: i <= step ? 'var(--accent)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < 3 && <div style={{ height: 2, width: 60, background: i < step ? 'var(--accent)' : 'var(--border)', margin: '0 8px', marginBottom: 18 }} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>Upload Dataset</h3>
          <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'var(--accent-light)' : 'var(--bg)', transition: 'all 0.15s' }}>
            <Upload size={40} color={dragOver ? 'var(--accent)' : 'var(--text-muted)'} style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>Drop your file here or click to browse</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Supports CSV and Excel files • Max 100MB</p>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
          {uploading && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Uploading {file?.name}...</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{progress}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: 'var(--border)' }}>
                <div style={{ height: '100%', borderRadius: 99, background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.1s' }} />
              </div>
            </div>
          )}
        </div>
      )}

      {step === 1 && preview.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Data Preview — {file?.name}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(0)} className="btn btn-ghost btn-sm"><X size={14} /></button>
              <button onClick={() => setStep(2)} className="btn btn-primary btn-sm">Next: Map Columns →</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Columns', value: headers.length, color: '#6366f1' },
              { label: 'Preview Rows', value: preview.length, color: '#10b981' },
              { label: 'Est. Total Rows', value: '~45,000', color: '#8b5cf6' },
              { label: 'Missing Values', value: '< 2%', color: '#f59e0b' },
            ].map(c => (
              <div key={c.label} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, borderLeft: `3px solid ${c.color}` }}>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{c.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{c.value}</p>
              </div>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  {headers.map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {row.map((cell, j) => <td key={j} style={{ padding: '7px 12px', color: 'var(--text-secondary)' }}>{cell || <span style={{ color: 'var(--danger)', fontSize: 11 }}>NULL</span>}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Column Mapping</h3>
            <button onClick={() => { toast.success('Dataset saved successfully!'); setStep(3); }} className="btn btn-primary btn-sm">Save Dataset</button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>Map your dataset columns to the system's expected fields</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {COLUMN_MAPPINGS.map(field => (
              <div key={field} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', minWidth: 140 }}>{field}</label>
                <select value={mappings[field] || ''} onChange={e => setMappings(m => ({ ...m, [field]: e.target.value }))} style={{ ...inputStyle, flex: 1 }}>
                  <option value="">— Not mapped —</option>
                  {headers.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>Dataset Ready!</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Your dataset has been processed. You can now run segmentation and predictions.</p>
          <button onClick={() => setStep(0)} className="btn btn-primary" style={{ marginTop: 20 }}>Upload Another Dataset</button>
        </div>
      )}

      {/* Dataset History */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Dataset History</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {['Dataset Name', 'Upload Date', 'Records', 'Type', 'Status', 'Quality'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map(d => (
              <tr key={d.name} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={14} color="var(--accent)" />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{d.name}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)' }}>{d.date}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{d.rows.toLocaleString()}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{d.type}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span className={`badge ${d.status === 'Processed' ? 'badge-success' : 'badge-danger'}`}>{d.status}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span className={`badge ${d.quality === 'Good' ? 'badge-success' : d.quality === 'Fair' ? 'badge-warning' : 'badge-neutral'}`}>{d.quality}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
