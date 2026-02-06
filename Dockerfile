# GRC Shield - Production Dockerfile
# Multi-stage build for optimized image size

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S grcshield -u 1001

# Copy built assets from builder
COPY --from=builder --chown=grcshield:nodejs /app/dist ./dist
COPY --from=builder --chown=grcshield:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=grcshield:nodejs /app/package.json ./
COPY --from=builder --chown=grcshield:nodejs /app/drizzle.config.ts ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Switch to non-root user
USER grcshield

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health/live', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
