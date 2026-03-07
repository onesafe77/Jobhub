-- Create cpns_bumn_posts table
create table public.cpns_bumn_posts (
  id uuid default gen_random_uuid() primary key,
  caption text,
  url text not null,
  image_url text,
  author text not null,
  timestamp timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.cpns_bumn_posts enable row level security;

-- Create policy for public read access
create policy "Enable read access for all users" on public.cpns_bumn_posts
  for select using (true);

-- Insert dummy data
insert into public.cpns_bumn_posts (author, caption, url, image_url, timestamp) values
('cpnsindonesia', 'PENGUMUMAN! Seleksi CPNS 2024 akan segera dibuka. Siapkan berkas dan belajar dari sekarang. #CPNS2024 #AbdiNegara', 'https://www.instagram.com/p/dummy1', 'https://images.unsplash.com/photo-1573164574230-db1d5e960238?w=800&auto=format&fit=crop', now() - interval '2 days'),
('kementerianbumn', 'Rekrutmen Bersama BUMN 2024 (RBB) Batch 1 officially OPEN! Daftar sekarang melalui portal resmi kami. Waspada penipuan! #BUMNUntukIndonesia #RBB2024', 'https://www.instagram.com/p/dummy2', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop', now() - interval '5 hours'),
('info.cpns.asn', 'Formasi terbanyak tahun ini jatuh pada tenaga pengajar dan tenaga kesehatan. Apakah jurusanmu masuk kualifikasi? Cek di sini.', 'https://www.instagram.com/p/dummy3', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop', now() - interval '4 days'),
('bumncareer', 'PT Pertamina (Persero) membuka lowongan untuk fresh graduate program Bimbingan Profesi Sarjana (BPS). Siapkan dirimu!', 'https://www.instagram.com/p/dummy4', 'https://images.unsplash.com/photo-1510925758641-869d353cecc7?w=800&auto=format&fit=crop', now() - interval '1 day'),
('cpnsindonesia', 'Tips lulus SKD: Banyak latihan soal TKP, TIU, TWK. Manajemen waktu adalah kunci.', 'https://www.instagram.com/p/dummy5', null, now() - interval '10 hours');
