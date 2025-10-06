# Multi-stage build for Frontend

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for API URLs
ARG VITE_ISSUANCE_API_URL=http://localhost:3001
ARG VITE_VERIFICATION_API_URL=http://localhost:3002

# Set environment variables for build
ENV VITE_ISSUANCE_API_URL=$VITE_ISSUANCE_API_URL
ENV VITE_VERIFICATION_API_URL=$VITE_VERIFICATION_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS runner

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of nginx directories
RUN chown -R nodejs:nodejs /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
