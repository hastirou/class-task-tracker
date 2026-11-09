> Last verified: (isi saat commit pertama) against commit (hash)

# Spec: Class Task Tracker

## 1. Requirements

1. Registrasi dan login, dua peran: `TEACHER` dan `STUDENT`. Password di-hash.
2. Guru: membuat, mengubah, menghapus tugas (judul, deskripsi, tenggat, kelas).
3. Siswa: hanya melihat daftar tugas dan menandai selesai. Tidak boleh mengubah/menghapus tugas.
4. Daftar tugas: pencarian judul, filter status (selesai/belum), paginasi.
5. REST API dengan validasi input dan respons error konsisten.
6. Frontend web yang berfungsi untuk semua alur di atas, dengan pesan error dan status loading yang jelas.
7. Database PostgreSQL, migrasi, seeder.
8. Nilai tambah (hanya dua): test minimal tiga endpoint, Docker/docker-compose.

## 2. Model data

- `User`: id (uuid), name, email (unik, lowercase), passwordHash, role (`TEACHER` | `STUDENT`), className (wajib untuk STUDENT, null untuk TEACHER), createdAt
- `Task`: id (uuid), title, description, dueDate, className, createdById (-> User), createdAt, updatedAt
- `TaskCompletion`: id, taskId (-> Task, onDelete Cascade), studentId (-> User), completedAt; unique (taskId, studentId)

Index: `Task(className, dueDate)`, `Task(title)`.

## 3. Keputusan desain

- Siswa hanya melihat tugas dengan `className` sama dengan miliknya.
- Status selesai bersifat per siswa (via `TaskCompletion`), bukan kolom di `Task`.
- Registrasi `TEACHER` memerlukan `TEACHER_REGISTRATION_CODE` dari env, agar tidak sembarang orang jadi guru.
- Guru hanya boleh mengubah/menghapus tugas miliknya sendiri (`createdById`).
- Pesan login gagal generik, tidak membedakan email tidak ada vs password salah.
- Satu repo dua folder mandiri (bukan monorepo workspace). Di Docker, Express menyajikan hasil build Vue sehingga satu origin dan tanpa CORS; saat development Vite memakai proxy `/api`.
- Token JWT disimpan di `localStorage` agar sesi bertahan saat refresh. Konsekuensinya rentan jika ada XSS; mitigasi: tidak ada `v-html`, helmet di server. Catat di README sebagai hal yang bisa diperbaiki (cookie httpOnly).

## 4. Endpoint

Prefix `/api/v1`.

| Method | Path | Akses | Keterangan |
|---|---|---|---|
| POST | /auth/register | publik | name, email, password, role, className (siswa), teacherCode (guru) |
| POST | /auth/login | publik | mengembalikan `{ token, user }` |
| GET | /auth/me | login | profil saat ini |
| GET | /tasks | login | query: `search`, `status` (`done`/`pending`, untuk siswa), `page` (default 1), `limit` (default 10, maks 50), `className` (guru, opsional) |
| GET | /tasks/:id | login | siswa hanya tugas kelasnya |
| POST | /tasks | TEACHER | title, description, dueDate, className |
| PUT | /tasks/:id | TEACHER (pemilik) | ubah tugas |
| DELETE | /tasks/:id | TEACHER (pemilik) | hapus tugas |
| POST | /tasks/:id/complete | STUDENT | tandai selesai (idempoten) |
| DELETE | /tasks/:id/complete | STUDENT | batalkan tanda selesai |
| GET | /health | publik | cek hidup |

Aturan tambahan:
- `GET /tasks` untuk siswa menyertakan `isCompleted` per tugas.
- `search`: case-insensitive `contains` pada judul.
- Pagination: `meta: { page, limit, total, totalPages }`.

## 5. Format respons

