import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

// Email transport singleton
let transporter: Transporter | null = null;

/**
 * Get or create email transporter
 */
const getTransporter = (): Transporter => {
  if (transporter) return transporter;

  // Check if email is configured
  if (!env.email.user || !env.email.password) {
    console.warn('Email not configured. Emails will be logged to console.');
    // Return a mock transporter that logs to console
    transporter = {
      sendMail: async (options: nodemailer.SendMailOptions) => {
        console.log('=== EMAIL (not sent - no config) ===');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.html || options.text);
        console.log('===================================');
        return { messageId: 'mock-' + Date.now() };
      },
    } as Transporter;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465, // true for 465, false for other ports
    auth: {
      user: env.email.user,
      pass: env.email.password,
    },
  });

  return transporter;
};

// Email templates
interface EmailTemplateData {
  firstName: string;
  [key: string]: string;
}

/**
 * Send email verification email
 */
export const sendVerificationEmail = async (
  to: string,
  data: { firstName: string; verificationLink: string }
): Promise<void> => {
  const transport = getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to ParkingPal!</h1>
        <p>Hi ${data.firstName},</p>
        <p>Welcome to ParkingPal! We're excited to have you.</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${data.verificationLink}" class="button">Verify Email</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${data.verificationLink}</p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Happy parking!</p>
        <p>The ParkingPal Team</p>
        <div class="footer">
          <p>Questions? Reply to this email or visit help.parkingpal.fr</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transport.sendMail({
    from: env.email.from,
    to,
    subject: 'Welcome to ParkingPal! Verify Your Email',
    html,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  to: string,
  data: { firstName: string; resetLink: string }
): Promise<void> => {
  const transport = getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Reset Your Password</h1>
        <p>Hi ${data.firstName},</p>
        <p>You requested to reset your password for ParkingPal.</p>
        <p>Click the button below to reset it:</p>
        <a href="${data.resetLink}" class="button">Reset Password</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${data.resetLink}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email. Your password won't change.</p>
        <p>Thanks,</p>
        <p>The ParkingPal Team</p>
        <div class="footer">
          <p>Questions? Reply to this email or visit help.parkingpal.fr</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transport.sendMail({
    from: env.email.from,
    to,
    subject: 'Reset Your ParkingPal Password',
    html,
  });
};

/**
 * Send password changed confirmation email
 */
export const sendPasswordChangedEmail = async (
  to: string,
  data: { firstName: string }
): Promise<void> => {
  const transport = getTransporter();

  const now = new Date();
  const date = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .warning { color: #DC2626; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Your Password Was Changed</h1>
        <p>Hi ${data.firstName},</p>
        <p>This email confirms that your password was successfully changed on ${date} at ${time}.</p>
        <p>If you made this change, no action is needed.</p>
        <p class="warning"><strong>If you didn't change your password, please contact us immediately at security@parkingpal.fr</strong></p>
        <p>Thanks,</p>
        <p>The ParkingPal Team</p>
        <div class="footer">
          <p>Questions? Reply to this email or visit help.parkingpal.fr</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transport.sendMail({
    from: env.email.from,
    to,
    subject: 'Your ParkingPal Password Was Changed',
    html,
  });
};
