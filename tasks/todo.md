# Tasks: PlanToGo Implementation

This task list follows the approved [CAPABILITY_MAP.md](../CAPABILITY_MAP.md) and [SPEC.md](../SPEC.md). Every task has explicit acceptance criteria and verification commands.

---

## Phase 1: Foundation & Database Layer (`core-db-auth`)

### Task 1: Next.js 15 Project Setup, Styling & Test Harness
**Description:** Initialize Next.js 15 with React 19, TypeScript, Tailwind CSS, Lucide icons, Framer Motion, Sonner, and configure Vitest for unit testing.
**Acceptance criteria:**
- [x] Next.js app builds cleanly with `npm run build`.
- [x] Tailwind CSS and fonts (`Plus Jakarta Sans` and `Instrument Serif`) are configured.
- [x] Vitest test runner runs and passes a sample test.
**Verification:**
- `npm run build`
- `npx vitest run`
**Dependencies:** None
**Files touched:**
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `vitest.config.ts`
**Estimated scope:** M (3-5 files)

---

### Task 2: PostgreSQL Schema, Migration, Indexes & Security Triggers
**Description:** Create the complete Supabase SQL migration containing `profiles`, `trips`, `trip_members`, `itinerary_items`, `expenses`, `expense_splits`, `settlements`, and `expense_audit_logs`, along with triggers for max 4 members, auto-binding invited emails, and financial audit logging.
**Acceptance criteria:**
- [x] Migration file `supabase/migrations/0001_init_plantogo.sql` contains all 8 tables and composite indexes.
- [x] Database trigger `enforce_max_four_trip_members` prevents inserting a 5th member.
- [x] Trigger `auto_bind_invited_email_on_login` auto-links `user_id` when an invited email profile is created.
- [x] TypeScript database definitions in `src/types/database.ts` strictly mirror the SQL schema.
**Verification:**
- Check SQL syntax and ensure `src/types/database.ts` compiles with `npx tsc --noEmit`.
**Dependencies:** Task 1
**Files touched:**
- `supabase/migrations/0001_init_plantogo.sql`
- `supabase/seed.sql`
- `src/types/database.ts`
**Estimated scope:** S (3 files)

---

### Task 3: Dual-Mode Auth Adapter & 4-Member Session Switcher
**Description:** Implement an auth layer that supports Supabase Auth while providing an instant Demo Email Switcher for 4 collaborator accounts (`ridho@plantogo.id` [Owner], `andi@gmail.com` [Editor], `budi@gmail.com` [Editor], `citra@gmail.com` [Viewer]) so local testing and MVP usage work immediately.
**Acceptance criteria:**
- [x] User can switch active email session with 1 click in the UI.
- [x] Invited email matching logic works deterministically (`LOWER(TRIM(email))`).
- [x] Active member role (`owner`, `editor`, `viewer`) is computed dynamically based on the current trip and active email.
**Verification:**
- `npx vitest run tests/unit/auth.test.ts`
**Dependencies:** Task 2
**Files touched:**
- `src/lib/auth/context.tsx`
- `src/lib/auth/demo-users.ts`
- `src/lib/supabase/client.ts`
- `tests/unit/auth.test.ts`
**Estimated scope:** M (4 files)

---

### Checkpoint: Foundation
- [x] `npm run build` succeeds.
- [x] All unit tests pass (`npx vitest run`).
- [x] Database schema and dual-mode auth abstraction are verified.

---

## Phase 2: Editorial UI Shell & Landing Page (`ui-shell-landing`)

