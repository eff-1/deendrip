import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateAdminSessionAsync, getAllOrdersAsync, getProducts } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Operations Dashboard | Deen Drip Admin',
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('deendrip_admin_token')?.value;

  // Validate token against server-side session store
  if (!token) {
    redirect('/admin/login');
  }

  const admin = await validateAdminSessionAsync(token);
  if (!admin) {
    redirect('/admin/login');
  }

  return <AdminDashboardClient adminName={admin.name} adminRole={admin.role} />;
}
