-- Performance optimization migration
-- Adds indexes and cleanup function for better performance

-- Create indexes for better query performance
-- Note: Using regular CREATE INDEX (not CONCURRENTLY) for migrations
-- CONCURRENTLY cannot run inside transaction blocks

CREATE INDEX idx_tasks_checklist_completed 
ON tasks(checklist_id, completed);

CREATE INDEX idx_tasks_updated_at 
ON tasks(updated_at DESC);

CREATE INDEX idx_checklists_department_type 
ON checklists(department, type);

-- Create cleanup function for old completed tasks
CREATE OR REPLACE FUNCTION cleanup_old_tasks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Reset tasks that are older than 30 days to not completed
    -- This helps keep the system fresh for recurring checklists
    UPDATE tasks 
    SET 
        completed = false,
        updated_at = NOW()
    WHERE 
        completed = true 
        AND updated_at < NOW() - INTERVAL '30 days';
        
    RAISE NOTICE 'Cleaned up % old completed tasks', ROW_COUNT;
END;
$$;

-- Note: Uncomment the following line to enable automated cleanup
-- This requires pg_cron extension and superuser privileges
-- SELECT cron.schedule('cleanup-old-tasks', '0 2 * * *', 'SELECT cleanup_old_tasks();');

COMMENT ON FUNCTION cleanup_old_tasks() IS 'Resets completed tasks older than 30 days to help refresh recurring checklists'; 