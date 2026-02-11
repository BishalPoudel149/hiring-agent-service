import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailUtilService {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'users.helpandcare@gmail.com',
      pass: process.env.SMTP_PASSWORD || ''
    }
  });

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
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject,
        text: body
      });
      return true;
    } catch {
      return false;
    }
  }
}

