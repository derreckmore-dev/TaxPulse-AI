import React from 'react';
import { useTax } from '../context/TaxContext';
import { Calendar, AlertCircle, Clock, CalendarDays, CheckCircle } from 'lucide-react';

const CalendarView = () => {
  const { workflowTasks } = useTax();

  // Group tasks by their deadline categories
  const immediate = workflowTasks.filter(t => t.dueDate.toLowerCase() === 'immediate');
  const sevenDays = workflowTasks.filter(t => t.dueDate.toLowerCase() === '7 days');
  const thirtyDays = workflowTasks.filter(t => t.dueDate.toLowerCase() === '30 days');
  const longTerm = workflowTasks.filter(t => t.dueDate.toLowerCase() === 'long-term' || t.dueDate.toLowerCase() === 'long term');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'var(--color-success)';
      case 'In Progress': return 'var(--color-warning)';
      default: return 'var(--text-secondary)';
    }
  };

  const renderTaskCard = (task) => (
    <div 
      key={task.id}
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-sm)',
        padding: '12px',
        backgroundColor: 'var(--bg-card)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="badge" style={{ fontSize: '0.6rem', padding: '2px 6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
          {task.department}
        </span>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: getStatusColor(task.status) }}>
          {task.status}
        </span>
      </div>
      <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
        {task.task}
      </strong>
      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        Ref: {task.regulationTitle}
      </span>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Roadmap Calendar</h1>
          <p className="page-subtitle">Schedule grid and operational milestones tracker</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {/* Immediate Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#FEF2F2', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px dashed #FCA5A5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #FECACA', paddingBottom: '10px' }}>
            <AlertCircle size={18} style={{ color: 'var(--color-danger)' }} />
            <h3 style={{ fontSize: '0.9rem', color: '#991B1B', fontWeight: 700 }}>Immediate Actions</h3>
            <span style={{ marginLeft: 'auto', backgroundColor: '#F87171', color: '#FFFFFF', borderRadius: '12px', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 700 }}>
              {immediate.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
            {immediate.map(renderTaskCard)}
            {immediate.length === 0 && (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#991B1B', opacity: 0.6, padding: '20px 0' }}>
                No immediate tasks pending.
              </div>
            )}
          </div>
        </div>

        {/* 7 Days Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#FFFBEB', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px dashed #FDE68A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #FDE047', paddingBottom: '10px' }}>
            <Clock size={18} style={{ color: 'var(--color-warning)' }} />
            <h3 style={{ fontSize: '0.9rem', color: '#92400E', fontWeight: 700 }}>Within 7 Days</h3>
            <span style={{ marginLeft: 'auto', backgroundColor: '#F59E0B', color: '#FFFFFF', borderRadius: '12px', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 700 }}>
              {sevenDays.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
            {sevenDays.map(renderTaskCard)}
            {sevenDays.length === 0 && (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#92400E', opacity: 0.6, padding: '20px 0' }}>
                No tasks due this week.
              </div>
            )}
          </div>
        </div>

        {/* 30 Days Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#EFF6FF', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px dashed #BFDBFE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #93C5FD', paddingBottom: '10px' }}>
            <CalendarDays size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '0.9rem', color: '#1E40AF', fontWeight: 700 }}>Within 30 Days</h3>
            <span style={{ marginLeft: 'auto', backgroundColor: '#3B82F6', color: '#FFFFFF', borderRadius: '12px', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 700 }}>
              {thirtyDays.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
            {thirtyDays.map(renderTaskCard)}
            {thirtyDays.length === 0 && (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#1E40AF', opacity: 0.6, padding: '20px 0' }}>
                No tasks due this month.
              </div>
            )}
          </div>
        </div>

        {/* Long Term Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ECFDF5', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px dashed #A7F3D0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #6EE7B7', paddingBottom: '10px' }}>
            <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
            <h3 style={{ fontSize: '0.9rem', color: '#065F46', fontWeight: 700 }}>Long-Term</h3>
            <span style={{ marginLeft: 'auto', backgroundColor: '#10B981', color: '#FFFFFF', borderRadius: '12px', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 700 }}>
              {longTerm.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
            {longTerm.map(renderTaskCard)}
            {longTerm.length === 0 && (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#065F46', opacity: 0.6, padding: '20px 0' }}>
                No long-term governance tasks.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
