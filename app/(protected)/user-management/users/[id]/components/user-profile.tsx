// app/(protected)/user-management/users/[id]/components/user-profile.tsx

'use client';

import { useState } from 'react';
import { formatDateTime } from '@/lib/helpers';
import { Badge, BadgeDot, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, UserStatus } from '@/app/models/user';
import { getUserStatusProps } from '../../constants/status';
import UserProfileEditDialog from './user-profile-edit-dialog';

// Hoist the loading skeleton to keep the render tree stable for SSR/CSR
const Loading = () => (
  <Card>
    <CardContent>
      <dl className="grid grid-cols-[auto_1fr] text-muted-foreground gap-3 text-sm mb-5">
        <div className="grid grid-cols-subgrid col-span-2 items-baseline">
          <dt className="flex md:w-64">
            <Skeleton className="h-6 w-24" />
          </dt>
          <dd>
            <Skeleton className="h-5 w-36" />
          </dd>
        </div>
        <div className="grid grid-cols-subgrid col-span-2 items-baseline">
          <dt>
            <Skeleton className="h-5 w-36" />
          </dt>
          <dd>
            <Skeleton className="h-5 w-48" />
          </dd>
        </div>
        <div className="grid grid-cols-subgrid col-span-2 items-baseline">
          <dt>
            <Skeleton className="h-5 w-20" />
          </dt>
          <dd>
            <Skeleton className="h-5 w-24" />
          </dd>
        </div>
        <div className="grid grid-cols-subgrid col-span-2 items-baseline">
          <dt>
            <Skeleton className="h-5 w-24" />
          </dt>
          <dd>
            <Skeleton className="h-5 w-20" />
          </dd>
        </div>
        <div className="grid grid-cols-subgrid col-span-2 items-baseline">
          <dt>
            <Skeleton className="h-5 w-36" />
          </dt>
          <dd>
            <Skeleton className="h-5 w-24" />
          </dd>
        </div>
        <div className="grid grid-cols-subgrid col-span-2 items-baseline">
          <dt>
            <Skeleton className="h-5 w-24" />
          </dt>
          <dd>
            <Skeleton className="h-5 w-36" />
          </dd>
        </div>
      </dl>
      <Skeleton className="h-9 w-32" />
    </CardContent>
  </Card>
);

const UserProfile = ({
  user,
  isLoading,
}: {
  user: User;
  isLoading: boolean;
}) => {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  // Always return loading while fetching or no user data
  if (isLoading || !user) {
    return <Loading />;
  }

  const statusPros = getUserStatusProps(user.status as UserStatus);
  const statusVariant = statusPros.variant as keyof BadgeProps['variant'];
  const primaryLocation = user.UserLocation?.find((ul) => ul.isPrimary)?.location;

  return (
    <>
      <Card>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-3 text-sm mb-5 [&_dt]:text-muted-foreground">
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt className="flex md:w-64">Full name:</dt>
              <dd>{user.name || 'Not available'}</dd>
            </div>
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt>Email address:</dt>
              <dd className="flex items-center gap-2.5">
                <span>{user.email}</span>
                {user.emailVerifiedAt ? (
                  <Badge variant="secondary" appearance="outline">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="warning" appearance="outline">
                    Not verified
                  </Badge>
                )}
              </dd>
            </div>
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt>Primary Location:</dt>
              <dd>
                {primaryLocation
                  ? primaryLocation.name
                  : <span className="text-muted-foreground">None assigned</span>
                }
              </dd>
            </div>
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt>Role:</dt>
              <dd>
                <span className="inline-flex items-center gap-1">
                  {user.role?.name}
                  {user.role?.isProtected && (
                    <Badge appearance="outline">System</Badge>
                  )}
                </span>
              </dd>
            </div>
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt>Status:</dt>
              <dd>
                <div className="inline-flex gap-2.5">
                  <Badge variant={statusVariant} appearance="ghost">
                    <BadgeDot />
                    {statusPros.label}
                  </Badge>
                  {user.isTrashed && (
                    <Badge variant="destructive" appearance="outline">
                      Trashed
                    </Badge>
                  )}
                </div>
              </dd>
            </div>
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt>Last Sign In:</dt>
              <dd>
                {user.lastSignInAt
                  ? formatDateTime(new Date(user.lastSignInAt))
                  : 'Never'}
              </dd>
            </div>
          </dl>
          <Button
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
            disabled={user.role?.isProtected}
          >
            Edit user details
          </Button>
        </CardContent>
      </Card>

      <UserProfileEditDialog
        open={isEditDialogOpen}
        closeDialog={() => setEditDialogOpen(false)}
        user={user}
      />
    </>
  );
};

export default UserProfile;
