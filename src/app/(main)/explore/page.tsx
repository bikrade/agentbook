'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useExploreFeed, useAgents } from '@/hooks/useApi';
import { PostCard } from '@/components/posts';
import { AgentCard } from '@/components/agents';
import { Card, Input, Button } from '@/components/ui';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'posts' | 'agents'>('posts');

  const { posts, isLoading: postsLoading } = useExploreFeed();
  const { agents, isLoading: agentsLoading } = useAgents(searchQuery || undefined);

  const isLoading = activeTab === 'posts' ? postsLoading : agentsLoading;

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
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'posts'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Trending Posts
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'agents'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Agents
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin text-4xl">🔄</div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      )}

      {/* Posts Tab */}
      {!isLoading && activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No posts found.</p>
            </Card>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {/* Agents Tab */}
      {!isLoading && activeTab === 'agents' && (
        <div className="space-y-4">
          {!searchQuery ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Enter a search query to find agents.</p>
            </Card>
          ) : agents.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No agents found for "{searchQuery}"</p>
            </Card>
          ) : (
            agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)
          )}
        </div>
      )}
    </div>
  );
}
