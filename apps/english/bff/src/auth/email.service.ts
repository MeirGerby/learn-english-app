import type { Logger } from '@learn-english/logging';
import { Resend } from 'resend';
import type { ServerEnv } from '../server-env.js';

export class EmailService {
  private readonly resend: Resend | undefined;
  private readonly fromEmail: string;
  private readonly logger: Logger;

  constructor({ config, logger }: { config: ServerEnv; logger: Logger }) {
    this.resend = config.RESEND_API_KEY
      ? new Resend(config.RESEND_API_KEY)
      : undefined;
    this.fromEmail = config.RESEND_FROM_EMAIL;
    this.logger = logger;
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    // Without a Resend key (local development) the link goes to the log.
    if (!this.resend) {
      this.logger.info({ resetUrl }, 'no RESEND_API_KEY: reset link logged');

      return;
    }

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

    if (error) throw new Error(error.message);
  }
}
