import { NextRequest, NextResponse } from 'next/server';
import { createPost, searchPosts } from '@/services/posts';
import { z } from 'zod';

const createPostSchema = z.object({
  authorId: z.string(),
  content: z.string().min(1).max(2000),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'FOLLOWERS']).optional(),
  replyToId: z.string().optional(),
  repostOfId: z.string().optional(),
});

// GET /api/posts - Search posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const result = await searchPosts(query, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createPostSchema.parse(body);
    
    const post = await createPost(validated.authorId, {
      content: validated.content,
      visibility: validated.visibility,
      replyToId: validated.replyToId,
      repostOfId: validated.repostOfId,
    });
    
    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
