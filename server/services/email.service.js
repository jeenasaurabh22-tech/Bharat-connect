import nodemailer from 'nodemailer';
import logger from '../config/logger.js';
class EmailService {
  constructor() {
    const isMock =
      !process.env.SMTP_USER ||
      process.env.SMTP_USER === 'your_smtp_username' ||
      process.env.NODE_ENV === 'test';
    if (isMock) {
      logger.info('EmailService: Running in MOCK mode. Emails will be logged to the console.');
      this.transporter = null;
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.SMTP_PORT || '2525', 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      logger.info('EmailService: Running in SMTP mode.');
    }
  }
  async sendEmail({ to, subject, html, text }) {
    if (!this.transporter) {
      logger.info(`
================ MOCK EMAIL SENT ================
To: ${to}
Subject: ${subject}
Text: ${text || 'Check HTML content'}
=================================================
      `);
      return { messageId: 'mock-id-123' };
    }
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"BharatConnect AI" <no-reply@bharatconnect.gov.in>',
        to,
        subject,
        text,
        html,
      });
      logger.info(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }
  async sendVerificationOTP(email, otp) {
    const subject = 'BharatConnect AI - Email Verification OTP';
    const text = `Verify your email. Your OTP code is: ${otp}. It will expire in 5 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #025a9c; border-bottom: 2px solid #025a9c; padding-bottom: 10px;">BharatConnect AI</h2>
        <p>Thank you for registering on BharatConnect AI. Please verify your email using the verification code below:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject, text, html });
  }
  async sendPasswordResetOTP(email, otp) {
    const subject = 'BharatConnect AI - Password Reset OTP';
    const text = `Reset your password. Your OTP code is: ${otp}. It will expire in 5 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #025a9c; border-bottom: 2px solid #025a9c; padding-bottom: 10px;">BharatConnect AI</h2>
        <p>You requested a password reset. Please use the verification code below to reset your password:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject, text, html });
  }
}
export default new EmailService();