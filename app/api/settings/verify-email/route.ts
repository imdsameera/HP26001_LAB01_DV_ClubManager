import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  createVerificationToken,
  consumeVerificationToken,
  cancelPendingVerification,
  getSettings,
} from "@/lib/services/settingsService";
import { sendVerificationEmail } from "@/lib/utils/mailer";

// ─── POST /api/settings/verify-email ─────────────────────────────────────────
// Body: { email: string }
// Generates a token, saves pending email, sends verification email.

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const clubId = (session?.user as any)?.clubId;
    if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, action } = await request.json() as { email?: string; action?: string };

    // Cancel pending verification
    if (action === "cancel") {
      await cancelPendingVerification(clubId);
      return NextResponse.json({ ok: true });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const token = await createVerificationToken(clubId, email);

    // Build the verification URL — must point to the API route (GET handler),
    // which validates the token and then redirects to the display page.
    const origin    = request.nextUrl.origin;
    const verifyUrl = `${origin}/api/settings/verify-email?token=${token}&clubId=${clubId}`;

    await sendVerificationEmail(email, verifyUrl);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[verify-email POST]", e);
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── GET /api/settings/verify-email?token=xxx ────────────────────────────────
// Validates the token and promotes pending email to active.
// Redirects to the public verify-email result page.

export async function GET(request: NextRequest) {
  const token  = request.nextUrl.searchParams.get("token") ?? "";
  const clubId = request.nextUrl.searchParams.get("clubId") ?? "";
  const origin = request.nextUrl.origin;

  if (!token || !clubId) {
    return NextResponse.redirect(`${origin}/verify-email?error=missing_params`);
  }

  const result = await consumeVerificationToken(clubId, token);

  if (!result.ok) {
    const msg = encodeURIComponent(result.reason);
    return NextResponse.redirect(`${origin}/verify-email?error=${msg}`);
  }

  // Get the now-verified email to pass along to the success page
  const settings = await getSettings(clubId);
  const email = encodeURIComponent(settings.senderEmail);
  return NextResponse.redirect(`${origin}/verify-email?success=1&email=${email}`);
}
