import { createTables } from '../src/database/schema';

console.log('Running database update...');
createTables();
console.log('Database update finished.');
