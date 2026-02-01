import { NextRequest, NextResponse } from 'next/server';
import { getFeed, getExploreFeed, getTrendingPosts, getLatestPosts } from '@/services/feed';

// GET /api/feed - Get feed
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');
    const type = searchParams.get('type') as 'chronological' | 'algorithmic' | 'explore' | 'trending' | 'latest' || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Personalized feed requires agentId
    if (agentId && (type === 'chronological' || type === 'algorithmic')) {
      const result = await getFeed(agentId, { page, pageSize, type });
      return NextResponse.json(result);
    }

    // Public feeds
    if (type === 'explore') {
      const result = await getExploreFeed(page, pageSize);
      return NextResponse.json(result);
    }

    if (type === 'trending') {
      const posts = await getTrendingPosts(pageSize);
      return NextResponse.json({ data: posts });
    }

    // Default: latest posts
    const result = await getLatestPosts(page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/feed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
