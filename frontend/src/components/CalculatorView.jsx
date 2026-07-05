import React, { useState } from 'react';
import { useTax } from '../context/TaxContext';
import { Calculator, AlertTriangle, ShieldAlert, Sparkles, Copy, Mail, Sliders, CheckCircle } from 'lucide-react';

const CalculatorView = () => {
  const { regulations, selectedRegId, setSelectedRegId, selectedRegulation } = useTax();
  
  // Calculator States
  const [turnover, setTurnover] = useState(15); // in Crores
  const [monthlyInvoices, setMonthlyInvoices] = useState(250);
  const [avgTaxDue, setAvgTaxDue] = useState(45000); // Average GST/tax amount per invoice
  const [copied, setCopied] = useState(false);
  const [memoAudience, setMemoAudience] = useState('board');

  // Calculation Logic
  // Penalty for invalid invoice (e.g. non-IRN GST) is ₹10,000 or tax amount, whichever is higher
  // Let's assume an exposure rate of 8% error rate or non-compliance impact rate
  const impactRate = 0.08; 
  const monthlyImpactedInvoices = Math.round(monthlyInvoices * impactRate);
  
  // Calculate exposure (10,000 flat per impacted invoice for demo)
  const penaltyPerInvoice = 10000;
  const annualPenaltyExposure = monthlyImpactedInvoices * penaltyPerInvoice * 12;
  
  // Input tax credit (ITC) risk (if invoices are invalid, client cannot claim ITC)
  const annualIicRisk = monthlyImpactedInvoices * avgTaxDue * 12;

  // Total financial exposure
  const totalFinancialExposure = annualPenaltyExposure + annualIicRisk;

  // AI hours saved
  const annualHoursSaved = 5 * 52; // 5 hours per week * 52 weeks
  const annualSavingsCost = annualHoursSaved * 1500; // estimated ₹1500/hr consultant cost

  // Memo Drafting Generator Logic
  const getMemoContent = () => {
    if (!selectedRegulation) return 'Please select a regulation focus context above to generate the memo.';

    const title = selectedRegulation.title;
    const date = new Date(selectedRegulation.effectiveDate).toLocaleDateString();
    
    switch (memoAudience) {
      case 'finance':
        return `Subject: URGENT COMPLIANCE UPDATE: Financial Adjustments for ${selectedRegulation.taxType} - ${selectedRegulation.id}

Dear Finance Team,

Please be advised that the following tax amendment has been published and requires immediate bookkeeping and operational audits:
Amendment: ${title}
Effective Date: ${date}

Key Financial Actions Required:
1. Invoice Auditing: Review accounts receivable processes to ensure invoices match the newly mandated criteria.
2. Reconciliation: Establish double-entry checks for transaction records subject to this regulation.
3. Supplier Credit: ${selectedRegulation.impactAnalysis.finance}

Please review the complete implementation workflow on the TaxPulse AI dashboard.

Regards,
Compliance Office`;

      case 'it':
        return `Subject: SYSTEM INTEGRATION BRIEFING: ERP & SAP Configurations for ${title}

Dear IT & Enterprise Systems Team,

An urgent update is required for our ERP/SAP accounting modules to align with new tax compliance mandates:
Regulation: ${title}
Effective Date: ${date}

Technical Specifications Required:
1. SAP Mappings: Adjust SAP FI/CO configurations and update tax code rates (T-Code: FTXP) matching the parameters of this circular.
2. Layout Adjustments: ${selectedRegulation.impactAnalysis.erpSap}
3. Sandbox Testing: Execute billing workflow tests to ensure real-time reporting APIs return valid success logs.

Please sync code layouts on the sandbox portal.

Regards,
Compliance Office`;

      default: // Board Memo
        return `MEMORANDUM FOR THE BOARD OF DIRECTORS

Subject: Strategic Compliance & Financial Exposure Risk Audit: ${selectedRegulation.taxType}

Executive Summary:
${selectedRegulation.summary.what}

Strategic Impact Analysis:
- Financial Exposure Risk: ${selectedRegulation.riskLevel} Risk rating. If non-compliant, estimated exposure from penalties and credit blockages exceeds standard operating margins.
- Operations: ${selectedRegulation.impactAnalysis.operational}
- Effective Implementation Date: ${date}

Management Recommendation:
We recommend immediate system upgrades to avoid operational bottlenecks. Our teams are currently executing the 30-day compliance checklist to align SAP, billing pipelines, and client notices.

Prepared by: TaxPulse AI Compliance Agent`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getMemoContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">Risk & ROI Exposure Simulator</h1>
          <p className="page-subtitle">Calculate potential penalties, cost of non-compliance, and draft executive memos</p>
        </div>

        {/* Focus Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Focus Context:</label>
          <select 
            className="form-control" 
            style={{ width: '250px', padding: '6px 12px' }}
            value={selectedRegId || ''}
            onChange={(e) => setSelectedRegId(e.target.value)}
          >
            {regulations.map(r => (
              <option key={r.id} value={r.id}>{r.title.substring(0, 45)}...</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
        
        {/* Left Side: Sliders & Outputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Inputs Card */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Sliders size={18} className="text-secondary" />
              Company Operational Metrics
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  <span>Annual Turnover</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{turnover} Crore</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  step="1"
                  value={turnover} 
                  onChange={(e) => setTurnover(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  <span>Monthly B2B Invoice Volume</span>
                  <span style={{ color: 'var(--color-primary)' }}>{monthlyInvoices} Invoices</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="2000" 
                  step="10"
                  value={monthlyInvoices} 
                  onChange={(e) => setMonthlyInvoices(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  <span>Average Invoice Tax Amount</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{avgTaxDue.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="200000" 
                  step="5000"
                  value={avgTaxDue} 
                  onChange={(e) => setAvgTaxDue(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Outputs Card */}
          <div className="card" style={{ borderColor: 'var(--color-danger)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--color-danger)' }}>
              <ShieldAlert size={18} />
              Estimated Penalty Exposure Analysis
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Annual Statutory Fines</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-danger)', marginTop: '4px' }}>
                  ₹{annualPenaltyExposure.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Based on ₹10k/invoice penalty code.
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Input Tax Credit (ITC) Risk</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-warning)', marginTop: '4px' }}>
                  ₹{annualIicRisk.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Client retention exposure from blocked credits.
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--color-danger-light)', padding: '16px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-danger)', display: 'block' }}>Total Annual Exposure</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  Your business faces a total compliance liability of <strong>₹{totalFinancialExposure.toLocaleString()}</strong> if operational and SAP invoicing controls are not updated prior to the deadline.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Memo Generator */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
            AI Compliance Memo Drafter
          </h3>

          {/* Audience selection */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['board', 'finance', 'it'].map(aud => (
              <button 
                key={aud}
                className={`btn ${memoAudience === aud ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.75rem', textTransform: 'capitalize' }}
                onClick={() => setMemoAudience(aud)}
              >
                {aud === 'it' ? 'IT / ERP Admin' : aud}
              </button>
            ))}
          </div>

          <div style={{ flexGrow: 1, position: 'relative', minHeight: '300px' }}>
            <textarea
              className="form-control"
              style={{
                width: '100%',
                height: '100%',
                minHeight: '280px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                backgroundColor: 'var(--bg-primary)',
                resize: 'none',
                padding: '16px',
                lineHeight: 1.4
              }}
              value={getMemoContent()}
              readOnly
            />
            
            <button 
              className="btn btn-primary"
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                padding: '8px 12px',
                fontSize: '0.75rem'
              }}
              onClick={handleCopy}
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorView;
