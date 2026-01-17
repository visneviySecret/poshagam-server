import nodemailer from "nodemailer";
import { google, Auth } from "googleapis";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_CLOUD_REFRESH;

class MailService {
  user: string;
  oAuth2Client: Auth.OAuth2Client;
  constructor() {
    this.user = process.env.GOOGLE_CLIENT_USER;
    this.oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    this.oAuth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN,
    });
  }

  async sendMail(to: string, instruction: string) {
    try {
      const accessToken = await this.oAuth2Client.getAccessToken();
      const transporter = nodemailer.createTransport({
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
      transporter.sendMail({
        from: this.user,
        to,
        subject: "Инструкция " + instruction,
        text: "",
        html: `
            <div>
              <h1>Ваша инструкция!</h1>
            </div>
          `,
      });
    } catch (e) {
      console.log("e", e);
    }
  }
}

export default new MailService();
