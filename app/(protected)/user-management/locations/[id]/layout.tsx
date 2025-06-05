'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Building, MoveLeft, Activity } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/common/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarTitle } from '@/components/common/toolbar';
import { LocationProvider } from './components/location-context';
import LocationHero from './components/location-hero';

type NavRoutes = Record<string, { title: string; icon: React.FC; path: string }>;

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export default function LocationLayout({ params, children }: Props) {
  const { id } = params; // <-- THIS IS CORRECT
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('');

  const navRoutes = useMemo<NavRoutes>(
    () => ({
      general: {
        title: 'Profile',
        icon: Building,
        path: `/user-management/locations/${id}`,
      },
      logs: {
        title: 'Activity Logs',
        icon: Activity,
        path: `/user-management/locations/${id}/logs`,
      },
    }),
    [id]
  );

  useEffect(() => {
    const found = Object.keys(navRoutes).find((key) => pathname === navRoutes[key].path);
    setActiveTab(found || 'general');
  }, [navRoutes, pathname]);

  const { data: location, isLoading } = useQuery({
    queryKey: ['location', id],
    queryFn: async () => {
      const response = await apiFetch(`/api/user-management/locations/${id}`);
      if (response.status === 404) router.push('/user-management/locations');
      if (!response.ok) throw new Error((await response.json()).message);
      return response.json();
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const handleTabClick = (key: string, path: string) => {
    setActiveTab(key);
    router.push(path);
  };

  return (
    <LocationProvider location={location} isLoading={isLoading}>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarTitle>Location</ToolbarTitle>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/user-management/locations">Locations</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{location?.name ?? (isLoading ? 'Loading...' : 'Location')}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </ToolbarHeading>
          <ToolbarActions>
            <Button asChild variant="outline">
              <Link href="/user-management/locations">
                <MoveLeft /> Back to locations
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
        <LocationHero location={location} isLoading={isLoading} />
        <Tabs defaultValue={activeTab} value={activeTab}>
          <TabsList variant="line" className="mb-5">
            {Object.entries(navRoutes).map(([key, { title, icon: Icon, path }]) => (
              <TabsTrigger
                key={key}
                value={key}
                disabled={isLoading}
                onClick={() => handleTabClick(key, path)}
              >
                <Icon />
                <span>{title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {children}
      </Container>
    </LocationProvider>
  );
}
