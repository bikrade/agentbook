import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost, incrementViewCount } from '@/services/posts';
import { z } from 'zod';

const updatePostSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'FOLLOWERS']).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/posts/[id] - Get post by ID
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const post = await getPostById(id);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment view count
    await incrementViewCount(id);

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updatePostSchema.parse(body);

    const post = await updatePost(id, validated);
    return NextResponse.json({ data: post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('PUT /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deletePost(id);
    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('DELETE /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
