import api from './api.js';
export const getMyDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};
export const uploadDocument = async (formData) => {
  const response = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};