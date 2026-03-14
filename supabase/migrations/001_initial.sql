-- DriverOS Initial Schema
-- Multi-tenant SaaS with RLS

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE membership_role AS ENUM ('owner', 'member', 'coach');
CREATE TYPE engine_name AS ENUM ('vision', 'people', 'operations', 'revenue', 'finance');
CREATE TYPE assessment_type AS ENUM ('flash_scan', 'full_audit', 'apex_audit');
CREATE TYPE meeting_type AS ENUM ('warm_up', 'pit_stop', 'full_tune_up', 'check_in');
CREATE TYPE action_status AS ENUM ('not_started', 'in_progress', 'completed', 'blocked', 'parked');
CREATE TYPE action_priority AS ENUM ('do_now', 'do_next');

-- =============================================================================
-- TABLES
-- =============================================================================

-- Organizations (tenants)
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  industry TEXT,
  size_band TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User <-> Org membership
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  role membership_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- North Star goals
CREATE TABLE north_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  vehicle TEXT,
  "constraint" TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assessments (flash_scan, full_audit, apex_audit)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  type assessment_type NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Engine scores over time (for trend analysis)
CREATE TABLE engine_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  engine engine_name NOT NULL,
  score NUMERIC NOT NULL,
  max_score NUMERIC NOT NULL DEFAULT 100,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  priority action_priority NOT NULL DEFAULT 'do_next',
  status action_status NOT NULL DEFAULT 'not_started',
  effort INTEGER CHECK (effort BETWEEN 1 AND 5),
  due_date DATE,
  north_star_id UUID REFERENCES north_stars(id) ON DELETE SET NULL,
  source TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id, date)
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
  attendees UUID[],
  action_ids UUID[],
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Company memory (AI memory blob per org)
CREATE TABLE company_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
  memory JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat history (AI messages per org)
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  page_context TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Brand config (per org branding)
CREATE TABLE brand_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
  logo_url TEXT,
  colors JSONB NOT NULL DEFAULT '{"primary": "#2563eb", "secondary": "#1e40af", "accent": "#f59e0b"}',
  fonts JSONB NOT NULL DEFAULT '{"heading": "Inter", "body": "Inter"}',
  tone TEXT DEFAULT 'professional',
  voice TEXT DEFAULT 'confident and clear',
  avoids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Industry config (plugin settings per org)
CREATE TABLE industry_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
  plugin TEXT NOT NULL DEFAULT 'general',
  settings JSONB NOT NULL DEFAULT '{}',
  integrations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scoring history (engine scores over time for trend analysis)
CREATE TABLE scoring_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  engine engine_name NOT NULL,
  score NUMERIC NOT NULL,
  gear INTEGER CHECK (gear BETWEEN 1 AND 5),
  overall_score NUMERIC,
  source TEXT, -- 'flash_scan', 'full_audit', 'manual', etc.
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accelerator history
CREATE TABLE accelerator_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accelerator_id UUID NOT NULL REFERENCES accelerators(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Streaks (habit tracking)
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id, streak_type)
);

-- Year plans
CREATE TABLE year_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  north_star_id UUID REFERENCES north_stars(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, year)
);

-- Year plan items
CREATE TABLE year_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_plan_id UUID NOT NULL REFERENCES year_plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  department TEXT,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  status TEXT NOT NULL DEFAULT 'planned',
  rationale TEXT,
  alignment_status TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parked ideas
CREATE TABLE parked_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role membership_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Memberships
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_org ON memberships(org_id);

-- Assessments
CREATE INDEX idx_assessments_org ON assessments(org_id);
CREATE INDEX idx_assessments_type ON assessments(org_id, type);
CREATE INDEX idx_assessments_created ON assessments(org_id, created_at DESC);

-- Engine scores
CREATE INDEX idx_engine_scores_org ON engine_scores(org_id);
CREATE INDEX idx_engine_scores_trend ON engine_scores(org_id, engine, recorded_at DESC);

-- Actions
CREATE INDEX idx_actions_org ON actions(org_id);
CREATE INDEX idx_actions_status ON actions(org_id, status);
CREATE INDEX idx_actions_priority ON actions(org_id, priority);
CREATE INDEX idx_actions_engine ON actions(org_id, engine);
CREATE INDEX idx_actions_owner ON actions(org_id, owner);

-- Check-ins
CREATE INDEX idx_checkins_org ON check_ins(org_id);
CREATE INDEX idx_checkins_user_date ON check_ins(user_id, date DESC);
CREATE INDEX idx_checkins_org_date ON check_ins(org_id, date DESC);

-- Meetings
CREATE INDEX idx_meetings_org ON meetings(org_id);
CREATE INDEX idx_meetings_type ON meetings(org_id, type);
CREATE INDEX idx_meetings_scheduled ON meetings(org_id, scheduled_for DESC);

-- Chat history
CREATE INDEX idx_chat_org ON chat_history(org_id, created_at DESC);
CREATE INDEX idx_chat_user ON chat_history(user_id, created_at DESC);

-- Scoring history
CREATE INDEX idx_scoring_org ON scoring_history(org_id);
CREATE INDEX idx_scoring_trend ON scoring_history(org_id, engine, recorded_at DESC);

-- Accelerators
CREATE INDEX idx_accelerators_org ON accelerators(org_id);
CREATE INDEX idx_accel_history ON accelerator_history(accelerator_id, recorded_at DESC);

-- North stars
CREATE INDEX idx_north_stars_org ON north_stars(org_id);
CREATE INDEX idx_north_stars_active ON north_stars(org_id, is_active) WHERE is_active = true;

-- Year plans
CREATE INDEX idx_year_plans_org ON year_plans(org_id);
CREATE INDEX idx_year_items_plan ON year_items(year_plan_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE north_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE accelerators ENABLE ROW LEVEL SECURITY;
ALTER TABLE accelerator_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE parked_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is member of org
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
    AND org_id = check_org_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user is owner of org
CREATE OR REPLACE FUNCTION is_org_owner(check_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
    AND org_id = check_org_id
    AND role = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: users can read/update their own
CREATE POLICY profiles_select ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Orgs: members can read, owners can update
CREATE POLICY orgs_select ON orgs FOR SELECT USING (is_org_member(id));
CREATE POLICY orgs_update ON orgs FOR UPDATE USING (is_org_owner(id));
CREATE POLICY orgs_insert ON orgs FOR INSERT WITH CHECK (true); -- anyone can create

-- Memberships: members can see their org's members
CREATE POLICY memberships_select ON memberships FOR SELECT USING (is_org_member(org_id));
CREATE POLICY memberships_insert ON memberships FOR INSERT WITH CHECK (is_org_owner(org_id) OR user_id = auth.uid());
CREATE POLICY memberships_update ON memberships FOR UPDATE USING (is_org_owner(org_id));
CREATE POLICY memberships_delete ON memberships FOR DELETE USING (is_org_owner(org_id));

-- Org-scoped tables: members can read, members can write
CREATE POLICY north_stars_select ON north_stars FOR SELECT USING (is_org_member(org_id));
CREATE POLICY north_stars_insert ON north_stars FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY north_stars_update ON north_stars FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY north_stars_delete ON north_stars FOR DELETE USING (is_org_owner(org_id));

CREATE POLICY assessments_select ON assessments FOR SELECT USING (is_org_member(org_id));
CREATE POLICY assessments_insert ON assessments FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY engine_scores_select ON engine_scores FOR SELECT USING (is_org_member(org_id));
CREATE POLICY engine_scores_insert ON engine_scores FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY actions_select ON actions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY actions_insert ON actions FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY actions_update ON actions FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY actions_delete ON actions FOR DELETE USING (is_org_member(org_id));

CREATE POLICY checkins_select ON check_ins FOR SELECT USING (is_org_member(org_id));
CREATE POLICY checkins_insert ON check_ins FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY checkins_update ON check_ins FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY meetings_select ON meetings FOR SELECT USING (is_org_member(org_id));
CREATE POLICY meetings_insert ON meetings FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY meetings_update ON meetings FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY meetings_delete ON meetings FOR DELETE USING (is_org_owner(org_id));

CREATE POLICY memory_select ON company_memory FOR SELECT USING (is_org_member(org_id));
CREATE POLICY memory_insert ON company_memory FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY memory_update ON company_memory FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY chat_select ON chat_history FOR SELECT USING (is_org_member(org_id));
CREATE POLICY chat_insert ON chat_history FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY brand_select ON brand_config FOR SELECT USING (is_org_member(org_id));
CREATE POLICY brand_insert ON brand_config FOR INSERT WITH CHECK (is_org_owner(org_id));
CREATE POLICY brand_update ON brand_config FOR UPDATE USING (is_org_owner(org_id));

CREATE POLICY industry_select ON industry_config FOR SELECT USING (is_org_member(org_id));
CREATE POLICY industry_insert ON industry_config FOR INSERT WITH CHECK (is_org_owner(org_id));
CREATE POLICY industry_update ON industry_config FOR UPDATE USING (is_org_owner(org_id));

CREATE POLICY scoring_select ON scoring_history FOR SELECT USING (is_org_member(org_id));
CREATE POLICY scoring_insert ON scoring_history FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY accelerators_select ON accelerators FOR SELECT USING (is_org_member(org_id));
CREATE POLICY accelerators_insert ON accelerators FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY accelerators_update ON accelerators FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY accelerators_delete ON accelerators FOR DELETE USING (is_org_member(org_id));

CREATE POLICY accel_history_select ON accelerator_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM accelerators a
    WHERE a.id = accelerator_history.accelerator_id
    AND is_org_member(a.org_id)
  ));
