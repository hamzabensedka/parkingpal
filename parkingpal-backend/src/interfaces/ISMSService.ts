/**
 * SMS Service Interface
 * Single Responsibility: Send SMS messages
 * Open/Closed: Can swap Twilio for Vonage, AWS SNS, etc.
 */
export interface ISMSService {
  /**
   * Send phone verification SMS
   * @param phoneNumber - Recipient phone number (E.164 format)
   * @param code - 6-digit verification code
   */
  sendVerificationCode(phoneNumber: string, code: string): Promise<void>;
}
