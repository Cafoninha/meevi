-- Tabela de entradas de diário
create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners(id) on delete cascade,
  dog_id uuid references public.dogs(id) on delete cascade,
  dog_name text,
  type text not null,
  title text not null,
  notes text,
  date date not null,
  time time not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.diary_entries enable row level security;

create policy "diary_entries_select_own"
  on public.diary_entries for select
  using (owner_id in (select id from public.owners));

create policy "diary_entries_insert_own"
  on public.diary_entries for insert
  with check (owner_id in (select id from public.owners));

create policy "diary_entries_update_own"
  on public.diary_entries for update
  using (owner_id in (select id from public.owners));

create policy "diary_entries_delete_own"
  on public.diary_entries for delete
  using (owner_id in (select id from public.owners));

-- Tabela de documentos
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners(id) on delete cascade,
  dog_id uuid references public.dogs(id) on delete cascade,
  title text not null,
  type text not null,
  file_url text,
  notes text,
  issue_date date,
  expiry_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.documents enable row level security;

create policy "documents_select_own"
  on public.documents for select
  using (owner_id in (select id from public.owners));

create policy "documents_insert_own"
  on public.documents for insert
  with check (owner_id in (select id from public.owners));

create policy "documents_update_own"
  on public.documents for update
  using (owner_id in (select id from public.owners));

create policy "documents_delete_own"
  on public.documents for delete
  using (owner_id in (select id from public.owners));

-- Tabela de contatos de emergência
create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners(id) on delete cascade,
  name text not null,
  phone text not null,
  relationship text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.emergency_contacts enable row level security;

create policy "contacts_select_own"
  on public.emergency_contacts for select
  using (owner_id in (select id from public.owners));

create policy "contacts_insert_own"
  on public.emergency_contacts for insert
  with check (owner_id in (select id from public.owners));

create policy "contacts_update_own"
  on public.emergency_contacts for update
  using (owner_id in (select id from public.owners));

create policy "contacts_delete_own"
  on public.emergency_contacts for delete
  using (owner_id in (select id from public.owners));

-- Tabela de status de vacinas
create table if not exists public.vaccine_status (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners(id) on delete cascade,
  dog_id uuid references public.dogs(id) on delete cascade,
  vaccine_name text not null,
  status text not null,
  date date,
  next_date date,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(dog_id, vaccine_name)
);

alter table public.vaccine_status enable row level security;

create policy "vaccine_status_select_own"
  on public.vaccine_status for select
  using (owner_id in (select id from public.owners));

create policy "vaccine_status_insert_own"
  on public.vaccine_status for insert
  with check (owner_id in (select id from public.owners));

create policy "vaccine_status_update_own"
  on public.vaccine_status for update
  using (owner_id in (select id from public.owners));

create policy "vaccine_status_delete_own"
  on public.vaccine_status for delete
  using (owner_id in (select id from public.owners));

-- Índices para melhorar performance
create index if not exists diary_entries_owner_id_idx on public.diary_entries(owner_id);
create index if not exists diary_entries_dog_id_idx on public.diary_entries(dog_id);
create index if not exists diary_entries_date_idx on public.diary_entries(date desc);
create index if not exists documents_owner_id_idx on public.documents(owner_id);
create index if not exists documents_dog_id_idx on public.documents(dog_id);
create index if not exists contacts_owner_id_idx on public.emergency_contacts(owner_id);
create index if not exists vaccine_status_dog_id_idx on public.vaccine_status(dog_id);
