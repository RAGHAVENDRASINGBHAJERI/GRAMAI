import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      clearMessages: () => set({ messages: [] }),

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
