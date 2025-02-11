import { defineStore } from 'pinia';
import { api } from '../api/Api';
import { removeAuthorization, setAuthorization } from "../api/Api";
import { jwtDecode } from 'jwt-decode';
import { useToast } from "vue-toastification";
import router from "@/router/index";


const toast = useToast();

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: {
      id: null,
      email: ''
    },
    token: null,
    error: null,
    role: null,
  }),
  actions: {
    async hydrate() {
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        setAuthorization(token);
        const decodedToken = jwtDecode(token);
        this.$patch({
          role: decodedToken.role,
          user: {
            id: decodedToken.userId,
            email: decodedToken.sub
          },
        });
      }
    },
    async login(user) {
      try {
        const response = await api.post('/auth/login', user);
        const res = response.data;


        this.token = res.data.token;
        const decodedToken = jwtDecode(this.token);
        this.role = decodedToken.role;

        // Cập nhật state
        this.$patch({
          user: {
            id: res.data.userId,
            email: decodedToken.sub
          },
          role: decodedToken.role,
          token: this.token,
        });

        const loginResponse = response;
        localStorage.setItem('token', this.token);
        sessionStorage.setItem('email', decodedToken.sub);
        setAuthorization(this.token);
        this.error = null; // Reset error
        return { loginResponse, role: this.role };
      } catch (err) {
        console.log(err);
        localStorage.removeItem('token'); // Xóa token khi lỗi
        removeAuthorization();
        this.error = err.response?.data?.message || 'An error occurred';
        throw new Error(this.error);
      }
    },
    async logout() {
      // Cập nhật lại state khi đăng xuất
      this.$patch({
        token: null,
        user: { id: null, name: '', email: '' },
        role: null,
      });

      localStorage.removeItem('token');
      sessionStorage.removeItem('email');
      removeAuthorization();
      toast.info("Đang chuyển sang trang đăng nhập")
      setTimeout(() => {
        router.replace('/login')
      }, 2000);
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.role && state.role.replace('ROLE_', '') === 'ADMIN',
    userId: (state) => state.user.id,
    email: (state) => state.user.email,
  },
});
