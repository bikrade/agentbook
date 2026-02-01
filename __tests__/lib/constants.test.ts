import {
  APP_NAME,
  APP_DESCRIPTION,
  MAX_BIO_LENGTH,
  MAX_POST_LENGTH,
  MAX_COMMENT_LENGTH,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  AGENT_TYPE_INFO,
  API_ROUTES,
  ROUTES,
} from '@/lib/constants';

describe('Application Constants', () => {
  it('should have correct app name', () => {
    expect(APP_NAME).toBe('Agentbook');
  });

  it('should have app description', () => {
    expect(APP_DESCRIPTION).toBeDefined();
    expect(typeof APP_DESCRIPTION).toBe('string');
  });
});

describe('Content Limits', () => {
  it('should have correct bio length limit', () => {
    expect(MAX_BIO_LENGTH).toBe(500);
  });

  it('should have correct post length limit', () => {
    expect(MAX_POST_LENGTH).toBe(2000);
  });

  it('should have correct comment length limit', () => {
    expect(MAX_COMMENT_LENGTH).toBe(1000);
  });
});

describe('Pagination Constants', () => {
  it('should have correct default page size', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });

  it('should have correct max page size', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
  });
});

describe('Agent Type Info', () => {
  const agentTypes = ['ASSISTANT', 'CREATIVE', 'ANALYTICAL', 'CODE', 'RESEARCH', 'CONVERSATIONAL', 'MULTIMODAL'];

  it('should have info for all agent types', () => {
    agentTypes.forEach((type) => {
      expect(AGENT_TYPE_INFO[type as keyof typeof AGENT_TYPE_INFO]).toBeDefined();
    });
  });

  it('should have label, color, and emoji for each type', () => {
    Object.values(AGENT_TYPE_INFO).forEach((info) => {
      expect(info.label).toBeDefined();
      expect(info.color).toBeDefined();
      expect(info.emoji).toBeDefined();
    });
  });
});

describe('API Routes', () => {
  it('should have correct agent routes', () => {
    expect(API_ROUTES.AGENTS).toBe('/api/agents');
  });

  it('should have correct post routes', () => {
    expect(API_ROUTES.POSTS).toBe('/api/posts');
  });

  it('should have correct feed routes', () => {
    expect(API_ROUTES.FEED).toBe('/api/feed');
  });
});

describe('Routes', () => {
  it('should have correct home route', () => {
    expect(ROUTES.HOME).toBe('/');
  });

  it('should have correct feed route', () => {
    expect(ROUTES.FEED).toBe('/feed');
  });

  it('should have correct explore route', () => {
    expect(ROUTES.EXPLORE).toBe('/explore');
  });

  it('should generate correct profile route', () => {
    expect(ROUTES.PROFILE('test-agent')).toBe('/profile/test-agent');
  });

  it('should generate correct post route', () => {
    expect(ROUTES.POST('123')).toBe('/post/123');
  });

  it('should have correct login route', () => {
    expect(ROUTES.LOGIN).toBe('/login');
  });
});
