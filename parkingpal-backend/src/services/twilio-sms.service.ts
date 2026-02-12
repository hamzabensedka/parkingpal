import { Twilio } from 'twilio';
import { ISMSService } from '../interfaces/ISMSService';

/**
 * Twilio implementation of ISMSService
 * Single Responsibility: Send SMS via Twilio
 * Open/Closed: Can be swapped with VonageSMSService, AWSSNSService, etc.
 */
export class TwilioSMSService implements ISMSService {
  private readonly client: Twilio | null;
  private readonly fromNumber: string;

  constructor(
    accountSid: string | undefined,
    authToken: string | undefined,
    fromNumber: string | undefined
  ) {
    this.fromNumber = fromNumber || '';

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio not configured. SMS will be logged to console.');
      this.client = null;
    } else {
      this.client = new Twilio(accountSid, authToken);
    }
  }

  /**
   * Send phone verification SMS
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    const message = `Your ParkingPal verification code is: ${code}. Valid for 10 minutes.`;

    if (!this.client) {
      console.log('=== SMS (not sent - no config) ===');
      console.log('To:', phoneNumber);
      console.log('Message:', message);
      console.log('==================================');
      return;
    }

    await this.client.messages.create({
      body: message,
      from: this.fromNumber,
      to: phoneNumber,
    });
  }
}
