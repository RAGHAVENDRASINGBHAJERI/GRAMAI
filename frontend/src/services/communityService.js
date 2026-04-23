import api from './api';

export const communityService = {
  getPosts: (params) => api.get('/community/posts', { params }),
  
  createPost: (formData) => {
    // FormData requires multipart/form-data headers, which Axios handles automatically 
    // when a FormData object is passed.
    return api.post('/community/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  updatePostStatus: (id, status) => api.patch(`/community/posts/${id}/status`, { status }),
};
