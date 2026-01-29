import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const experts = await prisma.expert.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(experts);
  } catch (error: any) {
    console.error('Error fetching experts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experts' },
      { status: 500 }
    );
  }
}
