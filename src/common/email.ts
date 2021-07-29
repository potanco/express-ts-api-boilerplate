import Mail from 'nodemailer/lib/mailer';
import ejs from 'ejs';

import { createTransport } from 'nodemailer';
import { ConfigService } from './config';

/**
 * Email Service
 */
export default class EmailService {
  private readonly nodemailerTransport: Mail;

  /**
   * Constructor
   * @param {ConfigService} configService
   */
  constructor(private readonly configService: ConfigService) {
    // Create Transportor
    this.nodemailerTransport = createTransport({
      service: configService.get('EMAIL_SERVICE'),
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD')
      }
    });
  }

  async sendMail(options: any) {

    // Render HTML Based on ejs template
    const html = await ejs.renderFile(
      `${__dirname}/../views/email/${options.html}`,
      {
        user: options.user,
        url: options.url
      }
    );
    // Define Mail Options
    const mailOptions: Mail.Options = {
      from: process.env.Email_From,
      to: options.email,
      subject: options.subject,
      html
    };

    // Send Email
    await this.nodemailerTransport.sendMail(options);
  }
}