Sukses:
```json
{ "data": {}, "meta": {} }
```
Error (semua error, termasuk 404 route API tak dikenal dan error tak terduga):
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Input tidak valid", "details": [{ "field": "email", "message": "Email tidak valid" }] } }
```
Status code: 200, 201, 204, 400, 401, 403, 404, 409, 429, 500.

## 6. Keamanan tambahan

- Password minimal 8 karakter.
- JWT: secret dari env (min. 32 karakter), kedaluwarsa default 1 hari, payload hanya `sub` dan `role`.
- Body ditolak jika punya field tak dikenal (`.strict()`); batas ukuran body 10kb.
- CORS dibatasi ke `CORS_ORIGIN`; rate limit pada `/auth/*`.

## 7. Env (`backend/.env.example`)

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/class_tasks
JWT_SECRET=ganti-dengan-string-acak-minimal-32-karakter
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
TEACHER_REGISTRATION_CODE=ganti-kode-guru
SERVE_FRONTEND=false
```

`SERVE_FRONTEND=true` (diset di Docker): Express menyajikan `frontend/dist` sebagai file statis dan mengembalikan `index.html` untuk route non-`/api` (SPA fallback). Route `/api/*` yang tidak dikenal tetap mengembalikan 404 JSON.

## 8. Seeder

`npm run db:seed` di `backend/` (idempoten, harus bisa dijalankan juga di dalam container):
- Guru: `guru@example.com` / `***REMOVED***`
- Siswa kelas `X-A`: `siswa1@example.com`, `siswa2@example.com` / `***REMOVED***`
- Siswa kelas `X-B`: `siswa3@example.com` / `***REMOVED***`
- Sekitar 12 tugas campuran X-A dan X-B (sebagian lewat tenggat); beberapa sudah ditandai selesai oleh siswa1.

## 9. Test minimal (backend)

1. `POST /auth/login`: sukses dan gagal (401).
2. `POST /tasks`: guru 201; siswa 403; tanpa token 401; input invalid 400.
3. `POST /tasks/:id/complete`: siswa sukses dan idempoten; guru 403.

## 10. Frontend

Halaman dan perilaku:
- `/login`, `/register`: form dengan validasi sisi klien sederhana; pesan error dari API (termasuk `details` per field) ditampilkan jelas. Register: pilihan role; siswa mengisi kelas, guru mengisi kode guru.
- `/tasks` (login): daftar tugas dengan kotak pencarian (debounce ~300 ms), filter status (semua/belum/selesai; hanya untuk siswa), paginasi. Sinkronkan `search`, `status`, `page` ke query URL.
  - Siswa: checkbox/tombol tandai selesai per tugas, tanpa tombol ubah/hapus.
  - Guru: tombol tambah, ubah, hapus (dengan konfirmasi) pada tugas miliknya.
- `/tasks/new` dan `/tasks/:id/edit` (hanya guru): form judul, deskripsi, tenggat, kelas.
- Navbar: nama user, role, tombol keluar.
- Router guard: belum login -> `/login`; role tidak sesuai -> redirect ke `/tasks`. Guard hanya kenyamanan; server tetap penentu.
- Wrapper API: menambahkan header `Authorization`, mem-parsing format error bagian 5, dan pada 401 menghapus sesi lalu mengarahkan ke `/login`.
- Wajib ada untuk setiap tampilan yang memanggil API: status **loading** (tombol nonaktif/spinner saat submit, skeleton/teks saat memuat daftar), status **error** (pesan jelas + tombol coba lagi), dan status **kosong** (pesan saat tidak ada tugas).
- Format tenggat ditampilkan dalam zona waktu lokal; tugas lewat tenggat diberi penanda.

Vite dev: proxy `/api` ke `http://localhost:3000`. Frontend memakai URL relatif `/api/v1`, tanpa base URL hard-coded.

## 11. Fase kerja (satu commit per langkah)

Backend:
1. Setup `backend/`: npm, TypeScript, ESLint, Prettier, struktur folder, `.gitignore`, `.env.example`, `config/env.ts`, `GET /health`.
2. Database: schema Prisma, migrasi awal, Prisma client, seeder. `docker-compose.yml` awal hanya service `db`.
3. Infrastruktur HTTP: `AppError`, `asyncHandler`, `validate`, `errorHandler`, `notFound`, helmet/cors/rate-limit.
4. Auth: register, login, me, middleware `authenticate` dan `requireRole`.
5. Tasks (guru): create, update, delete dengan cek kepemilikan.
6. Tasks (baca): list dengan search, filter status, pagination; detail; scoping kelas siswa.
7. Completion: complete dan uncomplete.
8. Test: tiga endpoint di bagian 9.

Frontend:
9. Setup `frontend/`: Vite + Vue + TypeScript, ESLint, Prettier, Router, Pinia, proxy `/api`, wrapper API, komponen loading/error.
10. Auth UI: login, register, store auth, guard, navbar, logout.
11. Daftar tugas: list, pencarian, filter, paginasi, sinkron URL, status loading/error/kosong.
12. Aksi siswa: tandai selesai dan batalkan.
13. Aksi guru: form tambah/ubah, hapus dengan konfirmasi.

Penutup:
14. Docker: `Dockerfile` multi-stage di root (build frontend, build backend, runtime menyajikan `frontend/dist` dengan `SERVE_FRONTEND=true`), `docker-compose.yml` (db + app, `prisma migrate deploy` otomatis saat start, `env_file: backend/.env` dengan `DATABASE_URL` ditimpa ke host `db`), `.dockerignore`.
15. README root: langkah dari nol (dev dan Docker), akun contoh, daftar endpoint, keputusan desain, bagian yang belum selesai (jujur), plus perbarui `docs/README.md`.

## 12. Definition of Done

- `docker compose up --build` lalu seed menghasilkan aplikasi yang bisa dipakai penuh di http://localhost:3000.
- Semua endpoint berfungsi dengan format respons bagian 5; semua alur UI bagian 10 berfungsi.
- Test backend lulus; lint dan build bersih di `backend/` dan `frontend/`.
- Riwayat git bertahap, tanpa `.env` asli atau secret.
