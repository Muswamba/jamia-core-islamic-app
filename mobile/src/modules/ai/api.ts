import axios from 'axios';
import * as Device from 'expo-device';
import { API_V1_BASE_URL, API_TIMEOUT } from '../../config/api';

const api = axios.create({
  baseURL: API_V1_BASE_URL,
  timeout: API_TIMEOUT,
});

export interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
  };
  disclaimer: string;
  message?: string;
  blocked?: boolean;
}

export interface ExplainAyahResponse {
  success: boolean;
  data?: {
    response: string;
  };
  disclaimer: string;
  message?: string;
  blocked?: boolean;
}

const getDeviceId = (): string => {
  return Device.osBuildId || Device.osInternalBuildId || 'unknown-device';
};

export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  try {
    const response = await api.post('/ai/chat', {
      device_id: getDeviceId(),
      message,
    });

    return response.data;
  } catch (error: any) {
    console.error('Error sending chat message:', error);

    if (error.response?.status === 429) {
      return {
        success: false,
        message: error.response.data.message || 'Rate limit exceeded',
        disclaimer: 'This AI assistant is for educational purposes only.',
      };
    }

    return {
      success: false,
      message: 'Failed to get response. Please try again.',
      disclaimer: 'This AI assistant is for educational purposes only.',
    };
  }
};

export const explainAyah = async (
  surah: number,
  ayah: number,
  text: string
): Promise<ExplainAyahResponse> => {
  try {
    const response = await api.post('/ai/explain-ayah', {
      device_id: getDeviceId(),
      surah,
      ayah,
      text,
    });

    return response.data;
  } catch (error: any) {
    console.error('Error explaining ayah:', error);

    if (error.response?.status === 429) {
      return {
        success: false,
        message: error.response.data.message || 'Rate limit exceeded',
        disclaimer: 'This AI assistant is for educational purposes only.',
      };
    }

    return {
      success: false,
      message: 'Failed to get explanation. Please try again.',
      disclaimer: 'This AI assistant is for educational purposes only.',
    };
  }
};
