import { redirect } from 'next/navigation';

export default function LegacyAdminToolsRedirect() {
  redirect('/3141592654/admin/tools');
  return null;
}
