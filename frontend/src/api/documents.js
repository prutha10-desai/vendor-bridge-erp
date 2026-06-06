import api from './client';

export const documentsApi = {
  listPOs: () => api.get('/documents/purchase-orders'),
  getPO: (id) => api.get(`/documents/purchase-orders/${id}`),
  generatePO: (quotationId, taxRate) =>
    api.post('/documents/purchase-orders', { quotationId, taxRate }),
  updatePOStatus: (id, status) => api.patch(`/documents/purchase-orders/${id}/status`, { status }),
  listInvoices: () => api.get('/documents/invoices'),
  getInvoice: (id) => api.get(`/documents/invoices/${id}`),
  generateInvoice: (purchaseOrderId) => api.post('/documents/invoices', { purchaseOrderId }),
  updateInvoiceStatus: (id, status) => api.patch(`/documents/invoices/${id}/status`, { status }),
  downloadInvoice: (id) =>
    api.get(`/documents/invoices/${id}/download`, { responseType: 'blob' }),
  printInvoice: (id) => api.get(`/documents/invoices/${id}/print`, { responseType: 'blob' }),
  emailInvoice: (id, email) => api.post(`/documents/invoices/${id}/email`, { email }),
};
