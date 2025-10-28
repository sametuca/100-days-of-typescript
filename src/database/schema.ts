// Tablo yapılarını tanımlar (CREATE TABLE)

// Database bağlantısını import et
import db from './connection';

// ==========================================
// CREATE TABLES FUNCTION
// ==========================================
// Tüm tabloları oluşturur

export const createTables = () => {
  
  console.log('📋 Creating database tables...');
  
  // ------------------------------------------
  // USERS TABLE
  // ------------------------------------------
  // Kullanıcı tablosu
  
  // db.exec() = SQL komutunu çalıştır
  // exec = Cevap döndürmeyen komutlar için
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      -- id = Primary key (benzersiz kimlik)
      -- TEXT = String veri tipi
      -- PRIMARY KEY = Bu alan benzersiz olmalı
      id TEXT PRIMARY KEY,
      
      -- email = E-posta adresi
      -- UNIQUE = Bu değer tekil olmalı (aynısından 2 tane olamaz)
      -- NOT NULL = Boş olamaz
      email TEXT UNIQUE NOT NULL,
      
      -- username = Kullanıcı adı
      username TEXT UNIQUE NOT NULL,
      
      -- password_hash = Şifrelenmiş şifre
      -- NOT NULL = Boş olamaz
      password_hash TEXT NOT NULL,
      
      -- first_name = Ad (opsiyonel, NULL olabilir)
      first_name TEXT,
      
      -- last_name = Soyad (opsiyonel)
      last_name TEXT,
      
      -- role = Kullanıcı rolü
      -- DEFAULT 'USER' = Belirtilmezse 'USER' olsun
      role TEXT NOT NULL DEFAULT 'USER',
      
      -- is_active = Hesap aktif mi?
      -- INTEGER = Sayı (SQLite'da boolean yok, 0/1 kullanılır)
      -- DEFAULT 1 = Varsayılan aktif
      is_active INTEGER NOT NULL DEFAULT 1,
      
      -- last_login_at = Son giriş tarihi (opsiyonel)
      -- TEXT = ISO tarih string'i
      last_login_at TEXT,
      
      -- created_at = Oluşturulma tarihi
      -- DATETIME('now') = Şu anki tarih-saat
      created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
      
      -- updated_at = Güncellenme tarihi
      updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
    )
  `);
  
  console.log('  ✅ users table created');
  
  // ------------------------------------------
  // PROJECTS TABLE
  // ------------------------------------------
  // Proje tablosu
  
  db.exec(`
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
  
  console.log('  ✅ projects table created');
  
  // ------------------------------------------
  // PROJECT_MEMBERS TABLE
  // ------------------------------------------
  // Proje üyeleri (many-to-many ilişki için)
  // Bir projede birden fazla üye olabilir
  // Bir kullanıcı birden fazla projede olabilir
  
  db.exec(`
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
  
  console.log('  ✅ project_members table created');
  
  // ------------------------------------------
  // TASKS TABLE
  // ------------------------------------------
  // Task tablosu
  
  db.exec(`
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
      
      -- created_at, updated_at
      created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
      updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
    )
  `);
  
  console.log('  ✅ tasks table created');
  
  // ------------------------------------------
  // CREATE INDEXES
  // ------------------------------------------
  // Index = Query performansını artırır
  // Sık kullanılan alanlara index oluşturulur
  
  // User email'e göre arama hızlı olsun
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email 
    ON users(email)
  `);
  
  // Task user_id'ye göre arama hızlı olsun
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id 
    ON tasks(user_id)
  `);
  
  // Task project_id'ye göre arama hızlı olsun
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id 
    ON tasks(project_id)
  `);
  
  // Task status'e göre arama hızlı olsun
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_status 
    ON tasks(status)
  `);
  
  console.log('  ✅ indexes created');
  
  console.log('✅ All tables created successfully');
};

// ==========================================
// DROP TABLES FUNCTION (Yeniden başlatma için)
// ==========================================
// Tüm tabloları siler (dikkatli kullan!)

export const dropTables = () => {
  console.log('🗑️  Dropping all tables...');
  
  // DROP TABLE = Tabloyu sil
  // IF EXISTS = Varsa sil (yoksa hata verme)
  db.exec('DROP TABLE IF EXISTS tasks');
  db.exec('DROP TABLE IF EXISTS project_members');
  db.exec('DROP TABLE IF EXISTS projects');
  db.exec('DROP TABLE IF EXISTS users');
  
  console.log('✅ All tables dropped');
};

// ==========================================
// RESET DATABASE FUNCTION
// ==========================================
// Database'i sıfırla (tüm veriyi sil ve tabloları yeniden oluştur)

export const resetDatabase = () => {
  console.log('🔄 Resetting database...');
  
  // Önce tabloları sil
  dropTables();
  
  // Sonra yeniden oluştur
  createTables();
  
  console.log('✅ Database reset complete');
};