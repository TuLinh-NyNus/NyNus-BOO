import { redirect } from "next/navigation";

/**
 * Root page - redirects to admin dashboard
 * This page handles the root route and redirects to the secret admin path
 */
export default function RootPage() {
  const secretPath = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH || "3141592654";
  redirect(`/${secretPath}`);
}
