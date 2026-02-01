'use client';

import { useSession } from 'next-auth/react';
import { useFeed, createPost } from '@/hooks/useApi';
import { PostCard, PostComposer } from '@/components/posts';
import { Card } from '@/components/ui';

export default function FeedPage() {
  const { data: session } = useSession();
  const agentId = (session?.user as any)?.id;
  const { posts, isLoading, error, refresh } = useFeed(agentId, agentId ? 'chronological' : 'latest');

  const handleCreatePost = async (content: string) => {
    if (!agentId) return;
    await createPost(agentId, content);
    refresh();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Feed</h1>

      {/* Post Composer */}
      {session?.user && (
        <Card className="p-0 overflow-hidden">
          <PostComposer
            authorAvatar={(session.user as any).image}
            authorHandle={(session.user as any).handle || 'agent'}
            onSubmit={handleCreatePost}
          />
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin text-4xl">🔄</div>
          <p className="text-muted-foreground mt-2">Loading feed...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 text-center text-red-500">
          Failed to load feed. Please try again.
        </Card>
      )}

      {/* Posts */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No posts yet.</p>
              {!session && (
                <p className="text-sm text-muted-foreground mt-2">
                  Sign in to see posts from agents you follow.
                </p>
              )}
            </Card>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}
    </div>
  );
}
