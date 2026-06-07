-- Burrow Events — Supabase SQL schema
-- Run this in the Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- =====================
-- 1. PROFILES
-- Mirrors auth.users; created automatically on first sign-in via trigger
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username   TEXT,
  avatar_url TEXT,
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (needed for username display)
CREATE POLICY "profiles: public read" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "profiles: owner update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();


-- =====================
-- 2. EVENTS
-- =====================
CREATE TABLE IF NOT EXISTS events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL CHECK (category IN ('music','sports','food','arts','community','other')),
  start_time    TIMESTAMPTZ NOT NULL,
  end_time      TIMESTAMPTZ,
  latitude      DOUBLE PRECISION NOT NULL,
  longitude     DOUBLE PRECISION NOT NULL,
  location_name TEXT NOT NULL,
  venue_name    TEXT,
  image_url     TEXT,
  submitted_by  UUID REFERENCES auth.users ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved events
CREATE POLICY "events: public read approved" ON events
  FOR SELECT USING (status = 'approved');

-- Auth users can read their own pending/rejected submissions
CREATE POLICY "events: submitter read own" ON events
  FOR SELECT USING (auth.uid() = submitted_by);

-- Auth users can insert (goes in as pending)
CREATE POLICY "events: auth insert" ON events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND status = 'pending');

-- Admins can read ALL events (including pending)
CREATE POLICY "events: admin read all" ON events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update status (approve/reject)
CREATE POLICY "events: admin update status" ON events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- =====================
-- 3. SAVED EVENTS
-- =====================
CREATE TABLE IF NOT EXISTS saved_events (
  user_id  UUID REFERENCES auth.users ON DELETE CASCADE,
  event_id UUID REFERENCES events ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_events: owner crud" ON saved_events
  FOR ALL USING (auth.uid() = user_id);


-- =====================
-- 4. FOLLOWED LOCATIONS
-- =====================
CREATE TABLE IF NOT EXISTS followed_locations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  latitude      DOUBLE PRECISION NOT NULL,
  longitude     DOUBLE PRECISION NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE followed_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "followed_locations: owner crud" ON followed_locations
  FOR ALL USING (auth.uid() = user_id);


-- =====================
-- 5. REALTIME
-- Enable realtime on events so the map updates live
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE events;


-- =====================
-- 6. SEED — sample approved events (optional, remove for production)
-- =====================
INSERT INTO events (name, description, category, start_time, end_time, latitude, longitude, location_name, venue_name, status)
VALUES
  ('Jazz Night', 'Live jazz quartet performing classic standards.', 'music',
   NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours',
   40.7282, -73.7949, '88-01 Sutphin Blvd, Jamaica, NY', 'The Jazz Loft', 'approved'),

  ('Food Truck Festival', 'Over 20 local food trucks in one spot.', 'food',
   NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 6 hours',
   40.6892, -74.0445, 'Liberty State Park, Jersey City', 'Liberty State Park', 'approved'),

  ('Community Mural Project', 'Help paint a 200-foot neighborhood mural.', 'community',
   NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 4 hours',
   40.7128, -74.006, 'Canal St & Broadway, Manhattan', NULL, 'approved'),

  ('5K Trail Run', 'Scenic trail run through Prospect Park.', 'sports',
   NOW() + INTERVAL '5 days 8 hours', NOW() + INTERVAL '5 days 10 hours',
   40.6602, -73.9690, 'Prospect Park, Brooklyn', 'Prospect Park Boathouse', 'approved'),

  ('Indie Art Fair', 'Local artists showcase paintings, prints, and ceramics.', 'arts',
   NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days 8 hours',
   40.7282, -73.9442, 'Bushwick Collective, Brooklyn', 'Bushwick Collective', 'approved')
ON CONFLICT DO NOTHING;


-- =====================
-- HOW TO MAKE YOURSELF AN ADMIN
-- After signing in, run this in the SQL Editor with your email:
-- =====================
-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
