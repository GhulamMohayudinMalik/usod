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
      'X-Platform': 'mobile'
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
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
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

  async getSecurityEvents() {
    try {
      const response = await fetch(`${this.baseURL}/api/data/security-events`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching security events:', error);
      throw error;
    }
  }

  async getLoginAttempts() {
    try {
      const response = await fetch(`${this.baseURL}/api/data/login-attempts`, {
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
      const response = await fetch(`${this.baseURL}/api/users`, {
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
      const response = await fetch(`${this.baseURL}/api/users`, {
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
      const response = await fetch(`${this.baseURL}/api/users/${userId}`, {
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

  async deleteUser(userId) {
    try {
      const response = await fetch(`${this.baseURL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Backup methods
  async createBackup() {
    try {
      const response = await fetch(`${this.baseURL}/api/backup/create`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

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

  async restoreBackup(backupId) {
    try {
      const response = await fetch(`${this.baseURL}/api/backup/restore/${backupId}`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error restoring backup:', error);
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
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
