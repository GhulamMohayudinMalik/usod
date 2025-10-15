import React, { useState, useEffect } from 'react';

const SettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: ''
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 24,
    loginAttempts: 5,
    passwordExpiry: 90
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    loginAlerts: true,
    securityEvents: true,
    systemErrors: true,
    emailNotifications: true
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Mock user data for demo
        const mockUser = {
          username: 'admin',
          email: 'admin@usod.com',
          role: 'Administrator',
          lastLogin: new Date().toISOString()
        };
        
        setProfile(mockUser);
        setProfileForm({
          username: mockUser.username,
          email: mockUser.email
        });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(prev => ({
        ...prev,
        username: profileForm.username,
        email: profileForm.email
      }));
      
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Security settings updated successfully!');
    } catch (err) {
      setError('Failed to update security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Notification settings updated successfully!');
    } catch (err) {
      setError('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      {/* Header */}
      <div>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Settings
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '2rem' }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#10b981',
          marginBottom: '2rem'
        }}>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#ef4444',
          marginBottom: '2rem'
        }}>
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(75, 85, 99, 0.3)' }}>
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'security', label: 'Security' },
            { id: 'notifications', label: 'Notifications' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 2rem',
                background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                border: 'none',
                color: activeTab === tab.id ? '#10b981' : '#9ca3af',
                fontWeight: activeTab === tab.id ? '600' : '400',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #10b981' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Profile Settings
              </h2>
              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#e5e7eb',
                      marginBottom: '0.5rem'
                    }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(55, 65, 81, 0.5)',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#e5e7eb',
                      marginBottom: '0.5rem'
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(55, 65, 81, 0.5)',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: loading ? 0.5 : 1
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Security Settings
              </h2>
              <form onSubmit={handleSecuritySettingsUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#e5e7eb',
                      marginBottom: '0.5rem'
                    }}>
                      Session Timeout (hours)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                      min="1"
                      max="168"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(55, 65, 81, 0.5)',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#e5e7eb',
                      marginBottom: '0.5rem'
                    }}>
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={securitySettings.loginAttempts}
                      onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: parseInt(e.target.value)})}
                      min="3"
                      max="10"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(55, 65, 81, 0.5)',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#e5e7eb',
                      marginBottom: '0.5rem'
                    }}>
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})}
                      min="30"
                      max="365"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(55, 65, 81, 0.5)',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: loading ? 0.5 : 1
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Security Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Notification Settings
              </h2>
              <form onSubmit={handleNotificationSettingsUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { key: 'loginAlerts', label: 'Login Alerts', description: 'Notify when users log in' },
                    { key: 'securityEvents', label: 'Security Events', description: 'Notify about security incidents' },
                    { key: 'systemErrors', label: 'System Errors', description: 'Notify about system errors' },
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Send email notifications' }
                  ].map((setting) => (
                    <div key={setting.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(55, 65, 81, 0.3)', borderRadius: '0.5rem' }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: '500', marginBottom: '0.25rem' }}>
                          {setting.label}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                          {setting.description}
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                        <input
                          type="checkbox"
                          checked={notificationSettings[setting.key]}
                          onChange={(e) => setNotificationSettings({...notificationSettings, [setting.key]: e.target.checked})}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: notificationSettings[setting.key] ? '#10b981' : '#6b7280',
                          borderRadius: '1.5rem',
                          transition: '0.3s'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '""',
                            height: '1.25rem',
                            width: '1.25rem',
                            left: notificationSettings[setting.key] ? '1.5rem' : '0.25rem',
                            bottom: '0.125rem',
                            background: 'white',
                            borderRadius: '50%',
                            transition: '0.3s'
                          }}></span>
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: loading ? 0.5 : 1
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Notification Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
