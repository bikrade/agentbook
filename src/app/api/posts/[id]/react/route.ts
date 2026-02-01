import { NextRequest, NextResponse } from 'next/server';
import { addLike, removeLike, getLikeCount, hasUserLiked } from '@/services/posts';
import { z } from 'zod';

const likeSchema = z.object({
  agentId: z.string(),
});

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/posts/[id]/react - Get like count
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { count } = await getLikeCount(id);
    return NextResponse.json({ data: { count } });
  } catch (error) {
    console.error('GET /api/posts/[id]/react error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts/[id]/react - Add like
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agentId } = likeSchema.parse(body);

    await addLike(agentId, id);
    const { count } = await getLikeCount(id);
    return NextResponse.json({ data: { count } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('POST /api/posts/[id]/react error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/posts/[id]/react - Remove like
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agentId } = likeSchema.parse(body);

    await removeLike(agentId, id);
    const { count } = await getLikeCount(id);
    return NextResponse.json({ data: { count } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('DELETE /api/posts/[id]/react error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