### Task 4: Design System Primitives, Strict Input Components & Editorial Primitives
**Description:** Build the design system components inspired by the 3 uploaded user references: `BentoCard`, `PillBadge`, `DotMatrixProgress` (vibe & budget dots), `GlassFilterBar`, `SkeletonLoader`, `PageTransitionWrapper`, plus strict input primitives: `NumericCurrencyInput` (blocks letters/symbols on keydown, formats live Rupiah `Rp 1.500.000`, numeric keypad on mobile) and `StrictTextInput` (auto-trim, name regex filter, length counter).
**Acceptance criteria:**
- [x] Components support clean light theme (`#FAFAFA`) and dark obsidian highlights (`#0F172A`).
- [x] `DotMatrixProgress` renders dot indicator arrays for score visualization (Ref #3).
- [x] `NumericCurrencyInput` strictly blocks non-numeric keystrokes (`a-z`, `e`, symbols), formats live Rupiah with thousand-separators, and emits raw integer values.
- [x] `StrictTextInput` sanitizes input, auto-trims, and supports name-only alphabetic restrictions where appropriate.
- [x] `PageTransitionWrapper` animates page transitions smoothly using Framer Motion.
- [x] Skeletons exist for cards, timelines, and budget widgets.
**Verification:**
- Component render and input restriction unit test with Vitest & visual verification.
**Dependencies:** Task 3
**Files touched:**
- `src/components/ui/bento-card.tsx`
- `src/components/ui/dot-matrix-progress.tsx`
- `src/components/ui/numeric-currency-input.tsx`
- `src/components/ui/strict-text-input.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/layout/page-transition.tsx`
**Estimated scope:** M (6 files)

---

### Task 5: Editorial Landing Page (`/`)
**Description:** Implement the full Landing Page synthesizing the 3 design references: full-bleed Central Java landscape hero with floating glass filter bar (Ref #1), vertical slide numbering and dark featured strip (Ref #2), and editorial italic typography + bento value highlights (Ref #3).
**Acceptance criteria:**
- [x] Hero displays headline *"Jawa Tengah Without Limits. Rencanakan Perjalanan Terbaikmu."* with editorial italic accents.
- [x] Translucent glass filter bar allows selecting Vibe, Region, Duration, and Budget, redirecting to the Onboarding wizard.
- [x] Featured Central Java cards carousel and dark contrast destination strip render properly.
- [x] Responsive across mobile (stacked), tablet, and desktop viewports.
**Verification:**
- `npm run build`
- Manual check on 375px, 768px, and 1280px screen widths.
**Dependencies:** Task 4
**Files touched:**
- `src/app/(marketing)/page.tsx`
- `src/components/landing/hero-section.tsx`
- `src/components/landing/curated-carousel.tsx`
- `src/components/landing/bento-features.tsx`
**Estimated scope:** M (4 files)

---

### Task 6: Responsive App Shell & Home Dashboard (`/dashboard`)
**Description:** Build the authenticated application shell (Collapsible Sidebar for desktop/tablet, Frosted Bottom Navigation Bar for mobile) and the Home Dashboard showing active trips, pending email invitations, and overall stats.
**Acceptance criteria:**
- [x] Mobile bottom navigation allows 1-thumb switching between views.
- [x] Top bar displays active email avatar, role badge, and demo account switcher.
- [x] Pending Email Invitations banner informs the user when their email has been invited to a trip with 1-click accept.
- [x] Empty state guides the user to create their first Central Java trip.
**Verification:**
- `npm run build`
- Mobile viewport navigation verification.
**Dependencies:** Task 5
**Files touched:**
- `src/components/layout/app-shell.tsx`
- `src/components/layout/mobile-bottom-nav.tsx`
- `src/components/layout/desktop-sidebar.tsx`
- `src/app/(app)/dashboard/page.tsx`
**Estimated scope:** M (4 files)

---

### Checkpoint: UI Shell & Landing
- [x] Landing page and Home Dashboard render cleanly without console errors.
- [x] Responsive layout adapts smoothly from 375px mobile to 1440px desktop.
- [x] Toast notifications and skeletons render smoothly during interactions.

---

## Phase 3: Interactive Onboarding & Central Java Generator (`trip-onboarding`)

### Task 7: Central Java Presets & Hybrid Recommendation Engine
**Description:** Build curated Central Java dataset (`Semarang`, `Dieng`, `Magelang`, `Solo`, `Jogja border`, `Karimunjawa`) with realistic durations, estimated costs, transit times, and vibe tags, along with an algorithm that generates a tailored day-by-day itinerary skeleton and budget allocation.
**Acceptance criteria:**
- [x] Dataset contains verified places, activities, and transit estimates across the 6 Central Java regions.
- [x] Generator accepts clusters, dates, vibe, and pace, outputting structured days with transit buffers.
- [x] Budget calculator allocates realistic proportions across transport, lodging, food, tickets, and miscellaneous.
**Verification:**
- `npx vitest run tests/unit/generator.test.ts`
**Dependencies:** Task 2
**Files touched:**
- `src/lib/presets/jawa-tengah.ts`
- `src/lib/generator/itinerary-generator.ts`
- `src/lib/generator/budget-generator.ts`
- `tests/unit/generator.test.ts`
**Estimated scope:** M (4 files)

---

### Task 8: 4-Step Questionnaire Wizard (`/trips/new`)
**Description:** Build the interactive step-by-step onboarding wizard: Step 1 (Region & Dates), Step 2 (Vibe & Pace), Step 3 (Budget targets with `NumericCurrencyInput`), and Step 4 (Invite up to 3 collaborator emails with roles, using strict email and name validation).
**Acceptance criteria:**
- [x] Smooth step-by-step navigation with Framer Motion slide transitions.
- [x] Step 3 budget input enforces numeric-only entry, mobile numeric keypad, and live Rupiah formatting (`Rp 5.000.000`).
- [x] Step 4 limits invited emails to max 3 (total 4 including creator) and validates email formatting (lowercase, trimmed).
- [x] Collaborator display names enforce alphabetic name validation (`^[a-zA-Z\s'’.-]+$`).
- [x] Role selector allows assigning `Editor` or `Viewer` to each invited email.
- [x] Preview summary displays before final trip creation.
**Verification:**
- Manual run through the 4 steps on mobile and desktop viewports.
**Dependencies:** Task 6, Task 7
**Files touched:**
- `src/app/(app)/trips/new/page.tsx`
- `src/components/onboarding/step-regions.tsx`
- `src/components/onboarding/step-vibe.tsx`
- `src/components/onboarding/step-budget.tsx`
- `src/components/onboarding/step-collaborators.tsx`
**Estimated scope:** L (5 files)

---

### Task 9: Trip Generation & Storage Persistence
**Description:** Connect wizard submission to create the trip record, link all invited emails as `trip_members`, generate the day-by-day itinerary with transit slots, and store category budgets.
**Acceptance criteria:**
- [x] Wizard completion saves trip, members, and initial schedule items to the store.
- [x] Redirects immediately to `/trips/[tripId]` with success toast notification.
- [x] Generated schedule includes transit cards between distant destinations.
**Verification:**
- `npx vitest run tests/integration/trip-creation.test.ts`
**Dependencies:** Task 8
**Files touched:**
- `src/lib/store/trip-store.ts`
- `tests/integration/trip-creation.test.ts`
**Estimated scope:** S (2 files)

---

### Checkpoint: Onboarding & Generator
- [x] Creating a trip via the questionnaire works seamlessly from Step 1 through Step 4.
- [x] Generated trip appears in `/dashboard` and loads in `/trips/[tripId]`.
- [x] Collaborator emails are saved with correct initial roles.

---

## Phase 4: Collaborative Itinerary Command Center (`itinerary-collab`)

### Task 10: Day-by-Day Specific Timeline & Transit Buffer Cards
**Description:** Build the detailed timeline view in `/trips/[tripId]` with Day tabs, activity cards (time, location, notes, planned cost), transit cards (duration, mode, toll/fuel), and item CRUD modal.
**Acceptance criteria:**
- [x] User can switch between Day 1, Day 2, etc.
- [x] Transit cards display travel duration, mode, and estimated transit cost.
- [x] Cards display category icons and location tags.
**Verification:**
- Manual check of timeline interactions and day switching.
**Dependencies:** Task 9
**Files touched:**
- `src/app/(app)/trips/[tripId]/page.tsx`
- `src/components/itinerary/timeline.tsx`
- `src/components/itinerary/activity-card.tsx`
- `src/components/itinerary/transit-card.tsx`
- `src/components/itinerary/item-form-modal.tsx`
**Estimated scope:** M (5 files)

---

### Task 11: Wishlist Drawer, Item Locking & RBAC Permission Guards
**Description:** Implement the Wishlist proposal drawer, item locking toggle (`is_locked`), and role-based guards enforcing `owner` (full control), `editor` (unlocked items only), and `viewer` (read-only with toast alerts).
**Acceptance criteria:**
- [x] Only `owner` can toggle lock/unlock on itinerary items.
- [x] `editor` cannot edit or delete locked items (blocked with warning toast).
- [x] `viewer` has all mutation buttons hidden/disabled and receives explanation toast if triggered.
- [x] Items in Wishlist can be dragged or promoted to a specific day slot.
**Verification:**
- `npx vitest run tests/unit/rbac.test.ts`
**Dependencies:** Task 10
**Files touched:**
- `src/lib/rbac/guards.ts`
- `src/components/itinerary/wishlist-drawer.tsx`
- `src/components/itinerary/lock-toggle.tsx`
- `tests/unit/rbac.test.ts`
**Estimated scope:** M (4 files)

---

### Task 12: Collaborator Team Management Modal (Max 4 Members)
**Description:** Build the member management modal in `/trips/[tripId]` allowing the Owner to view members, invite new friends by email (up to the 4-member limit), change member roles (`editor` ↔ `viewer`), and view invite status.
**Acceptance criteria:**
- [x] Shows current member count (e.g., `3/4 Anggota`).
- [x] Attempting to add a 5th member is strictly blocked in the UI with a descriptive warning toast.
- [x] Owner can toggle member roles; non-owners can only view the member list.
**Verification:**
- Unit test for member invitation limit and role assignment.
**Dependencies:** Task 11
**Files touched:**
- `src/components/itinerary/members-modal.tsx`
- `tests/unit/member-management.test.ts`
**Estimated scope:** S (2 files)

---

### Checkpoint: Itinerary & Collaboration
- [x] Timeline, transit cards, and wishlist drawer function smoothly.
- [x] Role enforcement strictly separates Owner, Editor, and Viewer privileges.
- [x] Member management upholds the 4-person ceiling.

---

## Phase 5: Finance, Split-Bill & Security Audit (`finance-splitbill`)

### Task 13: Core Split-Bill Math & Min-Cash-Flow Debt Simplification
**Description:** Implement pure, robust mathematical functions for splitting expenses (`equal`, `exact`, `percentage`) in integer IDR with deterministic remainder allocation, and calculate minimum cash-flow debt simplification.
**Acceptance criteria:**
- [x] `equal` split distributes remainder so $\sum \text{shares} \equiv \text{total}$ to the exact single Rupiah.
- [x] `simplifyDebts` produces at most $N - 1$ transfers for $N$ members with zero net balance discrepancy.
- [x] 100% test coverage on split calculations including odd splits (e.g., Rp 100.000 split by 3).
**Verification:**
- `npx vitest run tests/unit/split-bill.test.ts`
**Dependencies:** Task 1
**Files touched:**
- `src/lib/split-bill/calculator.ts`
- `src/lib/split-bill/debt-simplifier.ts`
- `tests/unit/split-bill.test.ts`
**Estimated scope:** S (3 files)

---

### Task 14: Bento Budget Overview (*Plan vs. Actual*) & 1-Click Itinerary Logger
**Description:** Build the financial overview dashboard showing Total Budget, Total Spent, Remaining Budget, and Category progress bars, with a 1-click "Catat Pengeluaran" button directly on Itinerary cards that links actual spend to schedule items.
**Acceptance criteria:**
- [x] Bento cards display Plan vs. Actual totals and remaining budget.
- [x] Category progress bars display dot-matrix indicators and turn amber (>85%) or rose (>100%) when over budget.
- [x] Clicking "Catat Pengeluaran" on an Itinerary card opens the Expense Modal pre-filled with the item's title, category, and planned cost.
**Verification:**
- Manual check of budget dashboard and linking from itinerary item.
**Dependencies:** Task 10, Task 13
**Files touched:**
- `src/components/finance/budget-bento.tsx`
- `src/components/finance/category-progress-card.tsx`
- `src/components/itinerary/activity-card.tsx`
**Estimated scope:** M (3 files)

---

### Task 15: Expense Logger Modal & Settlement Tracker
**Description:** Build the Expense Modal supporting multi-payer, split type selection (`equal`, `exact`, `percentage`) across all 4 member emails with strict `NumericCurrencyInput` on nominals, along with the Settlement Tracker showing who owes whom and the "Tandai Lunas" action.
**Acceptance criteria:**
- [x] Payer can be any of the 4 trip members (even if status is still pending login).
- [x] Expense amount and exact split shares strictly reject non-digits on keydown, display live Rupiah thousands separators, and save as integer IDR.
- [x] Splits are saved with exact integer shares.
- [x] Settlement list shows simplified debts with "Tandai Lunas" button restricted to `owner` and `editor`.
- [x] Marking settled recalculates outstanding balances immediately with success toast.
**Verification:**
- `npx vitest run tests/integration/finance-flow.test.ts`
**Dependencies:** Task 14
**Files touched:**
- `src/components/finance/expense-modal.tsx`
- `src/components/finance/settlement-card.tsx`
- `src/components/finance/expense-list.tsx`
- `tests/integration/finance-flow.test.ts`
**Estimated scope:** M (4 files)

---

### Task 16: Financial Security Audit Log Drawer (`expense_audit_logs`)
**Description:** Build the audit log drawer displaying an immutable chronological history of all expense creations, edits, deletions, and settlements, detailing which member's email made the change and what values were modified.
**Acceptance criteria:**
- [x] Every expense modification or deletion logs the actor email, timestamp, and before/after snapshot.
- [x] Drawer displays audit records with clear badge types (`CREATE`, `UPDATE`, `DELETE`, `SETTLE`).
- [x] High-transparency security view accessible by all 4 members.
**Verification:**
- Audit logging verification test.
**Dependencies:** Task 15
**Files touched:**
- `src/components/finance/audit-log-drawer.tsx`
- `src/lib/store/audit-store.ts`
- `tests/unit/audit-log.test.ts`
**Estimated scope:** S (3 files)

---

### Checkpoint: Complete Verification
- [x] Complete user journey tested: Landing Page -> Onboarding Questionnaire -> Generated Itinerary -> Schedule Editing & Locking -> Expense Logging from Timeline -> Split-Bill Settlement -> Financial Audit Log.
- [x] Verified across Mobile (375px), Tablet (768px), and Desktop (1280px+).
- [x] Zero TypeScript errors (`npx tsc --noEmit`), build clean (`npm run build`), all tests passing (`npx vitest run`).
