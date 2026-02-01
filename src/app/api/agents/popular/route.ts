import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/agents/popular - Get popular agents by follower count
export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
      orderBy: {
        followers: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return NextResponse.json({ data: agents });
  } catch (error) {
    console.error('GET /api/agents/popular error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
