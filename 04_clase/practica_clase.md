# BAAS (Backend as a service) - Supabase
[Supabase](https://supabase.com/)

# API REST completa en Supabase para tabla `productos`

## 1. Crear el proyecto en Supabase

- Registrate en supabase.com (free tier disponible).
- Creá un nuevo proyecto, elegí región cercana a tus usuarios y una contraseña segura para la base de datos.
- Esperá el aprovisionamiento (unos minutos).

## 2. Crear la tabla `productos`

La columna `imagen` guarda simplemente la URL pública de la imagen, sin importar de dónde provenga (Supabase Storage u otro proveedor). No hay ninguna relación ni constraint especial que agregar para esto, es un `varchar` común.

## 3. Habilitar Row Level Security (RLS) y definir políticas

Sin esto, la tabla queda bloqueada por defecto para la API aunque el endpoint exista.


Si vas a administrar el catálogo vos mismo desde un script o backoffice propio (no desde usuarios finales autenticados), podés saltear las políticas de escritura y usar directamente la `service_role key`, que bypassea RLS. Nunca la expongas en el frontend público; para eso usás la `anon key`.

## 4. Obtener las credenciales del proyecto -> Busquemos siempre el ANON KEY para este caso del FRONTEND

En Project Settings > API:

- **Project URL**: `https://<tu-proyecto>.supabase.co`
- **anon public key**: para el frontend, respeta RLS
- **service_role key**: solo para backend/scripts propios, bypassea RLS

## 5. El endpoint REST ya está disponible

No hay que programar nada adicional. Queda expuesto en:

```
https://<tu-proyecto>.supabase.co/rest/v1/productos
```

Headers obligatorios en toda request:

```
apikey: <tu-anon-o-service-key>
Authorization: Bearer <tu-anon-o-service-key>
```

## 6. Operaciones CRUD disponibles

**GET** (listar, filtrar, ordenar, paginar)
```bash
curl "https://<proyecto>.supabase.co/rest/v1/productos?select=*&order=creado_en.desc" \
  -H "apikey: <key>" -H "Authorization: Bearer <key>"
```

**POST** (crear)
```bash
curl -X POST "https://<proyecto>.supabase.co/rest/v1/productos" \
  -H "apikey: <key>" \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"nombre":"Magnesio Bisglicinato","precio":8500,"stock":50,"categoria":"minerales","imagen":"https://<url-publica>"}'
```

**PATCH** (actualización parcial)
```bash
curl -X PATCH "https://<proyecto>.supabase.co/rest/v1/productos?id=eq.<id>" \
  -H "apikey: <key>" \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -d '{"imagen":"https://<nueva-url-publica>"}'
```

**"PUT" equivalente** (reemplazo completo vía upsert, PostgREST no tiene PUT nativo)
```bash
curl -X POST "https://<proyecto>.supabase.co/rest/v1/productos" \
  -H "apikey: <key>" \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"id":"<id-existente>","nombre":"Magnesio Bisglicinato 400mg","precio":9000,"stock":45,"categoria":"minerales","imagen":"https://<url-publica>"}'
```

**DELETE**
```bash
curl -X DELETE "https://<proyecto>.supabase.co/rest/v1/productos?id=eq.<id>" \
  -H "apikey: <key>" -H "Authorization: Bearer <key>"
```

**OPTIONS**
```bash
curl -X OPTIONS "https://<proyecto>.supabase.co/rest/v1/productos" \
  -H "apikey: <key>"
```
PostgREST responde automáticamente con CORS y métodos permitidos, no requiere configuración manual.

## 7. Cómo se integra con el frontend a futuro

Cuando desarrolles el frontend, el flujo típico sin backend propio va a ser:

1. El usuario sube la imagen directamente al bucket que elijas (Supabase Storage u otro).
2. El bucket devuelve una URL pública (o firmada).
3. El frontend hace un POST o PATCH a `productos` guardando esa URL en la columna `imagen`.

Todo esto se puede hacer desde el cliente sin backend intermedio, siempre que las políticas RLS del bucket y de la tabla lo permitan.

## Alternativas de bucket para las imágenes

Si no querés usar Supabase Storage o querés comparar opciones:

- **Cloudinary**: free tier generoso (25GB almacenamiento/mes de transformaciones), muy usado para e-commerce porque además optimiza y transforma imágenes al vuelo (resize, crop, formato automático). Devuelve URL pública lista para usar.
- **Cloudflare R2**: compatible con API de S3, sin costos de egress (a diferencia de S3), free tier de 10GB. Requiere configurar CORS y políticas de acceso público vos mismo.
- **Bunny.net Storage**: barato, con CDN integrado, buen rendimiento para catálogos de e-commerce con muchas imágenes.
- **ImageKit.io**: similar a Cloudinary, free tier con 20GB de ancho de banda mensual, buena opción si además querés transformaciones automáticas (thumbnails, compresión).
- **AWS S3**: el más flexible y con más integraciones del mercado, pero el free tier es más acotado (12 meses, 5GB) y requiere más configuración manual de políticas IAM y CORS.

Para tu caso, dado que ya estás en el ecosistema Supabase, Supabase Storage sigue siendo la opción con menos fricción cuando decidas automatizarlo. Si priorizás optimización automática de imágenes de producto (thumbnails, distintos tamaños para mobile/desktop), Cloudinary o ImageKit son las alternativas más convenientes.