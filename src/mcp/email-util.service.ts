import { Injectable, OnModuleInit } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailUtilService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  onModuleInit() {
    this.verifyConnection();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER || 'users.helpandcare@gmail.com';
    const smtpPassword = process.env.SMTP_PASSWORD || '';

    // Explicitly check for 'true' or if port is 465 and secure is not defined
    let smtpSecure = process.env.SMTP_SECURE === 'true';
    if (process.env.SMTP_SECURE === undefined && smtpPort === 465) {
      smtpSecure = true;
    }

    console.log('[Email] Initializing SMTP transporter:', {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
      passwordSet: !!smtpPassword,
      envSecure: process.env.SMTP_SECURE
    });

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('[Email] SMTP server connection verified successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Email] SMTP server connection verification failed:', errorMessage);
      console.error('[Email] Please check your SMTP configuration in .env file');
    }
  }

  /**
   * Send an email to a specified email address.
   * Mirrors Util.SendEmailByAddress in C#.
   */
  async sendEmailByAddress(
    email: string,
    subject: string,
    body: string
  ): Promise<boolean> {
    try {
      // Validate SMTP configuration
      const smtpUser = process.env.SMTP_USER || 'users.helpandcare@gmail.com';
      const smtpPassword = process.env.SMTP_PASSWORD || '';

      if (!smtpPassword) {
        console.error('[Email] SMTP_PASSWORD is not set in environment variables');
        throw new Error('SMTP password is not configured');
      }

      console.log(`[Email] Attempting to send email to: ${email}`);
      console.log(`[Email] Subject: ${subject}`);
      console.log(`[Email] SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
      console.log(`[Email] SMTP User: ${smtpUser}`);

      const mailOptions = {
        from: process.env.SMTP_FROM || smtpUser,
        to: email,
        subject,
        text: body
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`[Email] Email sent successfully! MessageId: ${result.messageId}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error('[Email] Failed to send email:', {
        to: email,
        subject,
        error: errorMessage,
        stack: errorStack
      });

      // Log specific error details
      if (error instanceof Error) {
        if (errorMessage.includes('Invalid login')) {
          console.error('[Email] ERROR: Invalid SMTP credentials. Check SMTP_USER and SMTP_PASSWORD');
        } else if (errorMessage.includes('ECONNREFUSED')) {
          console.error('[Email] ERROR: Cannot connect to SMTP server. Check SMTP_HOST and SMTP_PORT');
        } else if (errorMessage.includes('timeout')) {
          console.error('[Email] ERROR: SMTP connection timeout. Check network/firewall settings');
        } else if (errorMessage.includes('self signed certificate')) {
          console.error('[Email] ERROR: SSL certificate issue. May need to set secure: false or configure SSL properly');
        }
      }

      return false;
    }
  }
}

