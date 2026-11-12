-- ============================================================================
-- PlanToGo — Production PostgreSQL Schema & Security Migration (Supabase)
-- Module 1: core-db-auth
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE CHECK (email = LOWER(BTRIM(email))),
  full_name TEXT NOT NULL CHECK (char_length(BTRIM(full_name)) >= 1 AND char_length(full_name) <= 80),
  avatar_url TEXT,
  bank_info TEXT CHECK (bank_info IS NULL OR char_length(bank_info) <= 160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 2. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(BTRIM(title)) >= 2 AND char_length(title) <= 60),
  region TEXT NOT NULL DEFAULT 'Jawa Tengah',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  total_budget_plan BIGINT NOT NULL DEFAULT 0 CHECK (total_budget_plan >= 0),
  onboarding_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trips_owner_id ON public.trips (owner_id);

-- 3. TRIP MEMBERS TABLE (Email-Based Collaboration & RBAC, Max 4 Members)
CREATE TABLE IF NOT EXISTS public.trip_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invited_email TEXT NOT NULL CHECK (invited_email = LOWER(BTRIM(invited_email))),
  display_name TEXT NOT NULL CHECK (char_length(BTRIM(display_name)) >= 1 AND char_length(display_name) <= 50),
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invite_status TEXT NOT NULL DEFAULT 'pending' CHECK (invite_status IN ('active', 'pending')),
  bank_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trip_id, invited_email)
);

-- High-scale composite index for O(log n) RLS lookups
CREATE INDEX IF NOT EXISTS idx_trip_members_lookup
  ON public.trip_members (trip_id, user_id, invited_email, role);

-- 4. ITINERARY ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('destination', 'transit', 'meal', 'stay')),
  title TEXT NOT NULL CHECK (char_length(BTRIM(title)) >= 1 AND char_length(title) <= 100),
  location_name TEXT,
  city_cluster TEXT,
  estimated_cost BIGINT NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0),
  transit_mode TEXT,
  transit_duration_mins INT CHECK (transit_duration_mins IS NULL OR transit_duration_mins >= 0),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 500),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'wishlist', 'completed')),
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.trip_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_itinerary_trip_day
  ON public.itinerary_items (trip_id, day_number, start_time);

-- 5. EXPENSES TABLE (Integer IDR BIGINT)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  itinerary_item_id UUID REFERENCES public.itinerary_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(BTRIM(title)) >= 1 AND char_length(title) <= 100),
  category TEXT NOT NULL CHECK (category IN ('transport', 'lodging', 'food', 'tickets', 'shopping', 'other')),
  amount BIGINT NOT NULL CHECK (amount > 0),
  paid_by_member_id UUID NOT NULL REFERENCES public.trip_members(id) ON DELETE RESTRICT,
  split_type TEXT NOT NULL DEFAULT 'equal' CHECK (split_type IN ('equal', 'exact', 'percentage')),
  incurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by_member_id UUID REFERENCES public.trip_members(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses (trip_id, incurred_at DESC);

-- 6. EXPENSE SPLITS TABLE
CREATE TABLE IF NOT EXISTS public.expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.trip_members(id) ON DELETE RESTRICT,
  share_amount BIGINT NOT NULL CHECK (share_amount >= 0),
  is_settled BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (expense_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_expense_splits_expense ON public.expense_splits (expense_id);

-- 7. SETTLEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  from_member_id UUID NOT NULL REFERENCES public.trip_members(id) ON DELETE RESTRICT,
  to_member_id UUID NOT NULL REFERENCES public.trip_members(id) ON DELETE RESTRICT,
  amount BIGINT NOT NULL CHECK (amount > 0),
  settled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 200),
  CHECK (from_member_id <> to_member_id)
);

CREATE INDEX IF NOT EXISTS idx_settlements_trip_id ON public.settlements (trip_id);

-- 8. EXPENSE AUDIT LOGS TABLE (Immutable Financial Security Trail)
CREATE TABLE IF NOT EXISTS public.expense_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  expense_id UUID,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'SETTLE')),
  previous_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_trip_id
  ON public.expense_audit_logs (trip_id, created_at DESC);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Trigger 1: Enforce hard limit of maximum 4 collaborators per trip
CREATE OR REPLACE FUNCTION public.enforce_max_four_trip_members()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_member_count INT;
BEGIN
  NEW.invited_email := LOWER(BTRIM(NEW.invited_email));
  NEW.display_name := BTRIM(NEW.display_name);

  SELECT COUNT(*) INTO current_member_count
  FROM public.trip_members
  WHERE trip_id = NEW.trip_id;

  IF current_member_count >= 4 THEN
    RAISE EXCEPTION 'MAX_MEMBERS_REACHED: Maksimal 4 kolaborator diizinkan dalam satu perjalanan.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_max_four_trip_members ON public.trip_members;
