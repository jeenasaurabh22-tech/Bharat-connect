import axios from 'axios';
import useAuthStore from '../store/useAuthStore.js';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh-token') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = refreshResponse.data;
        useAuthStore.getState().setAccessToken(accessToken);
        processQueue(null, accessToken);
        isRefreshing = false;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
export default api;