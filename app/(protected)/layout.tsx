'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ScreenLoader } from '@/components/common/screen-loader';
import { Demo3Layout } from '../components/layouts/demo3/layout';
import { LocationProvider } from '@/app/context/location-context'; // <-- import it

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <ScreenLoader />;
  }

  // Wrap your main layout with LocationProvider
  return session ? (
    <LocationProvider>
      <Demo3Layout>{children}</Demo3Layout>
    </LocationProvider>
  ) : null;
}
