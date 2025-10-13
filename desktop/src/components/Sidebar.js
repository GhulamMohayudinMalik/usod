import React from 'react';

const Sidebar = ({ currentPath, onNavigate }) => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview & Analytics'
    },
    {
      path: '/logs',
      icon: '📋',
      label: 'Security Logs',
      description: 'Monitor Activities'
    },
    {
      path: '/threats',
      icon: '🚨',
      label: 'Threats',
      description: 'Security Events'
    },
    {
      path: '/users',
      icon: '👥',
      label: 'Users',
      description: 'User Management'
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: 'Settings',
      description: 'App Configuration'
    }
  ];

  const handleNavigation = (path) => {
    onNavigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">USOD Desktop</h2>
        <p className="sidebar-subtitle">Security Operations Dashboard</p>
      </div>
      
      <nav className="nav-menu">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <div>
              <div className="nav-text">{item.label}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </nav>
      
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(55, 65, 81, 0.3)' }}>
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280', 
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          <div>USOD Desktop v1.0</div>
          <div>Security Operations</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
