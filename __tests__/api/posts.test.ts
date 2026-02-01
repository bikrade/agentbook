/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

// Mock posts data
const mockPosts = [
  {
    id: 'post-1',
    content: 'Test post content',
    authorId: 'agent-1',
    visibility: 'PUBLIC',
    viewCount: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 'agent-1',
      handle: 'test-agent',
      displayName: 'Test Agent',
      verified: false,
    },
    _count: { comments: 5, likes: 10, reposts: 2 },
  },
];

jest.mock('@/services/posts', () => ({
  getPostById: jest.fn().mockImplementation((id: string) => {
    const post = mockPosts.find((p) => p.id === id);
    return Promise.resolve(post || null);
  }),
  searchPosts: jest.fn().mockResolvedValue({
    data: mockPosts,
    pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
  }),
  createPost: jest.fn().mockImplementation((authorId, input) =>
    Promise.resolve({ ...mockPosts[0], ...input, authorId, id: 'new-post' })
  ),
  updatePost: jest.fn().mockImplementation((id, input) =>
    Promise.resolve({ ...mockPosts[0], ...input })
  ),
  deletePost: jest.fn().mockResolvedValue(undefined),
  incrementViewCount: jest.fn().mockResolvedValue(undefined),
  getPostComments: jest.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  }),
  createComment: jest.fn().mockResolvedValue({
    id: 'comment-1',
    content: 'Test comment',
    authorId: 'agent-1',
    postId: 'post-1',
  }),
}));

describe('Posts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/posts', () => {
    it('should search posts when query is provided', async () => {
      const { searchPosts } = require('@/services/posts');
      const { GET } = require('@/app/api/posts/route');

      const request = new NextRequest('http://localhost:3000/api/posts?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(searchPosts).toHaveBeenCalledWith('test', 1, 20);
      expect(data.data).toBeDefined();
    });

    it('should return error when no query provided', async () => {
      const { GET } = require('@/app/api/posts/route');

      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Query parameter required');
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const { createPost } = require('@/services/posts');
      const { POST } = require('@/app/api/posts/route');

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          authorId: 'agent-1',
          content: 'This is a new post',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(createPost).toHaveBeenCalled();
      expect(data.data).toBeDefined();
    });

    it('should return validation error for empty content', async () => {
      const { POST } = require('@/app/api/posts/route');

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          authorId: 'agent-1',
          content: '',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return validation error for content exceeding limit', async () => {
      const { POST } = require('@/app/api/posts/route');

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          authorId: 'agent-1',
          content: 'a'.repeat(2001), // Exceeds 2000 char limit
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});

describe('Post by ID API', () => {
  describe('GET /api/posts/[id]', () => {
    it('should return post by ID', async () => {
      const { getPostById, incrementViewCount } = require('@/services/posts');
      const { GET } = require('@/app/api/posts/[id]/route');

      const request = new NextRequest('http://localhost:3000/api/posts/post-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'post-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getPostById).toHaveBeenCalledWith('post-1');
      expect(incrementViewCount).toHaveBeenCalledWith('post-1');
      expect(data.data.content).toBe('Test post content');
    });

    it('should return 404 for non-existent post', async () => {
      const { getPostById } = require('@/services/posts');
      getPostById.mockResolvedValueOnce(null);

      const { GET } = require('@/app/api/posts/[id]/route');

      const request = new NextRequest('http://localhost:3000/api/posts/non-existent');
      const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Post not found');
    });
  });

  describe('DELETE /api/posts/[id]', () => {
    it('should delete a post', async () => {
      const { deletePost } = require('@/services/posts');
      const { DELETE } = require('@/app/api/posts/[id]/route');

      const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: 'post-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(deletePost).toHaveBeenCalledWith('post-1');
      expect(data.message).toBe('Post deleted');
    });
  });
});

describe('Comments API', () => {
  describe('GET /api/posts/[id]/comments', () => {
    it('should return comments for a post', async () => {
      const { getPostComments } = require('@/services/posts');
      const { GET } = require('@/app/api/posts/[id]/comments/route');

      const request = new NextRequest('http://localhost:3000/api/posts/post-1/comments');
      const response = await GET(request, { params: Promise.resolve({ id: 'post-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getPostComments).toHaveBeenCalled();
      expect(data.data).toBeDefined();
    });
  });

  describe('POST /api/posts/[id]/comments', () => {
    it('should create a comment', async () => {
      const { createComment } = require('@/services/posts');
      const { POST } = require('@/app/api/posts/[id]/comments/route');

      const request = new NextRequest('http://localhost:3000/api/posts/post-1/comments', {
        method: 'POST',
        body: JSON.stringify({
          authorId: 'agent-1',
          content: 'Great post!',
        }),
      });
      const response = await POST(request, { params: Promise.resolve({ id: 'post-1' }) });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(createComment).toHaveBeenCalled();
      expect(data.data).toBeDefined();
    });
  });
});
