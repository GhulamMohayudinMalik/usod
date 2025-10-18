import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    try {
      const result = await apiService.getUsers();
      if (result.success) {
        setUsers(result.data);
        setError('');
      } else {
        setError(result.message || 'Failed to fetch users');
        setUsers([]);
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString();
  };

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await apiService.createUser(createForm);
      if (result.success) {
        setUsers([result.data, ...users]);
        setCreateForm({ username: '', email: '', password: '', role: 'user' });
        setShowCreateForm(false);
        setSuccessMessage('User created successfully!');
      } else {
        setError(result.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const userId = selectedUser._id || selectedUser.id;
      const result = await apiService.deleteUser(userId, deleteReason || 'manual_deletion');
      if (result.success) {
        setUsers(users.filter(user => (user._id || user.id) !== userId));
        setShowDeleteModal(false);
        setSelectedUser(null);
        setDeleteReason('');
        setSuccessMessage('User deleted successfully!');
      } else {
        setError(result.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Change user role
  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const userId = selectedUser._id || selectedUser.id;
      const result = await apiService.changeUserRole(userId, newRole, 'manual_change');
      if (result.success) {
        setUsers(users.map(user => 
          (user._id || user.id) === userId
            ? { ...user, role: newRole }
            : user
        ));
        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole('');
        setSuccessMessage(`User role changed to ${newRole} successfully!`);
      } else {
        setError(result.message || 'Failed to change user role');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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

  if (loading && users.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #000000 100%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading users...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '0.5rem' 
          }}>
            User Management
          </h1>
          <p style={{ 
            color: '#9ca3af', 
            marginTop: '0.5rem',
            fontSize: '1rem'
          }}>
            {error && error.includes('permission') 
              ? 'Access restricted to administrators only' 
              : 'Manage system users and their permissions'
            }
          </p>
        </div>
        {!error && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={fetchUsers}
              style={{
                padding: '0.5rem 1rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Refresh
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: 'scale(1)',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25)'
              }}
            >
              {showCreateForm ? 'Cancel' : 'Create User'}
            </button>
          </div>
        )}
      </div>

      {/* Create User Form - Only show if user has permission */}
      {showCreateForm && !error && (
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: 'white', 
            marginBottom: '1rem' 
          }}>
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
                  color: '#d1d5db',
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
                    padding: '0.75rem 1rem',
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
                  color: '#d1d5db',
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
                    padding: '0.75rem 1rem',
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
                  color: '#d1d5db',
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
                    padding: '0.75rem 1rem',
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
                  color: '#d1d5db',
                  marginBottom: '0.5rem'
                }}>
                  Role
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(55, 65, 81, 0.5)',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#4b5563',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
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
                  fontSize: '0.875rem',
                  fontWeight: '500',
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

      {/* Users Table - Only show if user has permission */}
      {!error && (
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1rem',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '1.5rem', 
            borderBottom: '1px solid rgba(75, 85, 99, 0.3)' 
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'white',
              marginBottom: '0.25rem'
            }}>
              All Users
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Total users: {users.length}
            </p>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(55, 65, 81, 0.3)' }}>
                <tr>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Username
                  </th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Email
                  </th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Role
                  </th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Last Login
                  </th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Created
                  </th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid rgba(55, 65, 81, 0.3)' }}>
                {users.map((user) => (
                  <tr key={user._id || user.id} style={{ 
                    borderBottom: '1px solid rgba(55, 65, 81, 0.3)',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      fontSize: '0.875rem', 
                      color: 'white', 
                      fontWeight: '500' 
                    }}>
                      {user.username}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      fontSize: '0.875rem', 
                      color: '#d1d5db' 
                    }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '9999px',
                        ...(user.role === 'admin' 
                          ? { 
                              background: 'rgba(139, 92, 246, 0.2)', 
                              color: '#a78bfa', 
                              border: '1px solid rgba(139, 92, 246, 0.3)' 
                            }
                          : { 
                              background: 'rgba(59, 130, 246, 0.2)', 
                              color: '#60a5fa', 
                              border: '1px solid rgba(59, 130, 246, 0.3)' 
                            }
                        )
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '9999px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        Active
                      </span>
                    </td>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      fontSize: '0.875rem', 
                      color: '#d1d5db' 
                    }}>
                      {formatTimestamp(user.lastLogin)}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      fontSize: '0.875rem', 
                      color: '#d1d5db' 
                    }}>
                      {formatTimestamp(user.createdAt)}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      fontSize: '0.875rem', 
                      color: '#d1d5db' 
                    }}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={() => openRoleModal(user)}
                          style={{
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          title="Change Role"
                        >
                          Role
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          title="Delete User"
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
      )}

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
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '1rem' 
            }}>
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
                color: '#d1d5db',
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
                  padding: '0.75rem 1rem',
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
                  background: '#4b5563',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
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
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
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
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '1rem' 
            }}>
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
                color: '#d1d5db',
                marginBottom: '0.5rem'
              }}>
                New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
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
                  background: '#4b5563',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
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
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
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
