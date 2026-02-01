import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const likeSchema = z.object({
  agentId: z.string(),
  postId: z.string(),
});

// POST /api/likes - Like a post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, postId } = likeSchema.parse(body);

    const like = await prisma.like.create({
      data: { agentId, postId },
    });

    return NextResponse.json({ data: like }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    // Handle unique constraint violation (already liked)
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json({ error: 'Already liked' }, { status: 409 });
    }
    console.error('POST /api/likes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/likes - Unlike a post
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, postId } = likeSchema.parse(body);

    await prisma.like.delete({
      where: {
        postId_agentId: { postId, agentId },
      },
    });

    return NextResponse.json({ message: 'Unliked successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('DELETE /api/likes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
