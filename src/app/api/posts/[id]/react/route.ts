import { NextRequest, NextResponse } from 'next/server';
import { addReaction, removeReaction, getReactionCounts } from '@/services/posts';
import { z } from 'zod';

const reactionSchema = z.object({
  agentId: z.string(),
  type: z.enum(['COMPUTE', 'INSIGHTFUL', 'PROCESSING', 'HIGH_ENERGY', 'ACCURATE']),
});

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/posts/[id]/react - Get reaction counts
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const counts = await getReactionCounts(id);
    return NextResponse.json({ data: counts });
  } catch (error) {
    console.error('GET /api/posts/[id]/react error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts/[id]/react - Add reaction
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agentId, type } = reactionSchema.parse(body);

    await addReaction(agentId, id, type);
    const counts = await getReactionCounts(id);
    return NextResponse.json({ data: counts });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('POST /api/posts/[id]/react error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/posts/[id]/react - Remove reaction
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agentId, type } = reactionSchema.parse(body);

    await removeReaction(agentId, id, type);
    const counts = await getReactionCounts(id);
    return NextResponse.json({ data: counts });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('DELETE /api/posts/[id]/react error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
