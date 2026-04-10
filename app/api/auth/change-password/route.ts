import { NextResponse, type NextRequest } from "next/server";
import { auth }                          from "@/auth";
import { changePassword }                from "@/lib/services/userService";
import { sendEmail }                     from "@/lib/utils/mailer";
import { passwordChanged, securityWarning } from "@/emails";
import { findUserByEmail }               from "@/lib/repositories/userRepository";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json() as {
      currentPassword: string;
      newPassword:     string;
    };

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current and new password are required." }, { status: 400 });
    }

    const email    = session.user.email;
    const userName = session.user.name ?? email;
    const role     = session.user.role;
    const changedAt = new Date().toISOString();

    await changePassword(email, currentPassword, newPassword);

    // Email 1: Confirm to the user who changed their password
    try {
      const confirmTemplate = passwordChanged({ userName, email, changedAt });
      await sendEmail({ to: email, ...confirmTemplate });
    } catch (e) {
      console.warn("[change-password] Could not send confirmation email:", e);
    }

    // Email 2: Security warning to SUPER_ADMIN (only if it's not the super admin changing their own pw)
    if (role !== "SUPER_ADMIN") {
      try {
        const superAdmins = await findUserByEmail(process.env.SUPER_ADMIN_EMAIL ?? "");
        if (superAdmins) {
          const warnTemplate = securityWarning({
            superAdminName:  superAdmins.name,
            changedByName:   userName,
            changedByEmail:  email,
            changedByRole:   role,
            changedAt,
          });
          await sendEmail({ to: superAdmins.email, ...warnTemplate });
        }
      } catch (e) {
        console.warn("[change-password] Could not send security warning email:", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
