> Last verified: 2026-11-09 against commit 6373b73

# class-task-tracker

## What this is

Aplikasi Manajemen Tugas Kelas. Guru membuat, mengubah, dan menghapus tugas; siswa melihat daftar tugas kelasnya dan menandainya selesai. Satu repo berisi dua aplikasi mandiri: REST API (`backend/`) dan antarmuka web (`frontend/`). Fokus proyek: kerapian, kebenaran, keamanan.

## Stack

Backend (`backend/`):
- Node.js 22 LTS, TypeScript (strict), ESM
- Express 5: app di `src/app.ts`, listen di `src/server.ts`
- PostgreSQL 16 + Prisma 7: akses data, migrasi, seeder (`prisma.config.ts`)
- Zod: validasi input dan env
- JWT (`jsonwebtoken`) + `argon2`: autentikasi dan hash password
- helmet, cors, express-rate-limit: keamanan HTTP
- Vitest + Supertest: test
- `@asteasolutions/zod-to-openapi` + `@scalar/express-api-reference`: dokumentasi OpenAPI dibuat dari skema Zod yang sama dengan validasi
- ESLint + Prettier

Frontend (`frontend/`):
- Vue 3 (`<script setup>`) + TypeScript, Vite
- Vue Router (guard per role), Pinia (state auth dan tugas)
- `fetch` bawaan lewat satu wrapper API
- ESLint + Prettier, `vue-tsc`

Infra: docker-compose (service `db` saja; `Dockerfile` dan service `app` menyusul di fase Docker).

## Repo map

- `backend/src/config/`: parsing dan validasi env
- `backend/src/db/`: Prisma client
- `backend/src/middleware/`: authenticate, requireRole, validate, errorHandler, notFound
- `backend/src/modules/auth/`, `backend/src/modules/tasks/`: route, controller, service, schema
- `backend/src/utils/`: AppError, asyncHandler, jwt, password
- `backend/src/openapi/`: registry OpenAPI, pendaftaran tiap endpoint, pembuat dokumen
- `backend/prisma/`: `schema.prisma`, `prisma.config.ts`, `migrations/`, `seed.ts`
- `backend/tests/`: integration test
- `frontend/src/api/`: wrapper fetch dan fungsi per endpoint
- `frontend/src/stores/`: Pinia (auth, tasks)
- `frontend/src/router/`: route dan guard
- `frontend/src/views/`: halaman (Login, Register, Tasks, TaskForm)
- `frontend/src/components/`: komponen UI bersama (loading, error, pagination)
- `docs/`: dokumentasi
- root: `docker-compose.yml`, `README.md`, `AGENTS.md`

Pola backend: route -> controller (HTTP saja) -> service (logika bisnis + Prisma).

## How to run locally

Development (tiga proses: db, backend, frontend):

```bash
# 1. Database
docker compose up -d db

# 2. Backend (http://localhost:3000)
cd backend
npm install
cp .env.example .env          # isi JWT_SECRET, TEACHER_REGISTRATION_CODE, DEFAULT_PW_GURU, DEFAULT_PW_SISWA
npm run db:generate
npm run db:migrate:dev        # memakai prisma/prisma.config.ts lewat script
npm run db:seed
npm run dev

# 3. Frontend (http://localhost:5173, proxy /api ke :3000)
cd ../frontend
npm install
npm run dev
```

Menjalankan semua dalam Docker (satu origin di http://localhost:3000) belum bisa:
`Dockerfile` dan service `app` belum ada — menyusul di fase Docker (spec bagian 12, poin 15).

Test backend: `cd backend && npm test` (belum ada file test — `backend/tests/` masih kosong,
perintah ini keluar dengan `No test files found` sampai fase test dijalankan).

Dokumentasi API (Scalar) di `http://localhost:3000/api/docs` (juga `/docs`), dokumen mentah di `http://localhost:3000/api/openapi.json`.

## Docs index

- `README.md` (root): README untuk pengunjung repo (langkah dari nol, akun contoh, endpoint, keputusan desain, yang belum selesai). Dibuat di fase terakhir.
- `docs/README.md`: file ini
- `docs/spec.md`: spesifikasi build dan fase kerja