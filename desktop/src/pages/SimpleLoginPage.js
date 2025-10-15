import React, { useState, useEffect } from 'react';

const SimpleLoginPage = ({ onLogin }) => {
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
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const validCredentials = [
        { username: 'admin', password: 'password123' },
        { username: 'GhulamMohayudin', password: 'gm1234' },
        { username: 'Ali', password: 'ali123' },
        { username: 'Zuhaib', password: 'zuhaib123' },
        { username: 'GhulamMohayudin', password: 'user123' },
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            borderRadius: '1rem',
            marginBottom: '1rem',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)'
          }}>
            <svg style={{ width: '2rem', height: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>USOD</h1>
          <p style={{ color: '#9ca3af' }}>Unified Security Operations Dashboard</p>
        </div>

        {/* Login Form */}
        <div style={{
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(24px)',
          borderRadius: '1rem',
          padding: '2rem',
          border: '1px solid rgba(55, 65, 81, 0.5)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'center' }}>Sign In</h2>
          
          {error && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              color: '#fca5a5',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="username" style={{ display: 'block', color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
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
                  padding: '12px 16px',
                  backgroundColor: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
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
                  padding: '12px 16px',
                  backgroundColor: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(55, 65, 81, 0.5)' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Available Accounts:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#d1d5db' }}>Admins:</span>
                <span style={{ color: '#9ca3af' }}>GhulamMohayudin/gm1234, Ali/ali123</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#d1d5db' }}>Users:</span>
                <span style={{ color: '#9ca3af' }}>Zuhaib/zuhaib123, GhulamMohayudin/user123</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#d1d5db' }}>More Users:</span>
                <span style={{ color: '#9ca3af' }}>AliSami/user123, ZuhaibIqbal/user123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginPage;
