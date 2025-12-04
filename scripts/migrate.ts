import { DatabaseMigrator } from '../src/database/migrator';
import { db } from '../src/database/connection';
import logger from '../src/utils/logger';

const command = process.argv[2];
const steps = parseInt(process.argv[3]) || 1;

const migrator = new DatabaseMigrator(db);

async function main() {
  try {
    switch (command) {
      case 'up':
        await migrator.runMigrations();
        break;
      
      case 'down':
        await migrator.rollback(steps);
        break;
      
      case 'status':
        const status = migrator.getMigrationStatus();
        console.table(status);
        break;
      
      default:
        console.log('Usage: npm run migrate [up|down|status] [steps]');
        console.log('  up     - Run pending migrations');
        console.log('  down   - Rollback migrations');
        console.log('  status - Show migration status');
        process.exit(1);
    }
  } catch (error: any) {
    logger.error('Migration command failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();