import { defineStore } from "pinia";

const useAuthStore = defineStore("auth", {
  state: () => ({
    email: null,
    admin: false,
    token: null,
    // [REFRESH] nuevo: token de larga duración para renovar el access_token (que vence en ~1h)
    refreshToken: null,
  }),
  actions: {
    // [REFRESH] se agrega el parámetro refreshToken
    setUser(user, accessToken, role, refreshToken) {
      this.email = user.email;
      this.admin = role === "admin";
      this.token = accessToken;
      this.refreshToken = refreshToken;
    },
    // [REFRESH] nuevo: lo usa el interceptor de api.js al renovar la sesión.
    // Supabase rota el refresh token: cada renovación devuelve uno nuevo y el viejo deja de servir
    setTokens(accessToken, refreshToken) {
      this.token = accessToken;
      this.refreshToken = refreshToken;
    },
    clearUser() {
      this.email = null;
      this.admin = false;
      this.token = null;
      this.refreshToken = null; // [REFRESH] también se limpia al cerrar sesión
    },
  },
  getters: {
    userEmail: (state) => state.email,
    isAuthenticated: (state) => !!state.email,
    isAdmin: (state) => state.admin,
  },
  persist: {
    key: "auth",
    storage: sessionStorage,
  },
});

export default useAuthStore;

