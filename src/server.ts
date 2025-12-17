import app from './app';
import { initDatabase } from './database/connection';
import { cronService } from './services/cron.service';
import { initializeFirebaseAdmin } from './modules/notifications/notification.service';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await initDatabase();

  // Initialize Firebase Admin for FCM
  initializeFirebaseAdmin();

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
