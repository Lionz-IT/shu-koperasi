# SHU Koperasi

Sistem web untuk pencatatan nota belanja anggota koperasi dan perhitungan pembagian SHU (Sisa Hasil Usaha) secara proporsional.

**Rumus**: `SHU_anggota = (total_belanja_anggota / total_belanja_semua) × total_laba`

## Prasyarat

- Node.js >= 18
- PostgreSQL (via Docker **atau** install langsung di host)

## Setup

```bash
# 1. Clone & masuk ke direktori
cd shu-koperasi

# 2. Salin file environment
cp .env.example .env

# 3. Jalankan PostgreSQL (pilih salah satu):

# Opsi A: Pakai Docker
docker compose up -d

# Opsi B: PostgreSQL sudah jalan di host
# Pastikan database sudah dibuat:
# psql -U postgres -c "CREATE DATABASE shu_koperasi;"
# Sesuaikan DATABASE_URL di .env jika perlu

# 4. Install dependencies
npm install

# 5. Generate Prisma client
npm run generate

# 6. Jalankan migrasi database
npm run migrate:dev

# 7. Seed admin user
npm run seed

# 8. Jalankan development server
npm run dev
```

API berjalan di `http://localhost:3000`, web di `http://localhost:5173`.

## Login

Gunakan kredensial yang diatur di `.env`:
- Username: `admin`
- Password: `admin123`

## Fitur

- **Dashboard** — statistik ringkasan + grafik belanja per anggota & status periode
- **Anggota** — CRUD data anggota koperasi
- **Barang** — CRUD data barang
- **Nota** — input nota belanja + items, filter, detail
- **Periode** — buat periode, tutup periode (input laba → hitung SHU otomatis), lihat hasil pembagian
- **Laporan** — laporan SHU per periode yang sudah ditutup, cetak laporan

## Struktur

```
shu-koperasi/
├── apps/
│   ├── api/          # Express + Prisma + PostgreSQL
│   │   ├── prisma/   # Schema & migrations
│   │   └── src/      # Routes, controllers, services
│   └── web/          # React 19 + Vite + TypeScript
│       └── src/      # Pages, lib
├── docker-compose.yml
└── package.json      # npm workspaces root
```

## Scripts

| Perintah | Keterangan |
|----------|-----------|
| `npm run dev` | Jalankan API + Web bersamaan |
| `npm run dev:api` | Jalankan API saja |
| `npm run dev:web` | Jalankan Web saja |
| `npm run build` | Build untuk production |
| `npm run migrate:dev` | Buat/jalankan migrasi Prisma |
| `npm run seed` | Seed admin user |
| `npm run generate` | Generate Prisma client |
| `npm run lint` | Jalankan ESLint |
| `npm run format` | Format kode dengan Prettier |

## Tech Stack

- **API**: Express, Prisma ORM, PostgreSQL, JWT + bcrypt, Zod validation
- **Web**: React 19, Vite, TypeScript, React Router, Chart.js
# shu-koperasi
