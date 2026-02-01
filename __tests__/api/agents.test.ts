/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

// Mock the services
const mockAgents = [
  {
    id: 'agent-1',
    handle: 'test-agent',
    displayName: 'Test Agent',
    email: 'test@example.com',
    bio: 'A test agent',
    agentType: 'ASSISTANT',
    capabilities: ['testing'],
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { followers: 10, following: 5, posts: 3 },
  },
];

jest.mock('@/services/agents', () => ({
  getAgentById: jest.fn().mockImplementation((id: string) => {
    const agent = mockAgents.find((a) => a.id === id);
    return Promise.resolve(agent || null);
  }),
  searchAgents: jest.fn().mockResolvedValue({
    data: mockAgents,
    pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
  }),
  getSuggestedAgents: jest.fn().mockResolvedValue(mockAgents),
  createAgent: jest.fn().mockImplementation((input) => 
    Promise.resolve({ ...mockAgents[0], ...input, id: 'new-agent' })
  ),
  updateAgent: jest.fn().mockImplementation((id, input) => 
    Promise.resolve({ ...mockAgents[0], ...input })
  ),
  deleteAgent: jest.fn().mockResolvedValue(undefined),
  followAgent: jest.fn().mockResolvedValue(undefined),
  unfollowAgent: jest.fn().mockResolvedValue(undefined),
}));

describe('Agents API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/agents', () => {
    it('should return agents when query is provided', async () => {
      const { searchAgents } = require('@/services/agents');
      const { GET } = require('@/app/api/agents/route');

      const request = new NextRequest('http://localhost:3000/api/agents?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(searchAgents).toHaveBeenCalledWith('test', 1, 20);
      expect(data.data).toBeDefined();
    });

    it('should return suggested agents when suggestFor is provided', async () => {
      const { getSuggestedAgents } = require('@/services/agents');
      const { GET } = require('@/app/api/agents/route');

      const request = new NextRequest('http://localhost:3000/api/agents?suggestFor=agent-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getSuggestedAgents).toHaveBeenCalledWith('agent-1');
      expect(data.data).toBeDefined();
    });

    it('should return error when no query provided', async () => {
      const { GET } = require('@/app/api/agents/route');

      const request = new NextRequest('http://localhost:3000/api/agents');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Query parameter required');
    });
  });

  describe('POST /api/agents', () => {
    it('should create a new agent', async () => {
      const { createAgent } = require('@/services/agents');
      const { POST } = require('@/app/api/agents/route');

      const request = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          handle: 'new-agent',
          displayName: 'New Agent',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(createAgent).toHaveBeenCalled();
      expect(data.data).toBeDefined();
    });

    it('should return validation error for invalid input', async () => {
      const { POST } = require('@/app/api/agents/route');

      const request = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          handle: '', // Invalid: empty
          displayName: 'Test',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});

describe('Agent by ID API', () => {
  describe('GET /api/agents/[id]', () => {
    it('should return agent by ID', async () => {
      const { getAgentById } = require('@/services/agents');
      const { GET } = require('@/app/api/agents/[id]/route');

      const request = new NextRequest('http://localhost:3000/api/agents/agent-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'agent-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getAgentById).toHaveBeenCalledWith('agent-1');
      expect(data.data.handle).toBe('test-agent');
    });

    it('should return 404 for non-existent agent', async () => {
      const { getAgentById } = require('@/services/agents');
      getAgentById.mockResolvedValueOnce(null);
      
      const { GET } = require('@/app/api/agents/[id]/route');

      const request = new NextRequest('http://localhost:3000/api/agents/non-existent');
      const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Agent not found');
    });
  });
});
