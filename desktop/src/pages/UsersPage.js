import React, { useState, useEffect } from 'react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@usod.com',
          role: 'Administrator',
          status: 'Active',
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          loginCount: 156
        },
        {
          id: 2,
          username: 'GhulamMohayudin',
          email: 'ghulam@usod.com',
          role: 'Security Admin',
          status: 'Active',
          lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          loginCount: 89
        },
        {
          id: 3,
          username: 'Ali',
          email: 'ali@usod.com',
          role: 'Security Analyst',
          status: 'Active',
          lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          loginCount: 45
        },
        {
          id: 4,
          username: 'Zuhaib',
          email: 'zuhaib@usod.com',
          role: 'Security Analyst',
          status: 'Active',
          lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          loginCount: 67
        },
        {
          id: 5,
          username: 'AliSami',
          email: 'alisami@usod.com',
          role: 'Security Analyst',
          status: 'Inactive',
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          loginCount: 23
        },
        {
          id: 6,
          username: 'ZuhaibIqbal',
          email: 'zuhaibiqbal@usod.com',
          role: 'Security Analyst',
          status: 'Active',
          lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          loginCount: 34
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrator': return '#dc2626';
      case 'Security Admin': return '#f59e0b';
      case 'Security Analyst': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Inactive': return '#6b7280';
      case 'Suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getUserInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          User Management
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
          Manage users, roles, and permissions
        </p>
      </div>

      {/* User Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Total Users
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {users.length}
              </div>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              👥
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Active Users
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {users.filter(u => u.status === 'Active').length}
              </div>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              ✅
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Administrators
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {users.filter(u => u.role === 'Administrator' || u.role === 'Security Admin').length}
              </div>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              👑
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Users</h2>
          <button className="btn btn-primary">
            Add User
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  User
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Role
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Last Login
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Login Count
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}>
                        {getUserInitials(user.username)}
                      </div>
                      <div>
                        <div style={{ color: 'white', fontWeight: '500', fontSize: '0.875rem' }}>
                          {user.username}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `rgba(${getRoleColor(user.role)}20, 0.2)`,
                      color: getRoleColor(user.role)
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `rgba(${getStatusColor(user.status)}20, 0.2)`,
                      color: getStatusColor(user.status)
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'white', fontSize: '0.875rem' }}>
                    {formatTimestamp(user.lastLogin)}
                  </td>
                  <td style={{ padding: '1rem', color: 'white', fontSize: '0.875rem' }}>
                    {user.loginCount}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                        Edit
                      </button>
                      <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
