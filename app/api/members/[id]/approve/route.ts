import { NextResponse } from "next/server";
import { approveMember } from "@/lib/services/memberService";
import { getSettings } from "@/lib/services/settingsService";
import { sendWelcomeEmail } from "@/lib/utils/mailer";
import { findMemberById } from "@/lib/repositories/memberRepository";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    let role;
    try {
      const body = await _request.json();
      role = body?.role;
    } catch {
      // Ignored: empty or invalid JSON body
    }

    const result = await approveMember(id, role);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    // Send welcome email — errors are logged but never fail the approval
    try {
      const [doc, settings] = await Promise.all([
        findMemberById(id),
        getSettings(),
      ]);

      // Respect the "New Member Alerts" toggle
      if (!settings.newMemberAlerts) {
        console.info("[approve] newMemberAlerts is OFF — skipping welcome email.");
      } else if (!doc) {
        console.warn("[approve] Could not find member doc after approval — skipping email.");
      } else if (!doc.email) {
        console.warn(`[approve] Member ${id} has no email address — skipping email.`);
      } else if (!settings.senderEmail) {
        console.warn("[approve] No sender email configured in Settings — skipping email.");
      } else {
        await sendWelcomeEmail(settings, {
          firstName: doc.firstName,
          lastName:  doc.lastName,
          email:     doc.email,
          memberId:  doc.memberId ?? id,
          joinDate:  doc.joinDate ?? new Date().toISOString().slice(0, 10),
        });
      }
    } catch (emailErr) {
      // Log the real error so it's visible in the dev server terminal
      console.error("[approve] Welcome email error:", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[approve] Server error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
