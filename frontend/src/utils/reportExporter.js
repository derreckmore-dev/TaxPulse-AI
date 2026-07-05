/**
 * Utility exporter for generating client-side downloads of compliance reports
 */

// 1. Export CSV compliance report
export const exportToCSV = (data, filename = 'compliance_checklist.csv') => {
  if (!data || !data.length) return;

  const headers = ['Task ID', 'Regulation Title', 'Compliance Mandate', 'Assigned Department', 'Urgency Schedule', 'Compliance Status', 'Last Updated By', 'Last Updated At'];
  const rows = data.map(item => [
    item.id,
    `"${item.regulationTitle.replace(/"/g, '""')}"`,
    `"${item.task.replace(/"/g, '""')}"`,
    item.department,
    item.dueDate,
    item.status,
    item.updatedBy,
    item.updatedAt
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 2. Export Executive Summary Text Digest
export const exportToTxt = (regulation) => {
  if (!regulation) return;

  const content = `
========================================================================
                     TAXPULSE AI COMPLIANCE REPORT
========================================================================
REGULATION TITLE:  ${regulation.title}
ISSUING AUTHORITY: ${regulation.authority}
TAX CATEGORY:      ${regulation.taxType}
PUBLICATION DATE:  ${regulation.publicationDate}
EFFECTIVE DATE:    ${regulation.effectiveDate}
COMPLIANCE RISK:   [${regulation.riskLevel}]
------------------------------------------------------------------------

1. EXECUTIVE DIGEST:
   - What Changed: 
     ${regulation.summary.what}
   - Why it Changed: 
     ${regulation.summary.why}
   - Who is Affected: 
     ${regulation.summary.who}
   - Applicable Timeline: 
     ${regulation.summary.when}
   - Core Financial Impact: 
     ${regulation.summary.businessImpact}

2. FUNCTIONAL IMPACT ANALYSIS:
   - Affected Business Sectors: ${regulation.impactAnalysis.industries}
   - Critical Internal Teams:    ${regulation.impactAnalysis.functions}
   - Finance Implications:       ${regulation.impactAnalysis.finance}
   - Taxation Exposure:          ${regulation.impactAnalysis.tax}
   - Accounting Treatment:      ${regulation.impactAnalysis.accounting}
   - ERP / SAP Mapping Details:  ${regulation.impactAnalysis.erpSap}
   - Operations & Logistics:     ${regulation.impactAnalysis.operational}

3. STRATEGIC COMPLIANCE ROADMAP:
   - Immediate Steps:
     ${regulation.timeline.immediate.map((t, idx) => `  [ ] ${idx + 1}. ${t}`).join('\n')}
   - Actions (Within 7 Days):
     ${regulation.timeline.sevenDays.map((t, idx) => `  [ ] ${idx + 1}. ${t}`).join('\n')}
   - Actions (Within 30 Days):
     ${regulation.timeline.thirtyDays.map((t, idx) => `  [ ] ${idx + 1}. ${t}`).join('\n')}
   - Long-Term Governance:
     ${regulation.timeline.longTerm.map((t, idx) => `  [ ] ${idx + 1}. ${t}`).join('\n')}

4. AUDIT COMPLIANCE CHECKLIST:
   ${regulation.checklist.map((c, idx) => ` [ ] Task ${idx + 1}: ${c.task} (${c.department}) - Target: ${c.dueDate}`).join('\n')}

------------------------------------------------------------------------
Generated Autonomously by TaxPulse AI Agent.
Date of Generation: ${new Date().toLocaleString()}
========================================================================
  `;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanTitle = regulation.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('download', `TaxPulse_Summary_${cleanTitle}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
