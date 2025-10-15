import React, { useState, useEffect } from 'react';

const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when component mounts
  useEffect(() => {
    setCredentials({
      username: '',
      password: ''
    });
    setError('');
    setLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock authentication - in a real app, this would call the backend
      const validCredentials = [
        { username: 'admin', password: 'password123' },
        { username: 'GhulamMohayudin', password: 'gm1234' },
        { username: 'Ali', password: 'ali123' },
        { username: 'Zuhaib', password: 'zuhaib123' },
        { username: 'GM', password: 'user123' },
        { username: 'AliSami', password: 'user123' },
        { username: 'ZuhaibIqbal', password: 'user123' }
      ];

      const isValid = validCredentials.some(cred => 
        cred.username === credentials.username && cred.password === credentials.password
      );

      if (isValid) {
        onLogin({
          username: credentials.username,
          loginTime: new Date().toISOString()
        });
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { username: 'admin', password: 'password123', role: 'Administrator' },
    { username: 'GhulamMohayudin', password: 'gm1234', role: 'Security Admin' },
    { username: 'Ali', password: 'ali123', role: 'Security Analyst' },
    { username: 'Zuhaib', password: 'zuhaib123', role: 'Security Analyst' }
  ];

  const fillDemoAccount = (account) => {
    setCredentials({
      username: account.username,
      password: account.password
    });
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '28rem',
        width: '100%'
      }}>
        {/* Logo/Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.5rem',
            height: '3.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            borderRadius: '1rem',
            marginBottom: '1rem',
            boxShadow: '0 15px 35px -12px rgba(16, 185, 129, 0.3)'
          }}>
            <svg style={{
              width: '1.75rem',
              height: '1.75rem',
              color: 'white'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>USOD</h1>
          <p style={{
            color: '#d1d5db',
            fontSize: '0.875rem'
          }}>Unified Security Operations Dashboard</p>
        </div>

        {/* Login Form */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.9)',
          backdropFilter: 'blur(24px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Sign In</h2>
          
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="username" style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#e5e7eb',
                marginBottom: '0.5rem'
              }}>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                placeholder="Enter your username"
                autoComplete="username"
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#e5e7eb',
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #059669 0%, #0891b2 100%)';
                  e.target.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {loading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem'
                  }}></div>
                  <span style={{ fontSize: '0.875rem' }}>Signing in...</span>
                </div>
              ) : (
                <span style={{ fontSize: '0.875rem' }}>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(75, 85, 99, 0.3)'
          }}>
            <p style={{
              fontSize: '0.75rem',
              fontWeight: '500',
              color: '#d1d5db',
              marginBottom: '0.75rem',
              textAlign: 'center'
            }}>Quick Access Accounts</p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => fillDemoAccount(account)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    background: 'rgba(55, 65, 81, 0.3)',
                    borderRadius: '0.375rem',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(75, 85, 99, 0.4)';
                    e.target.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(55, 65, 81, 0.3)';
                    e.target.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: 'white'
                    }}>
                      {account.username}
                    </div>
                    <div style={{
                      fontSize: '0.625rem',
                      color: '#9ca3af'
                    }}>
                      {account.role}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.625rem',
                    color: '#6b7280'
                  }}>
                    Click to fill
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
