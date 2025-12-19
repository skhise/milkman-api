type MessagingChannel = 'whatsapp' | 'sms';
interface CredentialMessagePayload {
    mobile: string;
    message: string;
}
export interface MessagingResult {
    channel: MessagingChannel;
    deliveredAt: string;
}
interface SendSmsParams {
    number: string;
    message: string;
}
declare class MessagingService {
    /**
     * Send SMS using SMSLocal API
     * @param params - SMS parameters (number and message)
     * @returns Promise<void>
     */
    sendSms(params: SendSmsParams): Promise<void>;
    sendCredentialMessage(payload: CredentialMessagePayload): Promise<MessagingResult>;
}
export declare const messagingService: MessagingService;
export {};
//# sourceMappingURL=messaging.service.d.ts.map