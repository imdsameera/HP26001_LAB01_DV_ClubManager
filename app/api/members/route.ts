import { NextResponse } from "next/server";
import {
  createActiveMember,
  getMemberApiByMemberId,
  getMemberApiByEmail,
  listActiveMembersApi,
  listPendingApprovals,
} from "@/lib/services/memberService";
import { fileToDataUrl } from "@/lib/utils/fileToDataUrl";
import { adminFieldsFromFormData, validateAdminMemberFields } from "@/lib/validators/member";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status    = searchParams.get("status")   ?? "active";
    const memberIdQ = searchParams.get("memberId");
    const emailQ    = searchParams.get("email");

    // Single-member lookup
    if (memberIdQ) {
      const member = await getMemberApiByMemberId(memberIdQ);
      if (member) return NextResponse.json({ members: [member] });
    }

    if (emailQ) {
      const member = await getMemberApiByEmail(emailQ);
      if (member) return NextResponse.json({ members: [member] });
    }

    if (memberIdQ || emailQ) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (status === "pending") {
      const pending = await listPendingApprovals();
      return NextResponse.json({ pending });
    }
    const members = await listActiveMembersApi();
    return NextResponse.json({ members });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
    if (avatar instanceof File && avatar.size > 0) {
      avatarDataUrl = await fileToDataUrl(avatar);
    }

    const result = await createActiveMember(fields, avatarDataUrl);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, id: result.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
