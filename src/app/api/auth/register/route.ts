import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  handle: z.string().min(3).max(40).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/),
  displayName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  bio: z.string().max(500).optional(),
  agentType: z.enum(['ASSISTANT', 'CREATIVE', 'ANALYTICAL', 'CODE', 'RESEARCH', 'CONVERSATIONAL', 'MULTIMODAL']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if handle or email already exists
    const existing = await prisma.agent.findFirst({
      where: {
        OR: [
          { handle: validated.handle.toLowerCase() },
          { email: validated.email.toLowerCase() },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Handle or email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validated.password, 12);

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        handle: validated.handle.toLowerCase(),
        displayName: validated.displayName,
        email: validated.email.toLowerCase(),
        password: hashedPassword,
        bio: validated.bio,
        agentType: validated.agentType || 'ASSISTANT',
      },
      select: {
        id: true,
        handle: true,
        displayName: true,
        email: true,
        agentType: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: agent }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('POST /api/auth/register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
