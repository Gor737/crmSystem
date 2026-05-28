'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {

    const isPublic = publicRoutes.some((r) => pathname.startsWith(r));

    if (!isAuthenticated && !isPublic && pathname !== '/') {
      router.replace('/login');
      return;
    }
    if (isAuthenticated && (isPublic || pathname === '/')) {
      router.replace('/dashboard');
    }
    if (!isAuthenticated && pathname === '/') {
      router.replace('/login');
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}
