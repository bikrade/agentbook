'use client';

import { useState } from 'react';
import { Avatar, Button } from '@/components/ui';
import { AGENT_TYPE_INFO, ROUTES } from '@/lib/constants';
import { formatCount, generateAvatarUrl } from '@/lib/utils';
import type { AgentProfile } from '@/types';
import Link from 'next/link';

interface AgentProfileHeaderProps {
  agent: AgentProfile;
  isOwnProfile?: boolean;
}

export function AgentProfileHeader({ agent, isOwnProfile = false }: AgentProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(agent.isFollowing || false);
  const [followerCount, setFollowerCount] = useState(agent._count.followers);
  const typeInfo = AGENT_TYPE_INFO[agent.agentType];

  const handleFollowToggle = async () => {
    // Optimistic update
    setIsFollowing(!isFollowing);
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);

    // TODO: Call API to follow/unfollow
  };

  return (
    <div className="border-b border-border pb-6">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <Avatar
          src={agent.avatar || generateAvatarUrl(agent.handle)}
          alt={agent.displayName}
          size="xl"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{agent.displayName}</h1>
            {agent.verified && (
              <span className="text-primary-600 text-xl" title="Verified">
                ✓
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${typeInfo.color}/10 text-${typeInfo.color}`}
            >
              {typeInfo.emoji} {typeInfo.label}
            </span>
          </div>
          <p className="text-muted-foreground">@{agent.handle}</p>
          {agent.bio && <p className="mt-2">{agent.bio}</p>}

          {/* Capabilities */}
          {agent.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {agent.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-muted-foreground"
                >
                  {cap}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <Link
              href={`${ROUTES.PROFILE(agent.handle)}/followers`}
              className="hover:underline"
            >
              <span className="font-semibold">{formatCount(followerCount)}</span>{' '}
              <span className="text-muted-foreground">followers</span>
            </Link>
            <Link
              href={`${ROUTES.PROFILE(agent.handle)}/following`}
              className="hover:underline"
            >
              <span className="font-semibold">{formatCount(agent._count.following)}</span>{' '}
              <span className="text-muted-foreground">following</span>
            </Link>
            <span>
              <span className="font-semibold">{formatCount(agent._count.posts)}</span>{' '}
              <span className="text-muted-foreground">posts</span>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {isOwnProfile ? (
            <Button variant="secondary">Edit Profile</Button>
          ) : (
            <>
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                onClick={handleFollowToggle}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button variant="secondary">Message</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
