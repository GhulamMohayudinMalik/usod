import React, { useState } from 'react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30,
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    emailAlerts: true,
    securityAlerts: true,
    systemAlerts: false
  });

  const [loading, setLoading] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate saving settings
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        notifications: true,
        autoRefresh: true,
        refreshInterval: 30,
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        emailAlerts: true,
        securityAlerts: true,
        systemAlerts: false
      });
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Settings
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
          Configure your application preferences and security settings
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* General Settings */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>General Settings</h2>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Theme</label>
              <select
                className="form-input"
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Language</label>
              <select
                className="form-input"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                className="form-input"
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">Greenwich Mean Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>Display Settings</h2>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'white', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Enable Notifications
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Show desktop notifications for important events
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.notifications ? '#06b6d4' : '#6b7280',
                  borderRadius: '1.5rem',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '1.25rem',
                    width: '1.25rem',
                    left: settings.notifications ? '1.5rem' : '0.25rem',
                    bottom: '0.125rem',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }}></span>
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'white', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Auto Refresh
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Automatically refresh data at regular intervals
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.autoRefresh ? '#06b6d4' : '#6b7280',
                  borderRadius: '1.5rem',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '1.25rem',
                    width: '1.25rem',
                    left: settings.autoRefresh ? '1.5rem' : '0.25rem',
                    bottom: '0.125rem',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }}></span>
                </span>
              </label>
            </div>

            {settings.autoRefresh && (
              <div className="form-group">
                <label className="form-label">Refresh Interval (seconds)</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.refreshInterval}
                  onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                  min="10"
                  max="300"
                />
              </div>
            )}
          </div>
        </div>

        {/* Alert Settings */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>Alert Settings</h2>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'white', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Email Alerts
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Send email notifications for critical events
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.emailAlerts ? '#06b6d4' : '#6b7280',
                  borderRadius: '1.5rem',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '1.25rem',
                    width: '1.25rem',
                    left: settings.emailAlerts ? '1.5rem' : '0.25rem',
                    bottom: '0.125rem',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }}></span>
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'white', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Security Alerts
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Notify about security threats and incidents
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.securityAlerts}
                  onChange={(e) => handleSettingChange('securityAlerts', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.securityAlerts ? '#06b6d4' : '#6b7280',
                  borderRadius: '1.5rem',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '1.25rem',
                    width: '1.25rem',
                    left: settings.securityAlerts ? '1.5rem' : '0.25rem',
                    bottom: '0.125rem',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }}></span>
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'white', fontWeight: '500', marginBottom: '0.25rem' }}>
                  System Alerts
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Notify about system events and maintenance
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                <input
                  type="checkbox"
                  checked={settings.systemAlerts}
                  onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.systemAlerts ? '#06b6d4' : '#6b7280',
                  borderRadius: '1.5rem',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '1.25rem',
                    width: '1.25rem',
                    left: settings.systemAlerts ? '1.5rem' : '0.25rem',
                    bottom: '0.125rem',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }}></span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={handleReset}>
              Reset to Default
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
