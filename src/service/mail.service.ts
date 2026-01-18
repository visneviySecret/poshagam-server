import nodemailer from "nodemailer";
import { google, Auth } from "googleapis";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_CLOUD_REFRESH;

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
  private user: string;
  private oAuth2Client: Auth.OAuth2Client;

  constructor() {
    this.user = process.env.GOOGLE_CLIENT_USER;
    this.oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    this.oAuth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN,
    });
  }

  private async getTransporter() {
    const accessToken = await this.oAuth2Client.getAccessToken();
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: this.user,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      await transporter.sendMail({
        from: this.user,
        to: options.to,
        subject: options.subject,
        text: options.text || "",
        html: options.html || "",
        attachments: options.attachments || [],
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new MailService();
