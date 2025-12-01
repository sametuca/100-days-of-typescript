-- Day 36: Workflow Automation & Rules Engine
-- Database schema for workflow rules

CREATE TABLE IF NOT EXISTS workflow_rules (
  id VARCHAR(36) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  event VARCHAR(100) NOT NULL,
  conditions JSON NULL,
  actions JSON NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_org_id (organization_id),
  INDEX idx_event (event),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: sample rule for testing
-- INSERT INTO workflow_rules (
--   id,
--   organization_id,
--   name,
--   event,
--   conditions,
--   actions,
--   is_active
-- ) VALUES (
--   'rule-1',
--   'org-1',
--   'Notify assignees when task is done',
--   'task.status.changed',
--   '[{\"field\":\"task.status\",\"operator\":\"eq\",\"value\":\"DONE\"}]',
--   '[{\"type\":\"notify_assignees\",\"message\":\"Task marked as done\"}]',
--   1
-- );