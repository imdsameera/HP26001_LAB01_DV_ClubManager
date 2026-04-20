import { buildHtml, type EmailTemplate } from "./base";

interface SecurityWarningOpts {
  superAdminName: string;
  changedByName:  string;
  changedByEmail: string;
  changedByRole:  string;
  changedAt:      string;
}

export function securityWarning(opts: SecurityWarningOpts): EmailTemplate {
  const { superAdminName, changedByName, changedByEmail, changedByRole, changedAt } = opts;
  const time = new Date(changedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const subject = `⚠️ Security Alert: Admin password changed — ${changedByName}`;

  const text = `Hi ${superAdminName},

This is a security alert from Hyke Club Manager.

An admin account password was changed:

  Name:    ${changedByName}
  Email:   ${changedByEmail}
  Role:    ${changedByRole}
  Time:    ${time}

If this change was authorised, no further action is required.

If this was unexpected, please investigate immediately and consider revoking this account's access from Settings → Admin Access.

Hyke Club Manager Security`;

  const html = buildHtml({
    previewText: `Security alert: ${changedByName}'s admin password was changed.`,
    heading:     "🔐 Security Alert",
    bodyHtml: `
      <p>Hi <strong>${superAdminName}</strong>,</p>
      <p>An admin account password was changed on your Hyke Club Manager system:</p>
      <table cellpadding="0" cellspacing="0" style="width:100%;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin:20px 0">
        <tr><td style="padding:20px 24px">
          <table cellpadding="0" cellspacing="0" style="width:100%">
            <tr>
              <td style="padding:5px 0;font-size:13px;color:#78350f;width:80px">Name</td>
              <td style="padding:5px 0;font-size:14px;font-weight:600;color:#431407">${changedByName}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;font-size:13px;color:#78350f">Email</td>
              <td style="padding:5px 0;font-size:14px;font-weight:600;color:#431407">${changedByEmail}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;font-size:13px;color:#78350f">Role</td>
              <td style="padding:5px 0;font-size:14px;font-weight:600;color:#431407">${changedByRole}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;font-size:13px;color:#78350f">Time</td>
              <td style="padding:5px 0;font-size:14px;font-weight:600;color:#431407">${time}</td>
            </tr>
          </table>
        </td></tr>
      </table>
      <p style="font-size:14px;color:#374151">
        If this was <strong>not authorised</strong>, go to <strong>Settings → Admin Access</strong> and revoke this account's access immediately.
      </p>
    `,
    footerNote: "This is an automated security alert from Hyke Club Manager. Only Super Admins receive this email.",
    accentColor: "#dc2626",
  });

  return { subject, text, html };
}
