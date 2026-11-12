# Spec Module 1: `core-db-auth` (Database Schema, Scalable RLS, Email Auth & Audit Triggers)

## Objective
Establish a production-grade, high-performance PostgreSQL schema for Supabase alongside a seamless dual-mode authentication layer (supporting both **Supabase Email Auth** and **Instant Demo Email Login** for immediate personal/MVP usage without friction). Ensure that inviting collaborators by their login email (`invited_email`) works deterministically and scales without CPU bottlenecks.

## Database Architecture & Best Practices for High Scale

### 1. Core Tables (`supabase/migrations/0001_init_plantogo.sql`)
- **`profiles`**:
  - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
  - `email TEXT NOT NULL UNIQUE` (stored lowercase, indexed)
  - `full_name TEXT NOT NULL`
  - `avatar_url TEXT`
  - `bank_info TEXT` (optional static account/QRIS note for split-bill settlement)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- **`trips`**:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `owner_id UUID NOT NULL REFERENCES profiles(id)`
  - `title TEXT NOT NULL`
  - `region TEXT NOT NULL DEFAULT 'Jawa Tengah'`
  - `start_date DATE NOT NULL`
  - `end_date DATE NOT NULL`
  - `total_budget_plan BIGINT NOT NULL DEFAULT 0` (in integer IDR)
  - `onboarding_answers JSONB NOT NULL DEFAULT '{}'::jsonb` (stores questionnaire answers: vibe, pace, priorities)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- **`trip_members`** (Email-Based Collaboration & RBAC):
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` (used as participant reference in split bills so even pending email invites can be included in expense splits immediately!)
  - `trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE`
  - `user_id UUID REFERENCES profiles(id) ON DELETE SET NULL` (nullable until the invited email logs in)
  - `invited_email TEXT NOT NULL` (normalized lowercase email)
  - `display_name TEXT NOT NULL`
  - `role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer'))`
  - `invite_status TEXT NOT NULL DEFAULT 'pending' CHECK (invite_status IN ('active', 'pending'))`
  - `UNIQUE (trip_id, invited_email)`
- **`itinerary_items`**:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE`
  - `day_number INT NOT NULL CHECK (day_number >= 1)`
  - `start_time TIME NOT NULL`
  - `end_time TIME NOT NULL`
  - `item_type TEXT NOT NULL CHECK (item_type IN ('destination', 'transit', 'meal', 'stay'))`
  - `title TEXT NOT NULL`
  - `location_name TEXT`
  - `city_cluster TEXT` (e.g., `Semarang`, `Dieng`, `Magelang`, `Yogyakarta`, `Solo`, `Karimunjawa`)
  - `estimated_cost BIGINT NOT NULL DEFAULT 0`
  - `transit_mode TEXT` (e.g., `Mobil Pribadi`, `Kereta Api`, `Jalan Kaki`, `Shuttle`)
  - `transit_duration_mins INT`
  - `notes TEXT`
  - `status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'wishlist', 'completed'))`
  - `is_locked BOOLEAN NOT NULL DEFAULT false` (only `owner` can lock/unlock or edit when locked)
  - `created_by UUID REFERENCES trip_members(id)`
- **`expenses`**:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE`
  - `itinerary_item_id UUID REFERENCES itinerary_items(id) ON DELETE SET NULL` (links actual spend to a planned schedule item)
  - `title TEXT NOT NULL`
  - `category TEXT NOT NULL CHECK (category IN ('transport', 'lodging', 'food', 'tickets', 'shopping', 'other'))`
  - `amount BIGINT NOT NULL CHECK (amount > 0)` (integer IDR)
  - `paid_by_member_id UUID NOT NULL REFERENCES trip_members(id) ON DELETE RESTRICT`
  - `split_type TEXT NOT NULL DEFAULT 'equal' CHECK (split_type IN ('equal', 'exact', 'percentage'))`
  - `incurred_at DATE NOT NULL DEFAULT CURRENT_DATE`
  - `created_by_member_id UUID REFERENCES trip_members(id)`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- **`expense_splits`**:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE`
  - `member_id UUID NOT NULL REFERENCES trip_members(id) ON DELETE RESTRICT`
  - `share_amount BIGINT NOT NULL CHECK (share_amount >= 0)`
  - `is_settled BOOLEAN NOT NULL DEFAULT false`
  - `UNIQUE (expense_id, member_id)`
- **`settlements`**:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE`
  - `from_member_id UUID NOT NULL REFERENCES trip_members(id)`
  - `to_member_id UUID NOT NULL REFERENCES trip_members(id)`
  - `amount BIGINT NOT NULL CHECK (amount > 0)`
  - `settled_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `notes TEXT`
- **`expense_audit_logs`** (Strict Financial Security):
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE`
  - `expense_id UUID`
  - `actor_email TEXT NOT NULL`
  - `action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'SETTLE'))`
  - `previous_data JSONB`
  - `new_data JSONB`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### 2. Database Triggers & Functions
1. **`enforce_max_four_trip_members()`**: `BEFORE INSERT ON trip_members` trigger counting existing members for `NEW.trip_id`. Raises `EXCEPTION 'MAX_MEMBERS_REACHED: Maksimal 4 kolaborator per perjalanan.'` if `count >= 4`.
2. **`auto_bind_invited_email_on_login()`**: `AFTER INSERT OR UPDATE OF email ON profiles` trigger that updates `trip_members SET user_id = NEW.id, invite_status = 'active'` where `LOWER(invited_email) = LOWER(NEW.email)`.
3. **`log_expense_mutation()`**: `AFTER INSERT OR UPDATE OR DELETE ON expenses` trigger that automatically writes an immutable record into `expense_audit_logs`.
4. **Scalable RLS Helper `get_my_trip_role(target_trip_id UUID)`**:
   - Marked `SECURITY DEFINER STABLE` and backed by `CREATE INDEX idx_trip_members_lookup ON trip_members (trip_id, user_id, invited_email, role);` so PostgreSQL evaluates access via a single O(log n) index lookup per query.

## Success Criteria
- [ ] SQL migration file `supabase/migrations/0001_init_plantogo.sql` contains all tables, composite indexes, RLS policies, and the 3 triggers above.
- [ ] Inviting a member by email (`invited_email`) immediately creates a `trip_members` record that can be assigned schedule items and expense splits, and automatically binds to their `user_id` when they log in with that email.
- [ ] Attempting to add a 5th member to a trip fails deterministically.

