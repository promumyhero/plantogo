# Spec: PlanToGo — Master Specification

## 1. Objective
Build **PlanToGo**, a collaborative trip itinerary and split-bill web application designed initially for a 4-person Central Java (*Jawa Tengah*) trip and architected to scale cleanly to public users without database bottlenecks.

### Core User Flow
1. **Landing Page (`/`)**: Editorial minimalist travel showcase with a cohesive **Earth Tone** palette (Warm Sand `#F7F5F0`, Deep Espresso `#2C2623`, Sage Olive `#5F6F52`, Terracotta `#C86D51`, Warm Ochre `#D4A373`), refined typography, and custom-styled dropdowns.
2. **Single-User Focus + Canva-Style Share & Permissions**:
   - The app focuses cleanly on **1 primary user session** (no confusing multi-account simulation switchers in the navbar).
   - Multi-user collaboration works **just like Canva**: a **"Bagikan (Share)"** button in the top-right header opens a Canva-style Share Modal where the owner invites up to 3 friends by email (max 4 people total) and sets each person's permission level (**Bisa Edit / Can Edit** vs. **Hanya Lihat / Can View**), plus a quick permission preview toggle if the owner wants to preview how a Viewer/Editor sees the table.
3. **Table-First Dashboard & Itinerary Planner (`/dashboard` & `/trips/[tripId]`)**:
   - Instead of cluttered cards, the core workspace uses a **user-friendly, interactive Table Layout** (spreadsheet/Canva-table style) where the user can directly input and edit rows:
     - **Hari / Tanggal**
     - **Jam (Mulai – Selesai)**
     - **Tujuan / Mau Kemana**
     - **Kategori Aktivitas** (Custom Earth-Tone Dropdown)
     - **Estimasi / Realisasi Biaya (Rp)** (Strict Numeric Input)
     - **Catatan Spesifik**
     - **Canva-Style Row Actions**: Inline Edit, Duplicate Row, Lock/Unlock Row (`is_locked`), and Delete Row.
   - Includes a clean **Tabel Rencana Keuangan & Split-Bill** right below or via a clean tab switch, using the same fast, scannable table layout.

---

## 2. Tech Stack
- **Framework**: Next.js 15 (App Router, React 19, TypeScript 5.x, Server Actions + Route Handlers)
- **Database & Auth**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`) running PostgreSQL 15+ with Row Level Security (RLS), PL/pgSQL Triggers, and B-Tree composite indexes
- **Styling & Design System**: Tailwind CSS v4 + `lucide-react` icons + Google Fonts (`Plus Jakarta Sans` for clean UI & numbers, `Instrument Serif` for editorial italic headlines)
- **Animations & Transitions**: `framer-motion` (page transitions, layout animations, step wizard transitions)
- **Notifications & Feedback**: `sonner` (contextual toast notifications for CRUD, role restrictions, and budget alerts)
- **Validation & Forms**: `zod` + `react-hook-form`
- **Testing**: `vitest` + `@testing-library/react` (unit & integration tests for split-bill math, RBAC rules, and onboarding generator) + `playwright` (E2E flows)

---

## 3. Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production bundle
npm run build

# Run unit & integration tests with coverage
npm run test -- --run --coverage

# Run linter and typecheck
npm run lint
npx tsc --noEmit
```

---

