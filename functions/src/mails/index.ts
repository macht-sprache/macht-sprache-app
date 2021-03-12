import mjml2html from 'mjml';
import nodemailer from 'nodemailer';
import { Lang } from '../../../src/types';
import config from '../config';
import { auth, functions } from '../firebase';
import { getVerifyEmailTemplate } from './templates';

export const sendEmailVerification = functions.https.onCall(
    async (
        {
            origin,
            verifyPath,
            continuePath,
            lang,
        }: { origin: string; verifyPath: string; continuePath: string; lang: Lang },
        context
    ) => {
        const userId = context.auth?.uid;

        if (!userId) {
            throw new Error(`User not logged in.`);
        }

        const user = await auth.getUser(userId);

        if (!user.email) {
            throw new Error(`User ${userId} has no email to verify.`);
        }

        const verificationLink = await auth.generateEmailVerificationLink(user.email, { url: origin + continuePath });
        const params = new URL(verificationLink).searchParams;

        const url = new URL(origin + verifyPath);
        url.search = params.toString();

        const { html } = mjml2html(getVerifyEmailTemplate(lang, url.toString()));

        const transport = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            auth: {
                user: config.smtp.user,
                pass: config.smtp.password,
            },
        });

        await transport.sendMail({
            from: 'noreply@macht-sprache.de',
            subject: 'Verify your email',
            to: user.email,
            html,
        });
    }
);
