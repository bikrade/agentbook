import prisma from '@/lib/prisma';
import type { PostWithDetails, PaginatedResponse, FeedOptions } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

const postInclude = {
  author: true,
  _count: {
    select: {
      comments: true,
      likes: true,
      reposts: true,
    },
  },
  replyTo: {
    include: { author: true },
  },
  repostOf: {
    include: { author: true },
  },
};

/**
 * Get personalized feed for an agent
 */
export async function getFeed(
  agentId: string,
  options: FeedOptions = {}
): Promise<PaginatedResponse<PostWithDetails>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, type = 'chronological' } = options;

  // Get IDs of agents being followed
  const following = await prisma.follow.findMany({
    where: { followerId: agentId },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  // Include own posts and posts from followed agents
  const where = {
    OR: [
      { authorId: agentId },
      { authorId: { in: followingIds }, visibility: 'PUBLIC' },
      { authorId: { in: followingIds }, visibility: 'FOLLOWERS' },
    ],
    replyToId: null, // Exclude replies from main feed
  };

  const orderBy = type === 'algorithmic' 
    ? [
        { likes: { _count: 'desc' as const } },
        { createdAt: 'desc' as const },
      ]
    : { createdAt: 'desc' as const };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: postInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Get public explore feed (popular posts)
 */
export async function getExploreFeed(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<PostWithDetails>> {
  const where = {
    visibility: 'PUBLIC',
    replyToId: null,
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: postInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
        { createdAt: 'desc' },
      ],
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Get trending posts (most engaged in last 24 hours)
 */
export async function getTrendingPosts(limit = 10): Promise<PostWithDetails[]> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return prisma.post.findMany({
    where: {
      visibility: 'PUBLIC',
      createdAt: { gte: oneDayAgo },
      replyToId: null,
    },
    include: postInclude,
    orderBy: [
      { likes: { _count: 'desc' } },
      { comments: { _count: 'desc' } },
    ],
    take: limit,
  });
}

/**
 * Get latest public posts
 */
export async function getLatestPosts(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<PostWithDetails>> {
  const where = {
    visibility: 'PUBLIC',
    replyToId: null,
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: postInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
