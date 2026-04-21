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

    // Resolve clubId
    // 1. Check form data
    // 2. Check URL query params (if we had access to the full URL, but here we only have the request)
    let resolvedClubId = fd.get("clubId") as string | null;
    const handle        = fd.get("handle") as string | null;

    if (!resolvedClubId) {
      const { getDb } = await import("@/lib/db/mongodb");
      const { DB_NAME } = await import("@/lib/models/member");
      const { CLUBS_COLLECTION } = await import("@/lib/models/club");
      const { USERS_COLLECTION } = await import("@/lib/models/user");
      const db = await getDb(DB_NAME);

      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
      let targetClubDoc = null;

      if (superAdminEmail) {
        const superAdmin = await db.collection(USERS_COLLECTION).findOne({ email: superAdminEmail.toLowerCase().trim() });
        if (superAdmin?.clubId) {
          targetClubDoc = await db.collection(CLUBS_COLLECTION).findOne({ _id: (typeof superAdmin.clubId === 'string' ? superAdmin.clubId : superAdmin.clubId) as any });
          if (targetClubDoc) {
            resolvedClubId = targetClubDoc._id.toString();
            console.log(`[Join API] Resolved clubId via Super Admin (${superAdminEmail}): ${targetClubDoc.name} (${resolvedClubId})`);
          }
        }
      }

      // 2. Try handle if provided
      if (!resolvedClubId && handle) {
        targetClubDoc = await db.collection(CLUBS_COLLECTION).findOne({ slug: handle.toLowerCase().trim() });
        if (targetClubDoc) {
          resolvedClubId = targetClubDoc._id.toString();
          console.log(`[Join API] Resolved clubId via Handle (${handle}): ${targetClubDoc.name} (${resolvedClubId})`);
        }
      }

      if (!resolvedClubId) {
        const firstClub = await db.collection(CLUBS_COLLECTION).findOne({});
        if (!firstClub) {
          console.error("[Join API] No clubs found in database.");
          return NextResponse.json({ ok: false, error: "Club setup incomplete" }, { status: 404 });
        }
        resolvedClubId = firstClub._id.toString();
        console.log(`[Join API] No Super Admin match. Resolved to first club: ${firstClub.name} (${resolvedClubId})`);
      }
    } else {
      console.log(`[Join API] Using provided clubId: ${resolvedClubId}`);
    }

    const result = await createPendingFromJoin(resolvedClubId, fields, avatarDataUrl);
    if (!result.ok) {
      console.warn(`[Join API] Application failed for club ${resolvedClubId}:`, result.error);
      return NextResponse.json(result, { status: 400 });
    }

    console.log(`[Join API] Successfully created pending member for club: ${resolvedClubId}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
