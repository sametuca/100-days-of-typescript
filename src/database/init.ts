// Database'i başlatır ve seed data ekler

// Database fonksiyonlarını import et
import { createTables } from './schema';
import db from './connection';

export const initializeDatabase = () => {
  console.log('🚀 Initializing database...\n');
  
  try {
    createTables();
    
    seedData();
    
    console.log('\n✅ Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Test verileri ekler (development için)

const seedData = () => {
  console.log('\n🌱 Seeding data...');
  
  // Zaten veri var mı kontrol et
  // db.prepare() = SQL query hazırla
  // .get() = Tek satır döndür
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  // Eğer kullanıcı varsa seed etme
  if (userCount.count > 0) {
    console.log('  ℹ️  Data already exists, skipping seed');
    return;
  }
  
  console.log('  📝 Inserting seed data...');
  
  
  // db.prepare() = Query hazırla
  // ? = Placeholder (parametre)
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, username, password_hash, first_name, last_name, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  // .run() = Query'yi çalıştır
  // Parametreleri sırayla ver
  insertUser.run(
    'user_1',
    'admin@devtracker.com',
    'admin',
    'hashed_password_123', // Gerçekte bcrypt hash olmalı
    'Admin',
    'User',
    'ADMIN',
    1 // is_active = true
  );
  
  insertUser.run(
    'user_2',
    'john@example.com',
    'johndoe',
    'hashed_password_456',
    'John',
    'Doe',
    'USER',
    1
  );
  
  insertUser.run(
    'user_3',
    'jane@example.com',
    'janedoe',
    'hashed_password_789',
    'Jane',
    'Doe',
    'USER',
    1
  );
  
  console.log('  ✅ 3 users inserted');
  
  // ------------------------------------------
  // INSERT PROJECTS
  // ------------------------------------------
  
  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, description, owner_id, status, color)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  insertProject.run(
    'project_1',
    'DevTracker Development',
    '100 Days of Code project',
    'user_1', // admin'in projesi
    'ACTIVE',
    '#3B82F6' // Mavi
  );
  
  insertProject.run(
    'project_2',
    'Personal Tasks',
    'My personal todo list',
    'user_2', // john'un projesi
    'ACTIVE',
    '#10B981' // Yeşil
  );
  
  console.log('  ✅ 2 projects inserted');
  
  // ------------------------------------------
  // INSERT PROJECT MEMBERS
  // ------------------------------------------
  
  const insertMember = db.prepare(`
    INSERT INTO project_members (id, project_id, user_id)
    VALUES (?, ?, ?)
  `);
  
  // admin kendi projesinde
  insertMember.run('member_1', 'project_1', 'user_1');
  
  // john da admin'in projesinde
  insertMember.run('member_2', 'project_1', 'user_2');
  
  // john kendi projesinde
  insertMember.run('member_3', 'project_2', 'user_2');
  
  console.log('  ✅ 3 project members inserted');
  
  // ------------------------------------------
  // INSERT TASKS
  // ------------------------------------------
  
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, user_id, project_id, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertTask.run(
    'task_1',
    'Setup TypeScript Project',
    'Initialize project with TypeScript',
    'DONE',
    'HIGH',
    'user_1',
    'project_1',
    '["typescript", "setup"]' // JSON string
  );
  
  insertTask.run(
    'task_2',
    'Create Express Server',
    'Setup Express with TypeScript',
    'DONE',
    'HIGH',
    'user_1',
    'project_1',
    '["express", "backend"]'
  );
  
  insertTask.run(
    'task_3',
    'Implement CRUD Operations',
    'Create REST API endpoints',
    'IN_PROGRESS',
    'HIGH',
    'user_1',
    'project_1',
    '["api", "crud"]'
  );
  
  insertTask.run(
    'task_4',
    'Add SQLite Database',
    'Integrate SQLite for data persistence',
    'IN_PROGRESS',
    'URGENT',
    'user_1',
    'project_1',
    '["database", "sqlite"]'
  );
  
  insertTask.run(
    'task_5',
    'Buy groceries',
    'Milk, bread, eggs',
    'TODO',
    'MEDIUM',
    'user_2',
    'project_2',
    '["personal"]'
  );
  
  console.log('  ✅ 5 tasks inserted');
  
  console.log('✅ Seed data complete');
};

// Export
export default initializeDatabase;