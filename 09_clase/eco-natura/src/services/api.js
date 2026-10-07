// necesito llevarlo a una api rest
import config from '../config/index.js';
import axios from 'axios';import mockData from '../data/productos.mock.json';

// const urlProducts = `${config.supabaseUrl}/rest/v1/productos?select=*&order=creado_en.desc`

const api = axios.create({
  // siempre implementa el versionado de api
  baseURL: `${config.supabaseUrl}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'apikey': config.supabaseKey,
  },
});

export default api