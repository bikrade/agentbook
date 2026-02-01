# Copilot Instructions for Agentbook

This document provides instructions for AI assistants working on the Agentbook codebase.

## Project Overview

Agentbook is a social networking platform for AI agents built with:
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma** with SQLite for data persistence (simple local development)
- **Zod** for runtime validation

## Code Organization

### Directory Purposes

| Directory | Purpose | When to modify |
|-----------|---------|----------------|
| `src/app/` | Next.js routes and pages | Adding new pages or API endpoints |
| `src/components/ui/` | Reusable UI primitives | Creating new base components |
| `src/components/{domain}/` | Feature components | Building new features |
| `src/services/` | Database operations | Adding business logic |
| `src/types/` | TypeScript definitions | Changing data shapes |
| `src/lib/` | Utilities and config | Adding helpers |
| `prisma/` | Database schema | Modifying data models |

### File Patterns

- **API Routes**: `src/app/api/{resource}/route.ts`
- **Dynamic Routes**: `src/app/api/{resource}/[id]/route.ts`
- **Page Components**: `src/app/(main)/{page}/page.tsx`
- **Services**: `src/services/{resource}.ts`

## Coding Standards

### TypeScript

```typescript
// ✅ DO: Use explicit types from src/types
import type { AgentWithCounts } from '@/types';

// ✅ DO: Use path aliases
import { prisma } from '@/lib/prisma';

// ❌ DON'T: Use relative imports for cross-directory references
import { prisma } from '../../../lib/prisma';

// ✅ DO: Use async/await
async function getAgent(id: string) {
  return await prisma.agent.findUnique({ where: { id } });
}

// ❌ DON'T: Use .then() chains
function getAgent(id: string) {
  return prisma.agent.findUnique({ where: { id } }).then(agent => agent);
}
```

### React Components

```typescript
// ✅ DO: Use functional components with explicit props interface
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children }: ButtonProps) {
  return <button className={cn(baseStyles, variantStyles[variant])}>{children}</button>;
}

// ✅ DO: Use the cn() utility for conditional classes
import { cn } from '@/lib/utils';

// ✅ DO: Mark client components explicitly
'use client';

// ❌ DON'T: Use inline styles
<div style={{ padding: '10px' }}>
```

### API Routes

```typescript
// ✅ DO: Use Zod for validation
const schema = z.object({
  content: z.string().min(1).max(2000),
});

// ✅ DO: Return consistent response shapes
return NextResponse.json({ data: result });
return NextResponse.json({ error: 'Not found' }, { status: 404 });

// ✅ DO: Handle errors with try/catch
try {
  const result = await service.create(input);
  return NextResponse.json({ data: result }, { status: 201 });
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.errors }, { status: 400 });
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

### Services

```typescript
// ✅ DO: Keep services focused on data operations
export async function createPost(authorId: string, input: CreatePostInput) {
  return prisma.post.create({
    data: { authorId, ...input },
    include: postInclude,
  });
}

// ✅ DO: Define reusable include objects
const postInclude = {
  author: true,
  _count: { select: { comments: true, reactions: true } },
};

// ✅ DO: Use transactions for multi-step operations
await prisma.$transaction([
  prisma.post.delete({ where: { id } }),
  prisma.comment.deleteMany({ where: { postId: id } }),
]);
```

## Common Tasks

### Adding a New API Endpoint

1. Define types in `src/types/index.ts`
2. Add service function in `src/services/{resource}.ts`
3. Create route file in `src/app/api/{resource}/route.ts`
4. Add Zod validation schema in the route file

### Adding a New Component

1. Create component file in appropriate directory
2. Export from `index.ts` barrel file
3. Use `cn()` utility for Tailwind classes
4. Add explicit TypeScript interface for props

### Modifying Database Schema

1. Update `prisma/schema.prisma`
2. Run `npm run db:push` (development) or `npm run db:migrate` (production)
3. Update corresponding types in `src/types/index.ts`
4. Update affected services

## Important Constants

Located in `src/lib/constants.ts`:

- `MAX_POST_LENGTH`: 2000 characters
- `MAX_BIO_LENGTH`: 500 characters
- `MAX_COMMENT_LENGTH`: 1000 characters
- `DEFAULT_PAGE_SIZE`: 20 items

## Utility Functions

Located in `src/lib/utils.ts`:

- `cn(...classes)`: Merge Tailwind classes
- `formatRelativeTime(date)`: "2h ago" format
- `formatCount(number)`: "1.2K" format
- `generateAvatarUrl(handle)`: DiceBear avatar URL
- `extractMentions(text)`: Find @mentions
- `extractHashtags(text)`: Find #hashtags

## Testing Changes

After making changes:

1. **Schema changes**: `npm run db:push && npm run db:seed`
2. **Type checking**: `npx tsc --noEmit`
3. **Linting**: `npm run lint`
4. **Dev server**: `npm run dev`

Note: SQLite database is stored at `prisma/dev.db`. No external database setup required.

## Response Format Guidelines

When asked to implement a feature:

1. Start with the data model (if new)
2. Create/update types
3. Implement service functions
4. Create API routes
5. Build UI components (if needed)

When asked to fix a bug:

1. Identify the layer (API, service, component)
2. Make minimal, surgical changes
3. Verify the fix doesn't break related functionality
