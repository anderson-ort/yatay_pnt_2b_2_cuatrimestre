// Este es un servicio particular para el uso de supabase cuando lo implementemos a futuro en las proximas clases
// import { createClient } from '@supabase/supabase-js';

// Cliente listo para cuando se migre services/api.js a Supabase.
// Requiere VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env

import config from '../config/index.js';

const url = config.supabaseUrl;
const anonKey = config.supabaseKey;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
