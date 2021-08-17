import Mail from 'nodemailer/lib/mailer';
import ejs from 'ejs';

import { createTransport } from 'nodemailer';
import { ConfigService } from './config';

const configService = new ConfigService('.env');

/**
 * Email Service
 */
export class EmailService {
  private readonly nodemailerTransport: Mail;

  /**
   * Constructor
   * @param {ConfigService} configService
   */
  constructor() {
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

    console.log(options);

    const html = await ejs.renderFile(
      `${__dirname}/../email-templates/${options.template}`,
      {
        user: options.user,
        url: options.url
      }
    );
    // Define Mail Options
    const mailOptions: Mail.Options = {
      from: configService.get('EMAIL_USER'),
      to: options.email,
      subject: options.subject,
      html
    };

    // Send Email
    await this.nodemailerTransport.sendMail(mailOptions);
  }
}
