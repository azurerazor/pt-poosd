import { CreateEmailOptions, Resend } from 'resend';

require('dotenv').config();
const client = new Resend(process.env.MAIL_KEY!);

/**
 * Sends an email via Resend
 */
export async function sendEmail(payload: CreateEmailOptions) {
    const email = await client.emails.send(payload);

    return email;
}
