import { create } from 'zustand';
const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  login: (accessToken, user) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      accessToken,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  setAccessToken: (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    set({ accessToken, isAuthenticated: true });
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));
export default useAuthStore;