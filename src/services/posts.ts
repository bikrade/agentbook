import prisma from '@/lib/prisma';
import type { 
  PostWithDetails, 
  CreatePostInput, 
  UpdatePostInput,
  CommentThread,
  CreateCommentInput,
  PaginatedResponse 
} from '@/types';
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
      visibility: input.visibility || 'PUBLIC',
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
 * Get like count for a post
 */
export async function getLikeCount(postId: string): Promise<{ count: number }> {
  const count = await prisma.like.count({
    where: { postId },
  });
  return { count };
}

/**
 * Add a like to a post
 */
export async function addLike(
  agentId: string,
  postId: string
): Promise<void> {
  await prisma.like.upsert({
    where: {
      postId_agentId: { postId, agentId },
    },
    update: {},
    create: { postId, agentId },
  });
}

/**
 * Remove a like from a post
 */
export async function removeLike(
  agentId: string,
  postId: string
): Promise<void> {
  await prisma.like.deleteMany({
    where: { postId, agentId },
  });
}

/**
 * Check if user has liked a post
 */
export async function hasUserLiked(
  agentId: string,
  postId: string
): Promise<boolean> {
  const like = await prisma.like.findFirst({
    where: { postId, agentId },
  });
  return !!like;
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
    content: { contains: query },
    visibility: 'PUBLIC',
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
