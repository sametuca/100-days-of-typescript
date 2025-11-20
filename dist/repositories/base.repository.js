"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const connection_1 = __importDefault(require("../database/connection"));
class BaseRepository {
    constructor(tableName) {
        this.db = connection_1.default;
        this.tableName = tableName;
    }
    findAll() {
        const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
        const rows = stmt.all();
        return Promise.resolve(rows);
    }
    findById(id) {
        const stmt = this.db.prepare(`
      SELECT * FROM ${this.tableName} WHERE id = ?
    `);
        const row = stmt.get(id);
        return Promise.resolve(row || null);
    }
    delete(id) {
        const stmt = this.db.prepare(`
      DELETE FROM ${this.tableName} WHERE id = ?
    `);
        const result = stmt.run(id);
        return Promise.resolve(result.changes > 0);
    }
    count() {
        const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM ${this.tableName}
    `);
        const result = stmt.get();
        return Promise.resolve(result.count);
    }
    exists(id) {
        const stmt = this.db.prepare(`
      SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id = ?) as exists
    `);
        const result = stmt.get(id);
        return Promise.resolve(result.exists === 1);
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map