import api from './client';

export const rfqsApi = {
  list: (params) => api.get('/rfqs', { params }),
  get: (id) => api.get(`/rfqs/${id}`),
  create: (data) => api.post('/rfqs', data),
  update: (id, data) => api.put(`/rfqs/${id}`, data),
  publish: (id) => api.patch(`/rfqs/${id}/publish`),
  close: (id) => api.patch(`/rfqs/${id}/close`),
};
