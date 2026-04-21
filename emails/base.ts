// ─── Base HTML email builder ─────────────────────────────────────────────────

export interface EmailTemplate {
  subject: string;
  text:    string;
  html:    string;
}

interface BuildOptions {
  previewText: string;
  heading:     string;
  bodyHtml:    string;
  ctaLabel?:   string;
  ctaUrl?:     string;
  footerNote?: string;
  accentColor?: string;
}

export function buildHtml(opts: BuildOptions): string {
  const {
    previewText,
    heading,
    bodyHtml,
    ctaLabel,
    ctaUrl,
    footerNote,
    accentColor = "#0066FF",
  } = opts;

  const cta = ctaLabel && ctaUrl
    ? `<tr><td align="center" style="padding:8px 32px 28px">
        <a href="${ctaUrl}" style="display:inline-block;background:${accentColor};color:#ffffff;
           text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;
           border-radius:8px;letter-spacing:0.02em">${ctaLabel}</a>
       </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${heading}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;color:#1e293b">
  <span style="display:none;max-height:0;overflow:hidden">${previewText}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0052cc,${accentColor});padding:28px 32px">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:36px;height:36px;background:rgba(255,255,255,.15);border-radius:8px;
                       text-align:center;line-height:36px;font-size:18px;font-weight:900;color:#fff">H</td>
            <td style="padding-left:12px">
              <p style="margin:0;font-size:16px;font-weight:700;color:#fff">Teamnode Youth Club</p>
              <p style="margin:2px 0 0;font-size:11px;color:rgba(255,255,255,.7)">Club Management System</p>
            </td>
          </tr></table>
        </td></tr>
        <!-- Heading -->
        <tr><td style="padding:32px 32px 8px">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a">${heading}</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:16px 32px;font-size:15px;line-height:1.7;color:#334155">
          ${bodyHtml}
        </td></tr>
        ${cta}
        <!-- Divider -->
        <tr><td style="padding:0 32px"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0"/></td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;font-size:12px;color:#94a3b8;line-height:1.6">
          ${footerNote ?? "This email was sent automatically by Teamnode Youth Club's management system."}
        </td></tr>
      </table>
      <p style="margin:20px 0 0;font-size:11px;color:#cbd5e1">Teamnode Youth Club — Powered by Teamnode Global</p>
    </td></tr>
  </table>
</body></html>`;
}

export function textToHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .split(/\n{2,}/)
    .map(p => `<p style="margin:0 0 16px 0;line-height:1.6">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}
