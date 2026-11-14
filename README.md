# Undangan Pernikahan Digital Shofa & Ari

Aplikasi website undangan pernikahan digital siap deploy ke **Vercel** dengan database terpusat berbasis **Supabase** (PostgreSQL Serverless Realtime).

---

## 📁 Struktur File Proyek

```text
├── index.html            # File utama website undangan (untuk Vercel)
├── Undangan-Shofa-Ari.html # File cadangan / nama alternatif
├── supabase-config.js    # Tempat mengisi URL & Anon Key Supabase
├── schema.sql            # Script SQL untuk membuat tabel komentar di Supabase
├── audio.mp3             # Lagu musik latar romantis (Canon in D)
├── vercel.json           # Konfigurasi routing & caching Vercel
└── README.md             # Panduan lengkap
```

---

## ⚡ Langkah 1: Pengaturan Database Supabase (Cukup 2 Menit)

Agar komentar dan RSVP tersimpan terpusat dan realtime (bukan di browser masing-masing):

1. Buka [https://supabase.com](https://supabase.com) dan login menggunakan akun **Google / GitHub** (100% Gratis).
2. Klik tombol **"New Project"**, beri nama proyek (misal: `undangan-shofa-ari`), masukkan database password, lalu klik **"Create new project"**.
3. Tunggu sekitar 1 menit hingga database selesai dibuat.
4. Di bilah menu kiri, buka **"SQL Editor"** -> klik **"New Query"**.
5. Buka file `schema.sql` di folder ini, salin seluruh isinya, tempelkan ke SQL Editor Supabase, lalu klik tombol **"Run"** (hijau).
6. Di bilah menu kiri, klik menu **"Project Settings"** (ikon gear ⚙️) -> pilih **"API"**.
7. Salin 2 nilai berikut:
   * **Project URL**
   * **Project API Keys** bagian **`anon public`**
8. Buka file `supabase-config.js` di folder ini, lalu tempelkan kedua nilai tersebut:
   ```javascript
   window.SUPABASE_CONFIG = {
     url: "https://xyzcompany.supabase.co",      // Tempel Project URL Anda di sini
     anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..." // Tempel Anon Key Anda di sini
   };
   ```
9. Simpan file `supabase-config.js`. Selesai!

---

## 🚀 Langkah 2: Deploy ke Vercel

### Cara A: Menggunakan Vercel CLI via Terminal (Paling Cepat)
1. Buka Terminal di folder ini:
   ```bash
   cd "/Volumes/DATA/DATA/PROJECT LAIN-LAIN/undangan"
   ```
2. Jalankan perintah:
   ```bash
   npx vercel
   ```
3. Ikuti panduan di layar:
   * `Set up and deploy?` -> Ketik `y` lalu Enter.
   * `Which scope?` -> Pilih akun Vercel Anda.
   * `Link to existing project?` -> Ketik `n`.
   * `What's your project's name?` -> `undangan-shofa-ari` (atau nama pilihan Anda).
   * `In which directory is your code located?` -> Tekan Enter (`./`).
   * `Want to modify these settings?` -> Ketik `n`.
4. Selesai! Dalam hitungan detik link website Anda akan muncul (contoh: `https://undangan-shofa-ari.vercel.app`).
5. Untuk deploy ke domain production utama, jalankan:
   ```bash
   npx vercel --prod
   ```

---

### Cara B: Menggunakan GitHub & Dashboard Vercel (Drag-and-Drop / Git)
1. Buat repository baru di [GitHub](https://github.com) (misal: `undangan-shofa-ari`).
2. Upload semua file dalam folder ini ke repository tersebut.
3. Buka [https://vercel.com](https://vercel.com), login, lalu klik tombol **"Add New..."** -> **"Project"**.
4. Pilih repository `undangan-shofa-ari` yang baru dibuat, lalu klik **"Deploy"**.
5. Website undangan Anda langsung aktif secara global!

---

## 💌 Cara Membuat Link Khusus untuk Tamu Undangan

Anda dapat menambahkan parameter nama tamu pada link Vercel:

* **Untuk 1 Orang Tamu:**
  ```text
  https://undangan-shofa-ari.vercel.app/?to=Bapak+Budi+Santoso
  ```
* **Untuk Tamu dengan Jumlah Kuota Tertentu (misal 2 orang):**
  ```text
  https://undangan-shofa-ari.vercel.app/?to=Bapak+Budi+Santoso&guest=2
  ```
Nama tamu dan jumlah kuota kehadiran otomatis muncul di cover depan undangan dan form RSVP.

---

## 🎶 Fitur yang Telah Dilengkapi & Aktif:
* ✅ **Audio Musik Latar Otomatis**: Memutar instrumen romantis begitu tamu menekan tombol **"Buka Undangan"**, dilengkapi tombol putar/jeda melayang.
* ✅ **Komentar & RSVP Realtime**: Terintegrasi langsung dengan Supabase PostgreSQL.
* ✅ **Tombol Google Maps**: Langsung membuka navigasi Google Maps menuju Gedung Renald Tasikmalaya.
* ✅ **Tombol Kalender**: Langsung menambahkan jadwal akad & resepsi ke Google Calendar tamu secara otomatis.
* ✅ **Salin Rekening & Alamat Kado**: Memudahkan tamu menyalin rekening BSI dan alamat pengiriman kado pernikahan.
