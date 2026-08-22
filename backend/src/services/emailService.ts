/**
 * Email Service — sends verification codes via nodemailer.
 *
 * In development, we use Ethereal Email (https://ethereal.email)
 * which is a fake SMTP service by nodemailer. Emails are caught
 * and a preview URL is logged to the console so you can "see" the
 * email without a real inbox.
 *
 * In production, set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
 * in .env to point at a real mail provider (e.g. Gmail, SendGrid).
 */

import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

/**
 * Lazily initialise the nodemailer transporter.
 * Uses real SMTP if env vars are set, otherwise falls back to Ethereal.
 */
async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 0;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    // ── Real SMTP (production) ──────────────────────────────────
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    console.log(`[Email] Using real SMTP: ${host}:${port}`);
  } else {
    // ── Ethereal (development / testing) ────────────────────────
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email] Using Ethereal test SMTP (user: ${testAccount.user})`);
    console.log('[Email] Emails will NOT be delivered — check console for preview URLs');
  }

  return transporter;
}

/**
 * Send a 6-digit verification code to the given email address.
 * Returns the Ethereal preview URL (useful in dev) or null for real SMTP.
 */
export async function sendVerificationEmail(
  to: string,
  code: string,
  studentName: string
): Promise<string | null> {
  const t = await getTransporter();

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #FAF7F2; border-radius: 16px; border: 2px solid #e6d2ac;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 28px; color: #2C221E; font-weight: 900;">WitsQuest</h1>
        <p style="margin: 4px 0 0; font-size: 12px; color: #a87d4d; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 700;">Campus Adventure</p>
      </div>

      <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(44,34,30,0.06);">
        <h2 style="margin: 0 0 8px; font-size: 18px; color: #2C221E;">Verify Your Email</h2>
        <p style="margin: 0 0 20px; font-size: 14px; color: #6b5630; line-height: 1.6;">
          Hi <strong>${studentName}</strong>, welcome to WitsQuest! Use the code below to verify your student email address.
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #d37a32, #a87d4d); color: white; font-size: 36px; font-weight: 900; letter-spacing: 0.3em; padding: 16px 32px; border-radius: 12px; font-family: 'Courier New', monospace;">
            ${code}
          </div>
        </div>

        <p style="margin: 16px 0 0; font-size: 13px; color: #8a7560; text-align: center;">
          This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>

      <p style="text-align: center; margin-top: 20px; font-size: 11px; color: #a89880;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  const info = await t.sendMail({
    from: '"WitsQuest" <' + (process.env.SMTP_USER || 'noreply@witsquest.wits.ac.za') + '>',
    to,
    subject: `Your WitsQuest verification code: ${code}`,
    html,
  });

  // Ethereal returns a preview URL we can open in a browser to see the email
  const previewUrl = nodemailer.getTestMessageUrl(info) as string | null;
  if (previewUrl) {
    console.log(`[Email] Verification email preview: ${previewUrl}`);
  }
  console.log(`[Email] Sent verification code to ${to} — CODE: ${code}`);
  return previewUrl ?? null;
}
