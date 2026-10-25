-- ============================================================
-- Schema del database per tutti i siti del repository.
-- Da eseguire UNA volta in Supabase: SQL Editor → New query → Run.
-- ============================================================

-- Una sola tabella "chiave → valore" per ogni utente e ogni sito.
-- Ogni sito salva i suoi dati con il proprio identificativo in "app"
-- (es. 'percorso-fodmap'), quindi i siti futuri non richiedono nuove tabelle.
create table if not exists public.app_data (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  app        text        not null check (char_length(app) between 1 and 64),
  key        text        not null check (char_length(key) between 1 and 128),
  value      jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, app, key)
);

-- Sicurezza a livello di riga: ogni utente legge e scrive SOLO i propri dati.
alter table public.app_data enable row level security;

drop policy if exists "app_data: leggi i tuoi dati"     on public.app_data;
drop policy if exists "app_data: inserisci i tuoi dati" on public.app_data;
drop policy if exists "app_data: modifica i tuoi dati"  on public.app_data;
drop policy if exists "app_data: elimina i tuoi dati"   on public.app_data;

create policy "app_data: leggi i tuoi dati" on public.app_data
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "app_data: inserisci i tuoi dati" on public.app_data
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "app_data: modifica i tuoi dati" on public.app_data
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "app_data: elimina i tuoi dati" on public.app_data
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Gli utenti non autenticati non hanno alcun accesso.
revoke all on public.app_data from anon;
grant select, insert, update, delete on public.app_data to authenticated;

-- Aggiornamenti in tempo reale tra dispositivi.
do $$
begin
  alter publication supabase_realtime add table public.app_data;
exception when duplicate_object then null;
end $$;
