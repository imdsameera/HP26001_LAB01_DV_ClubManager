import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { removeMember, updateActiveMember } from "@/lib/services/memberService";
import { fileToDataUrl } from "@/lib/utils/fileToDataUrl";
import { adminFieldsFromFormData, validateAdminMemberFields } from "@/lib/validators/member";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const clubId = (session?.user as any)?.clubId;
    if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
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
    let avatarDataUrl: string | undefined | null = undefined;
    if (avatar instanceof File && avatar.size > 0) {
      avatarDataUrl = await fileToDataUrl(avatar);
    } else {
      const clear = fd.get("clearAvatar");
      if (clear === "1" || clear === "true") {
        avatarDataUrl = null;
      }
    }

    const result = await updateActiveMember(clubId, id, fields, avatarDataUrl);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.error === "Member not found" ? 404 : 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const clubId = (session?.user as any)?.clubId;
    if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const result = await removeMember(clubId, id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
