import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarWidth: 260,
      editorWidth: 900,
      fontFamily: 'Inter',
      fontSize: 16,
      
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setEditorWidth: (width) => set({ editorWidth: width }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
      
      resetSettings: () => set({
        theme: 'dark',
        sidebarWidth: 260,
        editorWidth: 900,
        fontFamily: 'Inter',
        fontSize: 16,
      }),
    }),
    {
      name: 'notion-settings-storage', // key in local storage
    }
  )
);

export default useSettingsStore;
