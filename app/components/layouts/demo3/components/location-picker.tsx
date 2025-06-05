'use client';

import { useLocation } from '@/app/context/location-context';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, MapPin } from 'lucide-react';
import { useTransition } from 'react';
import { useAllLocations } from '@/hooks/use-all-locations';

type UserLocationEntry = {
  location: { id: string; name: string };
  isPrimary?: boolean;
  isCurrent?: boolean;
};

type LocationFromApi = { id: string; name: string };

function isCorporate(roleName?: string | null) {
  if (!roleName) return false;
  const rn = roleName.toLowerCase();
  return rn === 'owner' || rn === 'corporate' || rn.includes('owner') || rn.includes('corporate');
}

export function LocationPicker() {
  const { currentLocation, setCurrentLocation } = useLocation();
  const { data: session, update: updateSession } = useSession();
  const [isPending, startTransition] = useTransition();

  // Corporate/Owner users should see all locations, others see assigned
  const isCorp = isCorporate(session?.user?.roleName);

  // Assigned locations
  const assigned: UserLocationEntry[] = session?.user?.userLocations || [];

  // All locations (from API, for Owner/Corporate)
  const { data: allLocations, isLoading } = useAllLocations();
  const allLocs: UserLocationEntry[] = (allLocations || []).map((l: LocationFromApi) => ({
    location: { id: l.id, name: l.name },
    isPrimary: assigned.find(a => a.location.id === l.id)?.isPrimary,
    isCurrent: assigned.find(a => a.location.id === l.id)?.isCurrent,
  }));

  // Source of locations
  const locations: UserLocationEntry[] = isCorp ? allLocs : assigned;

  if (!locations.length || isLoading) {
    return (
      <Button variant="outline" mode="input" disabled>
        <MapPin className="mr-2" />
        {isLoading ? "Loading..." : "No Locations"}
      </Button>
    );
  }

  async function handleSelect(loc: UserLocationEntry) {
    startTransition(async () => {
      await fetch('/api/user-management/set-current-location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: loc.location.id }),
      });
      // Always refresh session after PATCH
      const updated = await updateSession();

      // 1. Try to find the current location from session.user.userLocations
      let nextCurrent = null;
      const updatedUser = updated?.user || session?.user;
      const updatedUserLocations = updatedUser?.userLocations || [];

      // Only assigned locations (not allLocs): find which one is now current
      const found = updatedUserLocations.find((ul: UserLocationEntry) => ul.isCurrent);
      if (found) {
        nextCurrent = found.location;
      } else {
        // For corporate/owner, if not assigned, fallback to selected
        nextCurrent = loc.location;
      }

      setCurrentLocation(nextCurrent);
    });
  }

  // Show the current location from context
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id="location-picker" variant="outline" mode="input" disabled={isPending}>
          <MapPin className="mr-2" />
          {currentLocation?.name || 'Select Location'}
          <ChevronDown className="ml-2 size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[200px] p-2">
        <ul>
          {locations.map((ul: UserLocationEntry) => (
            <li key={ul.location.id}>
              <Button
                variant={currentLocation?.id === ul.location.id ? 'secondary' : 'ghost'}
                className="w-full justify-start mb-1"
                onClick={() => handleSelect(ul)}
                disabled={isPending}
              >
                {ul.location.name}
                {ul.isPrimary && (
                  <span className="ml-2 text-xs text-muted-foreground">(Primary)</span>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
