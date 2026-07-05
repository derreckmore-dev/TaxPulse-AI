import { 
  LayoutDashboard, 
  FileSearch, 
  MessageSquare, 
  Calendar, 
  GitCompare, 
  CheckSquare, 
  Calculator, 
  BarChart3, 
  Activity,
  Users
} from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'agent', name: 'AI Monitoring Agent', icon: FileSearch },
    { id: 'chat', name: 'AI Chat Assistant', icon: MessageSquare },
    { id: 'calendar', name: 'Compliance Calendar', icon: Calendar },
    { id: 'compare', name: 'Compare Circulars', icon: GitCompare },
    { id: 'workflow', name: 'Workflow Manager', icon: CheckSquare },
    { id: 'calculator', name: 'ROI & Risk Calculator', icon: Calculator },
    { id: 'analytics', name: 'Analytics Board', icon: BarChart3 },
    { id: 'team', name: 'Team Settings', icon: Users }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Activity className="logo-icon" />
        <span className="logo-text">TaxPulse AI</span>
      </div>
      
      <ul className="sidebar-menu">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <li 
              key={item.id} 
              className={`menu-item ${activeView === item.id ? 'active' : ''}`}
            >
              <button onClick={() => setActiveView(item.id)}>
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      
      <div className="sidebar-footer">
        <div>Enterprise Tier</div>
        <div style={{ fontSize: '0.65rem', marginTop: '4px' }}>v1.2.0 • Secure Node</div>
      </div>
    </aside>
  );
};

export default Sidebar;
