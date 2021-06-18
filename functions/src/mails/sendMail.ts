import { logger } from 'firebase-functions';
import { htmlToText } from 'html-to-text';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import config from '../config';

export type MailOptions = {
    html: string;
    subject: string;
    to: {
        email: string;
        id: string;
    };
};

let transport: Mail | null = null;
const getTransport = () => {
    if (transport) {
        return transport;
    }

    transport = nodemailer.createTransport({
        pool: true,
        host: config.smtp.host,
        port: config.smtp.port,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.password,
        },
    });

    return transport;
};

export const sendMail = async ({ html, subject, to }: MailOptions) => {
    logger.info(`Attempting to send mail to user ${to.id}`, { subject });
    await getTransport().sendMail({
        from: config.smtp.from,
        subject,
        to: to.email,
        html,
        text: htmlToText(html),
    });
    logger.info(`Successfully sent mail to user ${to.id}`);
};
