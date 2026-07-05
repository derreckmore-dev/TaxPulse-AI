import React, { useState, useEffect } from 'react';
import { useTax } from '../context/TaxContext';
import { GitCompare, AlertCircle, Plus, Minus, RefreshCw, FileText } from 'lucide-react';

const CompareView = () => {
  const { regulations } = useTax();
  
  // Set default comparative selections if enough regulations exist
  const [doc1Id, setDoc1Id] = useState('');
  const [doc2Id, setDoc2Id] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (regulations.length >= 2) {
      setDoc1Id(regulations[0].id);
      setDoc2Id(regulations[1].id);
    } else if (regulations.length === 1) {
      setDoc1Id(regulations[0].id);
    }
  }, [regulations]);

  const handleCompare = async () => {
    if (!doc1Id || !doc2Id) {
      alert('Please select two regulations to compare.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id1: doc1Id, id2: doc2Id })
      });
      const data = await res.json();
      setComparison(data);
    } catch (err) {
      console.error('Comparison error:', err);
      alert('Failed to compute comparison.');
    } finally {
      setLoading(false);
    }
  };

  const getDiffIcon = (status) => {
    switch (status) {
      case 'added': return <Plus size={16} style={{ color: 'var(--color-success)' }} />;
      case 'deleted': return <Minus size={16} style={{ color: 'var(--color-danger)' }} />;
      default: return <RefreshCw size={16} style={{ color: 'var(--color-warning)' }} />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Regulatory Comparison Console</h1>
          <p className="page-subtitle">Interactive Git-style difference checker for tax notification revisions</p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label className="form-label">Select Baseline Regulation (V1)</label>
            <select 
              className="form-control"
              value={doc1Id}
              onChange={(e) => setDoc1Id(e.target.value)}
            >
              <option value="">Choose V1 regulation...</option>
              {regulations.map(r => (
                <option key={r.id} value={r.id}>{r.title.substring(0, 75)}...</option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label className="form-label">Select Revision/Amendment (V2)</label>
            <select 
              className="form-control"
              value={doc2Id}
              onChange={(e) => setDoc2Id(e.target.value)}
            >
              <option value="">Choose V2 regulation...</option>
              {regulations.map(r => (
                <option key={r.id} value={r.id}>{r.title.substring(0, 75)}...</option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-primary"
            style={{ padding: '11px 24px', display: 'flex', gap: '8px', alignSelf: 'flex-end' }}
            onClick={handleCompare}
            disabled={loading || !doc1Id || !doc2Id}
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <GitCompare size={16} />}
            <span>Compare Versions</span>
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison ? (
        <div className="animate-fade-in">
          {/* Executive impact summary box */}
          <div className="card" style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid rgba(37, 99, 235, 0.1)', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle size={18} style={{ color: 'var(--color-primary)' }} />
              AI Comparative Analysis Summary
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {comparison.generalImpactDiff}
            </p>
          </div>

          {/* Diff Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Provision Difference Analysis</h3>
            
            {comparison.changes.map((item, idx) => (
              <div 
                key={idx}
                className={`diff-item ${item.status}`}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderLeft: `4px solid ${item.status === 'added' ? 'var(--color-success)' : item.status === 'deleted' ? 'var(--color-danger)' : 'var(--color-warning)'}`,
                  borderRadius: 'var(--border-radius-md)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {item.field}
                  </strong>
                  <span className={`diff-badge ${item.status}`}>
                    {item.status}
                  </span>
                </div>
                
                <div className="diff-container" style={{ margin: '0 0 12px 0' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Baseline Rule</div>
                    <span style={{ fontSize: '0.82rem', textDecoration: item.status === 'deleted' || item.status === 'modified' ? 'line-through' : 'none', color: 'var(--text-secondary)' }}>
                      {item.v1}
                    </span>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Amended Rule</div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {item.v2}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {getDiffIcon(item.status)}
                  <span><strong>Business Impact:</strong> {item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <GitCompare size={48} className="text-muted" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select two regulations from the bar above and click "Compare Versions".</p>
        </div>
      )}
    </div>
  );
};

export default CompareView;
