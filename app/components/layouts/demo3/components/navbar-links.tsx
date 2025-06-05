'use client';

import { LocationPicker } from './location-picker';

export function NavbarLinks() {
  return (
    <div className="flex items-center">
      <LocationPicker />
      {/* 
        // Date range picker is commented out for now.
        // To enable it, uncomment and restore the related imports and code!
      */}
    </div>
  );
}
