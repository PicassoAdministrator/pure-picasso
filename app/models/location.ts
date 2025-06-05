// app/models/location.ts
import { User, UserRole } from './user';

export interface Location {
  id: string;
  name: string;
  parent?: { id: string; name: string } | null;
  children?: { id: string; name: string }[];
  users?: UserLocation[];
  isTrashed: boolean;
  isProtected: boolean;
}

export interface UserLocation {
  id: string;
  userId: string;
  locationId: string;
  roleId: string;
  isPrimary: boolean;
  isCurrent: boolean;
  isTrashed: boolean;
  isProtected: boolean;
  user?: User;
  location?: Location;
  role?: UserRole;
}
