import { defineStore } from "pinia";

const useAuthStore = defineStore("auth", {
  state: () => ({
    email: null,
    admin: false,
    token: null,
  }),
  actions: {
    setUser(user, accessToken, role) {
      this.email = user.email;
      this.admin = role === "admin";
      this.token = accessToken;
    },
    clearUser() {
      this.email = null;
      this.admin = false;
      this.token = null;
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

