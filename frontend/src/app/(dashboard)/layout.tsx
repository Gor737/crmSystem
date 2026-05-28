'use client';

import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
