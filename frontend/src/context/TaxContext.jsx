import React, { createContext, useState, useEffect, useContext } from 'react';

const TaxContext = createContext();

export const useTax = () => useContext(TaxContext);

export const TaxProvider = ({ children }) => {
  const [regulations, setRegulations] = useState([]);
  const [selectedRegId, setSelectedRegId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [taxTypeFilter, setTaxTypeFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('taxpulse_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [workflowTasks, setWorkflowTasks] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      title: 'Mandatory E-Invoicing Threshold lowered to ₹5 Crore',
      type: 'critical',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'n-2',
      title: 'Assessees must file Form 10-ID to lock 15% rate',
      type: 'warning',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      read: false
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 'u-1',
      name: 'Advisor Atharva',
      email: 'atharva@company.com',
      role: 'Lead Compliance Consultant',
      status: 'Active',
      lastActive: 'Now'
    },
    {
      id: 'u-2',
      name: 'Angela Mathew',
      email: 'angelamathew0823@gmail.com',
      role: 'Compliance Officer',
      status: 'Active',
      lastActive: '5 mins ago'
    },
    {
      id: 'u-3',
      name: 'Jocelyn Mathew Samuel',
      email: 'jocelynmathewsamuel@gmail.com',
      role: 'Tax Consultant',
      status: 'Active',
      lastActive: '2 hours ago'
    }
  ]);

  const addTeamMember = (newMember) => {
    setTeamMembers(prev => [...prev, newMember]);
    addNotification({
      title: `Invited new team member: ${newMember.name}`,
      type: 'info'
    });
  };

  const removeTeamMember = (id) => {
    const member = teamMembers.find(t => t.id === id);
    setTeamMembers(prev => prev.filter(t => t.id !== id));
    if (member) {
      addNotification({
        title: `Removed access for: ${member.name}`,
        type: 'warning'
      });
    }
  };

  // Fetch regulations and workflow tasks from backend
  const refreshData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Regulations
      let url = `/api/regulations?search=${encodeURIComponent(searchQuery)}&taxType=${taxTypeFilter}&risk=${riskFilter}&industry=${industryFilter}`;
      const regRes = await fetch(url);
      const regData = await regRes.json();
      setRegulations(regData);
      
      // Auto select first regulation if none selected
      if (regData.length > 0 && !selectedRegId) {
        setSelectedRegId(regData[0].id);
      }

      // 2. Fetch Workflow tasks
      const flowRes = await fetch('/api/workflow');
      const flowData = await flowRes.json();
      setWorkflowTasks(flowData);
    } catch (error) {
      console.error('Failed to retrieve tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [searchQuery, taxTypeFilter, riskFilter, industryFilter]);

  // Save bookmarks
  useEffect(() => {
    localStorage.setItem('taxpulse_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Bookmark Toggle
  const toggleBookmark = (id) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
    // Push a notification
    const reg = regulations.find(r => r.id === id);
    if (reg) {
      const isBookmarked = !bookmarks.includes(id);
      addNotification({
        title: `Regulation ${isBookmarked ? 'bookmarked' : 'unbookmarked'}: ${reg.title.substring(0, 40)}...`,
        type: 'info'
      });
    }
  };

  // Add a notification dynamically
  const addNotification = ({ title, type }) => {
    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        title,
        type: type || 'info',
        timestamp: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);
  };

  // Clear or read notifications
  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Update a workflow task status (communicates with backend for audit trail logging)
  const updateTaskStatus = async (taskId, status, notes = '') => {
    try {
      const res = await fetch('/api/workflow/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status,
          updatedBy: 'Chief Compliance Officer',
          notes
        })
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setWorkflowTasks(prev => prev.map(t => t.id === taskId ? data.task : t));
        addNotification({
          title: `Task updated to ${status}: ${data.task.task.substring(0, 30)}...`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const selectedRegulation = regulations.find(r => r.id === selectedRegId) || regulations[0];

  return (
    <TaxContext.Provider value={{
      regulations,
      selectedRegId,
      setSelectedRegId,
      selectedRegulation,
      searchQuery,
      setSearchQuery,
      taxTypeFilter,
      setTaxTypeFilter,
      riskFilter,
      setRiskFilter,
      industryFilter,
      setIndustryFilter,
      bookmarks,
      toggleBookmark,
      workflowTasks,
      updateTaskStatus,
      notifications,
      markNotificationsAsRead,
      addNotification,
      refreshData,
      loading,
      teamMembers,
      addTeamMember,
      removeTeamMember
    }}>
      {children}
    </TaxContext.Provider>
  );
};
