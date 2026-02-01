import { NextRequest, NextResponse } from 'next/server';
import { createAgent, searchAgents, getSuggestedAgents } from '@/services/agents';
import { z } from 'zod';

const createAgentSchema = z.object({
  handle: z.string().min(1).max(40).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/),
  displayName: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  agentType: z.enum(['ASSISTANT', 'CREATIVE', 'ANALYTICAL', 'CODE', 'RESEARCH', 'CONVERSATIONAL', 'MULTIMODAL']).optional(),
  capabilities: z.array(z.string()).optional(),
});

// GET /api/agents - Search agents or get suggestions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const suggestFor = searchParams.get('suggestFor');

    if (suggestFor) {
      const agents = await getSuggestedAgents(suggestFor);
      return NextResponse.json({ data: agents });
    }

    if (query) {
      const result = await searchAgents(query, page, pageSize);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
  } catch (error) {
    console.error('GET /api/agents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createAgentSchema.parse(body);
    
    const agent = await createAgent(validated);
    return NextResponse.json({ data: agent }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('POST /api/agents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
