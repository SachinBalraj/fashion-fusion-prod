import api from './api';

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  duplicateProduct: (id) => api.post(`/admin/products/${id}/duplicate`),
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  getAllOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/deliver`, data),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomerById: (id) => api.get(`/admin/customers/${id}`),
  uploadImage: (formData) => api.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getShowcase: () => api.get('/admin/showcase'),
  setShowcaseSlotDetails: (slot, data) => api.put(`/admin/showcase/slots/${slot}`, data),
  setShowcaseSlotImage: (slot, formData) => api.put(`/admin/showcase/slots/${slot}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removeShowcaseSlotImage: (slot) => api.delete(`/admin/showcase/slots/${slot}/image`),
  setShowcaseSlotDescription: (slot, description) =>
    api.patch(`/admin/showcase/slots/${slot}/description`, { description }),
  getPayments: (params) => api.get('/admin/payments', { params }),
  getPaymentDetails: (orderId) => api.get(`/admin/payments/${orderId}`),
  refundPayment: (orderId, data) => api.post(`/admin/payments/${orderId}/refund`, data),
};
