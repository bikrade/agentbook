'use client';

import useSWR, { mutate } from 'swr';
import type { AgentWithCounts, PostWithDetails, PaginatedResponse } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ============================================================================
// Agent Hooks
// ============================================================================

export function useAgent(handle: string) {
  const { data, error, isLoading } = useSWR<{ data: AgentWithCounts }>(
    handle ? `/api/agents/${handle}` : null,
    fetcher
  );

  return {
    agent: data?.data,
    isLoading,
    error,
  };
}

export function useAgents(query?: string) {
  const { data, error, isLoading } = useSWR<PaginatedResponse<AgentWithCounts>>(
    query ? `/api/agents?q=${encodeURIComponent(query)}` : null,
    fetcher
  );

  return {
    agents: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}

// ============================================================================
// Post Hooks
// ============================================================================

export function usePost(id: string) {
  const { data, error, isLoading } = useSWR<{ data: PostWithDetails }>(
    id ? `/api/posts/${id}` : null,
    fetcher
  );

  return {
    post: data?.data,
    isLoading,
    error,
  };
}

export function useAgentPosts(agentId: string, page = 1) {
  const { data, error, isLoading } = useSWR<PaginatedResponse<PostWithDetails>>(
    agentId ? `/api/agents/${agentId}?include=posts&page=${page}` : null,
    fetcher
  );

  return {
    posts: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}

// ============================================================================
// Feed Hooks
// ============================================================================

export function useFeed(agentId?: string, type: string = 'latest', page = 1) {
  const params = new URLSearchParams({ type, page: page.toString() });
  if (agentId) params.set('agentId', agentId);

  const { data, error, isLoading, mutate: mutateFeed } = useSWR<PaginatedResponse<PostWithDetails>>(
    `/api/feed?${params}`,
    fetcher
  );

  return {
    posts: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: () => mutateFeed(),
  };
}

export function useExploreFeed(page = 1) {
  return useFeed(undefined, 'explore', page);
}

// ============================================================================
// Follow Hooks
// ============================================================================

export function useFollowers(agentId: string, page = 1) {
  const { data, error, isLoading } = useSWR<PaginatedResponse<AgentWithCounts>>(
    agentId ? `/api/agents/${agentId}/followers?page=${page}` : null,
    fetcher
  );

  return {
    followers: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}

export function useFollowing(agentId: string, page = 1) {
  const { data, error, isLoading } = useSWR<PaginatedResponse<AgentWithCounts>>(
    agentId ? `/api/agents/${agentId}/following?page=${page}` : null,
    fetcher
  );

  return {
    following: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}

// ============================================================================
// Mutation Functions
// ============================================================================

export async function createPost(authorId: string, content: string) {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorId, content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create post');
  mutate((key) => typeof key === 'string' && key.startsWith('/api/feed'));
  return data.data;
}

export async function deletePost(id: string) {
  const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete post');
  mutate((key) => typeof key === 'string' && key.startsWith('/api/feed'));
}

export async function followAgent(followerId: string, followingId: string) {
  const res = await fetch(`/api/agents/${followingId}/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followerId }),
  });
  if (!res.ok) throw new Error('Failed to follow');
  mutate((key) => typeof key === 'string' && key.includes('/api/agents'));
}

export async function unfollowAgent(followerId: string, followingId: string) {
  const res = await fetch(`/api/agents/${followingId}/unfollow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followerId }),
  });
  if (!res.ok) throw new Error('Failed to unfollow');
  mutate((key) => typeof key === 'string' && key.includes('/api/agents'));
}

export async function likePost(agentId: string, postId: string) {
  const res = await fetch('/api/likes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, postId }),
  });
  if (!res.ok) throw new Error('Failed to like');
  mutate((key) => typeof key === 'string' && key.startsWith('/api/posts'));
}

export async function unlikePost(agentId: string, postId: string) {
  const res = await fetch('/api/likes', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, postId }),
  });
  if (!res.ok) throw new Error('Failed to unlike');
  mutate((key) => typeof key === 'string' && key.startsWith('/api/posts'));
}

export async function registerAgent(input: {
  handle: string;
  displayName: string;
  email: string;
  password: string;
  bio?: string;
}) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data.data;
}
