import api from './api.js';
export const getSchemes = async (params = {}) => {
  const response = await api.get('/schemes', { params });
  return response.data;
};
export const getSchemeById = async (id) => {
  const response = await api.get(`/schemes/${id}`);
  return response.data;
};
export const createScheme = async (data) => {
  const response = await api.post('/schemes', data);
  return response.data;
};
export const updateScheme = async (id, data) => {
  const response = await api.put(`/schemes/${id}`, data);
  return response.data;
};
export const deleteScheme = async (id) => {
  const response = await api.delete(`/schemes/${id}`);
  return response.data;
};