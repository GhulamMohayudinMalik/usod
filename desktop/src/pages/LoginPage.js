import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #000000 100%)',
      padding: '2rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.5rem',
            color: 'white',
            fontWeight: 'bold'
          }}>
            USOD
          </div>
          <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            Sign in to your security operations dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Enter your username"
              value={credentials.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts */}
        <div style={{
          borderTop: '1px solid rgba(55, 65, 81, 0.3)',
          paddingTop: '1.5rem'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Demo Accounts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                onClick={() => fillDemoAccount(account)}
                style={{
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(55, 65, 81, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(55, 65, 81, 0.7)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(55, 65, 81, 0.5)';
                }}
              >
                <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                  {account.username}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {account.role}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
