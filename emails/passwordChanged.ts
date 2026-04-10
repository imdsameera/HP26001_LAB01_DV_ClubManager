import { buildHtml, type EmailTemplate } from "./base";

interface PasswordChangedOpts {
  userName:  string;
  email:     string;
  changedAt: string; // ISO string
}

export function passwordChanged(opts: PasswordChangedOpts): EmailTemplate {
  const { userName, email, changedAt } = opts;
  const time = new Date(changedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const subject = "Your Hyke Club Manager password was changed";

  const text = `Hi ${userName},

This is a confirmation that your password for ${email} was successfully changed on ${time}.

If you made this change, no further action is required.

If you did NOT make this change, please contact your Super Admin immediately.

Hyke Club Manager Security Team`;

  const html = buildHtml({
    previewText: "Your password has been changed successfully.",
    heading:     "Password Changed",
    bodyHtml: `
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your password for <strong>${email}</strong> was successfully updated on <strong>${time}</strong>.</p>
      <p>If you made this change, you can safely ignore this email.</p>
      <table cellpadding="0" cellspacing="0" style="width:100%;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;margin:20px 0">
        <tr><td style="padding:16px 20px;font-size:14px;color:#991b1b">
          ⚠️ <strong>Didn't make this change?</strong> Contact your Super Admin immediately to secure your account.
        </td></tr>
      </table>
    `,
    footerNote: "Hyke Club Manager Security — this is an automated security notification.",
    accentColor: "#0f766e",
  });

  return { subject, text, html };
}
