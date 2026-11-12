# Implementation Plan: PlanToGo (Collaborative Itinerary & Split-Bill Web App)

## Overview
PlanToGo is an editorial, minimalist-modern web application built with Next.js 15 (App Router), TypeScript, and Supabase (PostgreSQL 15+ with RLS). It is purpose-built to help a 4-person travel group plan a detailed, realistic Central Java trip itinerary, track real-time budgets (*Plan vs. Actual*), and automatically simplify *Split-Bill* debts across members using their login emails.

The design strictly synthesizes the user's 3 uploaded references:
1. *Visa Travels*: Full-bleed hero with floating glassmorphic filter bar, generous white space, and `rounded-3xl` destination cards.
2. *Visit Indonesia*: High-contrast editorial dark showcases, vertical slide numbering (`01 - 05`), and dramatic landscape framing.
3. *Nepalora*: Editorial serif italic headlines (`Instrument Serif`), dot-matrix progress indicators for travel vibe and budget health, and bento analytics cards.

## Architecture Decisions
1. **Next.js 15 App Router with Tailwind CSS v4 & Framer Motion**:
   - Modern React 19 architecture with Server Components for SEO/landing speed and Client Components for high-interactivity views (Questionnaire Wizard, Timeline drag/drawer, Expense modal).
   - Global typography pairing: `Plus Jakarta Sans` for ultra-clean UI, metadata, and tabular figures; `Instrument Serif` (italic) for editorial accent headlines.
2. **PostgreSQL & Dual-Mode Auth (Supabase + Instant Demo Email Switcher)**:
   - Complete production migration file (`supabase/migrations/0001_init_plantogo.sql`) with Row Level Security (RLS) policies, B-Tree composite indexes, and 3 database triggers:
     - `enforce_max_four_trip_members()` (hard cap of 4 collaborators per trip)
     - `auto_bind_invited_email_on_login()` (auto-links `user_id` when invited email signs in)
     - `log_expense_mutation()` (immutable audit trail for every financial mutation)
   - In-app **Demo Email Switcher** allowing instant testing and offline/personal MVP use across 4 distinct member emails (`ridho@plantogo.id` [Owner], `andi@gmail.com` [Editor], `budi@gmail.com` [Editor], `citra@gmail.com` [Viewer]) without requiring manual Supabase email confirmations upfront.
3. **Integer Rupiah Monetary Math (`BIGINT`)**:
   - All amounts (budgets, expenses, shares, settlements) are strictly represented as integers in IDR.
   - Any remainder during division (e.g., `Rp 100.000` split by 3 or 4 members) is deterministically allocated to ensure $\sum \text{shares} \equiv \text{amount}$ with zero rounding discrepancy.
4. **Mobile-First Responsive Navigation**:
   - Mobile (`< 768px`): Floating glassmorphic **Bottom Navigation Bar** (`Ringkasan`, `Jadwal`, `Keuangan`, `Tim/4`) for one-handed operation during travel.
   - Tablet/Desktop (`>= 768px`): Collapsible Left Navigation Sidebar with quick stats and collaborator avatar pills.
5. **Strict Input Standards & Best-Practice Sanitization (Aturan Input)**:
   - **Numeric / Financial Fields** (Budget, Expenses, Shares, Transit Duration): Component `NumericCurrencyInput` enforcing `inputMode="numeric"`, `pattern="[0-9]*"`, blocking non-digits on `onKeyDown`, live `Rp` thousand-separator display with raw integer internal state, and Zod `z.coerce.number().int().nonnegative()`.
   - **Text / Name Fields** (Member Names, Trip Title, Notes): Trimmed on blur, XSS-safe, name-only validation (`^[a-zA-Z\s'’.-]+$`) for collaborator names, with explicit length counters.
   - **Email Fields**: Auto-lowercase, space-stripped, and validated with Zod email schema.

## Task List Summary
See `tasks/todo.md` for granular acceptance criteria, verification commands, and file lists for each task.

### Phase 1: Foundation & Database Layer (`core-db-auth`)
- [x] Task 1: Next.js 15 project initialization, Tailwind CSS, typography, and test harness
- [x] Task 2: Supabase PostgreSQL schema, migrations, RLS, indexes, and triggers
- [x] Task 3: Dual-Mode Auth client, session management, and 4-member email switcher
- **Checkpoint 1: Foundation** (Types check, database migrations valid, demo auth works)

### Phase 2: Editorial UI Shell & Landing Page (`ui-shell-landing`)
- [x] Task 4: Design system primitives (GlassBar, BentoCard, DotMatrixProgress, Skeletons, Toasts)
- [x] Task 5: Editorial Landing Page (`/`) following the 3 design references
- [x] Task 6: Responsive App Shell (Desktop Sidebar + Mobile Bottom Bar) & Home Dashboard (`/dashboard`)
- **Checkpoint 2: UI Shell & Landing** (Visual design aligns with references, responsive across viewports)

### Phase 3: Interactive Onboarding & Hybrid Central Java Generator (`trip-onboarding`)
- [x] Task 7: Central Java Presets & Recommendation Engine (Semarang, Dieng, Magelang, Solo, Jogja, Karimunjawa)
- [x] Task 8: 4-Step Questionnaire Wizard (`/trips/new`) with email invitation inputs
- [x] Task 9: Itinerary & Budget Auto-Generation Engine (day-by-day skeleton + transit slots)
- **Checkpoint 3: Onboarding & Generator** (Completing wizard creates trip with max 4 members and realistic schedule)

### Phase 4: Collaborative Itinerary Command Center (`itinerary-collab`)
- [x] Task 10: Specific Day-by-Day Timeline with Transit Buffer Slots
- [x] Task 11: Wishlist Drawer, Item Locking, and Role-Based Access Guards (`owner`, `editor`, `viewer`)
- [x] Task 12: Member Management Modal with Email Inviting and 4-Member Cap Enforcement
- **Checkpoint 4: Itinerary & Collaboration** (Schedule editing works, locked items protected, viewer strictly blocked)

### Phase 5: Finance, Split-Bill & Security Audit (`finance-splitbill`)
- [x] Task 13: Pure Mathematical Split-Bill & Debt-Simplification Engine with Vitest Suite
- [x] Task 14: Bento Budget Dashboard (*Plan vs. Actual*) with 1-Click Itinerary Expense Logging
- [x] Task 15: Expense Logger Modal (`equal`, `exact`, `percentage`) & Settlement Tracker
- [x] Task 16: Financial Security Audit Log Drawer (`expense_audit_logs`)
- **Checkpoint 5: End-to-End Verification** (Complete E2E test of all flows across mobile, tablet, and desktop)

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Supabase credential configuration delay in local environment | Medium | Implemented a seamless **Dual-Mode Adapter**: operates with local in-memory/localStorage seed store if Supabase env vars are empty, switching to Supabase without code changes once connected. |
| Split-bill floating point rounding errors on odd amounts | High | All calculations use integer IDR with deterministic remainder distribution unit-tested in Vitest. |
| Unauthorized financial/schedule changes by collaborators | High | Strict RBAC matrix enforced at UI layer, state layer, and PostgreSQL triggers, with immutable audit logging on every change. |
| Cluttered UI on mobile phones during active travel | High | Mobile-first bottom navigation, oversized tap targets, contextual sheets, and fast 1-click expense logging from schedule items. |

## Open Questions & Dependencies
- External dependencies: npm packages (`next`, `react`, `react-dom`, `tailwindcss`, `lucide-react`, `framer-motion`, `sonner`, `zod`, `clsx`, `tailwind-merge`, `@supabase/supabase-js`, `vitest`).
