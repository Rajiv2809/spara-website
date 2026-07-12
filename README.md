# SPARA — Sistem Peminjaman Ruangan dan Peralatan SBUM

SPARA adalah aplikasi web untuk mengelola peminjaman ruangan dan peralatan di lingkungan SBUM. Sistem ini mendukung alur persetujuan bertingkat, notifikasi email otomatis, kalender booking, serta ekspor laporan ke Excel dan PDF.

**Stack:** React + Vite (frontend) · Laravel (backend API) · MySQL

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Persyaratan](#persyaratan)
- [Struktur Project](#struktur-project)
- [Instalasi & Menjalankan Aplikasi](#instalasi--menjalankan-aplikasi)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Menjalankan Backend (Laravel)](#2-menjalankan-backend-laravel)
  - [3. Menjalankan Frontend (React)](#3-menjalankan-frontend-react)
  - [4. Menjalankan Keduanya Sekaligus](#4-menjalankan-keduanya-sekaligus)
- [Build untuk Production](#build-untuk-production)
- [Troubleshooting](#troubleshooting)
- [Tim Pengembang](#tim-pengembang)

---

## Fitur Utama

- **Lima peran pengguna**: Peminjam, Penanggung Jawab, PIC, Admin, dan Kepala SBUM
- **Alur persetujuan multi-tahap** untuk setiap pengajuan peminjaman
- **Notifikasi email otomatis** di setiap tahap persetujuan
- **Kalender booking** untuk melihat jadwal peminjaman ruangan
- **Ekspor laporan** ke format Excel dan PDF
- **Manajemen ruangan & peralatan** yang responsif di desktop maupun mobile

## Persyaratan

Pastikan perangkat sudah terinstall sebelum memulai:

| Tools       | Versi Minimum |
|-------------|----------------|
| Node.js     | 18+            |
| npm         | Terbaru        |
| PHP         | 8.2+           |
| Composer    | Terbaru        |
| Database    | MySQL (atau setara) |

## Struktur Project

```text
spara-website/
├── frontend/     # Aplikasi React + Vite
└── backend/      # Aplikasi Laravel API
```

## Instalasi & Menjalankan Aplikasi

### 1. Clone Repository

```bash
git clone <url-repository-anda>
cd spara-website
```

### 2. Menjalankan Backend (Laravel)

Buka terminal, masuk ke folder `backend`, lalu install dependency:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Atur koneksi database pada file `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=root
DB_PASSWORD=
```

Jalankan migrasi database, lalu nyalakan server:

```bash
php artisan migrate
php artisan serve
```

Backend akan berjalan di:

```text
http://localhost:8000
```

### 3. Menjalankan Frontend (React)

Buka terminal baru, masuk ke folder `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Buka browser dan akses:

```text
http://localhost:5173
```

### 4. Menjalankan Keduanya Sekaligus

Untuk pengembangan penuh, jalankan backend dan frontend secara bersamaan di dua terminal terpisah — satu untuk `php artisan serve` dan satu lagi untuk `npm run dev`.

## Build untuk Production

**Frontend:**

```bash
cd frontend
npm run build
```

**Backend:**

```bash
cd backend
php artisan optimize
```

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Port 5173 atau 8000 sudah dipakai | Hentikan aplikasi lain yang menggunakan port tersebut, atau jalankan dengan port berbeda |
| Error terkait dependency frontend | Hapus `node_modules` lalu jalankan ulang `npm install` |
| Error terkait dependency backend | Jalankan ulang `composer install` |
| Cache Laravel bermasalah | Jalankan perintah berikut: |

```bash
php artisan config:clear
php artisan cache:clear
```

## Tim Pengembang

Dikembangkan oleh tim **CodeNusa** — Politeknik Negeri Batam.
