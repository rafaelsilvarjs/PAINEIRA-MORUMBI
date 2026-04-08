create table if not exists public.exit_feedbacks (
  id text primary key,
  created_at timestamptz not null default timezone('utc', now()),
  payload jsonb not null
);

create index if not exists exit_feedbacks_created_at_idx
  on public.exit_feedbacks (created_at desc);
