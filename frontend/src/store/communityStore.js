import { create } from 'zustand';
import { communityService } from '../services/communityService';

export const useCommunityStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  pagination: null,
  filterTransactionType: '', // '' or 'BUY' or 'SELL'
  filterCropType: '',

  setFilters: (filters) => {
    set((state) => ({ ...state, ...filters }));
    get().fetchPosts(1);
  },

  fetchPosts: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filterTransactionType, filterCropType } = get();
      const response = await communityService.getPosts({
        page,
        limit: 20,
        transactionType: filterTransactionType || undefined,
        cropType: filterCropType || undefined,
      });
      
      const { posts, ...pagination } = response.data.data;
      
      set((state) => ({
        posts: page === 1 ? posts : [...state.posts, ...posts],
        pagination,
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch community posts', 
        isLoading: false 
      });
    }
  },

  createPost: async (formData) => {
    try {
      const response = await communityService.createPost(formData);
      // Unshift the new post to the top of the feed
      set((state) => ({
        posts: [response.data.data.post, ...state.posts]
      }));
      return response.data.data.post;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create post');
    }
  },
}));
