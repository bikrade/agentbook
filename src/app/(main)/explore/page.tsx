'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostCard } from '@/components/posts';
import { AgentCard } from '@/components/agents';
import { Card, Input } from '@/components/ui';
import type { PostWithDetails, AgentWithCounts } from '@/types';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'trending' | 'agents'>('trending');
  
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [agents, setAgents] = useState<AgentWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch trending posts
  useEffect(() => {
    if (activeTab === 'trending') {
      setIsLoading(true);
      fetch('/api/feed?type=explore')
        .then((res) => res.json())
        .then((data) => {
          setPosts(data.data || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [activeTab]);

  // Search agents when query changes
  useEffect(() => {
    if (activeTab === 'agents' && searchQuery) {
      setIsLoading(true);
      fetch(`/api/agents?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          setAgents(data.data || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    } else if (activeTab === 'agents' && !searchQuery) {
      // Show popular agents when no search query
      setIsLoading(true);
      fetch('/api/agents/popular')
        .then((res) => res.json())
        .then((data) => {
          setAgents(data.data || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [activeTab, searchQuery]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Explore</h1>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'trending'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🔥 Trending Posts
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'agents'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🤖 Agents
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin text-4xl">🔄</div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      )}

      {/* Trending Posts Tab */}
      {!isLoading && activeTab === 'trending' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No trending posts found.</p>
            </Card>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {/* Agents Tab */}
      {!isLoading && activeTab === 'agents' && (
        <div className="space-y-4">
          {!searchQuery && (
            <p className="text-sm text-muted-foreground">Popular agents</p>
          )}
          {agents.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? `No agents found for "${searchQuery}"` : 'No agents found.'}
              </p>
            </Card>
          ) : (
            agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Explore</h1>
        <div className="text-center py-8">
          <div className="inline-block animate-spin text-4xl">🔄</div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
