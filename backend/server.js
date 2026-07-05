import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Setup environment and paths
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend assets in production
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// Setup upload folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Load seed data
const seedDataPath = path.join(__dirname, 'seedData.json');
let regulations = [];
try {
  const fileContent = fs.readFileSync(seedDataPath, 'utf8');
  regulations = JSON.parse(fileContent);
} catch (error) {
  console.error('Error loading seed data:', error);
}

// Global state for workflow checklist (audit trail)
let workflowTasks = [];
regulations.forEach(reg => {
  if (reg.checklist) {
    reg.checklist.forEach(item => {
      workflowTasks.push({
        id: `${reg.id}-${Math.random().toString(36).substr(2, 9)}`,
        regulationId: reg.id,
        regulationTitle: reg.title,
        task: item.task,
        status: item.status || 'Pending',
        department: item.department,
        dueDate: item.dueDate,
        updatedBy: 'System',
        updatedAt: new Date().toISOString(),
        history: []
      });
    });
  }
});

// Helper for Gemini AI connection
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

// API Endpoints

// 1. Get regulations list with search & filter
app.get('/api/regulations', (req, res) => {
  const { search, taxType, risk, industry } = req.query;
  let filtered = [...regulations];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(q) ||
      r.authority.toLowerCase().includes(q) ||
      r.summary.what.toLowerCase().includes(q)
    );
  }

  if (taxType && taxType !== 'All') {
    filtered = filtered.filter(r => r.taxType.toLowerCase() === taxType.toLowerCase());
  }

  if (risk && risk !== 'All') {
    filtered = filtered.filter(r => r.riskLevel.toLowerCase() === risk.toLowerCase());
  }

  if (industry && industry !== 'All') {
    filtered = filtered.filter(r => 
      r.industriesAffected.some(i => i.toLowerCase().includes(industry.toLowerCase()))
    );
  }

  res.json(filtered);
});

