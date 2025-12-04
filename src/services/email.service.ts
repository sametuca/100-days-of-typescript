import nodemailer from 'nodemailer';
import config from '../config/env';
import logger from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });

    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('✅ Email service is ready');
    } catch (error) {
      logger.error('❌ Email service connection failed:', error);
    }
  }

  public async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent: ${info.messageId} to ${options.to}`);

      return true;
    } catch (error) {
      logger.error('Email sending failed:', error);
      return false;
    }
  }

  public async sendWelcomeEmail(email: string, name: string, username: string): Promise<boolean> {
    const { welcomeEmailTemplate } = await import('../templates/email/welcome');
    const template = welcomeEmailTemplate(name, username);

    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  public async sendPasswordChangedEmail(email: string, name: string): Promise<boolean> {
    const { passwordChangedTemplate } = await import('../templates/email/password-changed');
    const template = passwordChangedTemplate(name);

    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  public async sendTaskReminderEmail(
    email: string,
    name: string,
    taskTitle: string,
    dueDate: Date
  ): Promise<boolean> {
    const { taskReminderTemplate } = await import('../templates/email/task-reminder');
    const template = taskReminderTemplate(name, taskTitle, dueDate);

    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  public async sendTaskAssignedEmail(email: string, task: any): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Yeni Görev Atandı: ${task.title}`,
      html: `<p>Size yeni bir görev atandı: <strong>${task.title}</strong></p><p>Açıklama: ${task.description || 'Açıklama yok'}</p>`,
      text: `Size yeni bir görev atandı: ${task.title}. Açıklama: ${task.description || 'Açıklama yok'}`
    });
  }

  public async sendTaskCompletedEmail(email: string, task: any): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Görev Tamamlandı: ${task.title}`,
      html: `<p>Göreviniz tamamlandı: <strong>${task.title}</strong></p><p>Tebrikler!</p>`,
      text: `Göreviniz tamamlandı: ${task.title}. Tebrikler!`
    });
  }
}

export const emailService = new EmailService();