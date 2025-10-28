# ============================================
# Multi-stage Dockerfile for DeraLinks Backend
# ============================================

# Base stage - shared dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies required for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
# Use npm install instead of npm ci for development (no package-lock.json yet)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3600

# Start development server with hot reload
CMD ["npm", "run", "dev"]

# Builder stage - compile TypeScript
FROM base AS builder
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies like TypeScript)
# This is needed to compile TypeScript to JavaScript
RUN npm install && \
    npm cache clean --force

# Verify TypeScript is installed
RUN ls -la node_modules/.bin/ | grep tsc || echo "TypeScript not found!"

# Copy source code
COPY . .

# Build TypeScript using node_modules/.bin/tsc directly
RUN node_modules/.bin/tsc

# Now install only production dependencies for the final image
RUN npm prune --production

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Install PostgreSQL client for health checks
RUN apk add --no-cache postgresql-client

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3600

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node dist/healthcheck.js || exit 1

# Start production server
CMD ["node", "dist/index.js"]
