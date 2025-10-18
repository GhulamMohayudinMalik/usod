import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const result = await apiService.changePassword(formData.currentPassword, formData.newPassword);
      if (result.success) {
        setSuccess('Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(result.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error changing password:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: '#ef4444' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: '#f59e0b' };
    if (password.length < 12) return { strength: 3, label: 'Good', color: '#3b82f6' };
    return { strength: 4, label: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div style={{ padding: '1.5rem', color: 'white' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header */}
          <div>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700', 
              color: 'white', 
              marginBottom: '0.5rem' 
            }}>
              Change Password
            </h1>
            <p style={{ 
              color: '#9ca3af', 
              marginTop: '0.5rem',
              fontSize: '1rem'
            }}>
              Update your account password for better security
            </p>
          </div>

          {/* Change Password Form */}
          <div style={{
            background: 'rgba(31, 41, 55, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid rgba(75, 85, 99, 0.3)'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Current Password */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#d1d5db',
                  marginBottom: '0.5rem'
                }}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
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
                  placeholder="Enter your current password"
                />
              </div>

              {/* New Password */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#d1d5db',
                  marginBottom: '0.5rem'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
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
                  placeholder="Enter your new password"
                />
                
                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        flex: 1, 
                        background: 'rgba(55, 65, 81, 0.5)', 
                        borderRadius: '9999px', 
                        height: '0.5rem' 
                      }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            borderRadius: '9999px', 
                            transition: 'all 0.3s ease',
                            background: passwordStrength.color,
                            width: `${(passwordStrength.strength / 4) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: passwordStrength.color
                      }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#d1d5db',
                  marginBottom: '0.5rem'
                }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
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
                  placeholder="Confirm your new password"
                />
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && formData.newPassword && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {formData.newPassword === formData.confirmPassword ? (
                      <span style={{ 
                        color: '#10b981', 
                        fontSize: '0.875rem', 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}>
                        <svg style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Passwords match
                      </span>
                    ) : (
                      <span style={{ 
                        color: '#ef4444', 
                        fontSize: '0.875rem', 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}>
                        <svg style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
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

              {/* Success Message */}
              {success && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  color: '#6ee7b7'
                }}>
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || formData.newPassword !== formData.confirmPassword || formData.newPassword.length < 6}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading || formData.newPassword !== formData.confirmPassword || formData.newPassword.length < 6 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading || formData.newPassword !== formData.confirmPassword || formData.newPassword.length < 6 ? 0.5 : 1,
                  border: 'none',
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25)',
                  transform: 'scale(1)'
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '0.5rem'
                    }}></div>
                    Changing Password...
                  </div>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>

          {/* Security Tips */}
          <div style={{
            background: 'rgba(30, 58, 138, 0.2)',
            border: '1px solid rgba(29, 78, 216, 0.5)',
            borderRadius: '0.5rem',
            padding: '1.5rem'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#93c5fd', 
              marginBottom: '0.75rem' 
            }}>
              Password Security Tips
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#bfdbfe' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', marginTop: '0.125rem', color: '#60a5fa' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Use at least 8 characters with a mix of letters, numbers, and symbols
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', marginTop: '0.125rem', color: '#60a5fa' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Avoid using personal information or common words
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', marginTop: '0.125rem', color: '#60a5fa' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Don't reuse passwords from other accounts
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', marginTop: '0.125rem', color: '#60a5fa' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Consider using a password manager for better security
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChangePasswordPage;