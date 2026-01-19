-- DriverOS Row Level Security (RLS) Policies
-- Ensures users can only access data within their organization

-- ===========================================
-- ENABLE RLS ON ALL TABLES
-- ===========================================

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE north_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE accelerators ENABLE ROW LEVEL SECURITY;
ALTER TABLE accelerator_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE parked_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Get user's org IDs
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT org_id FROM memberships WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is member of org
CREATE OR REPLACE FUNCTION is_member_of_org(target_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid() AND org_id = target_org_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is owner of org
CREATE OR REPLACE FUNCTION is_owner_of_org(target_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid() AND org_id = target_org_id AND role = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user can write to org (owner or member)
CREATE OR REPLACE FUNCTION can_write_to_org(target_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
      AND org_id = target_org_id
      AND role IN ('owner', 'member')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===========================================
-- PROFILES POLICIES
-- ===========================================

-- Users can view profiles of users in their org
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR id IN (
      SELECT m.user_id FROM memberships m
      WHERE m.org_id IN (SELECT get_user_org_ids())
    )
  );

-- Users can update their own profile
CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ===========================================
-- ORGS POLICIES
-- ===========================================

-- Users can view orgs they belong to
CREATE POLICY orgs_select ON orgs
  FOR SELECT USING (id IN (SELECT get_user_org_ids()));

-- Users can create new orgs (they become owner)
CREATE POLICY orgs_insert ON orgs
  FOR INSERT WITH CHECK (true);

-- Only owners can update org
CREATE POLICY orgs_update ON orgs
  FOR UPDATE USING (is_owner_of_org(id))
  WITH CHECK (is_owner_of_org(id));

-- Only owners can delete org
CREATE POLICY orgs_delete ON orgs
  FOR DELETE USING (is_owner_of_org(id));

-- ===========================================
-- MEMBERSHIPS POLICIES
-- ===========================================

-- Users can view memberships in their orgs
CREATE POLICY memberships_select ON memberships
  FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

-- Only owners can add members
CREATE POLICY memberships_insert ON memberships
  FOR INSERT WITH CHECK (is_owner_of_org(org_id));

-- Only owners can update memberships
CREATE POLICY memberships_update ON memberships
  FOR UPDATE USING (is_owner_of_org(org_id))
  WITH CHECK (is_owner_of_org(org_id));

-- Only owners can remove members (but not themselves)
CREATE POLICY memberships_delete ON memberships
  FOR DELETE USING (
    is_owner_of_org(org_id)
    AND user_id != auth.uid()
  );

-- ===========================================
-- NORTH STARS POLICIES
-- ===========================================

CREATE POLICY north_stars_select ON north_stars
  FOR SELECT USING (is_member_of_org(org_id));

CREATE POLICY north_stars_insert ON north_stars
  FOR INSERT WITH CHECK (can_write_to_org(org_id));

CREATE POLICY north_stars_update ON north_stars
  FOR UPDATE USING (can_write_to_org(org_id))
  WITH CHECK (can_write_to_org(org_id));

CREATE POLICY north_stars_delete ON north_stars
  FOR DELETE USING (is_owner_of_org(org_id));

-- ===========================================
-- ASSESSMENTS POLICIES
-- ===========================================

CREATE POLICY assessments_select ON assessments
  FOR SELECT USING (is_member_of_org(org_id));

CREATE POLICY assessments_insert ON assessments
  FOR INSERT WITH CHECK (can_write_to_org(org_id));

-- ===========================================
-- ENGINE SCORES POLICIES
-- ===========================================

CREATE POLICY engine_scores_select ON engine_scores
  FOR SELECT USING (is_member_of_org(org_id));

CREATE POLICY engine_scores_insert ON engine_scores
  FOR INSERT WITH CHECK (can_write_to_org(org_id));

-- ===========================================
-- ACCELERATORS POLICIES
-- ===========================================

CREATE POLICY accelerators_select ON accelerators
  FOR SELECT USING (is_member_of_org(org_id));

CREATE POLICY accelerators_insert ON accelerators
  FOR INSERT WITH CHECK (can_write_to_org(org_id));

CREATE POLICY accelerators_update ON accelerators
  FOR UPDATE USING (can_write_to_org(org_id))
  WITH CHECK (can_write_to_org(org_id));

CREATE POLICY accelerators_delete ON accelerators
  FOR DELETE USING (is_owner_of_org(org_id));

-- ===========================================
-- ACCELERATOR HISTORY POLICIES
-- ===========================================

CREATE POLICY accelerator_history_select ON accelerator_history
  FOR SELECT USING (
    accelerator_id IN (
      SELECT id FROM accelerators WHERE is_member_of_org(org_id)
    )
  );

CREATE POLICY accelerator_history_insert ON accelerator_history
  FOR INSERT WITH CHECK (
    accelerator_id IN (
      SELECT id FROM accelerators WHERE can_write_to_org(org_id)
    )
  );

-- ===========================================
-- ACTIONS POLICIES
-- ===========================================

CREATE POLICY actions_select ON actions
  FOR SELECT USING (is_member_of_org(org_id));

CREATE POLICY actions_insert ON actions
  FOR INSERT WITH CHECK (can_write_to_org(org_id));

CREATE POLICY actions_update ON actions
  FOR UPDATE USING (can_write_to_org(org_id))
  WITH CHECK (can_write_to_org(org_id));

CREATE POLICY actions_delete ON actions
  FOR DELETE USING (can_write_to_org(org_id));

-- ===========================================
-- MEETINGS POLICIES
-- ===========================================

CREATE POLICY meetings_select ON meetings
  FOR SELECT USING (is_member_of_org(org_id));

CREATE POLICY meetings_insert ON meetings
  FOR INSERT WITH CHECK (can_write_to_org(org_id));

CREATE POLICY meetings_update ON meetings
  FOR UPDATE USING (can_write_to_org(org_id))
  WITH CHECK (can_write_to_org(org_id));

CREATE POLICY meetings_delete ON meetings
  FOR DELETE USING (is_owner_of_org(org_id));

-- ===========================================
-- CHECK-INS POLICIES
-- ===========================================

CREATE POLICY check_ins_select ON check_ins
  FOR SELECT USING (is_member_of_org(org_id));

CREATE POLICY check_ins_insert ON check_ins
  FOR INSERT WITH CHECK (
    can_write_to_org(org_id)
    AND user_id = auth.uid()
  );

CREATE POLICY check_ins_update ON check_ins
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ===========================================
-- STREAKS POLICIES
-- ===========================================

CREATE POLICY streaks_select ON streaks
  FOR SELECT USING (is_member_of_org(org_id));

CREATE POLICY streaks_insert ON streaks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY streaks_update ON streaks
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ===========================================
-- YEAR PLANS POLICIES
-- ===========================================

CREATE POLICY year_plans_select ON year_plans
  FOR SELECT USING (is_member_of_org(org_id));

CREATE POLICY year_plans_insert ON year_plans
  FOR INSERT WITH CHECK (can_write_to_org(org_id));

CREATE POLICY year_plans_update ON year_plans
  FOR UPDATE USING (can_write_to_org(org_id))
  WITH CHECK (can_write_to_org(org_id));

CREATE POLICY year_plans_delete ON year_plans
  FOR DELETE USING (is_owner_of_org(org_id));

-- ===========================================
-- YEAR ITEMS POLICIES
-- ===========================================

CREATE POLICY year_items_select ON year_items
  FOR SELECT USING (
    year_plan_id IN (
      SELECT id FROM year_plans WHERE is_member_of_org(org_id)
    )
  );

CREATE POLICY year_items_insert ON year_items
  FOR INSERT WITH CHECK (
    year_plan_id IN (
      SELECT id FROM year_plans WHERE can_write_to_org(org_id)
    )
  );

CREATE POLICY year_items_update ON year_items
  FOR UPDATE USING (
    year_plan_id IN (
      SELECT id FROM year_plans WHERE can_write_to_org(org_id)
    )
  )
  WITH CHECK (
    year_plan_id IN (
      SELECT id FROM year_plans WHERE can_write_to_org(org_id)
    )
  );

CREATE POLICY year_items_delete ON year_items
  FOR DELETE USING (
    year_plan_id IN (
      SELECT id FROM year_plans WHERE can_write_to_org(org_id)
    )
  );

-- ===========================================
-- PARKED IDEAS POLICIES
-- ===========================================

CREATE POLICY parked_ideas_select ON parked_ideas
  FOR SELECT USING (is_member_of_org(org_id));

CREATE POLICY parked_ideas_insert ON parked_ideas
  FOR INSERT WITH CHECK (can_write_to_org(org_id));

CREATE POLICY parked_ideas_update ON parked_ideas
  FOR UPDATE USING (can_write_to_org(org_id))
  WITH CHECK (can_write_to_org(org_id));

CREATE POLICY parked_ideas_delete ON parked_ideas
  FOR DELETE USING (can_write_to_org(org_id));

-- ===========================================
-- INVITATIONS POLICIES
-- ===========================================

-- Users can view invitations to their org or to their email
CREATE POLICY invitations_select ON invitations
  FOR SELECT USING (
    is_member_of_org(org_id)
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Only owners can create invitations
CREATE POLICY invitations_insert ON invitations
  FOR INSERT WITH CHECK (is_owner_of_org(org_id));

-- Only owners can delete invitations
CREATE POLICY invitations_delete ON invitations
  FOR DELETE USING (is_owner_of_org(org_id));

-- Users can accept their own invitations
CREATE POLICY invitations_update ON invitations
  FOR UPDATE USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
