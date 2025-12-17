"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const connection_1 = require("./database/connection");
const cron_service_1 = require("./services/cron.service");
const notification_service_1 = require("./modules/notifications/notification.service");
const PORT = process.env.PORT || 4000;
async function bootstrap() {
    await (0, connection_1.initDatabase)();
    // Initialize Firebase Admin for FCM
    (0, notification_service_1.initializeFirebaseAdmin)();
    // Start cron jobs
    cron_service_1.cronService.start();
    app_1.default.listen(PORT, () => {
        console.log(`API server listening on port ${PORT}`);
    });
}
bootstrap().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map