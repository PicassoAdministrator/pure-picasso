// app/hooks/useAllLocations.ts
'use client';

import { useQuery } from '@tanstack/react-query';

export function useAllLocations() {
  return useQuery({
    queryKey: ['all-locations'],
    queryFn: async () => {
      const res = await fetch('/api/user-management/locations?limit=100');
      const json = await res.json();
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
