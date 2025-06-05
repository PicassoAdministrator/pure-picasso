'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import LocationProfileEditDialog from './location-profile-edit-dialog';
import { AvatarGroup } from '@/app/components/partials/common/avatar-group';
import { Button } from '@/components/ui/button';

// --- Define/Import these types as appropriate for your app ---
export interface LocationUser {
  id: string;
  userId: string;
  roleId: string;
  isPrimary: boolean;
  isCurrent: boolean;
  user: { id: string; name: string; email: string };
  role: { id: string; name: string };
}
export interface Location {
  isProtected: boolean | undefined;
  id: string;
  name: string;
  parent?: { id: string; name: string } | null;
  children?: { id: string; name: string }[];
  users?: LocationUser[];
}

interface LocationProfileProps {
  location: Location;
  isLoading: boolean;
}

const Loading = () => (
  <Card>
    <CardContent>
      <Skeleton className="h-6 w-32" />
    </CardContent>
  </Card>
);

export default function LocationProfile({ location, isLoading }: LocationProfileProps) {
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading || !location) return <Loading />;

  const users = location.users?.map((ul: LocationUser) => ({
    path: '', // If you add avatar support
    fallback:
      ul.user?.name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || ul.user?.email[0]?.toUpperCase() || 'U',
    title: ul.user?.name || ul.user?.email,
  })) ?? [];

  return (
    <>
      <Card>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-3 text-sm mb-5 [&_dt]:text-muted-foreground">
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt className="flex md:w-64">Location Name:</dt>
              <dd>{location.name}</dd>
            </div>
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt>Parent Location:</dt>
              <dd>{location.parent?.name ?? <span className="text-muted-foreground">—</span>}</dd>
            </div>
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt>Children:</dt>
              <dd>
                {location.children?.length
                  ? location.children.map((c: { name: string }) => c.name).join(', ')
                  : <span className="text-muted-foreground">—</span>}
              </dd>
            </div>
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt>Users:</dt>
              <dd>
                {users.length > 0
                  ? <AvatarGroup group={users} size="size-7" />
                  : <span className="text-muted-foreground">None</span>}
              </dd>
            </div>
          </dl>
          <Button variant="outline" onClick={() => setEditOpen(true)} disabled={location.isProtected} >
            Edit location details
          </Button>
        </CardContent>
      </Card>
      <LocationProfileEditDialog open={editOpen} closeDialog={() => setEditOpen(false)} location={location} />
    </>
  );
}
