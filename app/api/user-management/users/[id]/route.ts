// app/api/user-management/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getClientIP } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import {
  UserProfileSchema,
  UserProfileSchemaType,
} from '@/app/(protected)/user-management/users/[id]/forms/user-profile-schema';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { UserStatus } from '@/app/models/user';

// GET: Fetch a specific user by ID, including role and primary location
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Validate user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Fetch user, role, and primary location
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        UserLocation: {
          select: {
            isPrimary: true,
            location: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Record not found. Someone might have deleted it already.' },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// PUT: Edit a specific user by ID, including primary location logic
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Invalid input.' }, { status: 400 });
    }

    const clientIp = getClientIP(request);
    const body = await request.json();
    const parsedData = UserProfileSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ message: 'Invalid input.' }, { status: 400 });
    }

    const { name, status, roleId, primaryLocationId }: UserProfileSchemaType = parsedData.data;

    // Check role exists
    const roleExists = await prisma.userRole.findUnique({ where: { id: roleId } });
    if (!roleExists) {
      return NextResponse.json({ message: 'Role does not exist' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Update user profile fields
      await tx.user.update({
        where: { id },
        data: { name, status: status as UserStatus, roleId },
      });

      // Handle Primary Location
      if (typeof primaryLocationId !== 'undefined') {
        // 1. Set all UserLocation.isPrimary = false for this user
        await tx.userLocation.updateMany({
          where: { userId: id },
          data: { isPrimary: false },
        });

        // 2. If a primary is selected...
        if (primaryLocationId) {
          // Try to update an existing UserLocation for this user/location
          const updated = await tx.userLocation.updateMany({
            where: { userId: id, locationId: primaryLocationId },
            data: { isPrimary: true },
          });

          // 3. If no existing row, create one
          if (updated.count === 0) {
            await tx.userLocation.create({
              data: {
                userId: id,
                locationId: primaryLocationId,
                isPrimary: true,
                // assign roleId or leave null
                roleId, // or set to a specific user-location role if you use per-location roles
              },
            });
          }
        }
      }

      await systemLog(
        {
          event: 'update',
          userId: session.user.id,
          entityId: id,
          entityType: 'user.profile',
          description: 'User profile updated.',
          ipAddress: clientIp,
        },
        tx,
      );
    });

    return NextResponse.json(
      { message: 'User profile successfully updated.' },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Validate user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const clientIp = getClientIP(request);
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid input.' },
        { status: 400 }, // Bad request
      );
    }

    // Check if the role exists
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (userToDelete && userToDelete.isProtected) {
      return NextResponse.json(
        { message: 'You do not have permission to delete system users.' },
        { status: 401 },
      );
    }

    // Use a transaction to insert multiple records atomically
    await prisma.$transaction(async (tx) => {
      const user = await prisma.user.update({
        where: { id, isProtected: false },
        data: { isTrashed: true, status: UserStatus.INACTIVE },
      });

      // Log the event
      await systemLog(
        {
          event: 'trash',
          userId: session.user.id,
          entityId: user.id,
          entityType: 'user',
          description: 'User trashed.',
          ipAddress: clientIp,
        },
        tx,
      );

      return user;
    });

    return NextResponse.json(
      { message: 'User successfully deleted.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
