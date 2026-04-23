import api from './api';

export const authService = {
  register: (userData) => api.post('/auth/register', userData),

  login: (credentials) => api.post('/auth/login', credentials),

  logout: () => api.post('/auth/logout'),

  refreshToken: () => api.post('/auth/refresh'),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (profileData) => api.patch('/auth/profile', profileData),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};
