import { NextResponse }                 from "next/server";
import { auth }                         from "@/auth";
import { approveMember }               from "@/lib/services/memberService";
import { getSettings }                 from "@/lib/services/settingsService";
import { findMemberById }              from "@/lib/repositories/memberRepository";
import { createMemberUser, generateTempPassword } from "@/lib/services/userService";
import { sendEmail }                   from "@/lib/utils/mailer";
import { welcomeWithCredentials }      from "@/emails";
import type { MemberRole }             from "@/lib/models/member";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const clubId = (session?.user as any)?.clubId;
    if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    let role: MemberRole | undefined;
    try {
      const body = await _request.json();
      role = body?.role as MemberRole | undefined;
    } catch {
      // Ignored: empty or invalid JSON body
    }

    // ── 1. Approve the member in the members collection ──────────────────────
    const result = await approveMember(clubId, id, role);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    // ── 2. Auto-create member login account + send credentials email ─────────
    try {
      const [doc, settings] = await Promise.all([
        findMemberById(clubId, id),
        getSettings(clubId),
      ]);

      if (!doc) {
        console.warn("[approve] Could not find member doc after approval.");
        return NextResponse.json({ ok: true });
      }

      if (!doc.email) {
        console.warn(`[approve] Member ${id} has no email — skipping account creation.`);
        return NextResponse.json({ ok: true });
      }

      // Generate temp password and create portal account
      const tempPassword = generateTempPassword();
      await createMemberUser(
        clubId,
        doc.email,
        `${doc.firstName} ${doc.lastName}`.trim(),
        doc.memberId ?? id,
        id,
        tempPassword,
      );
      console.info(`[approve] Portal account created for ${doc.email}`);

      // Send credentials email if alerts are on
      if (!settings.newMemberAlerts) {
        console.info("[approve] newMemberAlerts is OFF — skipping welcome email.");
      } else {
        const loginUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/login`;
        const template = welcomeWithCredentials({
          firstName:  doc.firstName,
          lastName:   doc.lastName,
          memberId:   doc.memberId ?? id,
          email:      doc.email,
          password:   tempPassword,
          loginUrl,
          clubName:   settings.senderName || "Hyke Youth Club",
        });
        await sendEmail({ to: doc.email, ...template });
        console.info(`[approve] Welcome + credentials email sent to ${doc.email}`);
      }
    } catch (emailErr) {
      console.error("[approve] Error during account creation / email:", emailErr);
      // Don't fail the approval — the member was approved, account/email is best-effort
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[approve] Server error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
