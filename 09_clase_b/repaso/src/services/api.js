import axios from "axios";
import config from "../config/index.js";
import useAuthStore from "../stores/authStore.js";

const api = axios.create({
  baseURL: config.supabaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    apikey: config.supabaseAnonKey,
    //  SE AGREGA EL BEARER ANON_KEY POR DEFECTO PARA PETICIONES PÚBLICAS
    Authorization: `Bearer ${config.supabaseAnonKey}`,
  },
  timeout: 5000,
});

api.interceptors.request.use((requestConfig) => {
  const auth = useAuthStore();
  
  // Si el usuario está autenticado, reemplazamos por su JWT token
  if (auth.token) {
    requestConfig.headers.Authorization = `Bearer ${auth.token}`;
  } else {
    // Si no hay sesión, aseguramos que envíe el anonKey
    requestConfig.headers.Authorization = `Bearer ${config.supabaseAnonKey}`;
  }
  
  return requestConfig;
});

export default api

export const extraerMsg = (err) => {
  const data = err.response?.data
  if (data?.code === "42501") return "No tenes permisos para realizar esta accion"
  return data?.message ?? data?.error ?? err.message ?? "Error no esperado"
}


