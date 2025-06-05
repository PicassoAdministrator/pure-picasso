import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { locationId } = await request.json();

  if (!locationId) {
    return NextResponse.json({ message: 'Missing locationId' }, { status: 400 });
  }

  // Set all UserLocation for user to isCurrent = false
  await prisma.userLocation.updateMany({
    where: { userId: session.user.id },
    data: { isCurrent: false },
  });

  // Check if a UserLocation exists for this location
  let userLocation = await prisma.userLocation.findFirst({
    where: { userId: session.user.id, locationId },
  });

  // ----------- PATCH: Fix roleId -----------
  let roleId = session.user.roleId;
  if (!roleId) {
    const userDb = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { roleId: true },
    });
    roleId = userDb?.roleId;
  }
  if (!roleId) {
    return NextResponse.json({ message: 'Missing roleId for user.' }, { status: 400 });
  }

  if (userLocation) {
    await prisma.userLocation.update({
      where: { id: userLocation.id },
      data: { isCurrent: true },
    });
  } else {
    await prisma.userLocation.create({
      data: {
        userId: session.user.id,
        locationId,
        isCurrent: true,
        isPrimary: false,
        roleId,
      },
    });
  }

  return NextResponse.json({ message: 'Current location set', locationId }, { status: 200 });
}
