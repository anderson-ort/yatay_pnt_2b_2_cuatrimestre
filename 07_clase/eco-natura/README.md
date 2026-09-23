# EcoNatura — Vue 3 + Supabase

Implementación de la práctica de `06_clase/practica-clase.md`.

## Uso

```bash
npm install
npm run dev
```

## Estructura

```
src/
├── main.js
├── App.vue
├── style.css
├── router/index.js          # rutas /, /catalogo, /auth
├── data/productos.mock.json # mock con el shape de la tabla productos
├── services/
│   ├── api.js               # capa de datos (hoy mock, mañana Supabase)
│   └── supabase.js          # cliente Supabase (usa .env)
├── components/
│   ├── AnimatedLogo.vue
│   └── ProductCard.vue      # props down, events up (toggle-like)
└── views/
    ├── HomeView.vue
    ├── CatalogView.vue      # dueño del estado: products + Set de likes
    └── AuthView.vue
supabase/schema.sql          # tabla productos + políticas RLS
```

## Supabase

1. Copiar `.env.example` a `.env` y completar URL y anon key.
2. Ejecutar `supabase/schema.sql` en el SQL Editor.
3. Reemplazar el contenido de `services/api.js` para usar `supabase` de `services/supabase.js`. Las vistas no cambian.
