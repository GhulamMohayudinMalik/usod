import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [newRole, setNewRole] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // Dummy users data
  const dummyUsers = [
    {
      _id: 1,
      username: 'admin',
      email: 'admin@usod.com',
      role: 'admin',
      status: 'active',
      lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
    },
    {
      _id: 2,
      username: 'user1',
      email: 'user1@usod.com',
      role: 'user',
      status: 'active',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
    },
    {
      _id: 3,
      username: 'user2',
      email: 'user2@usod.com',
      role: 'user',
      status: 'active',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
    },
    {
      _id: 4,
      username: 'user3',
      email: 'user3@usod.com',
      role: 'user',
      status: 'active',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    },
    {
      _id: 5,
      username: 'moderator',
      email: 'moderator@usod.com',
      role: 'admin',
      status: 'active',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString()
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setUsers(dummyUsers);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchUsers();
      setRefreshing(false);
    }, 1500);
  };

  const handleCreateUser = async () => {
    if (!createForm.username || !createForm.email || !createForm.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Simulate API call
      setTimeout(() => {
        const newUser = {
          _id: Date.now(),
          username: createForm.username,
          email: createForm.email,
          role: createForm.role,
          status: 'active',
          lastLogin: null,
          createdAt: new Date().toISOString()
        };
        
        setUsers([newUser, ...users]);
        setCreateForm({ username: '', email: '', password: '', role: 'user' });
        setShowCreateForm(false);
        setSuccessMessage('User created successfully!');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Simulate API call
      setTimeout(() => {
        setUsers(users.filter(user => user._id !== selectedUser._id));
        setShowDeleteModal(false);
        setSelectedUser(null);
        setDeleteReason('');
        setSuccessMessage('User deleted successfully!');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Simulate API call
      setTimeout(() => {
        setUsers(users.map(user => 
          user._id === selectedUser._id
            ? { ...user, role: newRole }
            : user
        ));
        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole('');
        setSuccessMessage(`User role changed to ${newRole} successfully!`);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#7C3AED';
      case 'user': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getRoleBgColor = (role) => {
    switch (role) {
      case 'admin': return 'rgba(124, 58, 237, 0.1)';
      case 'user': return 'rgba(59, 130, 246, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>Manage system users and their permissions</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateForm(true)}
          >
            <Text style={styles.createButtonText}>+ Create User</Text>
          </TouchableOpacity>
        </View>

        {/* Success/Error Messages */}
        {successMessage ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Users List */}
        <View style={styles.usersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Users</Text>
            <Text style={styles.userCount}>Total users: {users.length}</Text>
          </View>
          
          {users.map((user) => (
            <View key={user._id} style={[styles.userCard, { backgroundColor: getRoleBgColor(user.role) }]}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{user.username}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                  <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.userDetails}>
                <View style={styles.userDetailItem}>
                  <Text style={styles.userDetailLabel}>Status:</Text>
                  <Text style={[styles.userDetailValue, { color: '#10B981' }]}>Active</Text>
                </View>
                <View style={styles.userDetailItem}>
                  <Text style={styles.userDetailLabel}>Last Login:</Text>
                  <Text style={styles.userDetailValue}>{formatDate(user.lastLogin)}</Text>
                </View>
                <View style={styles.userDetailItem}>
                  <Text style={styles.userDetailLabel}>Created:</Text>
                  <Text style={styles.userDetailValue}>{formatDate(user.createdAt)}</Text>
                </View>
              </View>
              
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.roleButton}
                  onPress={() => openRoleModal(user)}
                >
                  <Text style={styles.roleButtonText}>Change Role</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => openDeleteModal(user)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Create User Modal */}
      <Modal
        visible={showCreateForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New User</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Username</Text>
              <TextInput
                style={styles.formInput}
                value={createForm.username}
                onChangeText={(text) => setCreateForm({...createForm, username: text})}
                placeholder="Enter username"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.formInput}
                value={createForm.email}
                onChangeText={(text) => setCreateForm({...createForm, email: text})}
                placeholder="Enter email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Password</Text>
              <TextInput
                style={styles.formInput}
                value={createForm.password}
                onChangeText={(text) => setCreateForm({...createForm, password: text})}
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Role</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    createForm.role === 'user' && styles.roleOptionActive
                  ]}
                  onPress={() => setCreateForm({...createForm, role: 'user'})}
                >
                  <Text style={[
                    styles.roleOptionText,
                    createForm.role === 'user' && styles.roleOptionTextActive
                  ]}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    createForm.role === 'admin' && styles.roleOptionActive
                  ]}
                  onPress={() => setCreateForm({...createForm, role: 'admin'})}
                >
                  <Text style={[
                    styles.roleOptionText,
                    createForm.role === 'admin' && styles.roleOptionTextActive
                  ]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateUser}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Creating...' : 'Create User'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete User</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete user <Text style={styles.boldText}>{selectedUser?.username}</Text>? 
              This action cannot be undone.
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Reason for deletion (optional)</Text>
              <TextInput
                style={styles.formInput}
                value={deleteReason}
                onChangeText={setDeleteReason}
                placeholder="Enter reason for deletion"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                  setDeleteReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={handleDeleteUser}
                disabled={loading}
              >
                <Text style={styles.deleteConfirmButtonText}>
                  {loading ? 'Deleting...' : 'Delete User'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change User Role</Text>
            <Text style={styles.modalMessage}>
              Change role for user <Text style={styles.boldText}>{selectedUser?.username}</Text>
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>New Role</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    newRole === 'user' && styles.roleOptionActive
                  ]}
                  onPress={() => setNewRole('user')}
                >
                  <Text style={[
                    styles.roleOptionText,
                    newRole === 'user' && styles.roleOptionTextActive
                  ]}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    newRole === 'admin' && styles.roleOptionActive
                  ]}
                  onPress={() => setNewRole('admin')}
                >
                  <Text style={[
                    styles.roleOptionText,
                    newRole === 'admin' && styles.roleOptionTextActive
                  ]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleChangeRole}
                disabled={loading || newRole === selectedUser?.role}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Changing...' : 'Change Role'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  usersSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userCount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  userCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    marginBottom: 12,
  },
  userDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userDetailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  userDetailValue: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  roleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  roleOptionText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
  },
  roleOptionTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteConfirmButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  deleteConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UsersScreen;