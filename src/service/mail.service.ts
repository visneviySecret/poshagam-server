import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const env = (key: string) => process.env[key]?.trim() ?? "";

interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: MailAttachment[];
}

class MailService {
  private readonly from = env("SMTP_FROM") || "noreply@poshagam.local";
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const host = env("SMTP_HOST") || "localhost";
      const port = parseInt(env("SMTP_PORT") || "587", 10);
      const auth = { user: "api", pass: env("SMTP_API_TOKEN") };

      this.transporter = nodemailer.createTransport({
        host,
        port,
        auth,
      });
    }

    return this.transporter;
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const transporter = this.getTransporter();
    await transporter.sendMail({
      from: this.from,
      to: options.to,
      subject: options.subject,
      text: options.text || "",
      html: options.html || "",
      attachments: options.attachments || [],
    });
  }
}

export default new MailService();
