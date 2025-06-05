'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Location } from '@/app/models/location'; // Adjust the import path to your actual Location type/model
import LocationDeleteDialog from './location-delete-dialog';
import LocationRestoreDialog from './location-restore-dialog';

const LocationDangerZone = ({
  location,
  isLoading,
}: {
  location: Location;
  isLoading: boolean;
}) => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setRestoreDialogOpen] = useState(false);

  // Skeleton for loading state
  const Loading = () => (
    <div className="space-y-3">
      <Skeleton className="h-8 w-36" />
      <Card>
        <CardContent>
          <Skeleton className="h-7 w-40 mb-3" />
          <Skeleton className="h-6 w-full max-w-[560px] mb-4" />
          <Skeleton className="h-9 w-24" />
        </CardContent>
      </Card>
    </div>
  );

  // Danger zone content for deleting a location
  const DeleteContent = () => (
    <div className="space-y-3">
      <h2 className="font-semibold text-destructive">Danger Zone</h2>
      <Card>
        <CardContent>
          <h3 className="font-semibold mb-3">Delete location</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This action will permanently delete the location and all related data. It cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={location.isProtected} // if you have isProtected for locations
          >
            Delete location
          </Button>
        </CardContent>
      </Card>
      <LocationDeleteDialog
        open={isDeleteDialogOpen}
        closeDialog={() => setDeleteDialogOpen(false)}
        location={location}
      />
    </div>
  );

  // Restore content for trashed locations
  const RestoreContent = () => (
    <div className="space-y-3">
      <h2 className="font-semibold text-destructive">Restore Location</h2>
      <Card>
        <CardContent>
          <h3 className="font-semibold mb-3">Restore location</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This location is currently trashed. Restoring it will reactivate the location and all related data.
          </p>
          <Button variant="outline" onClick={() => setRestoreDialogOpen(true)}>
            Restore location
          </Button>
        </CardContent>
      </Card>
      <LocationRestoreDialog
        open={isRestoreDialogOpen}
        closeDialog={() => setRestoreDialogOpen(false)}
        location={location}
      />
    </div>
  );

  // Render logic
  return isLoading || !location ? (
    <Loading />
  ) : location.isTrashed ? (
    <RestoreContent />
  ) : (
    <DeleteContent />
  );
};

export default LocationDangerZone;
