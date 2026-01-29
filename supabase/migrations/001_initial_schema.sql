-- DriverOS Initial Database Schema
-- Run this migration in Supabase SQL Editor or via CLI

-- ===========================================
-- ENUMS
-- ===========================================

CREATE TYPE membership_role AS ENUM ('owner', 'member', 'coach');
CREATE TYPE engine_name AS ENUM ('vision', 'people', 'operations', 'revenue', 'finance');
CREATE TYPE assessment_type AS ENUM ('flash_scan', 'full_audit', 'apex_audit');
CREATE TYPE meeting_type AS ENUM ('warm_up', 'pit_stop', 'full_tune_up', 'check_in');
CREATE TYPE action_status AS ENUM ('not_started', 'in_progress', 'completed', 'blocked', 'parked');
CREATE TYPE action_priority AS ENUM ('do_now', 'do_next');

-- ===========================================
-- CORE TABLES
-- ===========================================

-- Organizations (tenants/workspaces)
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  industry TEXT,
  size_band TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User ↔ Org relationship with roles
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  role membership_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- ===========================================
-- BUSINESS DATA TABLES
-- ===========================================

-- North Star goal per org
CREATE TABLE north_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  vehicle TEXT,
  "constraint" TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assessments (flash scan, full audit, apex audit)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  type assessment_type NOT NULL,
  data JSONB NOT NULL,
  schema_version INTEGER DEFAULT 1,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Engine scores over time
CREATE TABLE engine_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  engine engine_name NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER DEFAULT 100,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Accelerators (KPIs/metrics)
CREATE TABLE accelerators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  frequency TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Accelerator history for trend tracking
CREATE TABLE accelerator_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accelerator_id UUID NOT NULL REFERENCES accelerators(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Actions (tasks/recommendations)
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  why TEXT,
  owner TEXT,
  engine engine_name,
  priority action_priority DEFAULT 'do_next',
  status action_status DEFAULT 'not_started',
  effort INTEGER CHECK (effort >= 1 AND effort <= 5),
  due_date DATE,
  north_star_id UUID REFERENCES north_stars(id) ON DELETE SET NULL,
  source TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  type meeting_type NOT NULL,
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  decisions JSONB,
  action_ids UUID[],
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Check-ins (daily habit loop)
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  date DATE NOT NULL,
  actions_completed BOOLEAN,
  blocker TEXT,
  win_or_lesson TEXT,
  action_updates JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id, date)
);

-- User streaks for habit tracking
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, org_id, streak_type)
);

-- Year plans
CREATE TABLE year_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  north_star_id UUID REFERENCES north_stars(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, year)
);

-- Year plan items
CREATE TABLE year_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_plan_id UUID NOT NULL REFERENCES year_plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  department TEXT,
  quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  status TEXT DEFAULT 'planned',
  rationale TEXT,
  alignment_status TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Parked ideas (guardrail inbox)
CREATE TABLE parked_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invitations for new team members
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role membership_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_org ON memberships(org_id);
CREATE INDEX idx_assessments_org ON assessments(org_id);
CREATE INDEX idx_assessments_type ON assessments(type);
CREATE INDEX idx_engine_scores_org ON engine_scores(org_id);
CREATE INDEX idx_engine_scores_recorded ON engine_scores(recorded_at);
CREATE INDEX idx_accelerators_org ON accelerators(org_id);
CREATE INDEX idx_actions_org ON actions(org_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_meetings_org ON meetings(org_id);
CREATE INDEX idx_check_ins_org_date ON check_ins(org_id, date);
CREATE INDEX idx_year_plans_org ON year_plans(org_id);
CREATE INDEX idx_year_items_plan ON year_items(year_plan_id);
CREATE INDEX idx_invitations_email ON invitations(email);

-- ===========================================
-- UPDATED_AT TRIGGERS
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orgs_updated_at
  BEFORE UPDATE ON orgs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_north_stars_updated_at
  BEFORE UPDATE ON north_stars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_accelerators_updated_at
  BEFORE UPDATE ON accelerators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_actions_updated_at
  BEFORE UPDATE ON actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_year_plans_updated_at
  BEFORE UPDATE ON year_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_year_items_updated_at
  BEFORE UPDATE ON year_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ===========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
