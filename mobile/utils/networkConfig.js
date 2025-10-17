// Network Configuration Utility
import { Platform } from 'react-native';

export const getApiBaseURL = () => {
  if (__DEV__) {
    // For development - update this IP to match your computer's IP address
    // You can find your IP by running: ipconfig (Windows) or ifconfig (Mac/Linux)
    return 'http://192.168.100.113:5000';
  } else {
    // In production, use your actual server URL
    return 'https://your-production-server.com';
  }
};

