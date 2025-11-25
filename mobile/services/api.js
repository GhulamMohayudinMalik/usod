import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseURL } from '../utils/networkConfig';

// API Configuration
let API_BASE_URL = getApiBaseURL();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.initializeToken();
    this.initializeNetwork();
  }

  // Ensure token is loaded before making API calls
  async ensureTokenLoaded() {
    if (!this.token) {
      await this.initializeToken();
    }
  }

  // Initialize network configuration
  async initializeNetwork() {
    // Network configuration is handled by getApiBaseURL()
    this.baseURL = getApiBaseURL();
  }

  // Initialize token from AsyncStorage
  async initializeToken() {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        this.token = storedToken;
      }
    } catch (error) {
      console.error('Error initializing token:', error);
    }
  }

  // Helper method to get headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-Platform': 'mobile',
      'x-platform': 'mobile' // Also send lowercase version for compatibility
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorData = { message: `Network error: HTTP ${response.status}` };
      }
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    try {
      return await response.json();
    } catch (parseError) {
      console.error('Failed to parse success response:', parseError);
      throw new Error('Invalid response format');
    }
  }

  // Authentication methods
  async login(username, password) {
    try {
      const headers = this.getHeaders();
      
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, password })
      });

      const data = await this.handleResponse(response);
      
      if (data.token) {
        this.token = data.token;
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('sessionId', data.sessionId);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      if (this.token) {
        await fetch(`${this.baseURL}/api/auth/logout`, {
          method: 'POST',
          headers: this.getHeaders()
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('sessionId');
    }
  }

  async refreshToken() {
    try {
      if (!this.token) {
        throw new Error('No token to refresh');
      }

      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse(response);
      
      if (data.token) {
        this.token = data.token;
        await AsyncStorage.setItem('token', data.token);
      }

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear the token
      await this.logout();
      throw error;
    }
  }

  async checkSession() {
    try {
      if (!this.token) {
        return { valid: false };
      }

      const response = await fetch(`${this.baseURL}/api/auth/session-status`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Session check error:', error);
      return { valid: false };
    }
  }

  // Data fetching methods
  async getDashboardStats() {
    try {
      const response = await fetch(`${this.baseURL}/api/data/dashboard-stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getSecurityEvents(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseURL}/api/data/security-events?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching security events:', error);
      throw error;
    }
  }

  async getLoginAttempts(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseURL}/api/data/login-attempts?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching login attempts:', error);
      throw error;
    }
  }

  // Log methods
  async getLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);

      const response = await fetch(`${this.baseURL}/api/logs?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }

  async getLogStatistics() {
    try {
      const response = await fetch(`${this.baseURL}/api/logs/statistics`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching log statistics:', error);
      throw error;
    }
  }

  async createLog(logData) {
    try {
      const response = await fetch(`${this.baseURL}/api/logs`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...logData,
          deviceInfo: {
            platform: 'mobile',
            userAgent: 'React Native Mobile App',
            timestamp: new Date().toISOString()
          }
        })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating log:', error);
      throw error;
    }
  }

  // User management methods
  async getUsers() {
    try {
      const response = await fetch(`${this.baseURL}/api/users/users`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const response = await fetch(`${this.baseURL}/api/users/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${this.baseURL}/api/users/users/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async changeUserRole(userId, newRole, reason = 'manual_change') {
    try {
      const response = await fetch(`${this.baseURL}/api/users/users/${userId}/role`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ newRole, reason })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error changing user role:', error);
      throw error;
    }
  }

  async deleteUser(userId, reason = 'manual_deletion') {
    try {
      const response = await fetch(`${this.baseURL}/api/users/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Security management methods
  async getSecurityStats() {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/security/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching security stats:', error);
      throw error;
    }
  }

  async getBlockedIPs() {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/security/blocked-ips`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching blocked IPs:', error);
      throw error;
    }
  }

  async blockIP(ip, reason = 'manual_block') {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/security/block-ip`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ ip, reason })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error blocking IP:', error);
      throw error;
    }
  }

  async unblockIP(ip, reason = 'manual_unblock') {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/security/unblock-ip`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ ip, reason })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error unblocking IP:', error);
      throw error;
    }
  }

  async clearLogs() {
    try {
      const response = await fetch(`${this.baseURL}/api/logs/clear`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({})
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error clearing logs:', error);
      throw error;
    }
  }

  // Backup management methods
  async getBackups() {
    try {
      const response = await fetch(`${this.baseURL}/api/backup/list`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching backups:', error);
      throw error;
    }
  }

  async getBackupStats() {
    try {
      const response = await fetch(`${this.baseURL}/api/backup/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching backup stats:', error);
      throw error;
    }
  }

  async createBackup(type = 'full', reason = 'manual') {
    try {
      const endpoint = type === 'full' ? '/api/backup/full' : 
                      type === 'security_logs' ? '/api/backup/security-logs' :
                      type === 'users' ? '/api/backup/users' : '/api/backup/full';
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  async restoreBackup(backupName, restoreScope = 'full', reason = 'manual') {
    try {
      const response = await fetch(`${this.baseURL}/api/backup/restore/${backupName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason, restoreScope })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  async cleanupBackups() {
    try {
      const response = await fetch(`${this.baseURL}/api/backup/cleanup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({})
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error cleaning up backups:', error);
      throw error;
    }
  }

  // Change password method
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await fetch(`${this.baseURL}/api/users/change-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Settings management methods
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${this.baseURL}/api/users/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async updateSettings(settingData) {
    try {
      const response = await fetch(`${this.baseURL}/api/users/settings`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(settingData)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }


  // Network monitoring methods
  async startNetworkMonitoring(networkInterface = 'auto', duration = 300) {
    try {
      const response = await fetch(`${this.baseURL}/api/network/start-monitoring`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ interface: networkInterface, duration })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error starting network monitoring:', error);
      throw error;
    }
  }

  async stopNetworkMonitoring() {
    try {
      const response = await fetch(`${this.baseURL}/api/network/stop-monitoring`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({})
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error stopping network monitoring:', error);
      throw error;
    }
  }

  async getNetworkThreats(limit = 50) {
    try {
      const response = await fetch(`${this.baseURL}/api/network/threats/history?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching network threats:', error);
      throw error;
    }
  }

  async getNetworkStatus() {
    try {
      const response = await fetch(`${this.baseURL}/api/network/status`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching network status:', error);
      throw error;
    }
  }

  async uploadPcapFile(file) {
    try {
      const formData = new FormData();
      formData.append('pcap', {
        uri: file.uri,
        type: 'application/octet-stream',
        name: file.name
      });

      const headers = this.getHeaders();
      delete headers['Content-Type']; // Let the browser set the correct Content-Type for FormData

      const response = await fetch(`${this.baseURL}/api/network/upload-pcap`, {
        method: 'POST',
        headers: headers,
        body: formData
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error uploading PCAP file:', error);
      throw error;
    }
  }

  async updateLogStatus(logId, status) {
    try {
      const response = await fetch(`${this.baseURL}/api/logs/${logId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating log status:', error);
      throw error;
    }
  }

  async getThreats(count = 100) {
    try {
      const response = await fetch(`${this.baseURL}/api/data/security-events?count=${count}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching threats:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get current user from AsyncStorage
  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // ============================================
  // Blockchain Methods
  // ============================================

  async getBlockchainStatistics() {
    try {
      const response = await fetch(`${this.baseURL}/api/blockchain/statistics`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching blockchain statistics:', error);
      return { success: false, message: error.message };
    }
  }

  async getBlockchainThreats() {
    try {
      const response = await fetch(`${this.baseURL}/api/blockchain/threats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching blockchain threats:', error);
      return { success: false, message: error.message };
    }
  }

  async verifyBlockchainThreat(logId) {
    try {
      const response = await fetch(`${this.baseURL}/api/blockchain/threats/${logId}/verify`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error verifying blockchain threat:', error);
      return { error: error.message };
    }
  }

  async getBlockchainThreatHistory(logId) {
    try {
      const response = await fetch(`${this.baseURL}/api/blockchain/threats/${logId}/history`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching threat history:', error);
      return [];
    }
  }

  // Generic HTTP methods
  async get(endpoint) {
    try {
      await this.ensureTokenLoaded();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error in GET ${endpoint}:`, error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      await this.ensureTokenLoaded();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error in POST ${endpoint}:`, error);
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      await this.ensureTokenLoaded();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error in PUT ${endpoint}:`, error);
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      await this.ensureTokenLoaded();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error in DELETE ${endpoint}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
