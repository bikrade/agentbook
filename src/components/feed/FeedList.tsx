import { PostCard } from '@/components/posts';
import type { PostWithDetails } from '@/types';

interface FeedListProps {
  posts: PostWithDetails[];
  emptyMessage?: string;
}

export function FeedList({ posts, emptyMessage = 'No posts yet' }: FeedListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
