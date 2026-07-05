import React, { useState } from 'react';
import { useTax } from '../context/TaxContext';
import { Users, UserPlus, Shield, Mail, Trash2, CheckCircle } from 'lucide-react';

const TeamView = () => {
  const { teamMembers, addTeamMember, removeTeamMember } = useTax();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Tax Consultant');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    
    addTeamMember({
      id: `u-${Date.now()}`,
      name,
      email,
      role,
      status: 'Invited',
      lastActive: 'Pending Acceptance'
    });

    setName('');
    setEmail('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Owner':
      case 'Lead Compliance Consultant':
        return <Shield size={16} style={{ color: 'var(--color-danger)' }} />;
      case 'Compliance Officer':
        return <Shield size={16} style={{ color: 'var(--color-primary)' }} />;
      default:
        return <Shield size={16} style={{ color: 'var(--color-success)' }} />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team & Access Management</h1>
          <p className="page-subtitle">Coordinate compliance projects and control auditor access levels</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
        {/* Left Side: Members List */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Users size={20} className="text-secondary" />
            Authorized Auditors & Consultants ({teamMembers.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {teamMembers.map(member => (
              <div 
                key={member.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: member.status === 'Active' ? 'var(--color-primary-light)' : 'var(--border-color)',
                    color: member.status === 'Active' ? 'var(--color-primary)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}>
                    {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{member.name}</strong>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {getRoleIcon(member.role)} {member.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Mail size={12} /> {member.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge ${member.status === 'Active' ? 'badge-low' : 'badge-medium'}`} style={{ fontSize: '0.65rem' }}>
                    {member.status}
                  </span>
                  {member.role !== 'Lead Compliance Consultant' && (
                    <button 
                      style={{ color: 'var(--color-danger)', cursor: 'pointer', opacity: 0.7, padding: '4px' }}
                      onClick={() => removeTeamMember(member.id)}
                      title="Remove Access"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Invite Form */}
        <div className="card" style={{ height: 'max-content' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <UserPlus size={20} style={{ color: 'var(--color-primary)' }} />
            Add New Member
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="E.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="E.g. jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role Definition</label>
              <select 
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Compliance Officer">Compliance Officer</option>
                <option value="Tax Consultant">Tax Consultant</option>
                <option value="IT / SAP Analyst">IT / SAP Analyst</option>
                <option value="Financial Auditor">Financial Auditor</option>
              </select>
            </div>

            {showSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-success-light)',
                color: 'var(--color-success)',
                padding: '10px',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.8rem'
              }}>
                <CheckCircle size={16} />
                <span>Invitation email sent successfully!</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Send Access Invitation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamView;
