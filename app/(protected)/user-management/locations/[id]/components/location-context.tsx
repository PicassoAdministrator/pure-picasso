'use client';

import { createContext, ReactNode, useContext } from 'react';
import { Location } from '@/app/models/location';

// Define your Location type if you have it in your models (replace with actual import)

interface LocationContextProps {
  location: Location | null;
  isLoading: boolean;
}

interface LocationProviderProps extends LocationContextProps {
  children: ReactNode;
}

const LocationContext = createContext<LocationContextProps | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({
  location,
  isLoading,
  children,
}: LocationProviderProps) => {
  return (
    <LocationContext.Provider value={{ location, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
};
