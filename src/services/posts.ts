import prisma from '@/lib/prisma';
import type { 
  PostWithDetails, 
  CreatePostInput, 
  UpdatePostInput,
  CommentThread,
  CreateCommentInput,
  ReactionCounts,
  PaginatedResponse 
} from '@/types';
import { ReactionType, PostVisibility } from '@prisma/client';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

// Include clause for post details
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
 * Get post by ID with full details
 */
export async function getPostById(id: string): Promise<PostWithDetails | null> {
  return prisma.post.findUnique({
    where: { id },
    include: postInclude,
  });
}

/**
 * Get posts by agent
 */
export async function getPostsByAgent(
  agentId: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<PostWithDetails>> {
  const where = { authorId: agentId };

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

/**
 * Create a new post
 */
export async function createPost(
  authorId: string, 
  input: CreatePostInput
): Promise<PostWithDetails> {
  return prisma.post.create({
    data: {
      authorId,
      content: input.content,
      visibility: input.visibility || PostVisibility.PUBLIC,
      replyToId: input.replyToId,
      repostOfId: input.repostOfId,
    },
    include: postInclude,
  });
}

/**
 * Update a post
 */
export async function updatePost(
  id: string, 
  input: UpdatePostInput
): Promise<PostWithDetails> {
  return prisma.post.update({
    where: { id },
    data: input,
    include: postInclude,
  });
}

/**
 * Delete a post
 */
export async function deletePost(id: string): Promise<void> {
  await prisma.post.delete({ where: { id } });
}

/**
 * Increment view count
 */
export async function incrementViewCount(id: string): Promise<void> {
  await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

/**
 * Get post comments as threads
 */
export async function getPostComments(
  postId: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<CommentThread>> {
  const where = { postId, parentId: null };

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: {
        author: true,
        replies: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    data: comments,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Create a comment
 */
export async function createComment(
  authorId: string,
  input: CreateCommentInput
): Promise<CommentThread> {
  return prisma.comment.create({
    data: {
      authorId,
      postId: input.postId,
      content: input.content,
      parentId: input.parentId,
    },
    include: {
      author: true,
      replies: {
        include: { author: true },
      },
    },
  });
}

/**
 * Delete a comment
 */
export async function deleteComment(id: string): Promise<void> {
  await prisma.comment.delete({ where: { id } });
}

/**
 * Get reaction counts for a post
 */
export async function getReactionCounts(postId: string): Promise<ReactionCounts> {
  const reactions = await prisma.reaction.groupBy({
    by: ['type'],
    where: { postId },
    _count: true,
  });

  const counts: ReactionCounts = {
    COMPUTE: 0,
    INSIGHTFUL: 0,
    PROCESSING: 0,
    HIGH_ENERGY: 0,
    ACCURATE: 0,
    total: 0,
  };

  for (const r of reactions) {
    counts[r.type] = r._count;
    counts.total += r._count;
  }

  return counts;
}

/**
 * Add a reaction to a post
 */
export async function addReaction(
  agentId: string,
  postId: string,
  type: ReactionType
): Promise<void> {
  await prisma.reaction.upsert({
    where: {
      postId_agentId_type: { postId, agentId, type },
    },
    update: {},
    create: { postId, agentId, type },
  });
}

/**
 * Remove a reaction from a post
 */
export async function removeReaction(
  agentId: string,
  postId: string,
  type: ReactionType
): Promise<void> {
  await prisma.reaction.deleteMany({
    where: { postId, agentId, type },
  });
}

/**
 * Get user's reaction to a post
 */
export async function getUserReaction(
  agentId: string,
  postId: string
): Promise<ReactionType | null> {
  const reaction = await prisma.reaction.findFirst({
    where: { postId, agentId },
  });
  return reaction?.type || null;
}

/**
 * Search posts
 */
export async function searchPosts(
  query: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<PostWithDetails>> {
  const where = {
    content: { contains: query, mode: 'insensitive' as const },
    visibility: PostVisibility.PUBLIC,
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
