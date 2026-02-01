import { render, screen } from '@testing-library/react';
import { PostCard } from '@/components/posts/PostCard';
import type { PostWithDetails } from '@/types';

const mockPost: PostWithDetails = {
  id: 'post-1',
  content: 'This is a test post content',
  authorId: 'agent-1',
  visibility: 'PUBLIC',
  viewCount: 150,
  createdAt: new Date(),
  updatedAt: new Date(),
  replyToId: null,
  repostOfId: null,
  author: {
    id: 'agent-1',
    handle: 'test-agent',
    displayName: 'Test Agent',
    email: 'test@example.com',
    password: null,
    avatar: null,
    bio: 'Test bio',
    agentType: 'ASSISTANT',
    capabilities: '[]',
    verified: true,
    organizationId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  _count: {
    comments: 10,
    likes: 25,
    reposts: 5,
  },
  replyTo: null,
  repostOf: null,
};

describe('PostCard Component', () => {
  it('renders post content', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('This is a test post content')).toBeInTheDocument();
  });

  it('renders author display name', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });

  it('renders author handle', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('@test-agent')).toBeInTheDocument();
  });

  it('renders verification badge for verified authors', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders like count', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders comment count', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders repost count', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders view count', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('150 views')).toBeInTheDocument();
  });

  it('links to author profile', () => {
    render(<PostCard post={mockPost} />);
    const links = screen.getAllByRole('link');
    const profileLink = links.find(l => l.getAttribute('href')?.includes('/profile/'));
    expect(profileLink).toHaveAttribute('href', '/profile/test-agent');
  });

  it('renders reply context when post is a reply', () => {
    const replyPost: PostWithDetails = {
      ...mockPost,
      replyToId: 'parent-post',
      replyTo: {
        ...mockPost,
        id: 'parent-post',
        author: {
          ...mockPost.author,
          handle: 'parent-agent',
          displayName: 'Parent Agent',
        },
      },
    };
    render(<PostCard post={replyPost} />);
    expect(screen.getByText(/Replying to/)).toBeInTheDocument();
    expect(screen.getByText('@parent-agent')).toBeInTheDocument();
  });

  it('renders repost context when post is a repost', () => {
    const repostPost: PostWithDetails = {
      ...mockPost,
      content: '',
      repostOfId: 'original-post',
      repostOf: {
        ...mockPost,
        id: 'original-post',
        content: 'Original post content',
        author: {
          ...mockPost.author,
          handle: 'original-agent',
          displayName: 'Original Agent',
        },
      },
    };
    render(<PostCard post={repostPost} />);
    expect(screen.getByText('Original post content')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByTitle('Like')).toBeInTheDocument();
    expect(screen.getByTitle('Comment')).toBeInTheDocument();
    expect(screen.getByTitle('Repost')).toBeInTheDocument();
  });
});
