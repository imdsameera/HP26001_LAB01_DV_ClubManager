import { buildHtml, type EmailTemplate } from "./base";

interface NewApplicantOpts {
  applicantName: string;
  applicantEmail: string;
  clubName?: string;
  dashboardUrl: string;
}

export function newApplicantNotification(opts: NewApplicantOpts): EmailTemplate {
  const {
    applicantName,
    applicantEmail,
    clubName = "Teamnode Club",
    dashboardUrl,
  } = opts;

  const subject = `New Membership Application: ${applicantName}`;

  const text = `Hi Admin,

A new membership application has been submitted to ${clubName} by ${applicantName}.

Applicant Details:
Name:  ${applicantName}
Email: ${applicantEmail}

You can review this application in the club dashboard:
${dashboardUrl}

Best regards,
The ${clubName} Team`;

  const html = buildHtml({
    previewText: `New application from ${applicantName} for ${clubName}`,
    heading: `New Application Received`,
    bodyHtml: `
      <p>Hello,</p>
      <p>A new membership application has been submitted to <strong>${clubName}</strong> and is waiting for your review.</p>

      <table cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin:20px 0">
        <tr><td style="padding:20px 24px">
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Applicant Details</p>
          <table cellpadding="0" cellspacing="0" style="width:100%">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b;width:80px">Name</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a">${applicantName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748b">Email</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a">${applicantEmail}</td>
            </tr>
          </table>
        </td></tr>
      </table>
      <p>Please log in to the dashboard to review and either approve or reject this application.</p>
    `,
    ctaLabel: "Review Application",
    ctaUrl: dashboardUrl,
    footerNote: `This is an automated notification from ${clubName}.`,
  });

  return { subject, text, html };
}
