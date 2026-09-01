import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
  });

  async sendVerificationOtp(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email',
      text: `Your verification code is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Verify your email</h2>

          <p>
            Thank you for creating an account.
          </p>

          <p>Your verification code is:</p>

          <h1 style="letter-spacing: 8px;">
            ${otp}
          </h1>

          <p>
            This code expires in 5 minutes.
          </p>

          <p>
            If you did not create this account, you can ignore this email.
          </p>
        </div>
      `,
    });

    this.logger.log(`Verification email sent to ${email}`);
  }

  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Password reset code',
      text: `Your password reset code is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Password reset</h2>

          <p>Your password reset code is:</p>

          <h1 style="letter-spacing: 8px;">
            ${otp}
          </h1>

          <p>
            This code expires in 5 minutes.
          </p>

          <p>
            If you did not request a password reset, ignore this email.
          </p>
        </div>
      `,
    });

    this.logger.log(`Password reset email sent to ${email}`);
  }
}
