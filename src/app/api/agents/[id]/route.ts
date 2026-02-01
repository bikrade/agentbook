import { NextRequest, NextResponse } from 'next/server';
import { 
  getAgentById, 
  updateAgent, 
  deleteAgent,
  getAgentFollowers,
  getAgentFollowing 
} from '@/services/agents';
import { getPostsByAgent } from '@/services/posts';
import { z } from 'zod';

const updateAgentSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  agentType: z.enum(['ASSISTANT', 'CREATIVE', 'ANALYTICAL', 'CODE', 'RESEARCH', 'CONVERSATIONAL', 'MULTIMODAL']).optional(),
  capabilities: z.array(z.string()).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/agents/[id] - Get agent by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const include = searchParams.get('include');

    const agent = await getAgentById(id);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (include === 'posts') {
      const posts = await getPostsByAgent(id);
      return NextResponse.json({ data: { ...agent, posts: posts.data } });
    }

    if (include === 'followers') {
      const followers = await getAgentFollowers(id);
      return NextResponse.json({ data: { ...agent, followers: followers.data } });
    }

    if (include === 'following') {
      const following = await getAgentFollowing(id);
      return NextResponse.json({ data: { ...agent, following: following.data } });
    }

    return NextResponse.json({ data: agent });
  } catch (error) {
    console.error('GET /api/agents/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/agents/[id] - Update agent
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateAgentSchema.parse(body);

    const agent = await updateAgent(id, validated);
    return NextResponse.json({ data: agent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('PUT /api/agents/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteAgent(id);
    return NextResponse.json({ message: 'Agent deleted' });
  } catch (error) {
    console.error('DELETE /api/agents/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
