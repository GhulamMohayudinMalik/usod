import React, { useState, useEffect } from 'react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Security Analyst'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

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

  // Create user
  const handleCreateUser = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const newUser = {
        id: users.length + 1,
        username: createForm.username,
        email: createForm.email,
        role: createForm.role,
        status: 'Active',
        lastLogin: new Date().toISOString(),
        loginCount: 0
      };

      setUsers([newUser, ...users]);
      setCreateForm({ username: '', email: '', password: '', role: 'Security Analyst' });
      setShowCreateForm(false);
      setSuccessMessage('User created successfully!');
    } catch (err) {
      setError('Failed to create user');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      setDeleteReason('');
      setSuccessMessage('User deleted successfully!');
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Change user role
  const handleChangeRole = () => {
    if (!selectedUser || !newRole) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      setUsers(users.map(user => 
        user.id === selectedUser.id
          ? { ...user, role: newRole }
          : user
      ));
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      setSuccessMessage(`User role changed to ${newRole} successfully!`);
    } catch (err) {
      setError('Failed to change user role');
      console.error('Error changing user role:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Open role change modal
  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
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

      {/* Create User Form */}
      {showCreateForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Create New User
          </h2>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#e5e7eb',
                  marginBottom: '0.5rem'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(55, 65, 81, 0.5)',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#e5e7eb',
                  marginBottom: '0.5rem'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(55, 65, 81, 0.5)',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#e5e7eb',
                  marginBottom: '0.5rem'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(55, 65, 81, 0.5)',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#e5e7eb',
                  marginBottom: '0.5rem'
                }}>
                  Role
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(55, 65, 81, 0.5)',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="Security Analyst">Security Analyst</option>
                  <option value="Security Admin">Security Admin</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(75, 85, 99, 0.5)',
                  color: '#e5e7eb',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success/Error Messages */}
      {successMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#10b981',
          marginBottom: '1rem'
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
          color: '#ef4444',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Users</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Add User'}
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
                      <button 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                        onClick={() => openRoleModal(user)}
                      >
                        Role
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                        onClick={() => openDeleteModal(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'rgba(31, 41, 55, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            maxWidth: '28rem',
            width: '100%',
            margin: '1rem'
          }}>
            <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Delete User
            </h3>
            <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>
              Are you sure you want to delete user <strong>{selectedUser?.username}</strong>? 
              This action cannot be undone.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#e5e7eb',
                marginBottom: '0.5rem'
              }}>
                Reason for deletion (optional)
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter reason for deletion"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                  setDeleteReason('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(75, 85, 99, 0.5)',
                  color: '#e5e7eb',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'rgba(31, 41, 55, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            maxWidth: '28rem',
            width: '100%',
            margin: '1rem'
          }}>
            <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Change User Role
            </h3>
            <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>
              Change role for user <strong>{selectedUser?.username}</strong>
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#e5e7eb',
                marginBottom: '0.5rem'
              }}>
                New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Security Analyst">Security Analyst</option>
                <option value="Security Admin">Security Admin</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(75, 85, 99, 0.5)',
                  color: '#e5e7eb',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                disabled={loading || newRole === selectedUser?.role}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading || newRole === selectedUser?.role ? 0.5 : 1
                }}
              >
                {loading ? 'Changing...' : 'Change Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
