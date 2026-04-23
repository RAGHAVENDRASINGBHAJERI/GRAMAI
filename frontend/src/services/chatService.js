import api from './api';

export const chatService = {
  sendQuery: (data) => api.post('/chat', data),

  getHistory: (params) => api.get('/chat/history', { params }),

  toggleSave: (id) => api.patch(`/chat/${id}/save`),

  deleteQuery: (id) => api.delete(`/chat/${id}`),
};
