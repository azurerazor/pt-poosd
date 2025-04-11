import { Resend } from 'resend';

require('dotenv').config();
const client = new Resend(process.env.MAIL_KEY!);

/**
 * Sends an email via Resend
 */
export async function sendEmail(from: string, to: string, subject: string, html: string) {
    const email = await client.emails.send({ from, to, subject, html });

    return email;
}
