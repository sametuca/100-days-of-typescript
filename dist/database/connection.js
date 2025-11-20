"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
const DB_PATH = path_1.default.resolve(env_1.config.database.path);
const dataDir = path_1.default.dirname(DB_PATH);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
    console.log(`Data directory created: ${dataDir}`);
}
const db = new better_sqlite3_1.default(DB_PATH, {
    verbose: env_1.config.database.verbose ? console.log : undefined
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
exports.default = db;
//# sourceMappingURL=connection.js.map