// 2. Upload and Parse Document (Simulated OCR + Optional Gemini Processing)
app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let extractedText = '';

    // Extract text depending on file type
    if (fileExt === '.pdf') {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;
      } catch (err) {
        console.error('PDF parsing failed, falling back to mock text:', err);
        extractedText = `PDF Document: ${req.file.originalname}`;
      }
    } else if (fileExt === '.txt') {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else {
      // For images/docx, we simulate OCR/parsing
      extractedText = `Mock OCR Content: Scanned document showing GST updates or Income Tax modifications. File name: ${req.file.originalname}`;
    }

    // AI Processing
    const gemini = getGeminiClient();
    let analysisResult;

    const lowerText = extractedText.toLowerCase();

    // Check if it's the specific GST e-invoicing turnover above 5 crore notification
    const isGstEInvoicing = lowerText.includes('5 crore') || lowerText.includes('turnover') || lowerText.includes('e-invoice') || req.file.originalname.toLowerCase().includes('einvoice') || req.file.originalname.toLowerCase().includes('e-invoice');

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
          Analyze the following tax regulation text as an expert Tax Consultant and return a JSON object (strictly valid JSON) matching this structure:
          {
            "title": "Clear title detailing regulation and number",
            "authority": "Name of issuing authority",
            "taxType": "GST, Corporate Tax, Customs, Income Tax, etc.",
            "publicationDate": "YYYY-MM-DD (estimate if not found)",
            "effectiveDate": "YYYY-MM-DD (estimate if not found)",
            "industriesAffected": ["List", "of", "industries"],
            "riskLevel": "LOW or MEDIUM or HIGH",
            "riskScore": {
              "urgency": "Urgency rating description",
              "financialExposure": "Financial exposure description",
              "penaltyRisk": "Penalty risk description",
              "operationalDisruption": "Operational disruption description",
              "complexity": "Implementation complexity description"
            },
            "summary": {
              "what": "Detailed description of the regulation",
              "why": "Reasoning behind this change",
              "who": "Businesses and individuals affected",
              "when": "When it becomes applicable",
              "businessImpact": "General business impact"
            },
            "impactAnalysis": {
              "industries": "Specific industry impacts",
              "functions": "Affected business functions",
              "finance": "Finance department impact details",
              "tax": "Tax department compliance impact",
              "accounting": "Accounting / Bookkeeping changes",
              "erpSap": "SAP / ERP system configurations needed",
              "operational": "Operational changes and training needed"
            },
            "recommendations": ["Recommendation 1", "Recommendation 2", "etc"],
            "timeline": {
              "immediate": ["Task 1", "Task 2"],
              "sevenDays": ["Task 1", "Task 2"],
              "thirtyDays": ["Task 1"],
              "longTerm": ["Task 1"]
            },
            "checklist": [
              {"task": "Verify applicability", "department": "Finance", "dueDate": "Immediate"},
              {"task": "Configure systems", "department": "IT / ERP", "dueDate": "7 Days"}
            ],
            "faqs": [
              {"question": "FAQ Question", "answer": "FAQ Answer"}
            ],
            "history": {
              "previousVersionId": "N/A",
              "previousTitle": "N/A",
              "comparisonText": "Comparison with baseline rules"
            }
          }

          Tax document text to analyze:
          ${extractedText}
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        // Clean JSON from code blocks
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to extract valid JSON from Gemini output');
        }
      } catch (err) {
        console.error('Gemini processing failed, falling back to mock analysis:', err);
      }
    }

    // Fallback/Seed matching if Gemini failed or is not available
    if (!analysisResult) {
      if (isGstEInvoicing) {
        // Return seed 1
        analysisResult = { ...regulations[0] };
      } else {
        // Generate dynamic mock analysis
        const cleanName = req.file.originalname.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
        analysisResult = {
          id: `reg-${Date.now()}`,
          title: `Autonomous Analysis: ${cleanName}`,
          authority: lowerText.includes('cbic') || lowerText.includes('gst') ? 'Central Board of Indirect Taxes & Customs' : 'Income Tax Department, Ministry of Finance',
          taxType: lowerText.includes('gst') ? 'GST (Goods & Services Tax)' : 'Corporate Income Tax',
          publicationDate: new Date().toISOString().split('T')[0],
          effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days out
          industriesAffected: ["Professional Services", "Manufacturing", "Finance & Banking", "Technology"],
          riskLevel: lowerText.includes('penalty') || lowerText.includes('strict') ? 'HIGH' : 'MEDIUM',
          riskScore: {
            urgency: 'Medium (Effective in 30 days)',
            financialExposure: 'Medium (Depends on business turnover)',
            penaltyRisk: 'Medium (Interest charges on delayed filings)',
            operationalDisruption: 'Low (Policy revision and manual adjustment)',
            complexity: 'Low-Medium (SOP updates and staff training)'
          },
          summary: {
            what: `Autonomous extract from document: The uploaded notification addresses compliance procedures for corporate tax filers and operational guidelines under Section 43B.`,
            why: `To streamline compliance filing cycles, ensure digital audits are supported, and align local business ledger values.`,
            who: `All businesses operating in B2B markets exceeding micro-business classifications.`,
            when: `Applicable starting next commercial cycle.`,
            businessImpact: `Requires compliance review of tax journals, invoice matching, and reconciliation adjustments.`
          },
          impactAnalysis: {
            industries: 'General corporate sectors, technology, service consultants, and manufacturing firms.',
            functions: 'Taxation, Accounts Receivable, ERP Administration.',
            finance: 'Audit compliance provisions must be set aside.',
            tax: 'Revised filing calendar templates need integration.',
            accounting: 'Ledger reconciliations must match dynamic tax categories.',
            erpSap: 'SAP/ERP settings must adjust automatic calculation tax codes.',
            operational: 'Review transactions and brief internal audit teams.'
          },
          recommendations: [
            "Perform immediate internal review of transactions matching criteria.",
            "Adjust ERP auto-calculation modules.",
            "Train finance operatives on ledger entries adjustments."
          ],
          timeline: {
            immediate: ["Initiate audit of files relevant to target dates."],
            sevenDays: ["Update accounting team templates."],
            thirtyDays: ["Run trial reconciliations."],
            longTerm: ["Conduct annual compliance health check."]
          },
          checklist: [
            {"task": "Verify corporate eligibility and aggregate threshold", "status": "Pending", "department": "Finance", "dueDate": "Immediate"},
            {"task": "Update SAP ledger auto-calculation accounts", "status": "Pending", "department": "IT / ERP", "dueDate": "7 Days"},
            {"task": "Perform operational briefing to billing managers", "status": "Pending", "department": "Tax & Compliance", "dueDate": "30 Days"}
          ],
          faqs: [
            {
              "question": "What is the core compliance requirement in this document?",
              "answer": "Ensuring ledger matches, reporting correct brackets, and updating automated calculation algorithms."
            }
          ],
          history: {
            previousVersionId: "N/A",
            previousTitle: "Baseline Standard Rules",
            comparisonText: "The uploaded updates represent minor operational administrative tweaks from prior standard filings, lowering processing friction but requiring strict audit trails."
          }
        };
      }
    }

    // Save newly parsed regulation to memory
    if (!analysisResult.id) {
      analysisResult.id = `reg-${Date.now()}`;
    }
    
    // Check if already exists, else add
    const exists = regulations.some(r => r.id === analysisResult.id);
    if (!exists) {
      regulations.unshift(analysisResult);
      // Synchronize back to workflow tasks
      analysisResult.checklist.forEach(item => {
        workflowTasks.push({
          id: `${analysisResult.id}-${Math.random().toString(36).substr(2, 9)}`,
          regulationId: analysisResult.id,
          regulationTitle: analysisResult.title,
          task: item.task,
          status: item.status || 'Pending',
          department: item.department,
          dueDate: item.dueDate,
          updatedBy: 'System',
          updatedAt: new Date().toISOString(),
          history: []
        });
      });
    }

    res.json({
      success: true,
      regulation: analysisResult,
      message: 'File analyzed successfully'
    });

  } catch (error) {
    console.error('File upload/processing failed:', error);
    res.status(500).json({ error: 'Failed to analyze the document' });
  }
});

