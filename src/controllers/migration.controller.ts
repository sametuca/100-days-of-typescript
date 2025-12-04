import { Request, Response } from 'express';
import { DatabaseMigrator } from '../database/migrator';
import { db } from '../database/connection';

export class MigrationController {
  private static migrator = new DatabaseMigrator(db);

  static async runMigrations(_req: Request, res: Response): Promise<void> {
    try {
      await MigrationController.migrator.runMigrations();
      res.json({
        success: true,
        message: 'Migrations executed successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async rollbackMigrations(req: Request, res: Response): Promise<void> {
    try {
      const steps = parseInt(req.query.steps as string) || 1;
      await MigrationController.migrator.rollback(steps);
      
      res.json({
        success: true,
        message: `Rolled back ${steps} migration(s)`
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static getMigrationStatus(_req: Request, res: Response): void {
    try {
      const status = MigrationController.migrator.getMigrationStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}