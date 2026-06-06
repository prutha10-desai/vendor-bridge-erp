import api from './client';

export const quotationsApi = {
  create: (data) => api.post('/quotations', data),
  get: (id) => api.get(`/quotations/${id}`),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  submit: (id) => api.patch(`/quotations/${id}/submit`),
  listByRfq: (rfqId) => api.get(`/quotations/rfq/${rfqId}`),
  compare: (rfqId, sortBy) => api.get(`/quotations/rfq/${rfqId}/compare`, { params: { sortBy } }),
  initiateApproval: (quotationId) => api.post('/quotations/approval/initiate', { quotationId }),
  approve: (id, remarks) => api.patch(`/quotations/${id}/approve`, { remarks }),
  reject: (id, remarks) => api.patch(`/quotations/${id}/reject`, { remarks }),
};
