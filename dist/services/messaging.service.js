"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagingService = void 0;
class MessagingService {
    async sendCredentialMessage(payload) {
        // TODO: integrate with actual WhatsApp provider (e.g. Meta Cloud API)
        console.log(`[Messaging:whatsapp] -> ${payload.mobile}: ${payload.message}`);
        return {
            channel: 'whatsapp',
            deliveredAt: new Date().toISOString(),
        };
    }
}
exports.messagingService = new MessagingService();
//# sourceMappingURL=messaging.service.js.map