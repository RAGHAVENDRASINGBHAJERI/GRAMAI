import api from './api';

export const adminService = {
  // Dashboard Stats
  getStats: () => api.get('/admin/stats'),

  // Users Management
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Queries Monitoring
  getQueries: (params) => api.get('/admin/queries', { params }),

  // Marketplace (Posts) Management
  getPosts: (params) => api.get('/admin/posts', { params }),
  updatePostStatus: (id, status) => api.patch(`/admin/posts/${id}/status`, { status }),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),

  // Schemes Management
  getSchemes: (params) => api.get('/admin/schemes', { params }),
  createScheme: (data) => api.post('/admin/schemes', data),
  updateScheme: (id, data) => api.put(`/admin/schemes/${id}`, data),
  deleteScheme: (id) => api.delete(`/admin/schemes/${id}`),
};
