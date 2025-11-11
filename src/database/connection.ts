import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env';

const DB_PATH = path.resolve(config.database.path);
const dataDir = path.dirname(DB_PATH);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Data directory created: ${dataDir}`);
}


const db = new Database(DB_PATH, {
   verbose: config.database.verbose ? console.log : undefined
});

db.pragma('foreign_keys = ON');

console.log('Database connection established');
console.log(`Database path: ${DB_PATH}`);

const closeDatabase = () => {
  console.log('Closing database connection...');
  db.close();
  console.log('Database closed');
  process.exit(0);
};

process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);

export default db;