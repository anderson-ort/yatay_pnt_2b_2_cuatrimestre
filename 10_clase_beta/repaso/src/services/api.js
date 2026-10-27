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

// [REFRESH] cliente aparte, SIN interceptores: si la renovación pasara por `api`,
// un 401 del propio refresh dispararía otro refresh (loop infinito)
const authClient = axios.create({
  baseURL: config.supabaseUrl,
  headers: {
    "Content-Type": "application/json",
    apikey: config.supabaseAnonKey,
  },
  timeout: 5000,
});

// [REFRESH] promesa compartida: si varias requests reciben 401 a la vez, todas esperan
// la MISMA renovación. El refresh token es de un solo uso; usarlo dos veces puede revocar la sesión
let refreshing = null;

// [REFRESH] pide un access_token nuevo a GoTrue con el refresh_token guardado
const refreshSession = async () => {
  const auth = useAuthStore();
  const { data } = await authClient.post("/auth/v1/token?grant_type=refresh_token", {
    refresh_token: auth.refreshToken,
  });
  auth.setTokens(data.access_token, data.refresh_token);
};

// [REFRESH] nuevo: interceptor de respuesta. Ante un 401 renueva la sesión y reintenta UNA vez
api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const auth = useAuthStore();
    const original = err.config;

    // no es un token vencido, ya se reintentó, o no hay con qué renovar -> se propaga el error
    if (err.response?.status !== 401 || !original || original._retry || !auth.refreshToken) {
      throw err;
    }
    original._retry = true; // evita reintentar para siempre si el token nuevo también falla

    try {
      refreshing ??= refreshSession().finally(() => (refreshing = null));
      await refreshing;
      // el interceptor de request pone el token nuevo en Authorization
      return api(original);
    } catch {
      // refresh vencido o revocado: la sesión terminó. El guard del router manda a Signin
      // en la próxima navegación (no se importa el router acá para evitar un import circular)
      auth.clearUser();
      throw err;
    }
  },
);

export default api

export const extraerMsg = (err) => {
  const data = err.response?.data
  if (data?.code === "42501") return "No tenes permisos para realizar esta accion"
  return data?.message ?? data?.error ?? err.message ?? "Error no esperado"
}


