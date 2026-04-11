import "server-only";

import nodemailer from "nodemailer";
import type { ClubSettings } from "@/lib/services/settingsService";

// ─── Transport ────────────────────────────────────────────────────────────────

function buildTransport() {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const port = Number(process.env.EMAIL_PORT ?? 587);

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
  });
}

function getSystemFrom(): string {
  const name = process.env.EMAIL_FROM_NAME ?? "Hyke Club Manager";
  const addr = process.env.EMAIL_USER ?? "";
  return addr ? `"${name}" <${addr}>` : name;
}

// ─── HTML template builder ────────────────────────────────────────────────────

function buildHtml(options: {
  previewText: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}): string {
  const { previewText, heading, bodyHtml, ctaLabel, ctaUrl, footerNote } = options;
  const cta = ctaLabel && ctaUrl
    ? `<tr><td align="center" style="padding:8px 32px 24px">
        <a href="${ctaUrl}"
          style="display:inline-block;background:#0066FF;color:#ffffff;text-decoration:none;
                 font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;
                 letter-spacing:0.02em">
          ${ctaLabel}
        </a>
       </td></tr>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;color:#1e293b">
  <!-- preview text (hidden) -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all">${previewText}</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px">

        <!-- Header bar -->
        <tr>
          <td style="background:linear-gradient(135deg,#0052cc,#0066FF);padding:28px 32px">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:8px;
                         text-align:center;line-height:36px;font-size:18px;font-weight:900;color:#fff">H</td>
              <td style="padding-left:12px">
                <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff">Hyke Youth Club</p>
                <p style="margin:2px 0 0;font-size:11px;color:rgba(255,255,255,0.7)">Club Management System</p>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Heading -->
        <tr>
          <td style="padding:32px 32px 8px">
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a">${heading}</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:16px 32px;font-size:15px;line-height:1.7;color:#334155">
            ${bodyHtml}
          </td>
        </tr>

        <!-- CTA -->
        ${cta}

        <!-- Divider -->
        <tr><td style="padding:0 32px"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0"/></td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;font-size:12px;color:#94a3b8;line-height:1.6">
            ${footerNote ?? "This email was sent automatically by Hyke Youth Club's management system. Please do not reply to this message."}
          </td>
        </tr>

      </table>

      <!-- Bottom spacer brand -->
      <p style="margin:20px 0 0;font-size:11px;color:#cbd5e1">
        Hyke Youth Club &mdash; Powered by Hyke Global
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return paragraphs;
}

// ─── Template interpolation ───────────────────────────────────────────────────

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

// ─── Send helpers ─────────────────────────────────────────────────────────────

async function send(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  fromOverride?: string;
}): Promise<void> {
  const transport = buildTransport();
  if (!transport) {
    throw new Error(
      "SMTP not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in your .env.local file.",
    );
  }
  const info = await transport.sendMail({
    from: opts.fromOverride ?? getSystemFrom(),
    to:   opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
  console.info(`[mailer] Email sent to ${opts.to} — messageId: ${info.messageId}`);
}

// ─── Public: Generic send (used by /emails templates) ────────────────────────

export async function sendEmail(opts: {
  to:      string;
  subject: string;
  text:    string;
  html:    string;
  from?:   string;
}): Promise<void> {
  await send({ ...opts, fromOverride: opts.from });
}

// ─── Public: Sender email verification ───────────────────────────────────────

export async function sendVerificationEmail(
  toEmail: string,
  verifyUrl: string,
): Promise<void> {
  const subject = "Verify your sender email address — Hyke Club Manager";
  const plain   = `Hi,\n\nPlease verify your sender email address for Hyke Youth Club's management system.\n\nClick the link below to verify:\n${verifyUrl}\n\nThis link expires in 24 hours. If you did not request this, you can safely ignore this email.\n\nBest regards,\nHyke Club Manager`;

  const html = buildHtml({
    previewText: "Verify your sender email to start sending member emails.",
    heading:     "Verify Your Email Address",
    bodyHtml: `
      <p>You (or an admin) requested to use <strong>${toEmail}</strong> as the
         sender address for outgoing member emails in Hyke Youth Club.</p>
      <p>Click the button below to confirm this address. The link is valid for
         <strong>24 hours</strong>.</p>
      <p style="font-size:13px;color:#64748b">
        If you didn't make this request, you can safely ignore this email.
        No changes will be made.
      </p>`,
    ctaLabel:   "Verify Email Address",
    ctaUrl:     verifyUrl,
    footerNote: `This verification was requested for the Hyke Club Manager. Link expires in 24 hours.`,
  });

  await send({ to: toEmail, subject, text: plain, html });
}

// ─── Public: Welcome email ────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  settings: ClubSettings,
  member: {
    firstName: string;
    lastName:  string;
    email:     string;
    memberId:  string;
    joinDate:  string;
  },
): Promise<void> {
  if (!settings.senderEmail) {
    throw new Error("No verified sender email configured in Settings → Emails & Alerts.");
  }
  if (!member.email) {
    throw new Error(`Member ${member.memberId} has no email address.`);
  }

  const vars: Record<string, string> = {
    first_name: member.firstName,
    last_name:  member.lastName,
    member_id:  member.memberId,
    join_date:  member.joinDate,
  };

  const from  = settings.senderName
    ? `"${settings.senderName}" <${settings.senderEmail}>`
    : settings.senderEmail;

  const subject   = interpolate(settings.welcomeSubject, vars);
  const plainText = interpolate(settings.welcomeTemplate, vars);

  const html = buildHtml({
    previewText: `Welcome to Hyke Youth Club, ${member.firstName}!`,
    heading:     interpolate("Welcome, {{first_name}}! 🎉", vars),
    bodyHtml:    textToHtml(plainText),
    footerNote:  `Your membership is now active. Member ID: ${member.memberId}`,
  });

  await send({ to: member.email, subject, text: plainText, html, fromOverride: from });
}
