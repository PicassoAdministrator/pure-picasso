// app/api/user-management/locations/route.ts

import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

// Utility: Checks if user is Owner/Corporate (slug or name, case-insensitive)
function isCorporateRole(roleName?: string | null) {
  if (!roleName) return false;
  const name = roleName.toLowerCase();
  return (
    name === 'owner' ||
    name === 'corporate' ||
    name.includes('owner') ||
    name.includes('corporate')
  );
}

// GET: List locations (with parent & children, pagination/search/sort)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'name';
  const sortDirection = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    // 1. Get user's role from session or database
    let roleName = session.user.roleName as string | undefined;

    // Fallback: fetch from DB if not present (shouldn't be needed if session is correct)
    if (!roleName && session.user.roleId) {
      const userRole = await prisma.userRole.findUnique({
        where: { id: session.user.roleId },
        select: { name: true },
      });
      roleName = userRole?.name;
    }

    // 2. Corporate logic
    const isCorporate = isCorporateRole(roleName);

    // 3. Build "where" clause
    let where: Prisma.LocationWhereInput = {};
    if (!isCorporate) {
      // Restrict to user's assigned locations if NOT owner/corporate
      where = {
        users: { some: { userId: session.user.id } },
      };
    }
    // Apply search
    if (query) {
      where = {
        ...where,
        name: { contains: query, mode: Prisma.QueryMode.insensitive },
      };
    }

    // 4. Count and fetch
    const totalCount = await prisma.location.count({ where });
    const orderBy = { [sortField]: sortDirection };

    const locations = await prisma.location.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        users: {
          select: {
            id: true,
            userId: true,
            roleId: true,
            isPrimary: true,
            isCurrent: true,
            user: { select: { id: true, name: true, email: true } },
            role: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      data: locations,
      pagination: { total: totalCount, page, limit },
    });
  } catch (e) {
    console.error('[LOCATIONS_GET]', e);
    return NextResponse.json({ message: 'Server error.' }, { status: 500 });
  }
}

// POST: Add new location (optionally with parent)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
    }

    const body = await req.json();
    const { name, parentId } = body;
    if (!name) {
      return NextResponse.json({ message: 'Name is required.' }, { status: 400 });
    }

    const location = await prisma.location.create({
      data: {
        name,
        parentId: parentId || null,
      },
    });

    return NextResponse.json({ message: 'Location created.', location }, { status: 200 });
  } catch (e) {
    console.error('[LOCATIONS_POST]', e);
    return NextResponse.json({ message: 'Server error.' }, { status: 500 });
  }
}
