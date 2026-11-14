-- ==============================================================================
-- SQL Schema Supabase untuk Undangan Shofa & Ari
-- Cara pakai:
-- 1. Buka dashboard Supabase (https://supabase.com)
-- 2. Pilih Project Anda -> Klik menu "SQL Editor" di bilah kiri
-- 3. Klik "New Query", tempel seluruh kode di bawah ini, lalu klik tombol "RUN"
-- ==============================================================================

-- 1. Buat tabel wishes untuk menampung ucapan, doa, dan konfirmasi kehadiran tamu
create table if not exists public.wishes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  msg text not null,
  status text default 'Hadir',
  count integer default 1
);

-- Index agar pengambilan data ucapan terbaru sangat cepat
create index if not exists wishes_created_at_idx on public.wishes (created_at desc);

-- 2. Aktifkan Row Level Security (RLS) demi keamanan data
alter table public.wishes enable row level security;

-- 3. Izinkan SEMUA PENGUNJUNG (publik/tamu) membaca daftar ucapan
drop policy if exists "Public can read wishes" on public.wishes;
create policy "Public can read wishes"
  on public.wishes
  for select
  using (true);

-- 4. Izinkan SEMUA PENGUNJUNG (publik/tamu) mengirimkan ucapan & konfirmasi kehadiran
drop policy if exists "Public can insert wishes" on public.wishes;
create policy "Public can insert wishes"
  on public.wishes
  for insert
  with check (true);

-- 5. Aktifkan Realtime Broadcast agar ucapan baru langsung muncul seketika di layar semua tamu
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'wishes'
  ) then
    alter publication supabase_realtime add table public.wishes;
  end if;
end $$;

-- 6. (Opsional) Data ucapan awal sebagai contoh
insert into public.wishes (name, msg, status, count)
values 
  ('Rofi Munawar', 'Hormat dan selamat atas pernikahannya. Semoga sakinah, mawaddah, warahmah.', 'Hadir · 2 tamu', 2)
on conflict do nothing;
