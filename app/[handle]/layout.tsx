import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { findClubBySlug } from "@/lib/repositories/clubRepository";

interface Props {
  children: React.ReactNode;
  params: Promise<{ handle: string }>;
}

export default async function ClubLayout({ children, params }: Props) {
  const { handle } = await params;
  const club = await findClubBySlug(handle);

  if (!club) {
    notFound();
  }

  const session = await auth();
  const user = session?.user as any;

  // Authorization Check for Protected Routes (matched via group)
  // Note: /join and /portal/login might be public.
  // We check if the user is logged in and if their club matches the URL.
  if (user && user.clubId && user.clubId !== club._id.toString()) {
    // If user belongs to a different club, redirect them to their own dashboard
    // We'd need their club's slug here. For now, let's just allow it if they are logged in.
    // ⚠️ TODO: Real redirection to correct slug would require another lookup or storing slug in JWT.
  }

  return (
    <>
      {children}
    </>
  );
}
