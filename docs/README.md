> Last verified: 2026-11-09 against commit 945f990

# class-task-tracker

## What this is

Aplikasi Manajemen Tugas Kelas. Guru membuat, mengubah, dan menghapus tugas; siswa melihat daftar tugas kelasnya dan menandainya selesai. Satu repo berisi dua aplikasi mandiri: REST API (`backend/`) dan antarmuka web (`frontend/`). Fokus proyek: kerapian, kebenaran, keamanan.

## Stack

Backend (`backend/`):
- Node.js 22 LTS, TypeScript (strict), ESM
- Express 5: app di `src/app.ts`, listen di `src/server.ts`
- PostgreSQL 16 + Prisma: akses data, migrasi, seeder
- Zod: validasi input dan env
- JWT (`jsonwebtoken`) + `argon2`: autentikasi dan hash password
- helmet, cors, express-rate-limit: keamanan HTTP
- Vitest + Supertest: test
- `@asteasolutions/zod-to-openapi` + `swagger-ui-express`: dokumentasi OpenAPI dibuat dari skema Zod yang sama dengan validasi
- ESLint + Prettier

Frontend (`frontend/`):
- Vue 3 (`<script setup>`) + TypeScript, Vite
- Vue Router (guard per role), Pinia (state auth dan tugas)
- `fetch` bawaan lewat satu wrapper API
- ESLint + Prettier, `vue-tsc`

Infra: Docker + docker-compose (db + app).

## Repo map

- `backend/src/config/`: parsing dan validasi env
- `backend/src/db/`: Prisma client
- `backend/src/middleware/`: authenticate, requireRole, validate, errorHandler, notFound
- `backend/src/modules/auth/`, `backend/src/modules/tasks/`: route, controller, service, schema
- `backend/src/utils/`: AppError, asyncHandler, jwt, password
- `backend/src/openapi/`: registry OpenAPI, pendaftaran tiap endpoint, pembuat dokumen
- `backend/prisma/`: `schema.prisma`, `migrations/`, `seed.ts`
- `backend/tests/`: integration test
- `frontend/src/api/`: wrapper fetch dan fungsi per endpoint
- `frontend/src/stores/`: Pinia (auth, tasks)
- `frontend/src/router/`: route dan guard
- `frontend/src/views/`: halaman (Login, Register, Tasks, TaskForm)
- `frontend/src/components/`: komponen UI bersama (loading, error, pagination)
- `docs/`: dokumentasi
- root: `Dockerfile`, `docker-compose.yml`, `README.md`, `AGENTS.md`

Pola backend: route -> controller (HTTP saja) -> service (logika bisnis + Prisma).

## How to run locally

Development (dua proses):

```bash
# 1. Database
docker compose up -d db

# 2. Backend (http://localhost:3000)
cd backend
npm install
cp .env.example .env          # isi JWT_SECRET dan TEACHER_REGISTRATION_CODE
npx prisma migrate dev
npm run db:seed
npm run dev

# 3. Frontend (http://localhost:5173, proxy /api ke :3000)
cd ../frontend
npm install
npm run dev
```

Semua dalam Docker (satu origin di http://localhost:3000):

```bash
docker compose up --build
docker compose exec app npm run db:seed
```

Test backend: `cd backend && npm test`.

Dokumentasi API: Swagger UI di `http://localhost:3000/api/docs`, dokumen mentah di `http://localhost:3000/api/openapi.json`.

(Bagian ini diperbarui oleh agent saat script benar-benar ada.)

## Docs index

- `README.md` (root): README untuk pengunjung repo (langkah dari nol, akun contoh, endpoint, keputusan desain, yang belum selesai). Dibuat di fase terakhir.
- `docs/README.md`: file ini
- `docs/spec.md`: spesifikasi build dan fase kerja