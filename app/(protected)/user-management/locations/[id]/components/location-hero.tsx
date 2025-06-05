'use client';

import { useState } from 'react';
import { Check, Building } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Location {
  id: string;
  name: string;
  parent?: { id: string; name: string } | null;
  // add avatar if you support location images
}

const LocationHero = ({
  location,
  isLoading,
}: {
  location: Location;
  isLoading: boolean;
}) => {
  const Loading = () => (
    <div className="flex items-center gap-5 mb-5">
      <Skeleton className="size-14 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );

  const Content = () => {
    const { copyToClipboard } = useCopyToClipboard();
    const [showCopied, setShowCopied] = useState(false);

    const handleLocationIdCopy = () => {
      copyToClipboard(location.id);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    };

    // If you ever add location avatars, you can handle images here.
    return (
      <div className="flex items-center gap-5 mb-5">
        <Avatar className="h-14 w-14 bg-muted text-muted-foreground">
          {/* No avatar image, just show a building icon */}
          <AvatarFallback className="text-2xl">
            <Building className="w-7 h-7" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-px">
          <div className="font-medium text-base">{location.name}</div>
          <div className="text-muted-foreground text-sm">
            {location.parent ? `Parent: ${location.parent.name}` : 'No parent'}
          </div>
          <div>
            <TooltipProvider>
              <Tooltip delayDuration={50}>
                <TooltipTrigger className="cursor-pointer">
                  <Badge
                    variant="secondary"
                    appearance="outline"
                    className="gap-1.5 px-2 py-0.5"
                    onClick={handleLocationIdCopy}
                  >
                    <span>Location ID: {location.id}</span>
                    {showCopied && <Check className="text-success size-3" />}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  Click to copy
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  };

  return isLoading || !location ? <Loading /> : <Content />;
};

export default LocationHero;
