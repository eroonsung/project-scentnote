-- 박람회용 "이 추천 어땠어요?" 좋아요/나빠요 저장 테이블
-- Supabase 대시보드 > SQL Editor에 붙여 넣고 Run 하세요. (여러 번 실행해도 괜찮아요)

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 같은 사람이 같은 추천 결과에 남긴 의견은 하나만 (다시 누르면 바뀜)
  result_key text not null,
  vote text not null check (vote in ('up', 'down')),
  mode text not null check (mode in ('self', 'gift')),
  moods text[] not null default '{}',
  objects text[] not null default '{}',
  avoids text[] not null default '{}',
  unsure boolean not null default false,
  perfume_ids text[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, result_key)
);

alter table public.feedback enable row level security;

-- 본인 의견만 쓰고 고치고 볼 수 있다 (다른 사람 의견은 앱에서 볼 수 없다. 전체는 대시보드 Table Editor에서 확인)
drop policy if exists "feedback insert own" on public.feedback;
create policy "feedback insert own" on public.feedback for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "feedback update own" on public.feedback;
create policy "feedback update own" on public.feedback for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "feedback select own" on public.feedback;
create policy "feedback select own" on public.feedback for select to authenticated using (user_id = auth.uid());
