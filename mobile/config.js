// Mobile App Configuration
const config = {
  // API Configuration
  api: {
    baseURL: __DEV__ 
      ? 'http://localhost:5000' // Development - use localhost for both platforms
      : 'http://localhost:5000', // Production
    timeout: 10000, // 10 seconds
  },

  // Platform Configuration
  platform: 'mobile',

  // Environment Configuration
  environment: __DEV__ ? 'development' : 'production',

  // Storage Keys
  storage: {
    token: 'token',
    user: 'user',
    sessionId: 'sessionId',
  },

  // App Configuration
  app: {
    name: 'USOD Mobile',
    version: '1.0.0',
  },

  // Network Configuration
  network: {
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Logging Configuration
  logging: {
    enabled: __DEV__,
    level: __DEV__ ? 'debug' : 'error',
  },
};

export default config;
