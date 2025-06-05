import 'next-auth';
import 'next-auth/jwt';

export interface SessionUserLocation {
  id: string;
  isPrimary: boolean;
  isCurrent: boolean;
  roleId?: string | null;
  location: {
    id: string;
    name: string;
    // add any other fields you need from Location
  };
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      roleId?: string | null;
      roleName?: string | null;
      status: string;
      userLocations?: SessionUserLocation[]; // <-- add this
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    roleId?: string | null;
    status: string;
    userLocations?: SessionUserLocation[]; // <-- add this
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    roleId?: string | null;
    roleName?: string | null;
    status: string;
    userLocations?: SessionUserLocation[]; // <-- add this
  }
}
