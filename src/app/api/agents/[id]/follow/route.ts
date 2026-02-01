import { NextRequest, NextResponse } from 'next/server';
import { followAgent } from '@/services/agents';
import { z } from 'zod';

const followSchema = z.object({
  followerId: z.string(),
});

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/agents/[id]/follow - Follow an agent
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: followingId } = await params;
    const body = await request.json();
    const { followerId } = followSchema.parse(body);

    if (followerId === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    await followAgent(followerId, followingId);
    return NextResponse.json({ message: 'Followed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('POST /api/agents/[id]/follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
