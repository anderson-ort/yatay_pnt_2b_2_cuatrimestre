// Este es un servicio particular para el uso de supabase cuando lo implementemos a futuro en las proximas clases
// import { createClient } from '@supabase/supabase-js';

// Cliente listo para cuando se migre services/api.js a Supabase.
// Requiere VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
