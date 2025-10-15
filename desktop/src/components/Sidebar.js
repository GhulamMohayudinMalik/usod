import React, { useState } from 'react';

const Sidebar = ({ currentPath, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuItems = [
    {
      path: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview & Analytics'
    },
    {
      path: '/security',
      icon: '🛡️',
      label: 'Security',
      description: 'Security Monitoring'
    },
    {
      path: '/threats',
      icon: '🚨',
      label: 'Threats',
      description: 'Security Events'
    },
    {
      path: '/logs',
      icon: '📋',
      label: 'Security Logs',
      description: 'Monitor Activities'
    },
    {
      path: '/analytics',
      icon: '📈',
      label: 'Analytics',
      description: 'Metrics & Trends'
    },
    {
      path: '/ai-insights',
      icon: '🤖',
      label: 'AI Insights',
      description: 'AI Analysis'
    },
    {
      path: '/security-lab',
      icon: '🔬',
      label: 'Security Lab',
      description: 'Testing Tools'
    },
    {
      path: '/users',
      icon: '👥',
      label: 'Users',
      description: 'User Management'
    },
    {
      path: '/backup',
      icon: '💾',
      label: 'Backup',
      description: 'Data Management'
    },
    {
      path: '/change-password',
      icon: '🔐',
      label: 'Change Password',
      description: 'Account Security'
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div style={{
      width: isCollapsed ? '60px' : '280px',
      background: 'rgba(17, 24, 39, 0.9)',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(55, 65, 81, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      transition: 'width 0.3s ease',
      position: 'relative',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        padding: isCollapsed ? '1rem 0.5rem' : '1.5rem',
        borderBottom: '1px solid rgba(55, 65, 81, 0.3)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        position: 'relative',
      }}>
        {!isCollapsed && (
          <div>
            <h2 style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>USOD Desktop</h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem'
            }}>Security Operations Dashboard</p>
          </div>
        )}
        
        {/* Toggle Button - Positioned on the right edge */}
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            right: '1px',
            top: '15px',
            transform: 'translateY(-50%)',
            background: 'rgba(55, 65, 81, 0.95)',
            border: '1px solid rgba(55, 65, 81, 0.7)',
            borderRadius: '50%',
            color: '#d1d5db',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            fontSize: '12px',
            width: '24px',
            height: '24px',
            zIndex: 999999,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(55, 65, 81, 1)';
            e.target.style.color = 'white';
            e.target.style.transform = 'translateY(-50%) scale(1.1)';
            e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(55, 65, 81, 0.95)';
            e.target.style.color = '#d1d5db';
            e.target.style.transform = 'translateY(-50%) scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
          }}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>
      
      {/* Scrollable Navigation */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: isCollapsed ? '0 0.5rem' : '0 1rem',
        paddingBottom: '1rem'
      }}>
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <div
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: isCollapsed ? '0.75rem 0.5rem' : '0.75rem 1rem',
                marginBottom: '0.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isActive 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'transparent',
                border: isActive 
                  ? '1px solid rgba(16, 185, 129, 0.3)' 
                  : '1px solid transparent',
                justifyContent: isCollapsed ? 'center' : 'flex-start'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              title={isCollapsed ? item.label : ''}
            >
              <span style={{
                width: '1.25rem',
                height: '1.25rem',
                marginRight: isCollapsed ? '0' : '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                color: 'inherit'
              }}>{item.icon}</span>
              {!isCollapsed && (
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                    color: isActive ? 'white' : '#d1d5db'
                  }}>{item.label}</div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: isActive ? '#a7f3d0' : '#9ca3af',
                    lineHeight: '1.2'
                  }}>
                    {item.description}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div style={{
        padding: isCollapsed ? '1rem 0.5rem' : '1rem',
        borderTop: '1px solid rgba(55, 65, 81, 0.3)',
        marginTop: 'auto'
      }}>
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280', 
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          {!isCollapsed && (
            <>
              <div>USOD Desktop v1.0</div>
              <div>Security Operations</div>
            </>
          )}
          {isCollapsed && (
            <div>v1.0</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
