import { createTables } from './schema';
import db from './connection';
import { DatabaseMigrator } from './migrator';

export const initializeDatabase = async () => {
  console.log('🚀 Initializing database...\n');
  
  try {
    // Run migrations first
    const migrator = new DatabaseMigrator(db);
    await migrator.runMigrations();
    
    createTables();
    
    seedData();
    
    console.log('Database initialization complete!');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};


const seedData = () => {
  console.log('\n🌱 Seeding data...');
  
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count > 0) {
    console.log('Data already exists, skipping seed');
    return;
  }

  console.log('Inserting seed data...');

  
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, username, password_hash, first_name, last_name, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertUser.run(
    'user_1',
    'admin@devtracker.com',
    'admin',
    'hashed_password_123', 
    'Admin',
    'User',
    'ADMIN',
    1 
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
  
  console.log('3 users inserted');
  
  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, description, owner_id, status, color)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  insertProject.run(
    'project_1',
    'DevTracker Development',
    '100 Days of Code project',
    'user_1',
    'ACTIVE',
    '#3B82F6'
  );
  
  insertProject.run(
    'project_2',
    'Personal Tasks',
    'My personal todo list',
    'user_2', 
    'ACTIVE',
    '#10B981'
  );
  
  console.log('2 projects inserted');
  
  const insertMember = db.prepare(`
    INSERT INTO project_members (id, project_id, user_id)
    VALUES (?, ?, ?)
  `);
  
  insertMember.run('member_1', 'project_1', 'user_1');
  
  insertMember.run('member_2', 'project_1', 'user_2');
  
  insertMember.run('member_3', 'project_2', 'user_2');
  
  console.log('3 project members inserted');
  
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
    '["typescript", "setup"]' 
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
  
  console.log('5 tasks inserted');

  console.log('Seed data complete');
};

export default initializeDatabase;