## 4. Project Structure
```text
d:\Coding\plantogo\
├── CAPABILITY_MAP.md                → Approved module decomposition & build order
├── SPEC.md                          → Master specification (this file)
├── SPEC-core-db-auth.md             → Module 1 spec: Database schema, RLS, Email Auth & Triggers
├── SPEC-ui-shell-landing.md         → Module 2 spec: Design system, Landing, Dashboard, Transitions
├── SPEC-trip-onboarding.md          → Module 3 spec: Questionnaire wizard & Hybrid generator
├── SPEC-itinerary-collab.md         → Module 4 spec: Day-by-day planner, Transit slots, RBAC
├── SPEC-finance-splitbill.md        → Module 5 spec: Budget vs Actual, Split-Bill & Audit logs
├── supabase/
│   ├── migrations/
│   │   └── 0001_init_plantogo.sql   → Production PostgreSQL schema, indexes, triggers, RLS
│   └── seed.sql                     → Central Java destinations & demo trip seed data
├── src/
│   ├── app/
│   │   ├── (marketing)/page.tsx     → Editorial Landing Page ("Explore Central Java")
│   │   ├── (auth)/login/page.tsx    → Email Login + Instant Demo Member Switcher
│   │   ├── (app)/
│   │   │   ├── dashboard/page.tsx   → Home Dashboard (My Trips, Pending Email Invites)
│   │   │   └── trips/
│   │   │       ├── new/page.tsx     → Interactive Onboarding Questionnaire Wizard
│   │   │       └── [tripId]/        → Collaborative Trip Command Center (Itinerary, Finance, Team)
│   ├── components/
│   │   ├── ui/                      → Reusable primitives (Skeleton, Toast, PillButton, BentoCard)
│   │   ├── layout/                  → Responsive Navigation (Desktop Sidebar, Mobile Bottom Bar, PageTransition)
│   │   ├── onboarding/              → Wizard steps & Central Java preset cards
│   │   ├── itinerary/               → Timeline, DestinationCard, TransitSlot, WishlistPanel
│   │   └── finance/                 → SplitBillCalculator, ExpenseModal, AuditLogDrawer, BudgetBento
│   ├── lib/
│   │   ├── supabase/                → Client, Server, Middleware, and Local/Demo fallback adapter
│   │   ├── split-bill/              → Pure, tested debt-simplification & integer Rupiah math
│   │   ├── rbac/                    → Role permission matrix (Owner, Editor, Viewer)
│   │   └── presets/                 → Curated Jawa Tengah destinations, transit estimates & templates
│   └── types/
│       └── database.ts              → Strict TypeScript definitions matching PostgreSQL schema
└── tests/
    ├── unit/                        → Split-bill math, RBAC guards, Onboarding generator tests
    └── integration/                 → Workflow & state integration tests
```

---

## 5. Code Style & Architectural Conventions
- **Monetary Values**: Always store and compute currency as integer Rupiah (`number` in TS validated via `z.number().int().nonnegative()`, `BIGINT` in PostgreSQL). Never use floating-point division without deterministic remainder distribution.
- **Email Normalization**: All user and invitation emails must be normalized with `.trim().toLowerCase()` before querying or storing.
- **Component Pattern**: Functional components with strict TypeScript interfaces, skeleton fallbacks for async boundaries, and explicit toast feedback on mutations.

### 5.1 Strict Input Validation & Formatting Standards (Aturan Input Best Practice)
Sistem menerapkan pemisahan dan validasi input yang ketat antara angka dan huruf di 3 layer (UI Input Layer, Zod Schema Layer, dan PostgreSQL Constraint Layer):

1. **Input Angka / Finansial (Budget, Nominal Pengeluaran, Split Bill, Durasi, Jumlah Orang)**:
   - **Mobile & Keyboard Optimization**: Wajib menggunakan `inputMode="numeric"` dan `pattern="[0-9]*"` agar keyboard numerik otomatis muncul di HP (iOS/Android).
   - **Blokir Karakter Non-Numerik (Live Filter)**: Mencegah pengetikan huruf (`a-z`, `A-Z`), karakter eksponensial (`e`, `E`), minus (`-`), dan simbol pada event `onKeyDown` serta membersihkan paste input via regex `value.replace(/\D/g, '')`.
   - **Format Tampilan Rupiah**: Input nominal uang otomatis menampilkan *live thousands separator* (misal: user mengetik `1500000`, UI menampilkan `Rp 1.500.000`) sementara *state* internal dan payload API tetap berupa integer murni (`1500000`).
   - **Validasi Zod**: `z.coerce.number().int({ message: 'Harus berupa bilangan bulat' }).nonnegative({ message: 'Nominal tidak boleh negatif' })`.
   - **Database**: Tipe data `BIGINT` / `INTEGER` dengan `CHECK (amount >= 0)`.

2. **Input Teks / Huruf (Nama Anggota, Judul Trip, Destinasi, Catatan)**:
   - **Sanitasi & Trim**: Otomatis melakukan `.trim()` saat blur dan sebelum submit untuk mencegah spasi ganda atau kosong.
   - **Nama Anggota / Orang**: Menggunakan aturan teks ramah nama (`^[a-zA-Z\s'’.-]+$`), otomatis `autoCapitalize="words"`, dan menolak karakter angka atau simbol aneh pada kolom nama panggilan.
   - **Judul & Catatan**: `maxLength` yang terukur (Judul: max 60 karakter; Catatan: max 500 karakter) dengan indikator counter.
   - **Validasi Zod**: `z.string().trim().min(1, 'Wajib diisi').max(N)`.

