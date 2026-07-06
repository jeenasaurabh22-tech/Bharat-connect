import api from './api.js';
export const getMyApplications = async () => {
  const response = await api.get('/applications/my');
  return response.data;
};
export const submitApplication = async (schemeId) => {
  const response = await api.post('/applications', { schemeId });
  return response.data;
};
export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};