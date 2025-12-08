import mysql from 'mysql2/promise';
import { config } from './env';

// MySQL connection pool
const pool = mysql.createPool({
  host: config.database.host || 'localhost',
  port: config.database.port || 3306,
  user: config.database.user || 'root',
  password: config.database.password || '',
  database: config.database.name || 'devtracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;