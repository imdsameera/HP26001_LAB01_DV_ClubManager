import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findMemberById } from "@/lib/repositories/memberRepository";
import { getSettings } from "@/lib/services/settingsService";
import { createMemberUser } from "@/lib/services/userService";
import { generateSecurePassword } from "@/lib/utils";
import { sendEmail } from "@/lib/utils/mailer";
import { portalInviteWithCredentials } from "@/emails";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const clubId = (session?.user as any)?.clubId;
    if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const [doc, settings] = await Promise.all([
      findMemberById(clubId, id),
      getSettings(clubId),
    ]);

    if (!doc) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (!doc.email) {
      return NextResponse.json({ error: "Member has no email address configured" }, { status: 400 });
    }

    // Generate temp password and create/update portal account
    const tempPassword = generateSecurePassword();
    try {
      await createMemberUser(
        clubId,
        doc.email,
        `${doc.firstName} ${doc.lastName}`.trim(),
        doc.memberId ?? id,
        id,
        tempPassword,
      );
    } catch (userErr: any) {
      console.error("[invite] Error creating member user:", userErr);
      return NextResponse.json({ error: userErr.message || "Failed to provision member portal account" }, { status: 400 });
    }

    // Send the custom invite email
    const loginUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/login`;
    const template = portalInviteWithCredentials({
      firstName:  doc.firstName,
      lastName:   doc.lastName,
      memberId:   doc.memberId ?? id,
      email:      doc.email,
      password:   tempPassword,
      loginUrl,
      clubName:   settings.senderName || "Teamnode Youth Club",
    });

    try {
      await sendEmail({ to: doc.email, ...template });
      console.info(`[invite] Portal invite sent to ${doc.email}`);
    } catch (emailErr: any) {
      console.error("[invite] Error sending email:", emailErr);
      return NextResponse.json({ error: "Account created but failed to send email." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[invite] Server error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
