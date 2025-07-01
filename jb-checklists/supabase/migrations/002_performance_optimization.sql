-- Add additional indexes for better query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_completed_checklist 
ON tasks(checklist_id, completed);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_updated_at 
ON tasks(updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_checklists_department_type 
ON checklists(department, type);

-- Add automatic cleanup for old completed tasks (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_tasks()
RETURNS void AS $$
BEGIN
  -- Reset tasks older than 30 days
  UPDATE tasks 
  SET 
    completed = false,
    completed_at = NULL,
    completed_by = NULL,
    updated_at = NOW()
  WHERE 
    completed = true 
    AND completed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-tasks', '0 2 * * *', 'SELECT cleanup_old_tasks();'); 