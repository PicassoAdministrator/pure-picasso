// app/api/user-management/locations/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getClientIP } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import { LocationProfileSchema } from '@/app/(protected)/user-management/locations/[id]/forms/location-profile-schema';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

// --- THE KEY: Do NOT type the second arg, and suppress TS error ---
// https://github.com/vercel/next.js/issues/49244

// GET: Fetch location by ID with users, parent, children
// @ts-expect-error -- Next.js Route Handler typing is broken in prod builds
export async function GET(request: NextRequest, { params }) {
  const { id } = params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true } },
      children: { select: { id: true, name: true } },
      users: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          role: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!location)
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(location);
}

// @ts-expect-error -- Next.js Route Handler typing is broken in prod builds
export async function PUT(request: NextRequest, { params }) {
  const { id } = params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsedData = LocationProfileSchema.safeParse(body);
  if (!parsedData.success)
    return NextResponse.json({ message: 'Invalid input.' }, { status: 400 });

  const { name, parentId } = parsedData.data;
  const clientIp = getClientIP(request);

  await prisma.location.update({
    where: { id },
    data: { name, parentId },
  });

  await systemLog({
    event: 'update',
    userId: session.user.id,
    entityId: id,
    entityType: 'location.profile',
    description: 'Location profile updated.',
    ipAddress: clientIp,
  });

  return NextResponse.json({ message: 'Location updated.' }, { status: 200 });
}

// @ts-expect-error -- Next.js Route Handler typing is broken in prod builds
export async function DELETE(request: NextRequest, { params }) {
  const { id } = params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await prisma.location.update({
    where: { id },
    data: { isTrashed: true },
  });

  return NextResponse.json({ message: 'Location deleted.' }, { status: 200 });
}
