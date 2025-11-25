// Network Configuration Utility
import { Platform } from 'react-native';

export const getApiBaseURL = () => {
  if (__DEV__) {
    // For development - use your computer's IP address for mobile testing
    return 'http://192.168.100.113:5000';
    // return 'http://192.168.43.8:5000';
  } else {
    // In production, use your actual server URL
    return 'https://your-production-server.com';
  }
};

