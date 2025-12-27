// Network Configuration Utility
import { Platform } from 'react-native';

// =============================================================================
// API CONFIGURATION
// =============================================================================
// Production API URL - used in production builds and when testing against remote
const PRODUCTION_API_URL = 'https://api.glitchmorse.tech';

// Local development URLs - uncomment ONE to use local backend
// const LOCAL_API_URL = 'http://192.168.100.113:5000'; // Your LAN IP
const LOCAL_API_URL = 'http://192.168.100.120:5000'; // Your LAN IP
// const LOCAL_API_URL = 'http://192.168.43.8:5000';    // Hotspot IP
// const LOCAL_API_URL = 'http://10.10.80.158:5000';    // Alternative IP
// const LOCAL_API_URL = 'http://localhost:5000';       // Android emulator (use 10.0.2.2)

// Set to true to use local backend in development, false to use production
const USE_LOCAL_IN_DEV = false;
// =============================================================================

export const getApiBaseURL = () => {
  if (__DEV__ && USE_LOCAL_IN_DEV && typeof LOCAL_API_URL !== 'undefined') {
    // Use local backend for development testing
    console.log('📡 Using LOCAL API:', LOCAL_API_URL);
    return LOCAL_API_URL;
  } else {
    // Use production API
    console.log('🌐 Using PRODUCTION API:', PRODUCTION_API_URL);
    return PRODUCTION_API_URL;
  }
};

// Export the production URL for reference
export const PRODUCTION_URL = PRODUCTION_API_URL;


