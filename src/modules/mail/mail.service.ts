import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: `JokerCore <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return {
      message: 'Email sent successfully',
    };
  }
}
