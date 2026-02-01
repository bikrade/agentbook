import {
  cn,
  formatRelativeTime,
  generateAvatarUrl,
  truncate,
  formatCount,
  isValidHandle,
  extractMentions,
  extractHashtags,
} from '@/lib/utils';

describe('cn (className merger)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active')).toBe('base active');
    expect(cn('base', false && 'active')).toBe('base');
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });
});

describe('formatRelativeTime', () => {
  it('should return "just now" for recent times', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('should return minutes for times less than an hour', () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    expect(formatRelativeTime(thirtyMinutesAgo)).toBe('30m');
  });

  it('should return hours for times less than a day', () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    expect(formatRelativeTime(fiveHoursAgo)).toBe('5h');
  });

  it('should return days for times less than a week', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d');
  });

  it('should return formatted date for older times', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(twoWeeksAgo);
    expect(result).toMatch(/[A-Z][a-z]{2} \d{1,2}/); // e.g., "Jan 15"
  });

  it('should handle string dates', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });
});

describe('generateAvatarUrl', () => {
  it('should generate dicebear URL with handle as seed', () => {
    const url = generateAvatarUrl('test-agent');
    expect(url).toContain('dicebear.com');
    expect(url).toContain('bottts');
    expect(url).toContain('test-agent');
  });

  it('should generate unique URLs for different handles', () => {
    const url1 = generateAvatarUrl('agent1');
    const url2 = generateAvatarUrl('agent2');
    expect(url1).not.toBe(url2);
  });
});

describe('truncate', () => {
  it('should not truncate short strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('should truncate long strings with ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('should handle exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('should handle empty strings', () => {
    expect(truncate('', 10)).toBe('');
  });
});

describe('formatCount', () => {
  it('should return number as-is for small counts', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(999)).toBe('999');
  });

  it('should format thousands with K', () => {
    expect(formatCount(1000)).toBe('1.0K');
    expect(formatCount(1500)).toBe('1.5K');
    expect(formatCount(15000)).toBe('15.0K');
  });

  it('should format millions with M', () => {
    expect(formatCount(1000000)).toBe('1.0M');
    expect(formatCount(2500000)).toBe('2.5M');
  });
});

describe('isValidHandle', () => {
  it('should accept valid handles', () => {
    expect(isValidHandle('test-agent')).toBe(true);
    expect(isValidHandle('agent123')).toBe(true);
    expect(isValidHandle('a1')).toBe(true);
  });

  it('should reject handles starting with hyphen', () => {
    expect(isValidHandle('-test')).toBe(false);
  });

  it('should reject handles ending with hyphen', () => {
    expect(isValidHandle('test-')).toBe(false);
  });

  it('should reject handles with uppercase', () => {
    expect(isValidHandle('TestAgent')).toBe(false);
  });

  it('should reject handles with special characters', () => {
    expect(isValidHandle('test@agent')).toBe(false);
    expect(isValidHandle('test_agent')).toBe(false);
  });

  it('should reject empty handles', () => {
    expect(isValidHandle('')).toBe(false);
  });
});

describe('extractMentions', () => {
  it('should extract mentions from text', () => {
    expect(extractMentions('Hello @user1 and @user2')).toEqual(['user1', 'user2']);
  });

  it('should return empty array for no mentions', () => {
    expect(extractMentions('Hello world')).toEqual([]);
  });

  it('should handle mentions at start and end', () => {
    expect(extractMentions('@start and @end')).toEqual(['start', 'end']);
  });

  it('should handle empty string', () => {
    expect(extractMentions('')).toEqual([]);
  });
});

describe('extractHashtags', () => {
  it('should extract hashtags from text', () => {
    expect(extractHashtags('Hello #AI and #ML')).toEqual(['AI', 'ML']);
  });

  it('should return empty array for no hashtags', () => {
    expect(extractHashtags('Hello world')).toEqual([]);
  });

  it('should handle hashtags with numbers', () => {
    expect(extractHashtags('#AI2024 #GPT4')).toEqual(['AI2024', 'GPT4']);
  });

  it('should handle empty string', () => {
    expect(extractHashtags('')).toEqual([]);
  });
});
