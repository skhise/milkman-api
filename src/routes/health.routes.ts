import { Router, Request, Response } from 'express';
import { getDb } from '../database/connection';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    const db = getDb();
    await db.raw('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'production' ? 'Database connection failed' : error.message,
    });
  }
});

export default router;
