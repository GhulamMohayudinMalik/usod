import React, { useState } from 'react';

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 25, label: 'Weak', color: '#ef4444' };
    if (password.length < 8) return { strength: 50, label: 'Fair', color: '#f59e0b' };
    if (password.length < 12) return { strength: 75, label: 'Good', color: '#06b6d4' };
    return { strength: 100, label: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div style={{ 
      padding: '2rem', 
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Change Password
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
          Update your account password and security settings
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#10b981',
          marginBottom: '2rem'
        }}>
          Password changed successfully!
        </div>
      )}

      {/* Error Message */}
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

      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '600px',
        minWidth: '400px'
      }}>
        <h2 style={{ 
          color: 'white', 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '1.5rem' 
        }}>
          Password Management
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#e5e7eb',
                marginBottom: '0.75rem'
              }}>
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#e5e7eb',
                marginBottom: '0.75rem'
              }}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                placeholder="Enter new password"
              />
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(55, 65, 81, 0.5)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${passwordStrength.strength}%`,
                      height: '100%',
                      background: passwordStrength.color,
                      transition: 'all 0.3s ease',
                      borderRadius: '3px'
                    }}></div>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: passwordStrength.color,
                    marginTop: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Password Strength: {passwordStrength.label}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#e5e7eb',
                marginBottom: '0.75rem'
              }}>
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
              style={{
                padding: '1rem 2rem',
                background: 'rgba(55, 65, 81, 0.5)',
                color: '#9ca3af',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(55, 65, 81, 0.7)';
                e.target.style.color = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(55, 65, 81, 0.5)';
                e.target.style.color = '#9ca3af';
              }}
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.5 : 1,
                fontSize: '0.875rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Updating...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>

        {/* Password Requirements */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(55, 65, 81, 0.3)',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ 
            color: 'white', 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            marginBottom: '0.5rem' 
          }}>
            Password Requirements:
          </h3>
          <ul style={{ 
            color: '#9ca3af', 
            fontSize: '0.75rem', 
            paddingLeft: '1rem',
            lineHeight: '1.5'
          }}>
            <li>At least 8 characters long</li>
            <li>Contains uppercase and lowercase letters</li>
            <li>Contains at least one number</li>
            <li>Contains at least one special character</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
