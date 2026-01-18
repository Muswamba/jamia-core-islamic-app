import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * API Configuration
 * 
 * Set EXPO_PUBLIC_API_URL (or EXPO_PUBLIC_API_BASE_URL for legacy) in .env or app.config.js
 * Format: http://192.168.1.6:8002 (no trailing /api)
 * 
 * Fallback behavior:
 * - iOS Simulator: localhost:8002
 * - Android Emulator: 10.0.2.2:8002
 * - Physical device (Expo Go): Requires EXPO_PUBLIC_API_BASE_URL
 */

const getApiBaseUrl = (): string => {
  // Check for environment variable first
  const envApiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl;
  
  if (envApiUrl) {
    return `${envApiUrl}/api`;
  }

  // Fallback for development
  if (__DEV__) {
    const isExpoGo = Constants.appOwnership === 'expo';
    const API_PORT = '8002';

    if (Platform.OS === 'android') {
      return isExpoGo
        ? `http://10.0.2.2:${API_PORT}/api` // May not work on physical device
        : `http://10.0.2.2:${API_PORT}/api`;
    } else if (Platform.OS === 'ios') {
      return `http://localhost:${API_PORT}/api`;
    } else {
      return `http://localhost:${API_PORT}/api`;
    }
  }

  // Production - must be set via environment
  return 'https://api.example.com/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_V1_BASE_URL = `${API_BASE_URL}/v1`;
export const API_TIMEOUT = 30000; // 30 seconds

// Log API URL in development for debugging
if (__DEV__) {
  console.log('[API Config] Base URL:', API_BASE_URL);
}
