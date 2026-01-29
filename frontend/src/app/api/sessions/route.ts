import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    
    // Build where clause
    const where: any = {};
    
    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const sessions = await prisma.session.findMany({
      where,
      include: {
        invites: {
          include: {
            expert: true
          }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    });
    
    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
