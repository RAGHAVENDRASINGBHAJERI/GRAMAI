import api from './api';

export const communityService = {
  getPosts: (params) => api.get('/community/posts', { params }),
  
  createPost: (formData) => {
    // Axios handles multipart/form-data automatically when a FormData object is passed.
    // Setting it manually breaks the boundary string and can interfere with the auth interceptor.
    return api.post('/community/posts', formData);
  },
  
  updatePostStatus: (id, status) => api.patch(`/community/posts/${id}/status`, { status }),
};
