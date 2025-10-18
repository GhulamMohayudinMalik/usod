// API Service for Desktop App
// Step 1: Basic file structure

const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.csrfToken = null;
    console.log('API Service initialized with base URL:', this.baseURL);
  }

  // Test method to verify the service is working
  test() {
    console.log('API Service test method called');
    return 'API Service is working';
  }

  // Get CSRF token
  async getCSRFToken() {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/csrf-token`, {
        method: 'GET',
        headers: {
          'X-Platform': 'desktop'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.csrfToken;
        console.log('CSRF token obtained');
        return this.csrfToken;
      }
    } catch (error) {
      console.log('Could not get CSRF token:', error.message);
    }
    return null;
  }

  // Basic fetch method
  async fetch(url, options = {}) {
    try {
      console.log('Fetching:', url, options);
      
      const headers = {
        'Content-Type': 'application/json',
        'X-Platform': 'desktop',
        'x-platform': 'desktop', // Also send lowercase version for compatibility
        ...options.headers
      };

      // Add Authorization header if token exists and not already provided
      const token = localStorage.getItem('authToken');
      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Add CSRF token for POST/PUT/DELETE requests
      if (this.csrfToken && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
        headers['X-CSRF-Token'] = this.csrfToken;
      }

      const response = await fetch(url, {
        headers,
        ...options
      });
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  // Test backend connection
  async testConnection() {
    try {
      console.log('Testing backend connection...');
      const response = await this.fetch(`${this.baseURL}/health`);
      
      if (response.ok) {
        console.log('✅ Backend connection successful');
        return { success: true, message: 'Backend is reachable' };
      } else {
        console.log('❌ Backend connection failed:', response.status);
        return { success: false, message: `Backend returned ${response.status}` };
      }
    } catch (error) {
      console.log('❌ Backend connection error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Login function
  async login(username, password) {
    try {
      console.log('Attempting login for user:', username);
      
      const response = await this.fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login successful');
        
        // Store token for future requests
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        console.log('❌ Login failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Login error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Logout function
  async logout() {
    try {
      console.log('Attempting logout...');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No token found, clearing local storage');
        localStorage.removeItem('authToken');
        return { success: true, message: 'Already logged out' };
      }
      
      const response = await this.fetch(`${this.baseURL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Clear token regardless of response
      localStorage.removeItem('authToken');
      
      if (response.ok) {
        console.log('✅ Logout successful');
        return { success: true, message: 'Logout successful' };
      } else {
        console.log('⚠️ Logout request failed but token cleared locally');
        return { success: true, message: 'Logout completed locally' };
      }
    } catch (error) {
      console.log('❌ Logout error:', error.message);
      // Clear token even if request fails
      localStorage.removeItem('authToken');
      return { success: true, message: 'Logout completed locally' };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Get session status and user info
  async getSessionStatus() {
    try {
      console.log('Checking session status...');
      const response = await this.fetch(`${this.baseURL}/api/auth/session-status`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Session status checked successfully');
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Session check failed' }));
        console.log('❌ Session check failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Session check error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Dashboard data functions
  async getDashboardStats() {
    try {
      console.log('Fetching dashboard stats...');
      const response = await this.fetch(`${this.baseURL}/api/data/dashboard-stats`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard stats fetched successfully');
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch dashboard stats' }));
        console.log('❌ Dashboard stats failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Dashboard stats error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async getSecurityEvents() {
    try {
      console.log('Fetching security events...');
      const response = await this.fetch(`${this.baseURL}/api/data/security-events`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Security events fetched successfully');
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch security events' }));
        console.log('❌ Security events failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Security events error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async getAllData() {
    try {
      console.log('Fetching all dashboard data...');
      const response = await this.fetch(`${this.baseURL}/api/data/all`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ All data fetched successfully');
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch all data' }));
        console.log('❌ All data failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ All data error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Threats/Logs functions
  async getThreats(count = 100) {
    try {
      console.log('Fetching threats...');
      const response = await this.fetch(`${this.baseURL}/api/data/security-events?count=${count}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Threats fetched successfully');
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch threats' }));
        console.log('❌ Threats failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Threats error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async getLogs(params = {}) {
    try {
      console.log('Fetching logs with params:', params);
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.action) queryParams.append('action', params.action);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.platform) queryParams.append('platform', params.platform);
      
      const url = `${this.baseURL}/api/logs?${queryParams.toString()}`;
      console.log('Requesting URL:', url);
      
      const response = await this.fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Logs fetched successfully:', data.logs?.length || 0, 'logs');
        console.log('Pagination:', data.pagination);
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch logs' }));
        console.log('❌ Logs failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Logs error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async getLoginAttempts(count = 50) {
    try {
      console.log('Fetching login attempts...');
      const response = await this.fetch(`${this.baseURL}/api/data/login-attempts?count=${count}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login attempts fetched successfully:', data.length, 'attempts');
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch login attempts' }));
        console.log('❌ Login attempts failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Login attempts error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async updateLogStatus(logId, status) {
    try {
      console.log('Updating log status...');
      const response = await this.fetch(`${this.baseURL}/api/logs/${logId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Log status updated successfully');
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update log status' }));
        console.log('❌ Log status update failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Log status update error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Security management methods
  async getSecurityStats() {
    try {
      console.log('Fetching security stats...');
      const response = await this.fetch(`${this.baseURL}/api/auth/security/stats`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Security stats fetched successfully');
        return { success: true, data: data.stats };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch security stats' }));
        console.log('❌ Security stats failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Security stats error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async getBlockedIPs() {
    try {
      console.log('Fetching blocked IPs...');
      const response = await this.fetch(`${this.baseURL}/api/auth/security/blocked-ips`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Blocked IPs fetched successfully');
        return { success: true, data: data.blockedIPs };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch blocked IPs' }));
        console.log('❌ Blocked IPs failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Blocked IPs error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async blockIP(ip, reason = 'manual_block') {
    try {
      console.log('Blocking IP:', ip);
      const response = await this.fetch(`${this.baseURL}/api/auth/security/block-ip`, {
        method: 'POST',
        body: JSON.stringify({ ip, reason })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ IP blocked successfully');
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to block IP' }));
        console.log('❌ Block IP failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Block IP error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async unblockIP(ip, reason = 'manual_unblock') {
    try {
      console.log('Unblocking IP:', ip);
      const response = await this.fetch(`${this.baseURL}/api/auth/security/unblock-ip`, {
        method: 'POST',
        body: JSON.stringify({ ip, reason })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ IP unblocked successfully');
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to unblock IP' }));
        console.log('❌ Unblock IP failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Unblock IP error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // User management methods
  async getUsers() {
    try {
      console.log('Fetching users...');
      const response = await this.fetch(`${this.baseURL}/api/users/users`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Users fetched successfully');
        return { success: true, data: data.users };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
        console.log('❌ Users fetch failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Users fetch error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async createUser(userData) {
    try {
      console.log('Creating user:', userData.username);
      const response = await this.fetch(`${this.baseURL}/api/users/create`, {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User created successfully');
        return { success: true, data: data.user };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create user' }));
        console.log('❌ User creation failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ User creation error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async deleteUser(userId, reason = 'manual_deletion') {
    try {
      console.log('Deleting user:', userId);
      const response = await this.fetch(`${this.baseURL}/api/users/users/${userId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User deleted successfully');
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete user' }));
        console.log('❌ User deletion failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ User deletion error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async changeUserRole(userId, newRole, reason = 'manual_change') {
    try {
      console.log('Changing user role:', userId, 'to', newRole);
      const response = await this.fetch(`${this.baseURL}/api/users/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ newRole, reason })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User role changed successfully');
        return { success: true, data: data.user };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to change user role' }));
        console.log('❌ User role change failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ User role change error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Backup management methods
  async getBackups() {
    try {
      console.log('Fetching backups...');
      const response = await this.fetch(`${this.baseURL}/api/backup/list`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backups fetched successfully');
        return { success: true, data: data.backups };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch backups' }));
        console.log('❌ Backups fetch failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Backups fetch error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async getBackupStats() {
    try {
      console.log('Fetching backup stats...');
      const response = await this.fetch(`${this.baseURL}/api/backup/stats`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backup stats fetched successfully');
        return { success: true, data: data.stats };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch backup stats' }));
        console.log('❌ Backup stats fetch failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Backup stats fetch error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async createBackup(backupType, reason = 'manual') {
    try {
      console.log('Creating backup:', backupType);
      let endpoint = '';
      
      switch (backupType) {
        case 'security_logs':
          endpoint = `${this.baseURL}/api/backup/security-logs`;
          break;
        case 'users':
          endpoint = `${this.baseURL}/api/backup/users`;
          break;
        case 'full':
          endpoint = `${this.baseURL}/api/backup/full`;
          break;
        default:
          throw new Error('Invalid backup type');
      }

      const response = await this.fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backup created successfully');
        return { success: true, data: data.backup };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create backup' }));
        console.log('❌ Backup creation failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Backup creation error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async restoreBackup(backupName, restoreScope = 'full', reason = 'manual_restore') {
    try {
      console.log('Restoring backup:', backupName);
      const response = await this.fetch(`${this.baseURL}/api/backup/restore/${backupName}`, {
        method: 'POST',
        body: JSON.stringify({ reason, restoreScope })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backup restored successfully');
        return { success: true, data: data.restore };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to restore backup' }));
        console.log('❌ Backup restore failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Backup restore error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async cleanupBackups() {
    try {
      console.log('Cleaning up old backups...');
      const response = await this.fetch(`${this.baseURL}/api/backup/cleanup`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backup cleanup completed successfully');
        return { success: true, data: { deletedCount: data.deletedCount } };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to cleanup backups' }));
        console.log('❌ Backup cleanup failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Backup cleanup error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // User profile management methods
  async changePassword(currentPassword, newPassword) {
    try {
      console.log('Changing password...');
      const response = await this.fetch(`${this.baseURL}/api/users/change-password`, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Password changed successfully');
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to change password' }));
        console.log('❌ Password change failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Password change error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async updateProfile(profileData) {
    try {
      console.log('Updating profile...');
      const response = await this.fetch(`${this.baseURL}/api/users/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile updated successfully');
        return { success: true, data: data.user };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
        console.log('❌ Profile update failed:', response.status, errorData.message);
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.log('❌ Profile update error:', error.message);
      return { success: false, message: error.message };
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
