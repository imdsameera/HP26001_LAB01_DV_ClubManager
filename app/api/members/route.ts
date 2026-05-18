import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createActiveMember,
  getMemberApiByMemberId,
  getMemberApiByEmail,
  listActiveMembersApi,
  listPendingApprovals,
} from "@/lib/services/memberService";
import { findMemberById } from "@/lib/repositories/memberRepository";
import { getSettings } from "@/lib/services/settingsService";
import { createMemberUser } from "@/lib/services/userService";
import { generateSecurePassword } from "@/lib/utils";
import { sendEmail } from "@/lib/utils/mailer";
import { welcomeWithCredentials } from "@/emails";
import { fileToDataUrl } from "@/lib/utils/fileToDataUrl";
import { adminFieldsFromFormData, validateAdminMemberFields } from "@/lib/validators/member";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const clubId = (session?.user as any)?.clubId;
    if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status    = searchParams.get("status")   ?? "active";
    const memberIdQ = searchParams.get("memberId");
    const emailQ    = searchParams.get("email");

    // Single-member lookup
    if (memberIdQ) {
      const member = await getMemberApiByMemberId(clubId, memberIdQ);
      if (member) return NextResponse.json({ members: [member] });
    }

    if (emailQ) {
      const member = await getMemberApiByEmail(clubId, emailQ);
      if (member) return NextResponse.json({ members: [member] });
    }

    if (memberIdQ || emailQ) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (status === "pending") {
      const pending = await listPendingApprovals(clubId);
      require("fs").writeFileSync("scratch/debug_pending.json", JSON.stringify(pending, null, 2));
      return NextResponse.json({ pending });
    }
    const members = await listActiveMembersApi(clubId);
    return NextResponse.json({ members });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const clubId = (session?.user as any)?.clubId;
    if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
    }
    const fd = await request.formData();
    const fields = adminFieldsFromFormData(fd);
    const err = validateAdminMemberFields(fields);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }

    const avatar = fd.get("avatar");
    let avatarDataUrl: string | undefined;
    if (avatar && typeof avatar !== "string" && avatar.size > 0) {
      avatarDataUrl = await fileToDataUrl(avatar as File);
    }

    const result = await createActiveMember(clubId, fields, avatarDataUrl);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Auto-create member login account + send credentials email
    try {
      const [doc, settings] = await Promise.all([
        findMemberById(clubId, result.id),
        getSettings(clubId),
      ]);

      if (doc && doc.email) {
        const tempPassword = generateSecurePassword();
        await createMemberUser(
          clubId,
          doc.email,
          `${doc.firstName} ${doc.lastName}`.trim(),
          doc.memberId ?? result.id,
          result.id,
          tempPassword,
        );

        if (settings.newMemberAlerts) {
          const loginUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/login`;
          const template = welcomeWithCredentials({
            firstName:  doc.firstName,
            lastName:   doc.lastName,
            memberId:   doc.memberId ?? result.id,
            email:      doc.email,
            password:   tempPassword,
            loginUrl,
            clubName:   settings.senderName || "Teamnode Youth Club",
          });
          await sendEmail({ to: doc.email, ...template });
        }
      }
    } catch (emailErr) {
      console.error("[createActiveMember] Error during account creation / email:", emailErr);
    }

    return NextResponse.json({ ok: true, id: result.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
