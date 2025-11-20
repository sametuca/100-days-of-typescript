"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = __importDefault(require("../config/env"));
const logger_1 = __importDefault(require("../utils/logger"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: env_1.default.email.host,
            port: env_1.default.email.port,
            secure: false,
            auth: {
                user: env_1.default.email.user,
                pass: env_1.default.email.password
            }
        });
        this.verifyConnection();
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            logger_1.default.info('✅ Email service is ready');
        }
        catch (error) {
            logger_1.default.error('❌ Email service connection failed:', error);
        }
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: env_1.default.email.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text
            };
            const info = await this.transporter.sendMail(mailOptions);
            logger_1.default.info(`Email sent: ${info.messageId} to ${options.to}`);
            return true;
        }
        catch (error) {
            logger_1.default.error('Email sending failed:', error);
            return false;
        }
    }
    async sendWelcomeEmail(email, name, username) {
        const { welcomeEmailTemplate } = await Promise.resolve().then(() => __importStar(require('../templates/email/welcome')));
        const template = welcomeEmailTemplate(name, username);
        return this.sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text
        });
    }
    async sendPasswordChangedEmail(email, name) {
        const { passwordChangedTemplate } = await Promise.resolve().then(() => __importStar(require('../templates/email/password-changed')));
        const template = passwordChangedTemplate(name);
        return this.sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text
        });
    }
    async sendTaskReminderEmail(email, name, taskTitle, dueDate) {
        const { taskReminderTemplate } = await Promise.resolve().then(() => __importStar(require('../templates/email/task-reminder')));
        const template = taskReminderTemplate(name, taskTitle, dueDate);
        return this.sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text
        });
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=email.service.js.map