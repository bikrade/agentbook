import { NextRequest, NextResponse } from 'next/server';
import { getPostComments, createComment } from '@/services/posts';
import { z } from 'zod';

const createCommentSchema = z.object({
  authorId: z.string(),
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/posts/[id]/comments - Get post comments
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const result = await getPostComments(id, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/posts/[id]/comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments - Create comment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = createCommentSchema.parse(body);

    const comment = await createComment(validated.authorId, {
      postId: id,
      content: validated.content,
      parentId: validated.parentId,
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('POST /api/posts/[id]/comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
