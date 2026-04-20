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

    // Resolve clubId (from form or fallback to first club)
    const clubId = fd.get("clubId") as string | null;
    let resolvedClubId = clubId;

    if (!resolvedClubId) {
      const { getDb } = await import("@/lib/db/mongodb");
      const { DB_NAME } = await import("@/lib/models/member");
      const { CLUBS_COLLECTION } = await import("@/lib/models/club");
      const db = await getDb(DB_NAME);
      const firstClub = await db.collection(CLUBS_COLLECTION).findOne({});
      if (!firstClub) {
        return NextResponse.json({ ok: false, error: "Club not found" }, { status: 404 });
      }
      resolvedClubId = firstClub._id.toString();
    }

    const result = await createPendingFromJoin(resolvedClubId, fields, avatarDataUrl);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
