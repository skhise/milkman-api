import app from './app.js';
import { initDatabase } from './database/connection.js';
import { cronService } from './services/cron.service.js';
import { initializeFirebaseAdmin } from './modules/notifications/notification.service.js';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await initDatabase();

  // Initialize Firebase Admin for FCM
  await initializeFirebaseAdmin();

  // Start cron jobs
  cronService.start();

  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
