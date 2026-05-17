import { useState } from 'react';
import './Vault.css';

export default function VaultPage() {
  const [documents] = useState([]);

  return (
    <div className="vault-container">
      <div className="vault-header">
        <h1>Document Vault</h1>
        <p>Securely store and manage compliance documents</p>
        <button className="upload-btn">Upload Document</button>
      </div>

      <div className="vault-categories">
        <button className="category-tab active">All Documents</button>
        <button className="category-tab">Certificates</button>
        <button className="category-tab">Filings</button>
        <button className="category-tab">Reports</button>
        <button className="category-tab">Correspondence</button>
      </div>

      {documents.length === 0 ? (
        <div className="vault-empty">
          <div className="empty-icon">&#128193;</div>
          <h3>No documents yet</h3>
          <p>Upload compliance documents to securely store and organize them.</p>
          <p className="hint">Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 50MB)</p>
        </div>
      ) : (
        <div className="vault-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="doc-icon">&#128196;</div>
              <div className="doc-info">
                <h4>{doc.original_name}</h4>
                <p>{doc.category} - {new Date(doc.created_at).toLocaleDateString('en-ZA')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