// 3. Interactive AI Chat Assistant (Context-Aware)
app.post('/api/chat', async (req, res) => {
  const { message, contextId, history } = req.body;
  
  // Find context regulation if any
  const contextReg = regulations.find(r => r.id === contextId);
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      let systemPrompt = `
        You are "TaxPulse AI", a seasoned, elite Tax Consultant and Compliance Specialist.
        Provide professional, detailed, and legally sound advice.
        When advising, structure your response to address the user's business needs.
      `;

      if (contextReg) {
        systemPrompt += `
          You are discussing the tax regulation: "${contextReg.title}".
          Here are details of this regulation:
          - Authority: ${contextReg.authority}
          - Tax Type: ${contextReg.taxType}
          - Summary: ${JSON.stringify(contextReg.summary)}
          - Impact Analysis: ${JSON.stringify(contextReg.impactAnalysis)}
          - Risk Assessment: ${JSON.stringify(contextReg.riskScore)}
          - Recommendations: ${JSON.stringify(contextReg.recommendations)}
        `;
      }

      const contents = [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }
      ];

      // Format previous history for Gemini API
      if (history && history.length > 0) {
        history.forEach(h => {
          contents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        });
        contents.push({ role: 'user', parts: [{ text: message }] });
      }

      const chatSession = model.startChat({ history: contents.slice(0, -1) });
      const response = await chatSession.sendMessage(message);
      return res.json({ reply: response.response.text() });

    } catch (err) {
      console.error('Gemini chat failed, falling back to mock reply:', err);
    }
  }

  // Fallback Rule-Based Agent response (Mock)
  let reply = '';
  const msgLower = message.toLowerCase();

  if (contextReg) {
    if (msgLower.includes('sap') || msgLower.includes('erp')) {
      reply = `**SAP / ERP Update Roadmap for ${contextReg.title}**\n\nTo update SAP for this regulation, follow these key steps:\n1. **Tax Code Configuration (T-Code: FTXP)**: Setup or modify tax codes matching the new thresholds or rates. For e-invoicing, verify SD mapping.\n2. **GSP/IRP Connection**: Update API endpoints in the integration middleware (e.g., SAP PI/PO or SAP Integration Suite).\n3. **Layout Mapping**: Map the XML fields for IRN (Invoice Reference Number) and QR Code returned by the portal to the SmartForms/Adobe Forms layout.\n4. **Operational Testing**: Run complete end-to-end cycles in SAP Quality (QAS) from Billing Document (VF01) to Release to Accounting.`;
    } else if (msgLower.includes('finance') || msgLower.includes('action')) {
      reply = `**Recommended Financial and Operational Actions**\n\nFor **${contextReg.title}**, the Finance Department should take the following actions:\n1. **Vendor/Client Audit**: Review all suppliers and buyers impacted (e.g., those with turnovers near ₹5 crore) to verify if their tax settings are updated.\n2. **Credit Terms Adjustment**: Accounts Receivable should prepare for potential invoice rejection delays.\n3. **Accounting Entries**: Establish separate GL ledger tags for new asset classes or tax provisions if MAT credit is forfeited.`;
    } else if (msgLower.includes('manufacturer') || msgLower.includes('exporter')) {
      const isManufacturingAffected = contextReg.industriesAffected.some(i => i.toLowerCase().includes('manufacturing'));
      reply = `**Impact Analysis for Manufacturing & Export Operations**\n\nFor **${contextReg.title}**:\n- **Manufacturers**: ${isManufacturingAffected ? 'Directly affected. Invoicing pipelines for raw material shipments, sub-contractor billings, and factory dispatches must generate real-time IRNs.' : 'Indirectly affected via supplier pricing or raw material billing updates.'}\n- **Exporters**: Export bills of shipping must include e-invoice details to secure GST refunds. Automated checks should verify that matching shipping bills are logged.`;
    } else {
      reply = `**Consultant Analysis Summary**\n\nRegarding **${contextReg.title}**, the issuing authority is **${contextReg.authority}** and the tax class is **${contextReg.taxType}**.\n\n* **Executive Summary**: ${contextReg.summary.what}\n* **Risk Profile**: **${contextReg.riskLevel}** due to ${contextReg.riskScore.penaltyRisk}.\n* **Immediate Action Checklist**: ${contextReg.recommendations.slice(0, 2).map((r, i) => `\n  ${i+1}. ${r}`).join('')}\n\nLet me know if you would like me to detail the SAP configuration steps or draft a communication memo for the Board.`;
    }
  } else {
    // General chat queries
    if (msgLower.includes('hi') || msgLower.includes('hello')) {
      reply = `Hello! I am your **TaxPulse AI Compliance Agent**. I can help you monitor tax regulations, assess operational risks, outline SAP ERP ledger configurations, and perform audit checklists. \n\nPlease upload a circular or choose one from the dashboard list to get started!`;
    } else {
      reply = `I can provide custom analyses for specific notifications. Please select a notification from the context dropdown or upload a tax document.\n\nFor general advice: tax rules typically demand strict ledger matching, automated billing controls, and system configuration adjustments when thresholds change. Let me know which area (ERP, Finance, or Risk) you'd like to discuss.`;
    }
  }

  res.json({ reply });
});

