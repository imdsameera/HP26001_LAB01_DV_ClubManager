import { redirect } from "next/navigation";

/**
 * Root route — immediately redirect to the admin dashboard.
 * Once authentication is introduced, add a session check here
 * and redirect unauthenticated users to /join instead.
 */
export default function RootPage() {
  redirect("/dashboard");
}
