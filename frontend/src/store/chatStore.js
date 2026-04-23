import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatService } from '../services/chatService';

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,
      currentLanguage: 'en',
      currentCategory: 'general',
      useGroq: false,

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, { ...message, id: Date.now() }],
        })),

      setTyping: (isTyping) => set({ isTyping }),

      setLanguage: (language) => set({ currentLanguage: language }),

      setCategory: (category) => set({ currentCategory: category }),

      clearMessages: async () => {
        // Try to clear server-side history if user is authenticated
        try {
          const stored = localStorage.getItem('gramaai-auth');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.state?.isAuthenticated) {
              await chatService.clearHistory();
            }
          }
        } catch (error) {
          console.error('Failed to clear server chat history', error);
          // Continue to clear local state even if API fails
        }

        // Remove legacy localStorage key
        localStorage.removeItem('gramaai-chat-messages');

        // Clear Zustand state (persist middleware will update localStorage)
        set({ messages: [] });
      },

      fetchHistory: async () => {
        try {
          const response = await chatService.getHistory({ limit: 50 });
          if (response?.data?.data?.queries) {
            const queries = response.data.data.queries.reverse();
            const newMessages = [];
            queries.forEach((q) => {
              newMessages.push({ role: 'user', content: q.question, id: q._id + '_u' });
              newMessages.push({
                role: 'assistant',
                content: q.response,
                metadata: { source: q.source, confidence: q.confidence, category: q.category },
                id: q._id + '_a',
              });
            });
            set({ messages: newMessages });
          }
        } catch (error) {
          console.error('Failed to fetch chat history', error);
        }
      },

      loadLocalMessages: () => {
        const stored = localStorage.getItem('gramaai-chat-messages');
        if (stored) {
          try {
            const messages = JSON.parse(stored);
            set({ messages });
          } catch {
            // ignore
          }
        }
      },
    }),
    {
      name: 'gramaai-chat',
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        currentLanguage: state.currentLanguage,
      }),
    }
  )
);
