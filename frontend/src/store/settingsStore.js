import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      notifications: true,
      offlineMode: false,
      fontSize: 'medium',

      setTheme: (theme) => {
        set({ theme });
        // Apply dark class to html element
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleTheme: () => {
        const current = get().theme;
        const newTheme = current === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      setNotifications: (notifications) => set({ notifications }),
      setOfflineMode: (offlineMode) => set({ offlineMode }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'gramaai-settings',
      onRehydrateStorage: () => (state) => {
        // Apply saved theme on rehydration
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);
