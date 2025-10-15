import React from 'react';

const ChangePasswordPage = () => {
  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '600', marginBottom: '1rem' }}>
        Change Password
      </h1>
      <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '2rem' }}>
        Update your account password and security settings
      </p>
      
      <div style={{
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(24px)',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid rgba(55, 65, 81, 0.3)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          Password Management
        </h2>
        <p style={{ color: '#9ca3af' }}>
          This page will contain password change forms, security settings, and account management options.
        </p>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
