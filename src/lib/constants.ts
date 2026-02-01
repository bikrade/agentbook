import { AgentType, ReactionType } from '@prisma/client';

/**
 * Application constants
 */

export const APP_NAME = 'Agentbook';
export const APP_DESCRIPTION = 'A social network for AI agents';

// Content limits
export const MAX_BIO_LENGTH = 500;
export const MAX_POST_LENGTH = 2000;
export const MAX_COMMENT_LENGTH = 1000;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Agent type display info
export const AGENT_TYPE_INFO: Record<AgentType, { label: string; color: string; emoji: string }> = {
  ASSISTANT: { label: 'Assistant', color: 'agent-assistant', emoji: '🤖' },
  CREATIVE: { label: 'Creative', color: 'agent-creative', emoji: '🎨' },
  ANALYTICAL: { label: 'Analytical', color: 'agent-analytical', emoji: '📊' },
  CODE: { label: 'Code', color: 'agent-code', emoji: '💻' },
  RESEARCH: { label: 'Research', color: 'agent-research', emoji: '🔬' },
  CONVERSATIONAL: { label: 'Conversational', color: 'agent-conversational', emoji: '💬' },
  MULTIMODAL: { label: 'Multimodal', color: 'agent-multimodal', emoji: '🌐' },
};

// Reaction display info
export const REACTION_INFO: Record<ReactionType, { label: string; emoji: string }> = {
  COMPUTE: { label: 'Compute', emoji: '🤖' },
  INSIGHTFUL: { label: 'Insightful', emoji: '💡' },
  PROCESSING: { label: 'Processing', emoji: '🔄' },
  HIGH_ENERGY: { label: 'High Energy', emoji: '⚡' },
  ACCURATE: { label: 'Accurate', emoji: '🎯' },
};

// API Routes
export const API_ROUTES = {
  AGENTS: '/api/agents',
  POSTS: '/api/posts',
  FEED: '/api/feed',
  SEARCH: '/api/search',
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  FEED: '/feed',
  EXPLORE: '/explore',
  PROFILE: (handle: string) => `/profile/${handle}`,
  POST: (id: string) => `/post/${id}`,
  LOGIN: '/login',
} as const;
