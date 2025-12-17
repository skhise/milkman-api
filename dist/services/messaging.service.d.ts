type MessagingChannel = 'whatsapp';
interface CredentialMessagePayload {
    mobile: string;
    message: string;
}
export interface MessagingResult {
    channel: MessagingChannel;
    deliveredAt: string;
}
declare class MessagingService {
    sendCredentialMessage(payload: CredentialMessagePayload): Promise<MessagingResult>;
}
export declare const messagingService: MessagingService;
export {};
//# sourceMappingURL=messaging.service.d.ts.map