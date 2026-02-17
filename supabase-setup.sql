-- ========================================
-- HR Tablet Tracker - Database Setup
-- Run this SQL in Supabase SQL Editor
-- ========================================

-- 1. Members Table (HR staff)
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emp_id VARCHAR(20) UNIQUE NOT NULL,
  pin VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tablets Table
CREATE TABLE tablets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  taken_by INTEGER REFERENCES members(id) ON DELETE SET NULL,
  taken_at TIMESTAMP WITH TIME ZONE,
  has_pen BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Activity Log Table
CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  tablet_id INTEGER REFERENCES tablets(id) ON DELETE CASCADE,
  member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('TAKE', 'RETURN')),
  member_name VARCHAR(100),
  tablet_name VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Insert default 6 tablets
-- ========================================
INSERT INTO tablets (name) VALUES
  ('Tablet 1'),
  ('Tablet 2'),
  ('Tablet 3'),
  ('Tablet 4'),
  ('Tablet 5'),
  ('Tablet 6');

-- ========================================
-- Insert sample 12 members (update with real names)
-- Default PIN for all: 1234 (change in admin panel)
-- ========================================
INSERT INTO members (name, emp_id, pin) VALUES
  ('Member 1', 'EMP-001', '1234'),
  ('Member 2', 'EMP-002', '1234'),
  ('Member 3', 'EMP-003', '1234'),
  ('Member 4', 'EMP-004', '1234'),
  ('Member 5', 'EMP-005', '1234'),
  ('Member 6', 'EMP-006', '1234'),
  ('Member 7', 'EMP-007', '1234'),
  ('Member 8', 'EMP-008', '1234'),
  ('Member 9', 'EMP-009', '1234'),
  ('Member 10', 'EMP-010', '1234'),
  ('Member 11', 'EMP-011', '1234'),
  ('Member 12', 'EMP-012', '1234');

-- ========================================
-- Create indexes for performance
-- ========================================
CREATE INDEX idx_tablets_taken_by ON tablets(taken_by);
CREATE INDEX idx_activity_log_tablet ON activity_log(tablet_id);
CREATE INDEX idx_activity_log_member ON activity_log(member_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);

-- ========================================
-- Row Level Security (RLS) Policies
-- Disable RLS for simplicity (API routes handle auth)
-- ========================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tablets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role / anon key
CREATE POLICY "Allow all on members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tablets" ON tablets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on activity_log" ON activity_log FOR ALL USING (true) WITH CHECK (true);
