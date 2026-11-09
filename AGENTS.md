> Last verified: (isi saat commit pertama) against commit (hash)

# Rules

Aturan dan batasan mutlak untuk agent yang bekerja di repo ini.

## Reading

1. File ini (`AGENTS.md`): aturan
2. `docs/README.md`: gambaran proyek, stack, peta repo, cara menjalankan
3. `docs/spec.md`: spesifikasi build (model data, endpoint, format respons, UI, fase kerja)

Setiap doc diawali `> Last verified: YYYY-MM-DD against commit <hash>`. Cocokkan dengan `git rev-parse --short HEAD` sebelum mempercayai isinya.

## Repo structure

- Satu repo, dua folder mandiri: `backend/` dan `frontend/`. **Bukan monorepo**: tanpa npm workspaces, tanpa paket bersama. Masing-masing punya `package.json` dan `npm install` sendiri.
- Kontrak antara keduanya hanya REST API di `docs/spec.md`. Frontend tidak boleh meng-import apa pun dari `backend/`.
- File di root hanya: `AGENTS.md`, `README.md`, `docker-compose.yml`, `Dockerfile`, `.gitignore`, `.dockerignore`, `docs/`.

## Working rules

- Kerjakan per fase di `docs/spec.md`. **Satu commit per langkah logis**, Conventional Commits dengan scope `api`, `web`, `docker`, atau `docs` (contoh: `feat(api): add login endpoint`). Jangan satu commit besar.
- Setelah tiap fase: jalankan lint dan build pada folder yang disentuh (dan `npm test` di `backend/` bila menyentuh backend), commit, lalu berhenti dan laporkan.
- Jangan menambah fitur di luar `docs/spec.md`. Jika ada keputusan yang tidak tercakup, berhenti dan tanya, jangan menebak.
- Perubahan pada schema, env, auth, script, atau arsitektur harus memperbarui doc terkait dan baris "Last verified" dalam commit yang sama.
- Jika suatu alasan tidak bisa dipastikan dari kode/config/git, tulis `Rationale tidak terdokumentasi (konfirmasi ke pemilik repo)`, jangan mengarang.

## Security constraints

- Tidak ada secret, token, atau `.env` asli di repo. Hanya `.env.example` dengan placeholder.
- Password selalu di-hash; tidak pernah dikembalikan di respons atau di-log.
- Otorisasi dilakukan di server (middleware). Pembatasan di UI hanya kenyamanan, bukan keamanan.
- Semua input (body, query, params) divalidasi Zod di backend. Hanya Prisma (query berparameter), tanpa raw SQL hasil string concat.
- Error 500 tidak boleh membocorkan stack trace atau pesan internal.
- Frontend tidak memakai `v-html` dengan data dari API, dan tidak menulis token ke console/log.

## Testing bias

- Backend: integration-first terhadap Postgres sungguhan (database test terpisah, migrasi dijalankan) via Vitest + Supertest.
- Test membuat data sendiri dan membersihkannya di `afterAll`/`finally`.
- Jangan pernah menjalankan test terhadap database non-test.
- Frontend: tidak ada test otomatis (di luar lingkup nilai tambah). Verifikasi lewat `npm run build` dan `vue-tsc` bersih.

## Not present

- Tidak ada integrasi pihak ketiga, CI/CD, atau deployment di luar `Dockerfile` + `docker-compose.yml`.
- Nilai tambah hanya dua: test minimal tiga endpoint, dan Docker. Tidak ada OpenAPI, tampilan responsif khusus, atau notifikasi tenggat.