// 4. Compare Regulations (Visual Difference)
app.post('/api/compare', (req, res) => {
  const { id1, id2 } = req.body;
  const reg1 = regulations.find(r => r.id === id1);
  const reg2 = regulations.find(r => r.id === id2);

  if (!reg1 || !reg2) {
    return res.status(404).json({ error: 'One or both regulations not found' });
  }

  // Generate difference elements
  const comparisons = {
    doc1Title: reg1.title,
    doc2Title: reg2.title,
    changes: [
      {
        field: 'Turnover Threshold',
        v1: reg1.title.includes('₹5 Crore') ? '₹5 Crore' : '₹10 Crore',
        v2: reg2.title.includes('₹5 Crore') ? '₹5 Crore' : '₹10 Crore',
        status: 'modified',
        description: 'The turnover threshold for mandatory compliance was reduced by 50%, bringing thousands of small and medium businesses into the scope of compliance.'
      },
      {
        field: 'Tax Type',
        v1: reg1.taxType,
        v2: reg2.taxType,
        status: 'unchanged',
        description: 'Both circulars operate under the same taxation category rules.'
      },
      {
        field: 'SAP Integration Requirement',
        v1: 'Required for companies > ₹10 crore',
        v2: 'Required for companies > ₹5 crore',
        status: 'modified',
        description: 'Requires standard SAP SD layouts and API triggers to be activated for a much wider range of profit centers.'
      },
      {
        field: 'Penalties for Non-compliance',
        v1: '₹10,000 flat',
        v2: '₹10,000 or 100% of tax due (whichever is higher) per invalid invoice',
        status: 'modified',
        description: 'The penalty structure was changed to be proportional to tax exposure, significantly increasing the financial risk of invalid invoicing.'
      }
    ],
    generalImpactDiff: `Lowering the threshold from ₹10Cr to ₹5Cr forces smaller B2B entities to adopt digitized compliance systems. Mid-market vendors who previously issued manual invoices must integrate immediately or lose corporate buyers who reject invalid non-IRN bills.`
  };

  res.json(comparisons);
});

// 5. Get Workflow Tasks
app.get('/api/workflow', (req, res) => {
  res.json(workflowTasks);
});

// 6. Update Workflow Task
app.post('/api/workflow/update', (req, res) => {
  const { id, status, updatedBy, notes } = req.body;
  const taskIndex = workflowTasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const oldStatus = workflowTasks[taskIndex].status;
  
  // Update task values
  workflowTasks[taskIndex].status = status;
  workflowTasks[taskIndex].updatedBy = updatedBy || 'Compliance Officer';
  workflowTasks[taskIndex].updatedAt = new Date().toISOString();
  
  // Push to history audit trail
  workflowTasks[taskIndex].history.push({
    oldStatus,
    newStatus: status,
    updatedBy: updatedBy || 'Compliance Officer',
    updatedAt: new Date().toISOString(),
    notes: notes || 'Status updated via Compliance Console'
  });

  res.json({
    success: true,
    task: workflowTasks[taskIndex],
    message: 'Workflow status updated successfully and audit log saved.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`TaxPulse AI Backend running on http://localhost:${PORT}`);
});
