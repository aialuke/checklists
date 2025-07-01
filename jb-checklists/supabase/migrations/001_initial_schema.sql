-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE "Role" AS ENUM ('TEAM_MEMBER', 'MANAGER');
CREATE TYPE "ChecklistType" AS ENUM ('OPENING', 'CLOSING');

-- Staff table
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role "Role" NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checklists table
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department TEXT NOT NULL,
  type "ChecklistType" NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department, type)
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by TEXT REFERENCES staff(staff_number),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasks_checklist_id ON tasks(checklist_id);
CREATE INDEX idx_tasks_completed_by ON tasks(completed_by);
CREATE INDEX idx_staff_staff_number ON staff(staff_number);

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now - will restrict later if needed)
CREATE POLICY "Allow full access to staff" ON staff FOR ALL USING (true);
CREATE POLICY "Allow full access to checklists" ON checklists FOR ALL USING (true);
CREATE POLICY "Allow full access to tasks" ON tasks FOR ALL USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE checklists;