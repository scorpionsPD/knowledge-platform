import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const feedbackSchema = z.object({
  sessionId: z.string(),
  authorName: z.string().optional(),
  authorEmail: z.string().email().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    const where = sessionId ? { sessionId } : {};
    
    const feedback = await prisma.sessionFeedback.findMany({
      where,
      include: {
        session: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(feedback);
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = feedbackSchema.parse(body);
    
    const feedback = await prisma.sessionFeedback.create({
      data: {
        sessionId: data.sessionId,
        authorName: data.authorName || 'Anonymous',
        authorEmail: data.authorEmail,
        rating: data.rating,
        comment: data.comment
      }
    });
    
    return NextResponse.json(feedback, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}
