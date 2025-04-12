import { CreateEmailOptions, CreateEmailResponse, Resend } from 'resend';

require('dotenv').config();
const client = new Resend(process.env.MAIL_KEY!);

/**
 * Sends an email via Resend
 */
export async function sendEmail(payload: CreateEmailOptions): Promise<CreateEmailResponse> {
    const email = await client.emails.send(payload);

    return email;
}
