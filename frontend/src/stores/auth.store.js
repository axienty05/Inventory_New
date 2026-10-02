import { defineStore } from 'pinia';
import api from '@/api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => (state.user?.roles || []).some(r => ['admin', 'super admin'].includes(r.toLowerCase())),
  },
  actions: {
    async login(username, password) {
      this.isLoading = true;
      try {
        const res = await api.post('/auth/login', { username, password });
        this.token = res.data.data.token;
        this.user = res.data.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        return res.data;
      } finally {
        this.isLoading = false;
      }
    },
    async register(username, password) {
      this.isLoading = true;
      try {
        const res = await api.post('/auth/register', { username, password });
        return res.data;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchMe() {
      try {
        const res = await api.get('/auth/me');
        this.user = res.data.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (err) {
        this.logout();
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
