"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationController = void 0;
const migrator_1 = require("../database/migrator");
const connection_1 = require("../database/connection");
class MigrationController {
    static async runMigrations(_req, res) {
        try {
            await MigrationController.migrator.runMigrations();
            res.json({
                success: true,
                message: 'Migrations executed successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    static async rollbackMigrations(req, res) {
        try {
            const steps = parseInt(req.query.steps) || 1;
            await MigrationController.migrator.rollback(steps);
            res.json({
                success: true,
                message: `Rolled back ${steps} migration(s)`
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    static getMigrationStatus(_req, res) {
        try {
            const status = MigrationController.migrator.getMigrationStatus();
            res.json({
                success: true,
                data: status
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}
exports.MigrationController = MigrationController;
MigrationController.migrator = new migrator_1.DatabaseMigrator(connection_1.db);
//# sourceMappingURL=migration.controller.js.map