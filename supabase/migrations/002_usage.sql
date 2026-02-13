-- Tabela de uso para anti-abuse (todos os usuários)
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  identifier text not null unique,
  last_date date not null default current_date,
  daily_scans int not null default 0,
  total_scanned int not null default 0,
  last_month text not null default to_char(current_date, 'YYYY-MM'),
  monthly_descriptions int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_usage_identifier on public.usage(identifier);

alter table public.usage enable row level security;

-- Sem policies: acesso negado para anon/authenticated. APIs usam service role (bypassa RLS).
