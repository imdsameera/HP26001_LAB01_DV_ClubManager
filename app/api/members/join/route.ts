import { NextResponse } from "next/server";
import { createPendingFromJoin } from "@/lib/services/memberService";
import { fileToDataUrl } from "@/lib/utils/fileToDataUrl";
import { joinFieldsFromFormData, validateJoinFields } from "@/lib/validators/member";

export async function POST(request: Request) {
  try {
    const fd = await request.formData();
    const fields = joinFieldsFromFormData(fd);
    const err = validateJoinFields(fields);
    if (err) {
      return NextResponse.json({ ok: false, error: err }, { status: 400 });
    }

    const avatar = fd.get("avatar");
    let avatarDataUrl: string | undefined;
    if (avatar instanceof File && avatar.size > 0) {
      avatarDataUrl = await fileToDataUrl(avatar);
    }

    const result = await createPendingFromJoin(fields, avatarDataUrl);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
