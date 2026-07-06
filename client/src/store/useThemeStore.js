import { create } from 'zustand';
const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem('theme') || 'dark',
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    set({ theme: nextTheme });
    get().applyTheme();
  },
  applyTheme: () => {
    const currentTheme = get().theme;
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
}));
export default useThemeStore;