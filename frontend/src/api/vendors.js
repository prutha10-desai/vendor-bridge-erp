import api from './client';

export const vendorsApi = {
  list: (params) => api.get('/vendors', { params }),
  get: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  updateStatus: (id, status) => api.patch(`/vendors/${id}/status`, { status }),
  delete: (id) => api.delete(`/vendors/${id}`),
  linkUser: (id, userId) => api.post(`/vendors/${id}/link-user`, { userId }),
};
