import Link from 'next/link';
import { Avatar, Card, CardHeader, CardContent, CardFooter } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import { formatRelativeTime, generateAvatarUrl, formatCount } from '@/lib/utils';
import type { PostWithDetails } from '@/types';

interface PostCardProps {
  post: PostWithDetails;
}

export function PostCard({ post }: PostCardProps) {
  const { author } = post;

  return (
    <Card className="animate-in">
      <CardHeader>
        <Link href={ROUTES.PROFILE(author.handle)}>
          <Avatar
            src={author.avatar || generateAvatarUrl(author.handle)}
            alt={author.displayName}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.PROFILE(author.handle)}
              className="font-semibold hover:underline truncate"
            >
              {author.displayName}
            </Link>
            {author.verified && (
              <span className="text-primary-500 text-sm">✓</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={ROUTES.PROFILE(author.handle)} className="hover:underline">
              @{author.handle}
            </Link>
            <span>•</span>
            <time dateTime={post.createdAt.toString()}>
              {formatRelativeTime(post.createdAt)}
            </time>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Reply context */}
        {post.replyTo && (
          <div className="mb-2 text-sm text-muted-foreground">
            Replying to{' '}
            <Link
              href={ROUTES.PROFILE(post.replyTo.author.handle)}
              className="text-primary-500 hover:underline"
            >
              @{post.replyTo.author.handle}
            </Link>
          </div>
        )}

        {/* Repost context */}
        {post.repostOf && (
          <div className="mb-3 p-3 rounded-lg border border-border bg-gray-800/50">
            <div className="flex items-center gap-2 mb-2 text-sm">
              <Avatar
                src={post.repostOf.author.avatar || generateAvatarUrl(post.repostOf.author.handle)}
                alt={post.repostOf.author.displayName}
                size="sm"
              />
              <span className="font-medium">{post.repostOf.author.displayName}</span>
              <span className="text-muted-foreground">@{post.repostOf.author.handle}</span>
            </div>
            <p className="text-sm">{post.repostOf.content}</p>
          </div>
        )}

        {/* Post content */}
        <div className="whitespace-pre-wrap break-words">{post.content}</div>
      </CardContent>

      <CardFooter>
        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors"
            title="Like"
          >
            <span>❤️</span>
            <span className="text-sm">{formatCount(post._count.likes)}</span>
          </button>
          <button
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-500 transition-colors"
            title="Comment"
          >
            <span>💬</span>
            <span className="text-sm">{formatCount(post._count.comments)}</span>
          </button>
          <button
            className="flex items-center gap-1.5 text-muted-foreground hover:text-green-500 transition-colors"
            title="Repost"
          >
            <span>🔄</span>
            <span className="text-sm">{formatCount(post._count.reposts)}</span>
          </button>
        </div>

        <div className="flex-1" />

        {/* Views */}
        <span className="text-sm text-muted-foreground">
          {formatCount(post.viewCount)} views
        </span>
      </CardFooter>
    </Card>
  );
}
