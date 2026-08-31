import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.getOrThrow<string>('RESEND_API_KEY'));
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev';
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: 'איפוס סיסמה - Learn English',
      html: `
        <div dir="rtl" style="font-family: sans-serif; line-height: 1.6;">
          <p>קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
          <p><a href="${resetUrl}">לחצו כאן לאיפוס הסיסמה</a></p>
          <p>הקישור תקף לשעה אחת. אם לא ביקשתם זאת, אפשר להתעלם מהודעה זו.</p>
        </div>
      `,
    });
    if (error) {
      this.logger.error('Failed to send password reset email', error);
      throw new Error(error.message);
    }
  }
}
