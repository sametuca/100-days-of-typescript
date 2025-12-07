"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDatabase = exports.dropTables = exports.createTables = void 0;
const connection_1 = __importDefault(require("./connection"));
const createTables = () => {
    console.log('Creating database tables...');
    connection_1.default.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'USER',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
      updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
    )
  `);
    console.log('Users table created');
    connection_1.default.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      
      -- name = Proje adı
      name TEXT NOT NULL,
      
      -- description = Proje açıklaması (opsiyonel)
      description TEXT,
      
      -- owner_id = Proje sahibinin ID'si
      -- REFERENCES users(id) = users tablosundaki id'ye referans (Foreign Key)
      -- ON DELETE CASCADE = User silinirse, projeleri de silinsin
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      
      -- status = Proje durumu
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      
      -- color = Proje rengi (UI için)
      color TEXT,
      
      -- created_at, updated_at
      created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
      updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
    )
  `);
    console.log('Projects table created');
    connection_1.default.exec(`
    CREATE TABLE IF NOT EXISTS project_members (
      -- id = Primary key
      id TEXT PRIMARY KEY,
      
      -- project_id = Hangi proje?
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      
      -- user_id = Hangi kullanıcı?
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      
      -- joined_at = Ne zaman katıldı?
      joined_at TEXT NOT NULL DEFAULT (DATETIME('now')),
      
      -- UNIQUE constraint = Aynı kullanıcı aynı projeye 2 kere eklenemez
      -- (project_id, user_id) kombinasyonu benzersiz olmalı
      UNIQUE(project_id, user_id)
    )
  `);
    console.log('Project members table created');
    connection_1.default.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      
      -- title = Task başlığı
      title TEXT NOT NULL,
      
      -- description = Task açıklaması (opsiyonel)
      description TEXT,
      
      -- status = Task durumu (enum)
      status TEXT NOT NULL DEFAULT 'TODO',
      
      -- priority = Task önceliği (enum)
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      
      -- user_id = Task'ı oluşturan kullanıcı
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      
      -- project_id = Hangi projeye ait? (opsiyonel)
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      -- ON DELETE SET NULL = Proje silinirse, project_id NULL olsun (task kalır)
      
      -- due_date = Son tarih (opsiyonel)
      due_date TEXT,
      
      -- tags = Etiketler (JSON string)
      -- SQLite'da array yok, JSON string olarak saklarız
      -- Örnek: '["typescript", "backend"]'
      tags TEXT,
      
      -- attachments = Dosya ekleri (JSON string)
      -- Örnek: '[{"filename": "...", "path": "...", "mimetype": "..."}]'
      attachments TEXT,
      
      -- created_at, updated_at
      created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
      updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
    )
  `);
    connection_1.default.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
      revoked INTEGER NOT NULL DEFAULT 0,
      revoked_at TEXT
    )
  `);
    console.log('Refresh tokens table created');
    connection_1.default.exec(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id 
    ON refresh_tokens(user_id)
  `);
    connection_1.default.exec(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token 
    ON refresh_tokens(token)
  `);
    console.log('Tasks table created');
    connection_1.default.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
      updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
    )
  `);
    console.log('Comments table created');
    connection_1.default.exec(`
    CREATE TABLE IF NOT EXISTS saved_searches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      query TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (DATETIME('now'))
    )
  `);
    console.log('Saved searches table created');
    connection_1.default.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action_type TEXT NOT NULL, -- 'STATUS_CHANGE', 'COMMENT_ADDED', 'ASSIGNED', etc.
      details TEXT, -- JSON string or simple text
      created_at TEXT NOT NULL DEFAULT (DATETIME('now'))
    )
  `);
    console.log('Activity logs table created');
    connection_1.default.exec(`
    CREATE INDEX IF NOT EXISTS idx_comments_task_id 
    ON comments(task_id)
  `);
    connection_1.default.exec(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_task_id 
    ON activity_logs(task_id)
  `);
    connection_1.default.exec(`
    CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id 
    ON saved_searches(user_id)
  `);
    connection_1.default.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email 
    ON users(email)
  `);
    connection_1.default.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id 
    ON tasks(user_id)
  `);
    connection_1.default.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id 
    ON tasks(project_id)
  `);
    connection_1.default.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_status 
    ON tasks(status)
  `);
    console.log('  ✅ indexes created');
    console.log('✅ All tables created successfully');
};
exports.createTables = createTables;
const dropTables = () => {
    console.log('Dropping all tables...');
    connection_1.default.exec('DROP TABLE IF EXISTS saved_searches');
    connection_1.default.exec('DROP TABLE IF EXISTS activity_logs');
    connection_1.default.exec('DROP TABLE IF EXISTS comments');
    connection_1.default.exec('DROP TABLE IF EXISTS tasks');
    connection_1.default.exec('DROP TABLE IF EXISTS project_members');
    connection_1.default.exec('DROP TABLE IF EXISTS projects');
    connection_1.default.exec('DROP TABLE IF EXISTS users');
    connection_1.default.exec('DROP TABLE IF EXISTS refresh_tokens');
    console.log('All tables dropped');
};
exports.dropTables = dropTables;
const resetDatabase = () => {
    console.log('Resetting database...');
    (0, exports.dropTables)();
    (0, exports.createTables)();
    console.log('Database reset complete');
};
exports.resetDatabase = resetDatabase;
//# sourceMappingURL=schema.js.map