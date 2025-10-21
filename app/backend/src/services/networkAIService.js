import axios from 'axios';

class NetworkAIService {
  constructor() {
    this.pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';
    this.isMonitoring = false;
    this.monitoringInterface = null;
    this.monitoringDuration = null;
  }

  /**
   * Start network monitoring via Python AI service
   * @param {string} networkInterface - Network interface to monitor (default: 'auto')
   * @param {number} duration - Monitoring duration in seconds (default: 300)
   * @returns {Promise<Object>} Response from Python service
   */
  async startNetworkMonitoring(networkInterface = 'auto', duration = 300) {
    try {
      console.log(`🚀 Starting network monitoring on interface: ${networkInterface}, duration: ${duration}s`);
      
      const response = await axios.post(`${this.pythonServiceUrl}/api/start-capture`, {
        interface: networkInterface,
        duration
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'started') {
        this.isMonitoring = true;
        this.monitoringInterface = networkInterface;
        this.monitoringDuration = duration;
        console.log('✅ Network monitoring started successfully');
      }

      return {
        success: true,
        message: 'Network monitoring started',
        data: response.data
      };
    } catch (error) {
      console.error('❌ Failed to start network monitoring:');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error:', error);
      
      // Handle specific error cases
      if (error.response && error.response.status === 400) {
        if (error.response.data.detail === "Monitoring is already active") {
          return {
            success: true,
            message: 'Monitoring is already active',
            data: { status: 'already_active' }
          };
        }
      }
      
      // Return detailed error information
      const errorDetail = error.response?.data?.detail || error.response?.data?.message || error.message || 'Unknown error';
      
      return {
        success: false,
        message: 'Failed to start network monitoring',
        error: errorDetail
      };
    }
  }

  /**
   * Stop network monitoring via Python AI service
   * @returns {Promise<Object>} Response from Python service
   */
  async stopNetworkMonitoring() {
    try {
      console.log('🛑 Stopping network monitoring...');
      
      const response = await axios.post(`${this.pythonServiceUrl}/api/stop-capture`, {}, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'stopped') {
        this.isMonitoring = false;
        this.monitoringInterface = null;
        this.monitoringDuration = null;
        console.log('✅ Network monitoring stopped successfully');
      }

      return {
        success: true,
        message: 'Network monitoring stopped',
        data: response.data
      };
    } catch (error) {
      console.error('❌ Failed to stop network monitoring:', error.message);
      
      // Handle specific error cases
      if (error.response && error.response.status === 400) {
        if (error.response.data.detail === "Monitoring is not active") {
          // Monitoring wasn't active on Python side, but that's okay
          // Just update our local state
          this.isMonitoring = false;
          this.monitoringInterface = null;
          this.monitoringDuration = null;
          console.log('⚠️ Monitoring was not active on Python service, state synchronized');
          return {
            success: true,
            message: 'Monitoring already stopped',
            data: { status: 'already_stopped' }
          };
        }
      }
      
      return {
        success: false,
        message: 'Failed to stop network monitoring',
        error: error.message
      };
    }
  }

  /**
   * Get detected network threats from Python AI service
   * @param {number} limit - Maximum number of threats to return (default: 50)
   * @returns {Promise<Object>} List of detected threats
   */
  async getNetworkThreats(limit = 50) {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/api/get-threats`, {
        params: { limit },
        timeout: 10000
      });

      return {
        success: true,
        threats: response.data.threats || [],
        count: response.data.count || 0,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Failed to get network threats:', error.message);
      return {
        success: false,
        threats: [],
        count: 0,
        error: error.message
      };
    }
  }

  /**
   * Get model statistics from Python AI service
   * @returns {Promise<Object>} Model performance statistics
   */
  async getModelStatistics() {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/api/model-stats`, {
        timeout: 10000
      });

      return {
        success: true,
        statistics: response.data,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Failed to get model statistics:', error.message);
      return {
        success: false,
        statistics: null,
        error: error.message
      };
    }
  }

  /**
   * Upload and analyze PCAP file via Python AI service
   * @param {string} filePath - Path to the PCAP file
   * @returns {Promise<Object>} Analysis results
   */
  async analyzePCAPFile(filePath) {
    try {
      console.log(`📁 Analyzing PCAP file: ${filePath}`);
      
      const response = await axios.post(`${this.pythonServiceUrl}/api/analyze-pcap`, {
        file_path: filePath
      }, {
        timeout: 30000, // 30 second timeout for file analysis
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Python service response:`, response.data);

      return {
        success: true,
        message: 'PCAP file analyzed successfully',
        analysis: response.data,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Failed to analyze PCAP file:');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorDetail = error.response?.data?.detail || error.response?.data?.message || error.message || 'Unknown error';
      
      return {
        success: false,
        message: 'Failed to analyze PCAP file',
        error: errorDetail
      };
    }
  }

  /**
   * Check health status of Python AI service
   * @returns {Promise<Object>} Health status
   */
  async checkServiceHealth() {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/health`, {
        timeout: 5000
      });

      return {
        success: true,
        healthy: true,
        status: response.data,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Python AI service health check failed:', error.message);
      return {
        success: false,
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Get current monitoring status
   * @returns {Object} Current monitoring state
   */
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      interface: this.monitoringInterface,
      duration: this.monitoringDuration,
      serviceUrl: this.pythonServiceUrl
    };
  }

  /**
   * Test connection to Python AI service
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      const healthCheck = await this.checkServiceHealth();
      const modelStats = await this.getModelStatistics();
      
      return {
        success: true,
        message: 'Connection to Python AI service successful',
        health: healthCheck,
        models: modelStats,
        serviceUrl: this.pythonServiceUrl
      };
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return {
        success: false,
        message: 'Connection to Python AI service failed',
        error: error.message
      };
    }
  }
}

// Create singleton instance
const networkAIService = new NetworkAIService();

export default networkAIService;
