-- HFSE Document Control: tables, atomic save functions and private attachment bucket.
-- Client roles get no access. The server uses the secret key after its own access checks.
begin;

create table public.document_control_documents (
  id text primary key,
  data jsonb not null,
  updated text not null,
  -- Keeps the library in insertion order, as the app showed it on D1.
  seq bigint generated always as identity
);

create table public.document_control_history (
  id text primary key,
  document_id text not null,
  data jsonb not null,
  action text not null,
  actor text not null,
  "at" text not null
);

create table public.document_control_document_requests (
  id text primary key,
  data jsonb not null,
  requester text not null,
  created text not null
);

create table public.document_control_rca_cases (
  id text primary key,
  data jsonb not null,
  updated text not null
);

create table public.document_control_meeting_minutes (
  id text primary key,
  data jsonb not null,
  updated text not null
);

create index document_control_history_document_id_idx
  on public.document_control_history (document_id);

alter table public.document_control_documents enable row level security;
alter table public.document_control_history enable row level security;
alter table public.document_control_document_requests enable row level security;
alter table public.document_control_rca_cases enable row level security;
alter table public.document_control_meeting_minutes enable row level security;

revoke all on
  public.document_control_documents,
  public.document_control_history,
  public.document_control_document_requests,
  public.document_control_rca_cases,
  public.document_control_meeting_minutes
from public, anon, authenticated;

grant select, insert, update, delete on
  public.document_control_documents,
  public.document_control_history,
  public.document_control_document_requests,
  public.document_control_rca_cases,
  public.document_control_meeting_minutes
to service_role;

-- Replaces the D1 batch: the document and its history save together or not at all.
create function public.document_control_save_document(p_document jsonb, p_history jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.document_control_documents (id, data, updated)
  values (p_document->>'id', p_document->'data', p_document->>'updated')
  on conflict (id) do update set data = excluded.data, updated = excluded.updated;

  insert into public.document_control_history (id, document_id, data, action, actor, "at")
  select h->>'id', h->>'document_id', h->'data', h->>'action', h->>'actor', h->>'at'
  from jsonb_array_elements(p_history) as h
  on conflict (id) do nothing;
end;
$$;

-- Replaces the D1 batch: the request and its history save together or not at all.
create function public.document_control_save_request(p_request jsonb, p_history jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.document_control_document_requests (id, data, requester, created)
  values (p_request->>'id', p_request->'data', p_request->>'requester', p_request->>'created');

  insert into public.document_control_history (id, document_id, data, action, actor, "at")
  values (p_history->>'id', p_history->>'document_id', p_history->'data', p_history->>'action', p_history->>'actor', p_history->>'at');
end;
$$;

revoke all on function public.document_control_save_document(jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.document_control_save_request(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.document_control_save_document(jsonb, jsonb) to service_role;
grant execute on function public.document_control_save_request(jsonb, jsonb) to service_role;

-- Private bucket with the app's existing 10 MB per-file limit. No storage policies are added.
insert into storage.buckets (id, name, public, file_size_limit)
values ('document-control-attachments', 'document-control-attachments', false, 10485760);

commit;
