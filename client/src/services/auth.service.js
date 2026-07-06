import api from './api.js';
export const loginUser = async (email, password, role = 'citizen') => {
  const response = await api.post('/auth/login', { email, password, role });
  return response.data;
};
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};
export const verifyEmailOTP = async (email, otp, role = 'citizen') => {
  const response = await api.post('/auth/verify-email', { email, otp, role });
  return response.data;
};
export const requestPasswordReset = async (email, role = 'citizen') => {
  const response = await api.post('/auth/forgot-password', { email, role });
  return response.data;
};
export const resetPasswordWithOTP = async (email, otp, newPassword, role = 'citizen') => {
  const response = await api.post('/auth/reset-password', { email, otp, newPassword, role });
  return response.data;
};
export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};