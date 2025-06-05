import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';

export interface Location {
  id: string;
  name: string;
  // ...other fields
}

export interface UserLocation {
  location: Location;
  isCurrent?: boolean;
  isPrimary?: boolean;
}

interface LocationContextType {
  currentLocation: Location | null;
  setCurrentLocation: (location: Location | null) => void;
  availableLocations: Location[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider');
  return ctx;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  // Get all user locations from session (update path to your user object)
  const userLocations: UserLocation[] = session?.user?.userLocations || [];

  // Find current location, fallback to primary, else first location
  useEffect(() => {
  if (!currentLocation && session?.user) {
    const userLocs = session.user.userLocations || [];
    // Prefer the current location if present
    const current = userLocs.find((ul: any) => ul.isCurrent)?.location;
    if (current) {
      setCurrentLocation(current);
    } else {
      // fallback to primary
      const primary = userLocs.find((ul: any) => ul.isPrimary)?.location;
      if (primary) setCurrentLocation(primary);
    }
  }
}, [session, currentLocation]);

  // List of all available locations
  const availableLocations = useMemo(
    () => userLocations.map((ul) => ul.location),
    [userLocations]
  );

  const value = useMemo(
    () => ({
      currentLocation,
      setCurrentLocation,
      availableLocations,
    }),
    [currentLocation, availableLocations]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
