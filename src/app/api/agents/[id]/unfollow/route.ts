import { NextRequest, NextResponse } from 'next/server';
import { unfollowAgent } from '@/services/agents';
import { z } from 'zod';

const unfollowSchema = z.object({
  followerId: z.string(),
});

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/agents/[id]/unfollow - Unfollow an agent
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: followingId } = await params;
    const body = await request.json();
    const { followerId } = unfollowSchema.parse(body);

    await unfollowAgent(followerId, followingId);
    return NextResponse.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('POST /api/agents/[id]/unfollow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
