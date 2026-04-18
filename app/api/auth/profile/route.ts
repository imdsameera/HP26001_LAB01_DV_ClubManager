import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { patchUser, findUserByEmail } from "@/lib/repositories/userRepository";

async function fileToDataUrl(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

// GET — return current user profile details (name, email, avatarUrl)
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await findUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    name:      user.name,
    email:     user.email,
    avatarUrl: user.avatarUrl ?? null,
  });
}

// POST — update profile (name, avatar). Expects FormData.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";

    // Handle both FormData and JSON for backward compatibility
    if (contentType.includes("multipart/form-data")) {
      const fd = await request.formData();
      const name = fd.get("name") as string | null;
      const avatar = fd.get("avatar");
      const clearAvatar = fd.get("clearAvatar");

      const patch: Record<string, unknown> = {};
      if (name && name.trim().length > 0) patch.name = name.trim();

      if (avatar instanceof File && avatar.size > 0) {
        patch.avatarUrl = await fileToDataUrl(avatar);
      } else if (clearAvatar === "1") {
        patch.avatarUrl = null;
      }

      if (Object.keys(patch).length === 0) {
        return NextResponse.json({ error: "No changes provided." }, { status: 400 });
      }

      console.log("DEBUG: Patching user", session.user.email, { 
        name: patch.name, 
        avatarUrlLength: (patch.avatarUrl as string)?.length 
      });

      await patchUser(session.user.email, patch);
      return NextResponse.json({ ok: true, avatarUrl: patch.avatarUrl });
    } else {
      // JSON fallback (name-only update)
      const { name } = await request.json() as { name?: string };
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: "Name is required." }, { status: 400 });
      }
      await patchUser(session.user.email, { name: name.trim() });
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    console.error("Profile update error:", e);
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
