import { create } from 'zustand';
import { adminService } from '../services/adminService';

export const useAdminStore = create((set, get) => ({
  stats: null,
  users: [],
  posts: [],
  isLoading: false,
  error: null,

  // Fetch Dashboard Stats
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await adminService.getStats();
      set({ stats: res.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load stats', isLoading: false });
    }
  },

  // Users CRUD
  fetchUsers: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res = await adminService.getUsers({ page, limit: 50 });
      set({ users: res.data.data.users, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load users', isLoading: false });
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const res = await adminService.updateUserRole(id, role);
      set((state) => ({
        users: state.users.map((u) => (u._id === id ? res.data.data.user : u)),
      }));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user role');
    }
  },

  deleteUser: async (id) => {
    try {
      await adminService.deleteUser(id);
      set((state) => ({
        users: state.users.filter((u) => u._id !== id),
      }));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  // Posts CRUD
  fetchPosts: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res = await adminService.getPosts({ page, limit: 50 });
      set({ posts: res.data.data.posts, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load posts', isLoading: false });
    }
  },

  updatePostStatus: async (id, status) => {
    try {
      const res = await adminService.updatePostStatus(id, status);
      set((state) => ({
        posts: state.posts.map((p) => (p._id === id ? res.data.data.post : p)),
      }));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update post status');
    }
  },

  deletePost: async (id) => {
    try {
      await adminService.deletePost(id);
      set((state) => ({
        posts: state.posts.filter((p) => p._id !== id),
      }));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete post');
    }
  },

}));
