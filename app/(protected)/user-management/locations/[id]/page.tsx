'use client';
import { useLocation } from './components/location-context';
import LocationDangerZone from './components/location-danger-zone';
import LocationProfile from './components/location-profile';

export default function Page() {
  const { location, isLoading } = useLocation();

  return (
    <div className="space-y-10">
      <LocationProfile location={location} isLoading={isLoading} />
      <LocationDangerZone location={location} isLoading={isLoading} />
    </div>
  );
}
