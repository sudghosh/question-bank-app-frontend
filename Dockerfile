# syntax=docker/dockerfile:1.4

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Set build arguments and environment variables
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV \
    PATH=/app/node_modules/.bin:$PATH \
    CI=false \
    NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies for build
RUN apk add --no-cache python3 make g++ curl \
    && npm install -g npm@latest

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies with caching
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production --no-audit

# Copy source files
COPY . .

# Build the application with proper handling of TypeScript files
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Development stage
FROM node:20-alpine AS development

# Set working directory and create non-root user
WORKDIR /app
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

# Set environment variables with optimized memory settings
ENV NODE_ENV=development \
    WATCHPACK_POLLING=true \
    PATH=/app/node_modules/.bin:$PATH \
    CI=false \
    # Memory optimization settings
    GENERATE_SOURCEMAP=false \
    INLINE_RUNTIME_CHUNK=false \
    SKIP_PREFLIGHT_CHECK=true

# Copy package files with correct ownership
COPY --chown=appuser:appgroup package*.json ./
COPY --chown=appuser:appgroup tsconfig.json ./

# Install dependencies with cache and set ownership
RUN --mount=type=cache,target=/root/.npm \
    npm install && \
    chown -R appuser:appgroup node_modules

# Copy source code with correct ownership
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:3000 || exit 1

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start", "--", "--host", "0.0.0.0"]

# Production stage
FROM nginx:alpine AS production

# Install required tools and create non-root user
RUN apk add --no-cache curl && \
    addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

# Copy nginx configuration
COPY --chown=appuser:appgroup nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder --chown=appuser:appgroup /app/build /usr/share/nginx/html

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:3000 || exit 1

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]