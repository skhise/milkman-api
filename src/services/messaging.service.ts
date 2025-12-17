import { getEnv } from '../utils/getEnv';

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

class MessagingService {
  /**
   * Send SMS using SMSLocal API
   * @param params - SMS parameters (number and message)
   * @returns Promise<void>
   */
  async sendSms(params: SendSmsParams): Promise<void> {
    try {
      const smsApiKey = getEnv('SMS_API_KEY');
      const smsRoute = "2";
      const smsSender = "ALERTS";
      // const smsTemplateId = "1007466651417454020";

      const url = 'https://app.smslocal.in/api/smsapi';
      const queryParams = new URLSearchParams({
        key: smsApiKey,
        route: smsRoute,
        sender: smsSender,
        number: params.number,
        sms: params.message,
      });

      const finalUrl = `${url}?${queryParams.toString()}`;
      console.log('[SMS] Final API Call URL:', finalUrl);

      const response = await fetch(finalUrl);
      const responseData: any = await response.json();
      
      // Log response for debugging
      console.log('[SMS] SMS sent successfully:', {
        number: params.number,
        response: responseData,
      });

      // Check if SMS was sent successfully
      // Adjust based on SMSLocal API response format
      if (responseData && responseData.status && responseData.status !== 'success') {
        throw new Error(`SMS API error: ${JSON.stringify(responseData)}`);
      }
      
      // Also check HTTP status
      if (!response.ok) {
        throw new Error(`SMS API HTTP error: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('[SMS] Error sending SMS:', error);
      // Don't throw error - log it but don't fail the request
      // This allows the OTP to still be generated even if SMS fails
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendCredentialMessage(payload: CredentialMessagePayload): Promise<MessagingResult> {
    // TODO: integrate with actual WhatsApp provider (e.g. Meta Cloud API)
    console.log(`[Messaging:whatsapp] -> ${payload.mobile}: ${payload.message}`);

    return {
      channel: 'whatsapp',
      deliveredAt: new Date().toISOString(),
    };
  }
}

export const messagingService = new MessagingService();


