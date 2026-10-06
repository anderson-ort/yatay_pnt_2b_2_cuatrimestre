-- =========================================================
-- 1) Tabla de perfiles (extiende auth.users con el rol)
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nombre text,
  rol text not null default 'user' check (rol in ('admin', 'manager', 'user')),
  creado_en timestamptz default now()
);

alter table public.profiles enable row level security;

-- =========================================================
-- 2) Trigger: crear el perfil automáticamente al registrarse
--    El rol SIEMPRE es 'user' (default); no se lee del cliente.
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nombre)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usuarios que ya existían antes de este script
insert into public.profiles (id, email, nombre)
select id, email, split_part(email, '@', 1)
from auth.users
on conflict (id) do nothing;

-- =========================================================
-- 3) Función auxiliar: rol del usuario que está consultando
--    SECURITY DEFINER evita la recursión de RLS sobre profiles.
-- =========================================================
create or replace function public.mi_rol()
returns text
language sql
stable
security definer set search_path = ''
as $$
  select rol from public.profiles where id = auth.uid()
$$;

-- =========================================================
-- 4) Políticas de profiles
-- =========================================================
drop policy if exists "Ver perfil propio o todos si es admin" on public.profiles;
create policy "Ver perfil propio o todos si es admin"
on public.profiles for select
using (id = auth.uid() or public.mi_rol() = 'admin');

drop policy if exists "Solo admin cambia roles" on public.profiles;
create policy "Solo admin cambia roles"
on public.profiles for update
using (public.mi_rol() = 'admin')
with check (public.mi_rol() = 'admin');

-- (Sin políticas de INSERT/DELETE: el alta la hace el trigger y la baja es en cascada)

-- =========================================================
-- 5) Políticas de productos por rol
-- =========================================================
-- Se reemplazan las políticas "solo autenticado" del esquema histórico.
drop policy if exists "Insercion solo autenticada" on public.productos;
drop policy if exists "Actualizacion solo autenticada" on public.productos;
drop policy if exists "Borrado solo autenticado" on public.productos;
drop policy if exists "Insercion admin y manager" on public.productos;
drop policy if exists "Actualizacion admin y manager" on public.productos;
drop policy if exists "Borrado solo admin" on public.productos;

-- La política "Lectura publica de productos" se mantiene tal cual.

create policy "Insercion admin y manager"
on public.productos for insert
with check (public.mi_rol() in ('admin', 'manager'));

create policy "Actualizacion admin y manager"
on public.productos for update
using (public.mi_rol() in ('admin', 'manager'))
with check (public.mi_rol() in ('admin', 'manager'));

create policy "Borrado solo admin"
on public.productos for delete
using (public.mi_rol() = 'admin');
