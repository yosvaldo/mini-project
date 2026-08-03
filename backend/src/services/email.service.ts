import transporter from "../libs/nodemailer.js";
import { SMTP_USER } from "../configs/env.config.js";

const EmailService = {
    sendEmail: async (to: string, subject: string, html: string) => {
        return await transporter.sendMail({
            from: `"Eventura Team" <${SMTP_USER}>`,
            to,
            subject,
            html,
        });
    },
    sendEmailWithAttachment: async (
        to: string,
        subject: string,
        html: string,
        attachments: any[],
    ) => {
        return await transporter.sendMail({
            from: `"Eventura Team" <${SMTP_USER}>`,
            to,
            subject,
            html,
            attachments,
        });
    },
};

export default EmailService;