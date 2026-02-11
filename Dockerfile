# Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# Build stage
FROM base AS builder
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time SQLite database path used to create deterministic sample data
ENV DATABASE_URL=file:./prisma/dev.db

# Generate Prisma client and materialize seeded SQLite database into the image
RUN npx prisma generate
RUN npx prisma db push
RUN npx prisma db seed

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production stage
FROM base AS runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY docker/entrypoint.sh ./entrypoint.sh

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chmod +x ./entrypoint.sh

# Copy built assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV DATABASE_URL=file:./prisma/dev.db

CMD ["./entrypoint.sh"]
