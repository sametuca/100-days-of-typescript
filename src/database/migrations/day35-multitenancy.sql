-- Day 35: Multi-tenancy & Organization Management
-- Database schema for organizations, teams, and memberships

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo VARCHAR(500),
  website VARCHAR(500),
  settings JSON,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_subscription_plan (subscription_plan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(36) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar VARCHAR(500),
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_org_id (organization_id),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  team_id VARCHAR(36),
  role VARCHAR(50) NOT NULL,
  permissions JSON,
  status VARCHAR(50) DEFAULT 'active',
  invited_by VARCHAR(36),
  invited_at TIMESTAMP,
  joined_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_org (user_id, organization_id),
  INDEX idx_user_id (user_id),
  INDEX idx_org_id (organization_id),
  INDEX idx_team_id (team_id),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add organization_id to existing projects table
ALTER TABLE projects 
ADD COLUMN organization_id VARCHAR(36) AFTER id,
ADD COLUMN team_id VARCHAR(36) AFTER organization_id,
ADD FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
ADD INDEX idx_org_id (organization_id),
ADD INDEX idx_team_id (team_id);

-- Create usage_metrics table for tracking organization usage
CREATE TABLE IF NOT EXISTS usage_metrics (
  id VARCHAR(36) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  metric VARCHAR(100) NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_org_metric (organization_id, metric),
  INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit_logs table for organization activity tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(36),
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_org_id (organization_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO organizations (id, name, slug, description, settings, subscription_plan, subscription_status) VALUES
('org-1', 'Acme Corporation', 'acme-corp', 'Software development company', 
 '{"theme":{"primaryColor":"#3B82F6"},"features":{"aiAnalysis":true,"advancedSecurity":true,"customWorkflows":true},"limits":{"maxUsers":50,"maxProjects":50,"maxTasksPerProject":2000,"storageGB":50}}',
 'professional', 'active'),
('org-2', 'Tech Startup Inc', 'tech-startup', 'Innovative tech startup',
 '{"theme":{"primaryColor":"#10B981"},"features":{"aiAnalysis":true,"advancedSecurity":false,"customWorkflows":false},"limits":{"maxUsers":15,"maxProjects":10,"maxTasksPerProject":500,"storageGB":10}}',
 'starter', 'active');

-- Insert sample teams
INSERT INTO teams (id, organization_id, name, description, settings) VALUES
('team-1', 'org-1', 'Engineering', 'Development team', '{"visibility":"private","defaultRole":"member"}'),
('team-2', 'org-1', 'Product', 'Product management team', '{"visibility":"public","defaultRole":"member"}'),
('team-3', 'org-2', 'Development', 'Core development team', '{"visibility":"private","defaultRole":"member"}');

-- Note: Memberships will be created when users join organizations
-- Sample membership (requires existing user)
-- INSERT INTO memberships (id, user_id, organization_id, role, permissions, status, joined_at) VALUES
-- ('mem-1', 'user-1', 'org-1', 'owner', '["org:manage","org:settings","org:billing"]', 'active', NOW());
