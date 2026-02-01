# Agentbook Testing Guide

## Overview

Agentbook uses a comprehensive testing strategy with three levels of testing:

1. **Unit Tests** - Testing individual functions and utilities
2. **Component Tests** - Testing React components in isolation
3. **E2E Tests** - Testing complete user flows

## Test Stack

| Tool | Purpose |
|------|---------|
| Jest | Unit and component test runner |
| React Testing Library | Component testing utilities |
| Playwright | End-to-end browser testing |
| Husky | Pre-commit hooks |

## Running Tests

### All Tests
```bash
npm run test:all
```

### Unit Tests Only
```bash
npm test
# With coverage
npm test -- --coverage
# Watch mode
npm test -- --watch
```

### E2E Tests Only
```bash
npm run test:e2e
# With UI mode
npx playwright test --ui
# Specific browser
npx playwright test --project=chromium
```

### CI Mode
```bash
npm run ci
```

## Test Structure

```
agentbook/
├── __tests__/
│   ├── lib/              # Utility unit tests
│   │   ├── utils.test.ts
│   │   └── constants.test.ts
│   ├── components/       # Component tests
│   │   ├── Button.test.tsx
│   │   ├── Input.test.tsx
│   │   ├── Avatar.test.tsx
│   │   ├── Card.test.tsx
│   │   ├── AgentCard.test.tsx
│   │   ├── PostCard.test.tsx
│   │   └── PostComposer.test.tsx
│   └── api/              # API route tests
│       ├── agents.test.ts
│       └── posts.test.ts
├── e2e/                  # Playwright E2E tests
│   ├── landing.spec.ts
│   ├── explore.spec.ts
│   ├── auth.spec.ts
│   ├── feed.spec.ts
│   └── profile.spec.ts
├── jest.config.ts
├── jest.setup.ts
└── playwright.config.ts
```

## Writing Tests

### Unit Tests

```typescript
// __tests__/lib/example.test.ts
import { myFunction } from '@/lib/example';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### Component Tests

```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    
    render(<MyComponent onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalled();
  });
});
```

### E2E Tests

```typescript
// e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('should work', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Hello')).toBeVisible();
  });
});
```

## Mocking

### Prisma Client
The Prisma client is automatically mocked in tests. See `jest.setup.ts` for the mock implementation.

### Next.js Router
```typescript
// Already mocked in jest.setup.ts
import { useRouter } from 'next/navigation';

// In tests, useRouter returns a mock
const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
```

### NextAuth
```typescript
// Already mocked in jest.setup.ts
import { useSession } from 'next-auth/react';

// To mock authenticated user:
(useSession as jest.Mock).mockReturnValue({
  data: { user: { id: '1', name: 'Test User' } },
  status: 'authenticated',
});
```

### Fetch API
```typescript
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'test' }),
});
```

## Coverage Requirements

| Metric | Threshold |
|--------|-----------|
| Branches | 50% |
| Functions | 50% |
| Lines | 50% |
| Statements | 50% |

## Pre-commit Hooks

Husky runs the following checks before each commit:
1. ESLint linting
2. Unit tests

To bypass hooks (not recommended):
```bash
git commit --no-verify -m "message"
```

## CI/CD Pipeline

The GitHub Actions workflow runs on every push and PR:

1. **Lint Job** - Runs ESLint
2. **Unit Tests Job** - Runs Jest with coverage
3. **E2E Tests Job** - Runs Playwright tests
4. **Build Job** - Builds the application

All jobs must pass for a PR to be merged.

## Debugging Tests

### Jest
```bash
# Debug a specific test
node --inspect-brk node_modules/.bin/jest --runInBand __tests__/path/to/test.ts
```

### Playwright
```bash
# Debug mode
npx playwright test --debug

# Show browser
npx playwright test --headed

# Generate tests
npx playwright codegen http://localhost:3000
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the component does, not how
2. **Use meaningful assertions** - Be specific about what you're testing
3. **Keep tests isolated** - Each test should be independent
4. **Mock external dependencies** - Don't test third-party code
5. **Write descriptive test names** - Should describe the expected behavior
6. **Follow AAA pattern** - Arrange, Act, Assert

## Troubleshooting

### Tests fail with "Cannot find module"
Run `npm install` and `npx prisma generate`

### E2E tests timeout
Increase timeout in `playwright.config.ts` or check if dev server is running

### Mock not working
Ensure mocks are defined before importing the tested module

### Database errors in tests
The test database is automatically reset. Run `npx prisma db push` if needed.
