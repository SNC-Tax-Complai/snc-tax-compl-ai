import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import './Vault.css';

const API = '/api/documents';
const getToken = () => localStorage.getItem('token');

const CATEGORIES = [
  { value: '', label: 'All Documents' },
  { value: 'certificate', label: 'Certificates' },
  { value: 'filing', label: 'Filings' },
  { value: 'report', label: 'Reports' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'evidence', label: 'Evidence' },
  { value: 'contract', label: 'Contracts' },
  { value: 'other', label: 'Other' },
];

const MIME_ICONS = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/gif': '🖼️',
};

const STATUS_LABEL = {
  pending: { text: 'Pending', cls: 'status-pending' },
  processing: { text: 'Extracting…', cls: 'status-processing' },
  done: { text: 'Extracted', cls: 'status-done' },
  image_ready: { text: 'Image', cls: 'status-image' },
  unsupported: { text: 'No Extract', cls: 'status-unsupported' },
  failed: { text: 'Failed', cls: 'status-failed' },
};

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VaultPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [analysisDoc, setAnalysisDoc] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const url = category ? `${API}?category=${category}` : API;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  async function handleDownload(doc) {
    try {
      const res = await fetch(`${API}/${doc.id}/download`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`${API}/${deleteId}`, {
        method: 'DELETE',
        headers: authHeader,
      });
      if (!res.ok) throw new Error();
      toast.success('Document deleted');
      setDeleteId(null);
      fetchDocs();
    } catch {
      toast.error('Delete failed');
    }
  }

  async function handleAnalyze(doc) {
    setAnalysisDoc({ ...doc, loading: true, result: null });
    try {
      const res = await fetch(`${API}/${doc.id}/analyze`, {
        method: 'POST',
        headers: authHeader,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAnalysisDoc({ ...doc, loading: false, result: data.analysis });
        fetchDocs();
      } else {
        setAnalysisDoc({ ...doc, loading: false, error: data.message || 'Analysis failed' });
      }
    } catch {
      setAnalysisDoc((prev) => ({ ...prev, loading: false, error: 'Network error' }));
    }
  }

  return (
    <div className="vault-container">
      <div className="vault-header">
        <div>
          <h1>Document Vault</h1>
          <p>Securely store and manage compliance documents</p>
        </div>
        <button className="upload-btn" onClick={() => setShowUpload(true)}>
          + Upload Document
        </button>
      </div>

      <div className="vault-categories">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`category-tab${category === c.value ? ' active' : ''}`}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="vault-loading">Loading documents…</div>
      ) : documents.length === 0 ? (
        <div className="vault-empty">
          <div className="empty-icon">📁</div>
          <h3>No documents yet</h3>
          <p>Upload compliance documents to securely store and organize them.</p>
          <p className="hint">Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 50 MB)</p>
          <button className="upload-btn" style={{ marginTop: 16 }} onClick={() => setShowUpload(true)}>
            Upload Your First Document
          </button>
        </div>
      ) : (
        <div className="vault-list">
          {documents.map((doc) => {
            const icon = MIME_ICONS[doc.mime_type] || '📎';
            const st = STATUS_LABEL[doc.extraction_status] || STATUS_LABEL.pending;
            return (
              <div key={doc.id} className="doc-row">
                <span className="doc-row-icon">{icon}</span>
                <div className="doc-row-info">
                  <span className="doc-row-name" title={doc.original_name}>{doc.original_name}</span>
                  <span className="doc-row-meta">
                    {doc.category} &middot; {formatSize(doc.file_size)} &middot;{' '}
                    {new Date(doc.created_at).toLocaleDateString('en-ZA')}
                    {doc.uploaded_by_name ? ` · ${doc.uploaded_by_name}` : ''}
                  </span>
                  {doc.ai_analysis?.summary && (
                    <span className="doc-row-summary">{doc.ai_analysis.summary}</span>
                  )}
                </div>
                <span className={`extraction-status ${st.cls}`}>{st.text}</span>
                <div className="doc-row-actions">
                  <button className="doc-btn" onClick={() => handleAnalyze(doc)} title="Run AI analysis">
                    🔍 Analyse
                  </button>
                  <button className="doc-btn" onClick={() => handleDownload(doc)} title="Download">
                    ⬇ Download
                  </button>
                  <button className="doc-btn doc-btn-delete" onClick={() => setDeleteId(doc.id)} title="Delete">
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); fetchDocs(); }}
        />
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box confirm-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Document</h3>
            <p>Are you sure you want to delete this document? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {analysisDoc && (
        <AnalysisModal
          doc={analysisDoc}
          onClose={() => setAnalysisDoc(null)}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('evidence');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  function onDrop(e) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', category);
      fd.append('description', description);

      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      toast.success('Document uploaded — extraction in progress');
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Upload Document</h3>
        <form onSubmit={handleSubmit}>
          <div
            className={`drop-zone${drag ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            {file ? (
              <div className="drop-file-name">
                <span>{MIME_ICONS[file.type] || '📎'}</span>
                <strong>{file.name}</strong>
                <span>{formatSize(file.size)}</span>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 32 }}>📂</div>
                <p>Drag & drop a file here, or click to browse</p>
                <span className="drop-hint">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG — max 50 MB</span>
              </>
            )}
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.filter((c) => c.value).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description <span style={{ color: '#9ca3af' }}>(optional)</span></label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. CIPC annual return 2025"
              maxLength={255}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="upload-btn" disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AnalysisModal({ doc, onClose }) {
  const { result, error, loading } = doc;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box analysis-box" onClick={(e) => e.stopPropagation()}>
        <h3>AI Analysis — {doc.original_name}</h3>
        {loading && <div className="analysis-loading">Analysing document… this may take up to 30 seconds.</div>}
        {error && <div className="analysis-error">{error}</div>}
        {result && (
          <div className="analysis-results">
            <div className="analysis-row">
              <span className="analysis-label">Document Type</span>
              <span>{result.documentType || '—'}</span>
            </div>
            <div className="analysis-row">
              <span className="analysis-label">Risk Level</span>
              <span className={`risk-badge risk-${result.riskLevel}`}>{result.riskLevel}</span>
            </div>
            {result.companyName && (
              <div className="analysis-row">
                <span className="analysis-label">Company Name</span>
                <span>{result.companyName}</span>
              </div>
            )}
            {result.taxRefNumber && (
              <div className="analysis-row">
                <span className="analysis-label">Tax Reference</span>
                <span className="mono">{result.taxRefNumber}</span>
              </div>
            )}
            {result.relevantModules?.length > 0 && (
              <div className="analysis-row">
                <span className="analysis-label">Compliance Modules</span>
                <span>{result.relevantModules.join(', ')}</span>
              </div>
            )}
            {result.extractedDates?.length > 0 && (
              <div className="analysis-row">
                <span className="analysis-label">Dates Found</span>
                <span>{result.extractedDates.join(', ')}</span>
              </div>
            )}
            {result.extractedAmounts?.length > 0 && (
              <div className="analysis-row">
                <span className="analysis-label">Amounts Found</span>
                <span>{result.extractedAmounts.join(', ')}</span>
              </div>
            )}
            {result.summary && (
              <div className="analysis-summary">{result.summary}</div>
            )}
            {result.recommendations?.length > 0 && (
              <div className="analysis-recs">
                <strong>Recommendations</strong>
                <ul>
                  {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
