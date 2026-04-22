import { buildHtml, type EmailTemplate } from "./base";

interface WelcomeCredentialsOpts {
  firstName: string;
  lastName: string;
  memberId: string;
  email: string;
  password: string;
  loginUrl: string;
  clubName?: string;
}

export function welcomeWithCredentials(
  opts: WelcomeCredentialsOpts,
): EmailTemplate {
  const {
    firstName,
    lastName,
    memberId,
    email,
    password,
    loginUrl,
    clubName = "Teamnode Club",
  } = opts;
  const fullName = `${firstName} ${lastName}`.trim();

  const subject = `Welcome to ${clubName}! Your member account is ready 🎉`;

  const text = `Hi ${firstName},

Congratulations! Your membership application has been approved.

Here are your login credentials for the Member Portal:

  Email:     ${email}
  Password:  ${password}
  Member ID: ${memberId}

Sign in at: ${loginUrl}

For security, please change your password after your first login.

Welcome aboard,
The ${clubName} Team`;

  const html = buildHtml({
    previewText: `Welcome to ${clubName}! Your account is ready.`,
    heading: `Welcome, ${firstName}! 🎉`,
    bodyHtml: `
      <p>Congratulations <strong>${fullName}</strong>! Your membership application has been approved and your account is now active.</p>

      <table cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin:20px 0">
        <tr><td style="padding:20px 24px">
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Your Login Credentials</p>
          <table cellpadding="0" cellspacing="0" style="width:100%">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;width:100px">Email</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a">${email}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b">Password</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a;font-family:monospace">${password}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b">Member ID</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0066FF">${memberId}</td>
            </tr>
          </table>
        </td></tr>
      </table>

      <p style="font-size:13px;color:#ef4444">
        ⚠️ <strong>Please change your password</strong> after your first login for security.
      </p>
    `,
    ctaLabel: "Sign In to Member Portal",
    ctaUrl: loginUrl,
    footerNote: `Member ID: ${memberId} · This email contains sensitive login information. Please keep it safe.`,
  });

  return { subject, text, html };
}
