# PlanToGo 🎒🗺️

> **Modern Collaborative Travel Itinerary & Split-Bill Web Application**  
> Designed with an editorial Earth Tone aesthetic, real-time collaboration, strict financial calculations, and Supabase integration.

---

## 🌟 Overview

**PlanToGo** adalah aplikasi web perencanaan perjalanan kolaboratif yang menggabungkan kemudahan manajemen *itinerary* bergaya tabel/spreadsheet interaktif (serupa Canva) dan kalkulator bagi tagihan (*split-bill*) yang presisi hingga pembulatan rupiah.

Aplikasi ini dirancang untuk kelompok perjalanan (seperti trip 4 orang keliling Jawa Tengah) dan siap diskalakan ke publik dengan sistem izin berbasis peran (Role-Based Access Control / RBAC) yang terstruktur.

---

## ✨ Fitur Utama

- **Canva-Style Itinerary Workspace (`/trips/[tripId]`)**:
  - Tampilan tabel interaktif (*spreadsheet-like*) untuk menyusun jadwal per hari dan jam.
  - Kategori aktivitas dengan palet warna Earth Tone (*Warm Sand, Deep Espresso, Sage Olive, Terracotta, Warm Ochre*).
  - Aksi baris lengkap: Inline edit, duplikasi baris, kunci baris (`lock`), dan hapus baris.
  - Modal berbagi (*Share Modal*) Canva-style dengan kontrol izin: **Bisa Edit (`editor`)** vs **Hanya Lihat (`viewer`)**.
- **Kalkulator Rencana Keuangan & Split-Bill**:
  - Perhitungan otomatis siapa berutang kepada siapa dengan metode *debt simplification*.
  - Input biaya dengan validasi numerik ketat tanpa nilai negatif atau format desimal tak wajar.
  - Grafik dan rincian alokasi budget berbasis kategori.
- **Onboarding Perjalanan Praktis (`/trips/new`)**:
  - Wizard multi-langkah interaktif dengan *dot matrix progress indicator*.
  - Pilihan preset itinerary siap pakai (misal: Jawa Tengah 4D3N) atau kustom mandiri.
- **Autentikasi & RBAC (Role-Based Access Control)**:
  - Dukungan Supabase Auth dan mode Demo / Local Persistence bawaan.
  - Proteksi aksi (*Owner, Editor, Viewer*) untuk mencegah modifikasi tidak berizin.
- **Desain Editorial & Responsif**:
  - Ditenagai oleh Tailwind CSS v4, tipografi *Plus Jakarta Sans*, dan animasi halus dengan `framer-motion`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19, TypeScript 5)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Toast Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL 15+, RLS Policies, Triggers)
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 📁 Struktur Direktori

```plaintext
plantogo/
├── docs/                      # Ideasi dan catatan teknis
├── src/
│   ├── app/                   # Next.js App Router (pages & layouts)
│   │   ├── dashboard/         # Dashboard ringkasan trip
│   │   ├── login/             # Halaman autentikasi
│   │   ├── trips/             # Halaman trip detail & wizard baru
│   │   ├── globals.css        # Tema dan style global Tailwind v4
│   │   └── layout.tsx         # Root layout dengan context provider
│   ├── components/            # Reusable UI & fitur components
│   │   ├── finance/           # Komponen keuangan & split-bill
│   │   ├── itinerary/         # Workspace tabel itinerary Canva-style
│   │   ├── layout/            # Navbar, footer, page transitions
│   │   └── ui/                # Base UI components (bento, select, input, etc.)
│   ├── lib/                   # Utilitas, stores, dan modul logika bisnis
│   │   ├── auth/              # Context & demo auth
│   │   ├── presets/           # Preset perjalanan (misal Jawa Tengah)
│   │   ├── rbac/              # Aturan hak akses & guards
│   │   ├── split-bill/        # Algoritma perhitungan split-bill
│   │   ├── store/             # State management / Local store
│   │   └── supabase/          # Supabase client initializer
│   └── types/                 # Definisi tipe TypeScript & skema database
├── supabase/
│   ├── migrations/            # Skema migrasi SQL & kebijakan RLS
│   └── seed.sql               # Data awal / dummy development
├── tasks/                     # Task tracking & roadmap
├── tests/
│   ├── setup.ts               # Setup konfigurasi test runner
│   └── unit/                  # Unit tests (split-bill, rbac, rules, auth, dll.)
├── CAPABILITY_MAP.md          # Peta kapabilitas sistem
├── SPEC*.md                   # Spesifikasi teknis modular
├── package.json
└── tsconfig.json
```

---

## 🚀 Memulai (Getting Started)

### 1. Prasyarat
- **Node.js** v20.x atau lebih baru
- **pnpm** (direkomendasikan) atau `npm`

### 2. Instalasi Dependensi
```bash
pnpm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
> *Catatan:* Jika kredensial Supabase dikosongkan, aplikasi secara otomatis berjalan dalam **Mode Demo / Local Persistence** tanpa perlu setup cloud database terlebih dahulu.

### 4. Menjalankan Server Pengembangan
```bash
pnpm dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 5. Menjalankan Pengujian (Testing)
```bash
# Menjalankan seluruh unit test
pnpm test

# Type checking TypeScript
pnpm exec tsc --noEmit
```

### 6. Build Produksi
```bash
pnpm build
pnpm start
```

---

## 🗄️ Setup Database Supabase (Opsional)

Jika ingin menghubungkan langsung ke Supabase Cloud:
1. Jalankan migrasi yang ada di `supabase/migrations/0001_init_plantogo.sql` pada SQL Editor Supabase Anda.
2. (Opsional) Masukkan seed data dari `supabase/seed.sql`.
3. Masukkan URL dan Anon Key project Supabase ke `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 📜 Lisensi & Kontribusi

Proyek ini dikembangkan mengikuti standar **Trunk-Based Development** dan **Conventional Commits**:
- `feat:` Fitur baru
- `fix:` Perbaikan bug
- `docs:` Dokumentasi
- `chore:` Konfigurasi tooling & dependensi
- `test:` Penambahan atau pembaruan test suite
- `refactor:` Restrukturisasi kode tanpa mengubah fungsionalitas
