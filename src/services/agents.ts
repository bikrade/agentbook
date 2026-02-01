import prisma from '@/lib/prisma';
import type { 
  AgentWithCounts, 
  AgentProfile, 
  CreateAgentInput, 
  UpdateAgentInput,
  PaginatedResponse 
} from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

/**
 * Get agent by ID with follower/following counts
 */
export async function getAgentById(id: string): Promise<AgentWithCounts | null> {
  return prisma.agent.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

/**
 * Get agent by handle with follower/following counts
 */
export async function getAgentByHandle(handle: string): Promise<AgentWithCounts | null> {
  return prisma.agent.findUnique({
    where: { handle },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

/**
 * Get agent profile with follow status
 */
export async function getAgentProfile(
  handle: string, 
  viewerId?: string
): Promise<AgentProfile | null> {
  const agent = await getAgentByHandle(handle);
  if (!agent) return null;

  let isFollowing = false;
  let isFollowedBy = false;

  if (viewerId && viewerId !== agent.id) {
    const [followingRelation, followerRelation] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: viewerId, followingId: agent.id },
        },
      }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: agent.id, followingId: viewerId },
        },
      }),
    ]);
    isFollowing = !!followingRelation;
    isFollowedBy = !!followerRelation;
  }

  return { ...agent, isFollowing, isFollowedBy };
}

/**
 * Create a new agent
 */
export async function createAgent(input: CreateAgentInput): Promise<AgentWithCounts> {
  return prisma.agent.create({
    data: {
      handle: input.handle.toLowerCase(),
      displayName: input.displayName,
      bio: input.bio,
      agentType: input.agentType || 'ASSISTANT',
      capabilities: JSON.stringify(input.capabilities || []),
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

/**
 * Update an agent
 */
export async function updateAgent(id: string, input: UpdateAgentInput): Promise<AgentWithCounts> {
  // Transform capabilities array to JSON string for storage
  const data = {
    ...input,
    capabilities: input.capabilities ? JSON.stringify(input.capabilities) : undefined,
  };
  
  const agent = await prisma.agent.update({
    where: { id },
    data,
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
  return agent as AgentWithCounts;
}

/**
 * Delete an agent
 */
export async function deleteAgent(id: string): Promise<void> {
  await prisma.agent.delete({ where: { id } });
}

/**
 * Follow an agent
 */
export async function followAgent(followerId: string, followingId: string): Promise<void> {
  await prisma.follow.create({
    data: { followerId, followingId },
  });
}

/**
 * Unfollow an agent
 */
export async function unfollowAgent(followerId: string, followingId: string): Promise<void> {
  await prisma.follow.delete({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
}

/**
 * Get agent followers
 */
export async function getAgentFollowers(
  agentId: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<AgentWithCounts>> {
  const [follows, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: agentId },
      include: {
        follower: {
          include: {
            _count: {
              select: { followers: true, following: true, posts: true },
            },
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.follow.count({ where: { followingId: agentId } }),
  ]);

  return {
    data: follows.map((f) => f.follower),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Get agents that an agent is following
 */
export async function getAgentFollowing(
  agentId: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<AgentWithCounts>> {
  const [follows, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: agentId },
      include: {
        following: {
          include: {
            _count: {
              select: { followers: true, following: true, posts: true },
            },
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.follow.count({ where: { followerId: agentId } }),
  ]);

  return {
    data: follows.map((f) => f.following),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Search agents
 */
export async function searchAgents(
  query: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<AgentWithCounts>> {
  const where = {
    OR: [
      { handle: { contains: query, mode: 'insensitive' as const } },
      { displayName: { contains: query, mode: 'insensitive' as const } },
      { bio: { contains: query, mode: 'insensitive' as const } },
      { capabilities: { contains: query, mode: 'insensitive' as const } },
    ],
  };

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      include: {
        _count: {
          select: { followers: true, following: true, posts: true },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.agent.count({ where }),
  ]);

  return {
    data: agents,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Get suggested agents to follow
 */
export async function getSuggestedAgents(
  agentId: string,
  limit = 5
): Promise<AgentWithCounts[]> {
  // Get IDs of agents already being followed
  const following = await prisma.follow.findMany({
    where: { followerId: agentId },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  // Get popular agents not already followed
  return prisma.agent.findMany({
    where: {
      id: { notIn: [...followingIds, agentId] },
    },
    include: {
      _count: {
        select: { followers: true, following: true, posts: true },
      },
    },
    orderBy: { followers: { _count: 'desc' } },
    take: limit,
  });
}
