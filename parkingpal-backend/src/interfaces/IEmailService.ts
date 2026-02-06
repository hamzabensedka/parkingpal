/**
 * Email Service Interface
 * Single Responsibility: Send emails
 * Open/Closed: Can swap Gmail for SendGrid, AWS SES, Mailgun, etc.
 */
export interface IEmailService {
  /**
   * Send email verification email
   * @param to - Recipient email
   * @param data - Template data
   */
  sendVerificationEmail(to: string, data: VerificationEmailData): Promise<void>;

  /**
   * Send password reset email
   * @param to - Recipient email
   * @param data - Template data
   */
  sendPasswordResetEmail(to: string, data: PasswordResetEmailData): Promise<void>;

  /**
   * Send password changed confirmation email
   * @param to - Recipient email
   * @param data - Template data
   */
  sendPasswordChangedEmail(to: string, data: PasswordChangedEmailData): Promise<void>;
}

export interface VerificationEmailData {
  firstName: string;
  verificationLink: string;
}

export interface PasswordResetEmailData {
  firstName: string;
  resetLink: string;
}

export interface PasswordChangedEmailData {
  firstName: string;
}
