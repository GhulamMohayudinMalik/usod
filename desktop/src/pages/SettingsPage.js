import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const SettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Get user data from localStorage (set during login)
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

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await apiService.updateProfile(profileForm);
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        // Update localStorage with new user data
        const updatedUser = { ...profile, ...result.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setProfile(updatedUser);
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySettingsUpdate = async () => {
    // Removed - these settings are not actually enforced by the backend
    setSuccessMessage('Security settings functionality removed - these settings were not actually enforced by the backend.');
  };

  const handleNotificationSettingsUpdate = async () => {
    // Removed - these settings are not actually enforced by the backend
    setSuccessMessage('Notification settings functionality removed - these settings were not actually enforced by the backend.');
  };

  if (loading && !profile) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #000000 100%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', color: 'white' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header */}
          <div>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700', 
              color: 'white', 
              marginBottom: '0.5rem' 
            }}>
              Settings
            </h1>
            <p style={{ 
              color: '#9ca3af', 
              marginTop: '0.5rem',
              fontSize: '1rem'
            }}>
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
              color: '#6ee7b7'
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
              color: '#fca5a5'
            }}>
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{
            background: 'rgba(31, 41, 55, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            border: '1px solid rgba(75, 85, 99, 0.3)'
          }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(75, 85, 99, 0.3)' }}>
              {[
                { id: 'profile', name: 'Profile', icon: '👤' },
                { id: 'security', name: 'Security', icon: '🔒' },
                { id: 'notifications', name: 'Notifications', icon: '🔔' },
                { id: 'system', name: 'System', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '1rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    color: activeTab === tab.id ? '#6ee7b7' : '#9ca3af',
                    borderBottom: activeTab === tab.id ? '2px solid #10b981' : '2px solid transparent',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>

            <div style={{ padding: '1.5rem' }}>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h2 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      color: 'white', 
                      marginBottom: '1rem' 
                    }}>
                      Profile Information
                    </h2>
                    <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1rem'
                      }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#d1d5db',
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
                              padding: '0.75rem 1rem',
                              background: 'rgba(55, 65, 81, 0.5)',
                              border: '1px solid rgba(75, 85, 99, 0.5)',
                              borderRadius: '0.5rem',
                              color: 'white',
                              fontSize: '0.875rem',
                              transition: 'all 0.2s ease'
                            }}
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#d1d5db',
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
                              padding: '0.75rem 1rem',
                              background: 'rgba(55, 65, 81, 0.5)',
                              border: '1px solid rgba(75, 85, 99, 0.5)',
                              borderRadius: '0.5rem',
                              color: 'white',
                              fontSize: '0.875rem',
                              transition: 'all 0.2s ease'
                            }}
                            placeholder="Enter email"
                          />
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem', 
                        fontSize: '0.875rem', 
                        color: '#9ca3af' 
                      }}>
                        <div>
                          <span style={{ fontWeight: '500' }}>Role:</span> {profile?.role}
                        </div>
                        <div>
                          <span style={{ fontWeight: '500' }}>User ID:</span> {profile?.id}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: loading ? 0.5 : 1,
                          border: 'none',
                          alignSelf: 'flex-start'
                        }}
                      >
                        {loading ? 'Updating...' : 'Update Profile'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Security Tab - Removed non-functional settings */}
              {activeTab === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h2 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      color: 'white', 
                      marginBottom: '1rem' 
                    }}>
                      Security Settings
                    </h2>
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.5)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      color: '#fbbf24'
                    }}>
                      <p style={{ fontSize: '0.875rem' }}>
                        Security settings have been removed as they were not actually enforced by the backend. 
                        These settings only logged changes but did not affect actual system behavior.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab - Removed non-functional settings */}
              {activeTab === 'notifications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h2 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      color: 'white', 
                      marginBottom: '1rem' 
                    }}>
                      Notification Preferences
                    </h2>
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.5)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      color: '#fbbf24'
                    }}>
                      <p style={{ fontSize: '0.875rem' }}>
                        Notification settings have been removed as they were not actually enforced by the backend. 
                        These settings only logged changes but did not affect actual system behavior.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* System Tab */}
              {activeTab === 'system' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h2 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      color: 'white', 
                      marginBottom: '1rem' 
                    }}>
                      System Information
                    </h2>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '1.5rem'
                    }}>
                      <div style={{
                        background: 'rgba(55, 65, 81, 0.3)',
                        borderRadius: '0.5rem',
                        padding: '1rem'
                      }}>
                        <h3 style={{ color: 'white', fontWeight: '500', marginBottom: '0.75rem' }}>Application Info</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#d1d5db' }}>
                          <div><span style={{ fontWeight: '500' }}>Version:</span> 1.0.0</div>
                          <div><span style={{ fontWeight: '500' }}>Environment:</span> Development</div>
                          <div><span style={{ fontWeight: '500' }}>Last Updated:</span> {new Date().toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div style={{
                        background: 'rgba(55, 65, 81, 0.3)',
                        borderRadius: '0.5rem',
                        padding: '1rem'
                      }}>
                        <h3 style={{ color: 'white', fontWeight: '500', marginBottom: '0.75rem' }}>User Statistics</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#d1d5db' }}>
                          <div><span style={{ fontWeight: '500' }}>Account Created:</span> {new Date().toLocaleDateString()}</div>
                          <div><span style={{ fontWeight: '500' }}>Last Login:</span> {new Date().toLocaleDateString()}</div>
                          <div><span style={{ fontWeight: '500' }}>Total Logins:</span> 1</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;