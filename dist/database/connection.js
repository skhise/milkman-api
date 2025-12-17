"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = exports.initDatabase = void 0;
const knex_1 = __importDefault(require("knex"));
const objection_1 = require("objection");
const getEnv_1 = require("../utils/getEnv");
let db = null;
const initDatabase = async () => {
    if (db)
        return db;
    db = (0, knex_1.default)({
        client: 'mysql2',
        connection: {
            host: (0, getEnv_1.getEnv)('DB_HOST', '127.0.0.1'),
            port: Number((0, getEnv_1.getEnv)('DB_PORT', '3306')),
            user: (0, getEnv_1.getEnv)('DB_USER', 'root'),
            password: (0, getEnv_1.getEnv)('DB_PASSWORD', ''),
            database: (0, getEnv_1.getEnv)('DB_NAME', 'milkman'),
        },
        pool: { min: 0, max: 10 },
        migrations: {
            tableName: 'knex_migrations',
        },
    });
    objection_1.Model.knex(db);
    console.log('Database connected');
    return db;
};
exports.initDatabase = initDatabase;
const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
};
exports.getDb = getDb;
//# sourceMappingURL=connection.js.map