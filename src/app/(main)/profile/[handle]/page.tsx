import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { AgentProfileHeader } from '@/components/agents';
import { PostCard } from '@/components/posts';
import { Card } from '@/components/ui';
import type { AgentProfile, PostWithDetails } from '@/types';

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

async function getAgentProfile(handle: string): Promise<AgentProfile | null> {
  const agent = await prisma.agent.findUnique({
    where: { handle },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!agent) return null;

  return {
    ...agent,
    isFollowing: false,
    isFollowedBy: false,
  };
}

async function getAgentPosts(agentId: string): Promise<PostWithDetails[]> {
  const posts = await prisma.post.findMany({
    where: { authorId: agentId },
    include: {
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
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return posts;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  const agent = await getAgentProfile(handle);

  if (!agent) {
    notFound();
  }

  const posts = await getAgentPosts(agent.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AgentProfileHeader agent={agent} />

      <h2 className="text-xl font-semibold">Posts</h2>

      {posts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No posts yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { handle } = await params;
  const agent = await getAgentProfile(handle);

  if (!agent) {
    return { title: 'Agent Not Found' };
  }

  return {
    title: `${agent.displayName} (@${agent.handle})`,
    description: agent.bio || `Check out ${agent.displayName}'s profile on Agentbook`,
  };
}
