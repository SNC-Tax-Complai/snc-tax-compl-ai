import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplianceStore } from '../../stores/complianceStore';
import toast from 'react-hot-toast';
import './Compliance.css';

const PROVENANCE = {
  document:     { icon: '📄', label: 'Document',     cls: 'prov-document' },
  api:          { icon: '🌐', label: 'API',           cls: 'prov-api' },
  manual:       { icon: '✏️', label: 'Manual',        cls: 'prov-manual' },
  non_compliant:{ icon: '⚠️', label: 'Non-Compliant', cls: 'prov-noncompliant' },
};

function ProvenanceBadge({ dataSource }) {
  const p = PROVENANCE[dataSource] || PROVENANCE.non_compliant;
  return <span className={`prov-badge ${p.cls}`}>{p.icon} {p.label}</span>;
}

export default function ModulePage({ moduleId, moduleConfig }) {
  const navigate = useNavigate();
  const { moduleData, loading, fetchModuleData, updateComplianceStatus, clearModuleData } = useComplianceStore();
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchModuleData(moduleId);
    return () => clearModuleData();
  }, [moduleId]);

  const handleStatusChange = async (statusId, newStatus) => {
    try {
      await updateComplianceStatus(statusId, { status: newStatus });
      toast.success('Status updated successfully');
      fetchModuleData(moduleId);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      const res = await fetch('/api/compliance/resolve-all', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        const { document: docs, api, non_compliant: nc } = data.summary;
        toast.success(`Resolved: ${docs} from documents, ${api} from API, ${nc} non-compliant`);
        fetchModuleData(moduleId);
      } else {
        toast.error('Resolution failed');
      }
    } catch {
      toast.error('Failed to run resolution');
    } finally {
      setResolving(false);
    }
  };

  const filteredRequirements = moduleData?.requirements?.filter((req) => {
    if (statusFilter === 'all') return true;
    return req.status === statusFilter;
  }) || [];

  if (loading && !moduleData) {
    return <div className="module-loading">Loading {moduleConfig.name}...</div>;
  }

  return (
    <div className="module-page">
      <div className="module-header">
        <button className="back-button" onClick={() => navigate('/compliance')}>
          &#8249; Back
        </button>
        <div className="module-title">
          <h1>{moduleConfig.name}</h1>
          <p>{moduleConfig.description}</p>
        </div>
        <button className="resolve-btn" onClick={handleResolve} disabled={resolving} title="Re-scan documents and APIs to update data sources">
          {resolving ? '⏳ Resolving…' : '🔄 Resolve Sources'}
        </button>
      </div>

      {/* Module Summary */}
      <div className="module-summary">
        <div className="summary-stat">
          <span className="stat-value">{moduleData?.summary?.total || 0}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="summary-stat completed">
          <span className="stat-value">{moduleData?.summary?.completed || 0}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="summary-stat pending">
          <span className="stat-value">{moduleData?.summary?.pending || 0}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="summary-stat overdue">
          <span className="stat-value">{moduleData?.summary?.overdue || 0}</span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <button
          className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${statusFilter === 'overdue' ? 'active' : ''}`}
          onClick={() => setStatusFilter('overdue')}
        >
          Overdue
        </button>
        <button
          className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('completed')}
        >
          Completed
        </button>
      </div>

      {/* Requirements List */}
      <div className="requirements-list">
        {filteredRequirements.length === 0 ? (
          <div className="empty-state">
            <p>No compliance requirements found for this filter.</p>
          </div>
        ) : (
          filteredRequirements.map((req) => (
            <div
              key={req.id}
              className={`requirement-card ${req.status || 'pending'}`}
              onClick={() => setSelectedRequirement(req)}
            >
              <div className="req-header">
                <span className={`status-badge ${req.status || 'pending'}`}>
                  {(req.status || 'pending').replace('_', ' ')}
                </span>
                <ProvenanceBadge dataSource={req.data_source} />
                {req.regulation_code && (
                  <span className="regulation-code">{req.regulation_code}</span>
                )}
              </div>
              <h3 className="req-name">{req.name}</h3>
              {req.description && (
                <p className="req-description">{req.description}</p>
              )}
              <div className="req-footer">
                {req.due_date && (
                  <span className="due-date">
                    Due: {new Date(req.due_date).toLocaleDateString('en-ZA')}
                  </span>
                )}
                {req.frequency && (
                  <span className="frequency">{req.frequency}</span>
                )}
                {req.penalty_amount > 0 && (
                  <span className="penalty">
                    Penalty: R{Number(req.penalty_amount).toLocaleString()}
                  </span>
                )}
              </div>
              {req.status_id && req.status !== 'completed' && (
                <div className="req-actions">
                  <button
                    className="action-btn complete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(req.status_id, 'completed');
                    }}
                  >
                    Mark Complete
                  </button>
                  {req.status !== 'in_progress' && (
                    <button
                      className="action-btn progress"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(req.status_id, 'in_progress');
                      }}
                    >
                      In Progress
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Requirement Detail Modal */}
      {selectedRequirement && (
        <div className="modal-overlay" onClick={() => setSelectedRequirement(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedRequirement(null)}>
              &times;
            </button>
            <h2>{selectedRequirement.name}</h2>
            <p className="modal-description">{selectedRequirement.description}</p>
            <div className="modal-details">
              <div className="detail-row">
                <span>Regulation Code:</span>
                <strong>{selectedRequirement.regulation_code || 'N/A'}</strong>
              </div>
              <div className="detail-row">
                <span>Type:</span>
                <strong>{selectedRequirement.compliance_type || 'N/A'}</strong>
              </div>
              <div className="detail-row">
                <span>Frequency:</span>
                <strong>{selectedRequirement.frequency || 'N/A'}</strong>
              </div>
              <div className="detail-row">
                <span>Due Date:</span>
                <strong>
                  {selectedRequirement.due_date
                    ? new Date(selectedRequirement.due_date).toLocaleDateString('en-ZA')
                    : 'Not set'}
                </strong>
              </div>
              <div className="detail-row">
                <span>Penalty:</span>
                <strong>
                  {selectedRequirement.penalty_amount > 0
                    ? `R${Number(selectedRequirement.penalty_amount).toLocaleString()}`
                    : 'None specified'}
                </strong>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <strong className={`status-text ${selectedRequirement.status || 'pending'}`}>
                  {(selectedRequirement.status || 'pending').replace('_', ' ')}
                </strong>
              </div>
              <div className="detail-row">
                <span>Data Source:</span>
                <ProvenanceBadge dataSource={selectedRequirement.data_source} />
              </div>
            </div>
            {selectedRequirement.notes && (
              <div className="modal-notes">
                <h4>Notes</h4>
                <p>{selectedRequirement.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
