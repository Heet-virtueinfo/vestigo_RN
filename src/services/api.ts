import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from './endpoints';

const api = axios.create({
  baseURL: `${ENDPOINTS.BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${api.defaults.baseURL}${ENDPOINTS.AUTH.REFRESH}`,
            {
              refresh: refreshToken,
            },
            {
              headers: {
                'ngrok-skip-browser-warning': 'true',
              },
            },
          );
          if (response.status === 200) {
            await AsyncStorage.setItem('access_token', response.data.access);
            api.defaults.headers.common[
              'Authorization'
            ] = `Bearer ${response.data.access}`;
            return api(originalRequest);
          }
        }
      } catch (e) {
        console.error('Token refresh failed', e);
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
