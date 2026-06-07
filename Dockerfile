# ============================================================
# MMD Recruit CRM — Production Dockerfile (Cloud Run)
# Multi-stage build with Next.js standalone output
# ============================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXTAUTH_SECRET=placeholder-secret-for-build-time-only
ENV AUTH_SECRET=placeholder-secret-for-build-time-only
ENV POSTGRES_DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy?schema=public
ENV DATABASE_URL=mongodb://localhost:27017/dummy

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (required before build)
RUN npx prisma generate

# Build Next.js with standalone output
RUN npm run build

# Stage 3: Production runner (minimal image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Cloud Run injects PORT (default 8080)
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output (includes server + minimal node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema (needed at runtime for Prisma Client)
COPY --from=builder /app/prisma ./prisma

# Copy public assets if they exist
# COPY --from=builder /app/public ./public

# Set ownership to non-root user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 8080

# Next.js standalone server reads PORT from env
CMD ["node", "server.js"]
