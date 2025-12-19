"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../database/connection");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        // Check database connection
        const db = (0, connection_1.getDb)();
        await db.raw('SELECT 1');
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: process.env.NODE_ENV === 'production' ? 'Database connection failed' : error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map