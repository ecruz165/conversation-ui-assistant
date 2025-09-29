# Multi-stage build for Management UI - Zero Trust Environment
FROM node:20-alpine AS builder

# Security: Create non-root user for build
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Security: Install security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    ca-certificates \
    curl \
    dumb-init && \
    rm -rf /var/cache/apk/*

# Copy package files first for better caching
COPY package*.json ./

# Security: Verify package integrity and install dependencies
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copy source code
COPY . .

# Security: Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Build the application
RUN npm run build

# Production stage - Zero Trust Security Hardened
FROM nginx:1.25-alpine AS production

# Security: Install security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    ca-certificates \
    curl \
    openssl \
    tzdata && \
    rm -rf /var/cache/apk/*

# Security: Create non-root user for nginx
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-app -u 1001 -G nginx-app

# Security: Create directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run/nginx /etc/nginx/ssl && \
    chown -R nginx-app:nginx-app /var/cache/nginx /var/log/nginx /var/run/nginx /etc/nginx/ssl && \
    chmod 755 /var/cache/nginx /var/log/nginx /var/run/nginx /etc/nginx/ssl

# Copy built assets from builder stage (handle both dist and dist/client paths)
COPY --from=builder --chown=nginx-app:nginx-app /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY --chown=nginx-app:nginx-app nginx.conf /etc/nginx/conf.d/default.conf

# Security: Copy SSL/TLS certificates (mount point for zero trust)
# These will be mounted at runtime in zero trust environments
VOLUME ["/etc/nginx/ssl"]

# Security: Remove default nginx config and set proper permissions
RUN rm -f /etc/nginx/conf.d/default.conf.bak && \
    chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Security: Switch to non-root user
USER nginx-app

# Expose ports (80 for HTTP, 443 for HTTPS)
EXPOSE 80 443

# Security: Enhanced health check with SSL support
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:80/health || curl -fk https://localhost:443/health || exit 1

# Security: Use dumb-init for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start nginx with non-daemon mode
CMD ["nginx", "-g", "daemon off;"]
