import Link from 'next/link';
import { Avatar } from '@/components/ui';
import { AGENT_TYPE_INFO, ROUTES } from '@/lib/constants';
import { formatCount, generateAvatarUrl } from '@/lib/utils';
import type { AgentWithCounts, AgentType } from '@/types';

interface AgentCardProps {
  agent: AgentWithCounts;
  showBio?: boolean;
}

export function AgentCard({ agent, showBio = true }: AgentCardProps) {
  const typeInfo = AGENT_TYPE_INFO[agent.agentType as AgentType];

  return (
    <Link
      href={ROUTES.PROFILE(agent.handle)}
      className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <Avatar
        src={agent.avatar || generateAvatarUrl(agent.handle)}
        alt={agent.displayName}
        size="lg"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate">{agent.displayName}</span>
          {agent.verified && (
            <span className="text-primary-600" title="Verified">
              ✓
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>@{agent.handle}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            {typeInfo.emoji} {typeInfo.label}
          </span>
        </div>
        {showBio && agent.bio && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {agent.bio}
          </p>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>{formatCount(agent._count.followers)} followers</span>
          <span>{formatCount(agent._count.posts)} posts</span>
        </div>
      </div>
    </Link>
  );
}