CREATE POLICY accel_history_insert ON accelerator_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM accelerators a
    WHERE a.id = accelerator_history.accelerator_id
    AND is_org_member(a.org_id)
  ));

CREATE POLICY streaks_select ON streaks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY streaks_insert ON streaks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY streaks_update ON streaks FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY year_plans_select ON year_plans FOR SELECT USING (is_org_member(org_id));
CREATE POLICY year_plans_insert ON year_plans FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY year_plans_update ON year_plans FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY year_items_select ON year_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM year_plans yp
    WHERE yp.id = year_items.year_plan_id
    AND is_org_member(yp.org_id)
  ));
CREATE POLICY year_items_insert ON year_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM year_plans yp
    WHERE yp.id = year_items.year_plan_id
    AND is_org_member(yp.org_id)
  ));
CREATE POLICY year_items_update ON year_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM year_plans yp
    WHERE yp.id = year_items.year_plan_id
    AND is_org_member(yp.org_id)
  ));

CREATE POLICY parked_ideas_select ON parked_ideas FOR SELECT USING (is_org_member(org_id));
CREATE POLICY parked_ideas_insert ON parked_ideas FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY parked_ideas_delete ON parked_ideas FOR DELETE USING (is_org_member(org_id));

CREATE POLICY invitations_select ON invitations FOR SELECT USING (is_org_member(org_id));
CREATE POLICY invitations_insert ON invitations FOR INSERT WITH CHECK (is_org_owner(org_id));
CREATE POLICY invitations_update ON invitations FOR UPDATE USING (is_org_owner(org_id));

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_orgs_updated BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_memberships_updated BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_north_stars_updated BEFORE UPDATE ON north_stars FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_actions_updated BEFORE UPDATE ON actions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_meetings_updated BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_brand_config_updated BEFORE UPDATE ON brand_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_industry_config_updated BEFORE UPDATE ON industry_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_accelerators_updated BEFORE UPDATE ON accelerators FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_streaks_updated BEFORE UPDATE ON streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_year_plans_updated BEFORE UPDATE ON year_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_year_items_updated BEFORE UPDATE ON year_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_company_memory_updated BEFORE UPDATE ON company_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
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
