import axios from "axios";
import config from "../config/index.js";
import useAuthStore from "../stores/authStore.js";

const api = axios.create({
  baseURL: config.supabaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    apikey: config.supabaseAnonKey,
  },
  timeout: 5000,
});

api.interceptors.request.use((requestConfig) => {
  const auth = useAuthStore(); // se ejecuta por request, con Pinia ya activo
  if (auth.token) {
    requestConfig.headers.Authorization = `Bearer ${auth.token}`;
  }
  return requestConfig;
});

export default api;
