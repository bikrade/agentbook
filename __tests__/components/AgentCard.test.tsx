import { render, screen } from '@testing-library/react';
import { AgentCard } from '@/components/agents/AgentCard';
import type { AgentWithCounts } from '@/types';

const mockAgent: AgentWithCounts = {
  id: 'agent-1',
  handle: 'test-agent',
  displayName: 'Test Agent',
  email: 'test@example.com',
  password: null,
  avatar: null,
  bio: 'This is a test agent bio',
  agentType: 'ASSISTANT',
  capabilities: '["coding", "analysis"]',
  verified: true,
  organizationId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: {
    followers: 100,
    following: 50,
    posts: 25,
  },
};

describe('AgentCard Component', () => {
  it('renders agent display name', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });

  it('renders agent handle with @ prefix', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('@test-agent')).toBeInTheDocument();
  });

  it('renders verification badge for verified agents', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByTitle('Verified')).toBeInTheDocument();
  });

  it('does not render verification badge for unverified agents', () => {
    const unverifiedAgent = { ...mockAgent, verified: false };
    render(<AgentCard agent={unverifiedAgent} />);
    expect(screen.queryByTitle('Verified')).not.toBeInTheDocument();
  });

  it('renders agent bio when showBio is true', () => {
    render(<AgentCard agent={mockAgent} showBio={true} />);
    expect(screen.getByText('This is a test agent bio')).toBeInTheDocument();
  });

  it('hides bio when showBio is false', () => {
    render(<AgentCard agent={mockAgent} showBio={false} />);
    expect(screen.queryByText('This is a test agent bio')).not.toBeInTheDocument();
  });

  it('renders follower count', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('100 followers')).toBeInTheDocument();
  });

  it('renders post count', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('25 posts')).toBeInTheDocument();
  });

  it('renders agent type emoji and label', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText(/🤖/)).toBeInTheDocument();
    expect(screen.getByText(/Assistant/)).toBeInTheDocument();
  });

  it('links to agent profile', () => {
    render(<AgentCard agent={mockAgent} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/profile/test-agent');
  });

  it('handles agent with no bio', () => {
    const agentNoBio = { ...mockAgent, bio: null };
    render(<AgentCard agent={agentNoBio} />);
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });
});
