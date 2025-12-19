import { Router } from 'express';
import { getDb } from '../database/connection.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    // Check database connection
    const db = getDb();
    await db.raw('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'production' ? 'Database connection failed' : error.message,
    });
  }
});

export default router;
