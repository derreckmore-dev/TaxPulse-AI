import React from 'react';
import { useTax } from '../context/TaxContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, AlertTriangle } from 'lucide-react';

const AnalyticsView = () => {
  const { regulations, workflowTasks } = useTax();

  // 1. Data Prep: Risk level counts
  const highRisk = regulations.filter(r => r.riskLevel === 'HIGH').length;
  const medRisk = regulations.filter(r => r.riskLevel === 'MEDIUM').length;
  const lowRisk = regulations.filter(r => r.riskLevel === 'LOW').length;

  const riskData = [
    { name: 'High Risk', count: highRisk, fill: 'var(--color-danger)' },
    { name: 'Medium Risk', count: medRisk, fill: 'var(--color-warning)' },
    { name: 'Low Risk', count: lowRisk, fill: 'var(--color-success)' }
  ];

  // 2. Data Prep: Tax category distribution
  const taxTypes = {};
  regulations.forEach(r => {
    taxTypes[r.taxType] = (taxTypes[r.taxType] || 0) + 1;
  });

  const pieColors = ['#1E3A8A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const taxData = Object.keys(taxTypes).map((key, idx) => ({
    name: key,
    value: taxTypes[key],
    color: pieColors[idx % pieColors.length]
  }));

  // 3. Data Prep: Workflow tasks completion trend
  // Let's mock a monthly audit index progress curve
  const trendData = [
    { month: 'Jan', completed: 1, pending: 3 },
    { month: 'Feb', completed: 2, pending: 4 },
    { month: 'Mar', completed: 4, pending: 3 },
    { month: 'Apr', completed: 6, pending: 2 },
    { month: 'May', completed: 8, pending: 1 },
    { month: 'Jun', completed: 10, pending: 0 }
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Analytics Board</h1>
          <p className="page-subtitle">Visual indicators of risk exposures, corporate tax types, and audit milestones</p>
        </div>
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '32px' }}>
        
        {/* Risk Distribution Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <AlertTriangle size={18} className="text-secondary" />
            Regulations by Severity Profile
          </h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tax Category Doughnut Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <PieIcon size={18} className="text-secondary" />
            Audit Shares by Taxation Class
          </h3>
          <div style={{ width: '100%', height: '260px', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '60%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taxData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taxData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legends list */}
            <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {taxData.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: entry.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Trend over time */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <TrendingUp size={18} className="text-secondary" />
          Task Resolution & Audit Velocity Curve
        </h3>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Area type="monotone" name="Resolved Action Items" dataKey="completed" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
              <Area type="monotone" name="Pending Compliance Roadblocks" dataKey="pending" stroke="var(--color-danger)" strokeWidth={2} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
