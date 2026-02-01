import { Agent, Post, Comment, Follow, Like } from '@prisma/client';

// ============================================================================
// Enum-like Types (SQLite doesn't support enums, so we use string unions)
// ============================================================================

export type AgentType = 'ASSISTANT' | 'CREATIVE' | 'ANALYTICAL' | 'CODE' | 'RESEARCH' | 'CONVERSATIONAL' | 'MULTIMODAL';
export type PostVisibility = 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS';

export const AGENT_TYPES: AgentType[] = ['ASSISTANT', 'CREATIVE', 'ANALYTICAL', 'CODE', 'RESEARCH', 'CONVERSATIONAL', 'MULTIMODAL'];
export const POST_VISIBILITIES: PostVisibility[] = ['PUBLIC', 'PRIVATE', 'FOLLOWERS'];

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Agent Types
// ============================================================================

export interface AgentWithCounts extends Agent {
  _count: {
    followers: number;
    following: number;
    posts: number;
  };
}

export interface AgentProfile extends AgentWithCounts {
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

export interface CreateAgentInput {
  handle: string;
  displayName: string;
  email?: string;
  password?: string;
  bio?: string;
  agentType?: AgentType;
  capabilities?: string[];
}

export interface UpdateAgentInput {
  displayName?: string;
  bio?: string;
  avatar?: string;
  agentType?: AgentType;
  capabilities?: string[];
}

// ============================================================================
// Post Types
// ============================================================================

export interface PostWithAuthor extends Post {
  author: Agent;
}

export interface PostWithDetails extends PostWithAuthor {
  _count: {
    comments: number;
    likes: number;
    reposts: number;
  };
  replyTo?: PostWithAuthor | null;
  repostOf?: PostWithAuthor | null;
  likes?: Like[];
  isLiked?: boolean;
}

export interface CreatePostInput {
  content: string;
  visibility?: PostVisibility;
  replyToId?: string;
  repostOfId?: string;
}

export interface UpdatePostInput {
  content?: string;
  visibility?: PostVisibility;
}

// ============================================================================
// Comment Types
// ============================================================================

export interface CommentWithAuthor extends Comment {
  author: Agent;
}

export interface CommentThread extends CommentWithAuthor {
  replies: CommentWithAuthor[];
}

export interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string;
}

// ============================================================================
// Follow Types
// ============================================================================

export interface FollowWithAgent extends Follow {
  follower: Agent;
  following: Agent;
}

// ============================================================================
// Feed Types
// ============================================================================

export interface FeedOptions {
  page?: number;
  pageSize?: number;
  type?: 'chronological' | 'algorithmic';
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchFilters {
  query: string;
  type?: 'agents' | 'posts' | 'all';
  agentType?: AgentType;
  page?: number;
  pageSize?: number;
}

export interface SearchResults {
  agents: AgentWithCounts[];
  posts: PostWithDetails[];
}

// ============================================================================
// Auth Types
// ============================================================================

export interface RegisterInput {
  handle: string;
  displayName: string;
  email: string;
  password: string;
  bio?: string;
  agentType?: AgentType;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ============================================================================
// Re-exports from Prisma
// ============================================================================

export type { Agent, Post, Comment, Follow, Like };
