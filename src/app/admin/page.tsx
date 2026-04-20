import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { counts, listAll } from '@/lib/registrations';
import { AdminDashboard } from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }
  const [registrations, totals] = await Promise.all([listAll(), counts()]);
  return <AdminDashboard initialRegistrations={registrations} initialCounts={totals} />;
}
