import React, { useState, useRef } from 'react';
import { useTax } from '../context/TaxContext';
import { exportToTxt } from '../utils/reportExporter';
import { 
  Upload, 
  FileText, 
  Download, 
  Bookmark, 
  AlertTriangle, 
  ShieldAlert, 
  Building, 
  Cpu, 
  ListTodo,
  Loader2,
  BookmarkCheck,
  CalendarCheck
} from 'lucide-react';

const AIMonitorView = () => {
  const { 
    regulations, 
    selectedRegulation, 
    setSelectedRegId, 
    bookmarks, 
    toggleBookmark, 
    refreshData,
    loading 
  } = useTax();

  const [activeTab, setActiveTab] = useState('summary');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  // File Drag-and-Drop handoffs
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Upload file to the Express server API
  const uploadFile = async (file) => {
    setUploading(true);
    setUploadProgress(10);
    
    // Simulate loading transitions
    const progInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      clearInterval(progInterval);
      setUploadProgress(100);
      
      setTimeout(async () => {
        setUploading(false);
        if (data.success) {
          await refreshData();
          setSelectedRegId(data.regulation.id);
        } else {
          alert('Upload failed: ' + (data.error || 'Unknown error'));
        }
      }, 500);

    } catch (error) {
      clearInterval(progInterval);
      setUploading(false);
      console.error('File uploading failed:', error);
      alert('Network or server error during upload.');
    }
  };

  const isBookmarked = selectedRegulation ? bookmarks.includes(selectedRegulation.id) : false;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Tax Monitoring Agent</h1>
          <p className="page-subtitle">Autonomous scanning, risk assessment & ERP impact analysis</p>
        </div>
      </div>

      <div className="agent-split-layout">
        {/* Left Side: Regulations List & Uploader */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Uploader Zone */}
          <div 
            className={`upload-zone ${dragActive ? 'dragging' : ''} ${uploading ? 'animate-pulse-glow' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".pdf,.docx,.txt,image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <Loader2 className="animate-spin text-primary" size={32} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>OCR Reading & AI Analyzing...</span>
                <div className="progress-container" style={{ width: '150px' }}>
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <>
                <Upload className="upload-icon" />
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload Circular</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Drag & drop PDF, DOCX, TXT or Scanned Image
                </div>
              </>
            )}
          </div>

          {/* List panel */}
          <div className="list-panel">
            <h3 className="panel-title">Active Notifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {regulations.map(reg => (
                <button
                  key={reg.id}
                  className={`list-item-card ${selectedRegulation?.id === reg.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRegId(reg.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className={`badge ${reg.riskLevel === 'HIGH' ? 'badge-high' : 'badge-medium'}`} style={{ fontSize: '0.65rem' }}>
                      {reg.riskLevel}
                    </span>
                    {bookmarks.includes(reg.id) && <BookmarkCheck size={14} style={{ color: 'var(--color-primary)' }} />}
                  </div>
                  <strong style={{ fontSize: '0.85rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reg.title}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                    {reg.taxType} • {reg.authority.substring(0, 30)}...
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed analysis panel */}
        {selectedRegulation ? (
          <div className="card" style={{ padding: '32px' }}>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
              <div style={{ maxWidth: '80%' }}>
                <span className="badge badge-low" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                  {selectedRegulation.taxType}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.3 }}>{selectedRegulation.title}</h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  <span><strong>Authority:</strong> {selectedRegulation.authority}</span>
                  <span><strong>Published:</strong> {new Date(selectedRegulation.publicationDate).toLocaleDateString()}</span>
                  <span><strong>Effective Date:</strong> <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{new Date(selectedRegulation.effectiveDate).toLocaleDateString()}</span></span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '8px' }}
                  onClick={() => toggleBookmark(selectedRegulation.id)}
                  title="Bookmark Regulation"
                >
                  <Bookmark size={18} style={{ fill: isBookmarked ? 'var(--color-primary)' : 'none', color: isBookmarked ? 'var(--color-primary)' : 'inherit' }} />
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => exportToTxt(selectedRegulation)}
                >
                  <Download size={16} /> <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* Risk indicators section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}>
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Overall Risk</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', color: selectedRegulation.riskLevel === 'HIGH' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                  {selectedRegulation.riskLevel}
                </div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Urgency</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>{selectedRegulation.riskScore.urgency.split(' ')[0]}</div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Exposure</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>{selectedRegulation.riskScore.financialExposure.split(' ')[0]}</div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Penalty Risk</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>{selectedRegulation.riskScore.penaltyRisk.split(' ')[0]}</div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Complexity</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>{selectedRegulation.riskScore.complexity.split(' ')[0]}</div>
              </div>
            </div>

            {/* View Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <button 
                style={{ padding: '10px 20px', borderBottom: activeTab === 'summary' ? '2px solid var(--color-primary)' : 'none', fontWeight: activeTab === 'summary' ? 600 : 400, color: activeTab === 'summary' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                onClick={() => setActiveTab('summary')}
              >
                Executive Summary
              </button>
              <button 
                style={{ padding: '10px 20px', borderBottom: activeTab === 'impact' ? '2px solid var(--color-primary)' : 'none', fontWeight: activeTab === 'impact' ? 600 : 400, color: activeTab === 'impact' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                onClick={() => setActiveTab('impact')}
              >
                Business Impact
              </button>
              <button 
                style={{ padding: '10px 20px', borderBottom: activeTab === 'timeline' ? '2px solid var(--color-primary)' : 'none', fontWeight: activeTab === 'timeline' ? 600 : 400, color: activeTab === 'timeline' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                onClick={() => setActiveTab('timeline')}
              >
                Compliance Timeline
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ minHeight: '280px' }}>
              {activeTab === 'summary' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <FileText size={16} className="text-secondary" />
                      What Changed?
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{selectedRegulation.summary.what}</p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <AlertTriangle size={16} className="text-secondary" />
                      Why it Changed & Who is Affected
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <strong>Purpose:</strong> {selectedRegulation.summary.why}<br />
                      <strong>Affected Scope:</strong> {selectedRegulation.summary.who}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <CalendarCheck size={16} className="text-secondary" />
                      Execution Deadline
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{selectedRegulation.summary.when}</p>
                  </div>
                </div>
              )}

              {activeTab === 'impact' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--border-radius-sm)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--color-primary)' }}>
                        <Building size={16} />
                        Functional Impact
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div><strong>Finance:</strong> {selectedRegulation.impactAnalysis.finance}</div>
                        <div><strong>Tax:</strong> {selectedRegulation.impactAnalysis.tax}</div>
                        <div><strong>Accounting:</strong> {selectedRegulation.impactAnalysis.accounting}</div>
                      </div>
                    </div>

                    <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--border-radius-sm)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--color-primary)' }}>
                        <Cpu size={16} />
                        ERP & SAP Configuration
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {selectedRegulation.impactAnalysis.erpSap}
                      </p>
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--border-radius-sm)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Building size={16} className="text-secondary" />
                      Affected Industries & Operations
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      <strong>Industries:</strong> {selectedRegulation.impactAnalysis.industries}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>Operational Scope:</strong> {selectedRegulation.impactAnalysis.operational}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Timeline steps */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ borderLeft: '3px solid var(--color-danger)', paddingLeft: '12px' }}>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--color-danger)', textTransform: 'uppercase' }}>Immediate Actions</strong>
                      <ul style={{ paddingLeft: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {selectedRegulation.timeline.immediate.map((t, idx) => <li key={idx}>{t}</li>)}
                      </ul>
                    </div>

                    <div style={{ borderLeft: '3px solid var(--color-warning)', paddingLeft: '12px' }}>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--color-warning)', textTransform: 'uppercase' }}>Within 7 Days</strong>
                      <ul style={{ paddingLeft: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {selectedRegulation.timeline.sevenDays.map((t, idx) => <li key={idx}>{t}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '12px' }}>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>Within 30 Days</strong>
                      <ul style={{ paddingLeft: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {selectedRegulation.timeline.thirtyDays.map((t, idx) => <li key={idx}>{t}</li>)}
                      </ul>
                    </div>

                    <div style={{ borderLeft: '3px solid var(--color-success)', paddingLeft: '12px' }}>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--color-success)', textTransform: 'uppercase' }}>Long-Term Governance</strong>
                      <ul style={{ paddingLeft: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {selectedRegulation.timeline.longTerm.map((t, idx) => <li key={idx}>{t}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Recommendations checklist */}
            <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <ListTodo size={18} className="text-secondary" />
                AI Consultant Recommended Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedRegulation.recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      fontSize: '0.85rem',
                      padding: '10px',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--border-radius-sm)'
                    }}
                  >
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifycontent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <FileText size={48} className="text-muted" style={{ marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Please select or upload a tax document to begin AI analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMonitorView;
