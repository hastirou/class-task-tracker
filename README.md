# class-task-tracker

Aplikasi Manajemen Tugas Kelas: guru membuat, mengubah, dan menghapus tugas; siswa
melihat daftar tugas kelasnya dan menandainya selesai. Satu repo, dua folder mandiri:
REST API (`backend/`) dan antarmuka web (`frontend/`). Detail proyek di
[`docs/README.md`](docs/README.md), spesifikasi di [`docs/spec.md`](docs/spec.md).

## Menjalankan (development)

Prasyarat: Node.js 22 LTS dan Docker (untuk database PostgreSQL). Jalankan tiga proses
di terminal terpisah.

```bash
# 1. Database (docker-compose.yml, port 5433)
docker compose up -d db

# 2. Backend -> http://localhost:3000
cd backend
npm install
cp .env.example .env   # isi JWT_SECRET (min. 32 karakter) dan TEACHER_REGISTRATION_CODE
npm run db:generate    # generate Prisma client
npm run db:migrate:dev # terapkan migrasi
npm run db:seed        # data contoh (guru + siswa + tugas)
npm run dev

# 3. Frontend -> http://localhost:5173
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`. Vite mem-proxy `/api` ke backend (`frontend/vite.config.ts`),
jadi cukup satu origin di 5173 saat development.

Setelah `npm run db:seed`, akun contoh siap dipakai:

- Guru: `guru@example.com` / `***REMOVED***`
- Siswa: `siswa1@example.com`, `siswa2@example.com`, `siswa3@example.com` / `***REMOVED***`

(Registrasi guru baru lewat form membutuhkan `TEACHER_REGISTRATION_CODE` dari `.env`.)

Alternatif lain:

- Jalankan semua dalam Docker (satu origin di `http://localhost:3000`): **belum tersedia** —
  `Dockerfile` dan service `app` menyusul di fase Docker.
- Dokumentasi API (Scalar): `http://localhost:3000/api/docs` (juga `/docs`), dokumen mentah di
  `http://localhost:3000/api/openapi.json`.
- Lint: `npm run lint` di `backend/` dan `frontend/` (format: `npm run format` di `backend/`).

## Penggunaan Alat AI

Proyek ini dikerjakan dengan bantuan alat AI (Claude) & Agentic AI (PI). Berikut rinciannya.

### Bagian yang dibantu AI

- **Frontend (`frontend/`)**: struktur proyek Vue + Vite, halaman login/register, daftar tugas
  (pencarian, filter, paginasi), form guru, wrapper API, dan penanganan status
  loading/error/kosong ditulis dengan bantuan AI.
- **Perencanaan**: struktur repo, spesifikasi (`docs/spec.md`), dan aturan kerja (`AGENTS.md`)
  disusun dengan bantuan AI.

### Yang saya ubah / kerjakan sendiri

- "Menjalankan dan memverifikasi semua endpoint secara manual lewat Swagger UI"
- "Menulis ulang pesan error di frontend agar lebih jelas"

### Verifikasi

Semua kode hasil AI saya baca, jalankan, dan uji sebelum di-commit. Riwayat commit
mencerminkan tahapan pengerjaan.