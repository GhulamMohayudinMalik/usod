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
        ...options.headers
      };

      // Add CSRF token for POST/PUT/DELETE requests
      if (this.csrfToken && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
        headers['X-CSRF-Token'] = this.csrfToken;
      }

      const response = await fetch(url, {
        headers,
        ...options
      });
      
      console.log('Response status:', response.status);
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
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
