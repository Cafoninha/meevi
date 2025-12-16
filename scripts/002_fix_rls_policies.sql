-- Fix RLS policies to use authenticated users properly
-- Drop existing public policies on dogs table
DROP POLICY IF EXISTS "Allow public read access on dogs" ON dogs;
DROP POLICY IF EXISTS "Allow public insert on dogs" ON dogs;
DROP POLICY IF EXISTS "Allow public update on dogs" ON dogs;
DROP POLICY IF EXISTS "Allow public delete on dogs" ON dogs;

-- Drop existing public policies on owners table
DROP POLICY IF EXISTS "Allow public read access on owners" ON owners;
DROP POLICY IF EXISTS "Allow public insert on owners" ON owners;
DROP POLICY IF EXISTS "Allow public update on owners" ON owners;
DROP POLICY IF EXISTS "Allow public delete on owners" ON owners;

-- Create proper authenticated user policies for dogs
CREATE POLICY "Users can view their own dogs"
ON dogs FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own dogs"
ON dogs FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own dogs"
ON dogs FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own dogs"
ON dogs FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Create proper authenticated user policies for owners
CREATE POLICY "Users can view their own profile"
ON owners FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON owners FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON owners FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete their own profile"
ON owners FOR DELETE
TO authenticated
USING (id = auth.uid());

-- Verify all tables have RLS enabled
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Add RLS policies to calendar_events (missing)
CREATE POLICY "Users can view calendar events for their dogs"
ON calendar_events FOR SELECT
TO authenticated
USING (
  dog_id IN (
    SELECT id FROM dogs WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert calendar events for their dogs"
ON calendar_events FOR INSERT
TO authenticated
WITH CHECK (
  dog_id IN (
    SELECT id FROM dogs WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update calendar events for their dogs"
ON calendar_events FOR UPDATE
TO authenticated
USING (
  dog_id IN (
    SELECT id FROM dogs WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  dog_id IN (
    SELECT id FROM dogs WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete calendar events for their dogs"
ON calendar_events FOR DELETE
TO authenticated
USING (
  dog_id IN (
    SELECT id FROM dogs WHERE owner_id = auth.uid()
  )
);