3. **Input Email (Login & Undangan Kolaborator)**:
   - **Atribut HTML**: `type="email"`, `inputMode="email"`, `autoCapitalize="none"`, `spellCheck="false"`, `autoComplete="email"`.
   - **Normalisasi**: Otomatis menghapus spasi (`value.replace(/\s+/g, '')`) dan dikonversi ke huruf kecil (`.toLowerCase()`).
   - **Validasi Zod**: `z.string().trim().toLowerCase().email({ message: 'Format email tidak valid (contoh: teman@gmail.com)' })`.

4. **Input Waktu & Tanggal**:
   - Waktu menggunakan format 24 jam WIB (`HH:mm`), regex `^([01]\d|2[0-3]):[0-5]\d$`.
   - Tanggal menggunakan format ISO `YYYY-MM-DD` dengan aturan `end_date >= start_date`.

```tsx
// Example: Role-guarded action with toast feedback and integer currency safety
export async function handleLockItineraryItem(
  itemId: string,
  role: TripMemberRole,
  toggleLock: (id: string) => Promise<{ ok: boolean; error?: string }>
) {
  if (role !== 'owner') {
    toast.error('Akses Ditolak', {
      description: 'Hanya Owner perjalanan yang dapat mengunci atau membuka kunci jadwal.',
    });
    return;
  }

  const result = await toggleLock(itemId);
  if (!result.ok) {
    toast.error('Gagal memperbarui status kunci', { description: result.error });
    return;
  }

  toast.success('Jadwal dikunci', {
    description: 'Item ini kini terlindungi dari perubahan tidak sengaja.',
  });
}
```

---

## 6. Testing Strategy
- **Framework**: Vitest + React Testing Library.
- **Coverage Target**: ≥ 90% coverage on business logic (`src/lib/split-bill`, `src/lib/rbac`, `src/lib/presets`).
- **Test Levels**:
  1. **Unit Tests**:
     - Debt simplification algorithm (4 members, unequal payments, exact/equal/percentage splits, zero-sum rounding verification).
     - RBAC permission enforcement (`owner` vs `editor` vs `viewer`, locked item protection, 4-member cap enforcement).
     - Onboarding questionnaire recommendation engine (matching Jawa Tengah regions + vibe answers to generated itinerary & budget allocations).
  2. **Integration / Component Tests**:
     - Adding a collaborator by email (`invited_email`) and verifying auto-binding when that email logs in.
     - Logging an actual expense from an itinerary card and verifying *Plan vs. Actual* recalculation.

---

## 7. Boundaries
- **Always do**:
  - Normalize emails (`LOWER(TRIM(email))`) in both TypeScript and PostgreSQL triggers.
  - Enforce the 4-member limit per trip at both the UI layer and the PostgreSQL trigger layer.
  - Provide smooth transitions (`framer-motion`), skeleton placeholders during loading, and clear Indonesian `sonner` toast messages for every mutation.
  - Test responsive behavior across Mobile (`375px`), Tablet (`768px`), and Desktop (`1280px+`).
- **Ask first**:
  - Adding paid third-party external APIs (e.g., paid Google Maps Billing APIs or paid LLM APIs).
  - Modifying the 4-member cap or changing the core role definitions (`owner`, `editor`, `viewer`).
- **Never do**:
  - Store monetary values as `FLOAT` or `REAL` in PostgreSQL.
  - Write N+1 unindexed subqueries inside Supabase RLS policies.
  - Commit `.env.local` secrets or service-role keys to version control.

---

## 8. Success Criteria
1. **Visual & UX Fidelity**: Landing page, Home Dashboard, and Trip Workspace reflect the 3 uploaded references (Editorial Serif Italic + Sans typography, full-bleed Indonesian landscape hero with floating glass search/plan bar, `rounded-3xl` cards, dot-matrix progress bars, smooth page transitions, skeletons, and toasts).
2. **Email-Based Collaboration (Max 4 Users)**: Owner can invite up to 3 friends using their login email addresses (`owner`, `editor`, `viewer`). Trying to add a 5th member is blocked with a clear toast and rejected by the database trigger.
3. **Onboarding Questionnaire to Specific Plan**: Answering the initial wizard generates a tailored Central Java day-by-day schedule (with transit slots and estimated costs) + category budgets.
4. **Strict RBAC & Auditability**:
   - `viewer` can view schedule and finances but cannot add/edit/delete.
   - `editor` can add/edit non-locked schedule items and expenses, but cannot delete the trip, change member roles, or modify Owner-locked items.
   - Every expense update or deletion records an entry in the financial audit log.
5. **Accurate Split-Bill & Settlement**: Supports splitting expenses among the 4 members (even while an invited email is still pending first login) and calculates the minimum number of transfers required to settle all debts accurately to the single Rupiah.

