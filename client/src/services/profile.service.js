import api from './api.js';
export const getMyProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
export const updateMyProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};