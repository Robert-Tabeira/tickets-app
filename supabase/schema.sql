-- Ejecutar en Supabase: Project > SQL Editor > New query > pegar todo y darle "Run"

create extension if not exists "pgcrypto";

-- Catálogo de productos con precio (sin IVA) para Lista 1 y Lista 5
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  precio_lista1 numeric,
  precio_lista5 numeric,
  iva integer not null default 22 check (iva in (10, 22)),
  created_at timestamptz default now()
);

-- Configuración general (guarda el próximo número de ticket)
create table if not exists configuracion (
  id integer primary key default 1,
  proximo_ticket integer not null default 1,
  constraint solo_una_fila check (id = 1)
);

insert into configuracion (id, proximo_ticket)
values (1, 1)
on conflict (id) do nothing;

-- Tickets guardados
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  numero integer not null,
  lista integer not null check (lista in (1, 5)),
  total numeric not null,
  created_at timestamptz default now()
);

-- Artículos de cada ticket
create table if not exists ticket_items (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete cascade,
  nombre text not null,
  precio_unitario numeric not null,
  iva integer not null,
  precio_con_iva numeric not null,
  cantidad numeric not null default 1,
  total_linea numeric not null
);

-- Esta app es de uso personal (sin login). Se habilita RLS con una política
-- abierta para que funcione con la clave "anon". No compartas la URL/clave
-- de tu proyecto de Supabase con nadie que no deba usar la app.
alter table productos enable row level security;
alter table configuracion enable row level security;
alter table tickets enable row level security;
alter table ticket_items enable row level security;

create policy "acceso total productos" on productos for all using (true) with check (true);
create policy "acceso total configuracion" on configuracion for all using (true) with check (true);
create policy "acceso total tickets" on tickets for all using (true) with check (true);
create policy "acceso total ticket_items" on ticket_items for all using (true) with check (true);
