import { redirect } from 'next/navigation';

export default function LegacyAdminDashboardRedirect() {
  redirect('/3141592654/admin');
  return null;
}
