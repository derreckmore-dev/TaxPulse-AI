import React from 'react';
import { useTax } from '../context/TaxContext';
import { 
  ShieldAlert, 
  FileText, 
  Clock, 
  CheckSquare, 
  AlertTriangle, 
  Bookmark, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const DashboardView = ({ setActiveView }) => {
  const { 
    regulations, 
    workflowTasks, 
    setSelectedRegId,
    setTaxTypeFilter,
    setRiskFilter
  } = useTax();

  // Computations
  const totalRegs = regulations.length;
  const highRiskRegs = regulations.filter(r => r.riskLevel === 'HIGH').length;
  
  const pendingTasks = workflowTasks.filter(t => t.status === 'Pending');
  const completedTasks = workflowTasks.filter(t => t.status === 'Completed');
  const totalTasksCount = workflowTasks.length;
  const complianceScore = totalTasksCount > 0 
    ? Math.round((completedTasks.length / totalTasksCount) * 100) 
    : 100;

  // Next upcoming actions (due date matches Immediate or 7 Days)
  const urgentActions = workflowTasks
    .filter(t => t.status !== 'Completed')
    .slice(0, 3);

  // Critical alerts list based on High Risk regulations
  const highRiskUpdates = regulations.filter(r => r.riskLevel === 'HIGH').slice(0, 2);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Compliance Console</h1>
          <p className="page-subtitle">AI-powered regulatory dashboard & audit coordination hub</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setActiveView('compare')}>
            Compare Circulars
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('agent')}>
            + Upload Document
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="card-grid">
        {/* Compliance Score Widget */}
        <div className="card metric-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div>
            <span className="metric-title">Compliance Index</span>
            <div className="metric-value">{complianceScore}%</div>
            <div className="metric-change" style={{ color: 'var(--color-success)' }}>
              <TrendingUp size={14} />
              <span>+{completedTasks.length} Mandates Audited</span>
            </div>
          </div>
          {/* Circular progress meter */}
          <div style={{ position: 'relative', width: '70px', height: '70px' }}>
            <svg width="70" height="70" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--color-success)"
                strokeDasharray={`${complianceScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              Score
            </div>
          </div>
        </div>

        {/* Total Monitored */}
        <div className="card metric-card">
          <div>
            <span className="metric-title">Active Regulations</span>
            <div className="metric-value">{totalRegs}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Across CBIC, Income Tax
            </div>
          </div>
          <div className="metric-icon">
            <FileText size={22} />
          </div>
        </div>

        {/* High Risk Alerts */}
        <div className="card metric-card">
          <div>
            <span className="metric-title">High Risk Updates</span>
            <div className="metric-value" style={{ color: highRiskRegs > 0 ? 'var(--color-danger)' : 'inherit' }}>
              {highRiskRegs}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Require immediate ERP changes
            </div>
          </div>
          <div className={`metric-icon ${highRiskRegs > 0 ? 'danger' : ''}`}>
            <ShieldAlert size={22} />
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="card metric-card">
          <div>
            <span className="metric-title">Pending Action Items</span>
            <div className="metric-value">{pendingTasks.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Assigned to IT, Tax, Finance
            </div>
          </div>
          <div className="metric-icon warning">
            <CheckSquare size={22} />
          </div>
        </div>
      </div>

      {/* Main Dashboard Panel Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Side: Latest Regulations Feed */}
        <div>
          <div className="card" style={{ minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Monitored Tax Regulations</h3>
              <button 
                style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setActiveView('agent')}
              >
                Open AI Monitoring Agent <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {regulations.map(reg => (
                <div 
                  key={reg.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '18px',
                    transition: 'var(--transition-fast)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedRegId(reg.id);
                    setActiveView('agent');
                  }}
                  className="stagger-item"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className={`badge ${reg.riskLevel === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                      {reg.riskLevel} Risk
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Effective: {new Date(reg.effectiveDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {reg.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {reg.summary.what}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>{reg.authority}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{reg.taxType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Alerts & Deadlines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Smart Alerts Box */}
          <div className="card" style={{ borderColor: highRiskRegs > 0 ? 'var(--color-danger)' : 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertTriangle size={18} style={{ color: highRiskRegs > 0 ? 'var(--color-danger)' : 'var(--color-warning)' }} />
              Smart Alerts Center
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {highRiskUpdates.map(u => (
                <div 
                  key={u.id}
                  style={{
                    backgroundColor: 'var(--color-danger-light)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '12px',
                    fontSize: '0.8rem'
                  }}
                >
                  <strong style={{ color: 'var(--color-danger)', display: 'block', marginBottom: '4px' }}>
                    Critical Compliance Exposure
                  </strong>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {u.title} is effective shortly. SAP configurations must map turnover limits immediately to avoid client credit blockages.
                  </span>
                </div>
              ))}

              {workflowTasks.some(t => t.dueDate === 'Immediate' && t.status === 'Pending') && (
                <div 
                  style={{
                    backgroundColor: 'var(--color-warning-light)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '12px',
                    fontSize: '0.8rem'
                  }}
                >
                  <strong style={{ color: 'var(--color-warning)', display: 'block', marginBottom: '4px' }}>
                    Urgent Actions Pending
                  </strong>
                  <span style={{ color: 'var(--text-primary)' }}>
                    You have immediate action items waiting in the compliance workflow dashboard.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Effective Dates / Calendar teaser */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Clock size={18} className="text-secondary" />
              Immediate Roadmap
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {urgentActions.map(action => (
                <div 
                  key={action.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    paddingBottom: '10px',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="text-truncate">
                      {action.task}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {action.department} • Due: {action.dueDate}
                    </span>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                    onClick={() => setActiveView('workflow')}
                  >
                    Action
                  </button>
                </div>
              ))}
              
              {urgentActions.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0', fontSize: '0.8rem' }}>
                  All urgent actions completed!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
