'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
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
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setProfile(user);
          setProfileForm({
            username: user.username,
            email: user.email
          });
        } else {
          throw new Error('No user data found');
        }
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Profile updated successfully!');
        // Update localStorage with new user data
        const updatedUser = { ...profile, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setProfile(updatedUser);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySettingsUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      // Log each setting change
      const settingsToUpdate = [
        {
          settingType: 'security',
          settingName: 'session_timeout',
          newValue: securitySettings.sessionTimeout.toString()
        },
        {
          settingType: 'security', 
          settingName: 'max_login_attempts',
          newValue: securitySettings.loginAttempts.toString()
        },
        {
          settingType: 'security',
          settingName: 'password_expiry_days',
          newValue: securitySettings.passwordExpiry.toString()
        }
      ];

      // Send each setting change to backend for logging
      for (const setting of settingsToUpdate) {
        await fetch('http://localhost:5000/api/users/settings', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...setting,
            changeScope: 'user'
          })
        });
      }

      setSuccessMessage('Security settings updated successfully!');
    } catch (err) {
      setError('Failed to update security settings');
      console.error('Error updating security settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      // Log each notification setting change
      const settingsToUpdate = [
        {
          settingType: 'notifications',
          settingName: 'login_alerts',
          newValue: notificationSettings.loginAlerts.toString()
        },
        {
          settingType: 'notifications',
          settingName: 'security_events',
          newValue: notificationSettings.securityEvents.toString()
        },
        {
          settingType: 'notifications',
          settingName: 'system_errors',
          newValue: notificationSettings.systemErrors.toString()
        },
        {
          settingType: 'notifications',
          settingName: 'email_notifications',
          newValue: notificationSettings.emailNotifications.toString()
        }
      ];

      // Send each setting change to backend for logging
      for (const setting of settingsToUpdate) {
        await fetch('http://localhost:5000/api/users/settings', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...setting,
            changeScope: 'user'
          })
        });
      }

      setSuccessMessage('Notification settings updated successfully!');
    } catch (err) {
      setError('Failed to update notification settings');
      console.error('Error updating notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 text-green-300">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50">
        <div className="flex border-b border-gray-700/50">
          {[
            { id: 'profile', name: 'Profile', icon: '👤' },
            { id: 'security', name: 'Security', icon: '🔒' },
            { id: 'notifications', name: 'Notifications', icon: '🔔' },
            { id: 'system', name: 'System', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter email"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div>
                      <span className="font-medium">Role:</span> {profile?.role}
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span> {profile?.id}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Session Timeout (hours)
                    </label>
                    <select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value={1}>1 hour</option>
                      <option value={8}>8 hours</option>
                      <option value={24}>24 hours</option>
                      <option value={168}>7 days</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={securitySettings.loginAttempts}
                      onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="365"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={handleSecuritySettingsUpdate}
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Updating...' : 'Update Security Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'loginAlerts', label: 'Login Alerts', description: 'Get notified of login attempts' },
                    { key: 'securityEvents', label: 'Security Events', description: 'Get notified of security incidents' },
                    { key: 'systemErrors', label: 'System Errors', description: 'Get notified of system errors' },
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">{setting.label}</h3>
                        <p className="text-gray-400 text-sm">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[setting.key]}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            [setting.key]: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  ))}

                  <button
                    onClick={handleNotificationSettingsUpdate}
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Updating...' : 'Update Notification Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Application Info</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div><span className="font-medium">Version:</span> 1.0.0</div>
                      <div><span className="font-medium">Environment:</span> Development</div>
                      <div><span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">User Statistics</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div><span className="font-medium">Account Created:</span> {new Date().toLocaleDateString()}</div>
                      <div><span className="font-medium">Last Login:</span> {new Date().toLocaleDateString()}</div>
                      <div><span className="font-medium">Total Logins:</span> 1</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}