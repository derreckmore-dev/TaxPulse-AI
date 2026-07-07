import React, { useState } from 'react';
import { useTax } from '../context/TaxContext';
import { exportToCSV } from '../utils/reportExporter';
import { 
  CheckSquare, 
  Clock, 
  User, 
  Calendar, 
  FileSpreadsheet, 
  History, 
  CheckCircle2, 
  HelpCircle,
  FileText
} from 'lucide-react';

const WorkflowView = () => {
  const { workflowTasks, updateTaskStatus } = useTax();
  const [filter, setFilter] = useState('All');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [auditNote, setAuditNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');

  // Filtering tasks
  const filteredTasks = workflowTasks.filter(task => {
    if (filter === 'All') return true;
    return task.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />;
      case 'In Progress': return <Clock size={16} style={{ color: 'var(--color-warning)' }} />;
      default: return <CheckSquare size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'var(--color-success)';
      case 'In Progress': return 'var(--color-warning)';
      default: return 'var(--text-secondary)';
    }
  };

  const handleStatusChangeTrigger = (taskId, newStatus) => {
    setSelectedTaskId(taskId);
    setTargetStatus(newStatus);
    setAuditNote('');
    setShowStatusModal(true);
  };

  const submitStatusChange = () => {
    if (!selectedTaskId || !targetStatus) return;
    updateTaskStatus(selectedTaskId, targetStatus, auditNote);
    setShowStatusModal(false);
    setSelectedTaskId(null);
  };

  const selectedTask = workflowTasks.find(t => t.id === selectedTaskId);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Workflow Manager</h1>
          <p className="page-subtitle">Department audit task tracks & historical audit trails</p>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={() => exportToCSV(workflowTasks)}
          style={{ display: 'flex', gap: '8px' }}
        >
          <FileSpreadsheet size={16} />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter tab bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
          <button 
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            onClick={() => setFilter(f)}
          >
            {f} Tasks
          </button>
        ))}
      </div>

      {/* Main split view: Task list (left) & Audit Trail log (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        
        {/* Left Side: Tasks list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTasks.map(task => (
            <div 
              key={task.id}
              className="card"
              style={{
                padding: '20px',
                borderLeft: `4px solid ${task.status === 'Completed' ? 'var(--color-success)' : task.status === 'In Progress' ? 'var(--color-warning)' : 'var(--text-muted)'}`,
                cursor: 'pointer'
              }}
              onClick={() => setSelectedTaskId(task.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className="badge badge-low" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                  {task.department}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> Due: {task.dueDate}
                  </span>
                  
                  {/* Status Dropdown */}
                  <select 
                    style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    value={task.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChangeTrigger(task.id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {getStatusIcon(task.status)}
                {task.task}
              </h4>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--bg-primary)' }}>
                <span>Ref: {task.regulationTitle.substring(0, 45)}...</span>
                <span>Updated by: {task.updatedBy}</span>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No tasks found matching filter "{filter}".
            </div>
          )}
        </div>

        {/* Right Side: Audit Trail History Panel */}
        <div className="card" style={{ height: 'max-content', position: 'sticky', top: '90px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <History size={18} className="text-secondary" />
            Compliance Audit Trail Log
          </h3>

          {selectedTask ? (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {selectedTask.task}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Task Status: <strong style={{ color: getStatusColor(selectedTask.status) }}>{selectedTask.status}</strong>
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 700 }}>
                  Audit History Logs
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* System instantiation log */}
                  <div style={{ fontSize: '0.75rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '12px', position: 'relative' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', position: 'absolute', left: '-5px', top: '4px' }} />
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Task Registered by System</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(selectedTask.updatedAt).toLocaleString()} • User: System
                    </div>
                  </div>

                  {/* Updates logs */}
                  {selectedTask.history.map((h, index) => (
                    <div key={index} style={{ fontSize: '0.75rem', borderLeft: '2px solid var(--color-primary)', paddingLeft: '12px', position: 'relative' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', position: 'absolute', left: '-5px', top: '4px' }} />
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        Status changed to {h.newStatus}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                        "{h.notes}"
                      </p>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {new Date(h.updatedAt).toLocaleString()} • Officer: {h.updatedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '30px 0' }}>
              Select a task card on the left to review its compliance audit trail.
            </div>
          )}
        </div>
      </div>

      {/* Status note popup Modal */}
      {showStatusModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '400px', padding: '24px', zIndex: 1010 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Log Status Audit Details</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Update task status to <strong>{targetStatus}</strong>. Please record your verification notes for the audit logs.
            </p>
            
            <div className="form-group">
              <label className="form-label">Verification Note / Audit Evidence</label>
              <textarea 
                className="form-control" 
                rows="3" 
                style={{ resize: 'none', fontFamily: 'inherit' }}
                placeholder="E.g., Configured FTXP mappings, verified sandbox inputs, or completed employee seminar."
                value={auditNote}
                onChange={(e) => setAuditNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submitStatusChange}>
                Submit Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowView;