CREATE TRIGGER trg_enforce_max_four_trip_members
  BEFORE INSERT ON public.trip_members
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_max_four_trip_members();

-- Trigger 2: Auto-bind invited_email to user_id when user logs in / creates profile
CREATE OR REPLACE FUNCTION public.auto_bind_invited_email_on_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.trip_members
  SET user_id = NEW.id,
      invite_status = 'active'
  WHERE invited_email = LOWER(BTRIM(NEW.email))
    AND (user_id IS NULL OR invite_status = 'pending');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_bind_invited_email ON public.profiles;
CREATE TRIGGER trg_auto_bind_invited_email
  AFTER INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_bind_invited_email_on_login();

-- Trigger 3: Immutable Financial Audit Log Trigger
CREATE OR REPLACE FUNCTION public.log_expense_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_email TEXT;
BEGIN
  v_actor_email := COALESCE(
    current_setting('request.jwt.claim.email', true),
    'system@plantogo.id'
  );

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.expense_audit_logs (trip_id, expense_id, actor_email, action, previous_data, new_data)
    VALUES (NEW.trip_id, NEW.id, v_actor_email, 'CREATE', NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.expense_audit_logs (trip_id, expense_id, actor_email, action, previous_data, new_data)
    VALUES (NEW.trip_id, NEW.id, v_actor_email, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.expense_audit_logs (trip_id, expense_id, actor_email, action, previous_data, new_data)
    VALUES (OLD.trip_id, OLD.id, v_actor_email, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_expense_mutation ON public.expenses;
CREATE TRIGGER trg_log_expense_mutation
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_expense_mutation();

-- ============================================================================
-- SCALABLE ROW LEVEL SECURITY (RLS) HELPER & POLICIES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_my_trip_role(target_trip_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role
  FROM public.trip_members
  WHERE trip_id = target_trip_id
    AND (
      user_id = auth.uid()
      OR invited_email = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
    )
  LIMIT 1;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_audit_logs ENABLE ROW LEVEL SECURITY;

-- Trips policies
CREATE POLICY "Members can view trips"
  ON public.trips FOR SELECT
  USING (public.get_my_trip_role(id) IS NOT NULL OR owner_id = auth.uid());

CREATE POLICY "Authenticated users can create trips"
  ON public.trips FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Only owner can update or delete trip"
  ON public.trips FOR UPDATE
  USING (public.get_my_trip_role(id) = 'owner');

-- Itinerary items policies (Owner & Editor can mutate unlocked; only Owner can mutate locked)
CREATE POLICY "Members can view itinerary items"
  ON public.itinerary_items FOR SELECT
  USING (public.get_my_trip_role(trip_id) IS NOT NULL);

CREATE POLICY "Owner and Editor can insert itinerary items"
  ON public.itinerary_items FOR INSERT
  WITH CHECK (public.get_my_trip_role(trip_id) IN ('owner', 'editor'));

CREATE POLICY "Owner can update any item; Editor only unlocked items"
  ON public.itinerary_items FOR UPDATE
  USING (
    public.get_my_trip_role(trip_id) = 'owner'
    OR (public.get_my_trip_role(trip_id) = 'editor' AND is_locked = false)
  );

CREATE POLICY "Owner can delete any item; Editor only unlocked items"
  ON public.itinerary_items FOR DELETE
  USING (
    public.get_my_trip_role(trip_id) = 'owner'
    OR (public.get_my_trip_role(trip_id) = 'editor' AND is_locked = false)
  );

-- Expenses policies (Viewer is strictly read-only)
CREATE POLICY "Members can view expenses"
  ON public.expenses FOR SELECT
  USING (public.get_my_trip_role(trip_id) IS NOT NULL);

CREATE POLICY "Owner and Editor can manage expenses"
  ON public.expenses FOR ALL
  USING (public.get_my_trip_role(trip_id) IN ('owner', 'editor'))
  WITH CHECK (public.get_my_trip_role(trip_id) IN ('owner', 'editor'));

-- Audit logs policy (Read-only for all trip members, no manual delete/update)
CREATE POLICY "Members can view financial audit logs"
  ON public.expense_audit_logs FOR SELECT
  USING (public.get_my_trip_role(trip_id) IS NOT NULL);

