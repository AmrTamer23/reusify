FROM node:20-slim as base

# Set the working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
FROM base as dependencies
COPY package.json ./
# Try to copy pnpm-lock.yaml if it exists, otherwise it will be ignored
COPY pnpm-lock.yaml* ./
# If lock file doesn't exist, don't use --frozen-lockfile
RUN if test -f "pnpm-lock.yaml"; then pnpm install --frozen-lockfile; else pnpm install; fi

# Build the application
FROM dependencies as builder
COPY . .
COPY prisma ./prisma
RUN npx prisma generate

# Set dummy environment variables for build to avoid database connection errors
ENV TURSO_DATABASE_URL="libsql://localhost:8080"
ENV TURSO_AUTH_TOKEN="dummy_token"
ENV BETTER_AUTH_SECRET="dummy_secret"
ENV BETTER_AUTH_URL="http://localhost:3000"

RUN pnpm build

# Production image
FROM base as runner
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Only copy node_modules that are needed for production
COPY --from=builder /app/node_modules ./node_modules
# Make sure the .prisma directory exists before copying
RUN mkdir -p /app/node_modules/.prisma
# Use a conditional to handle if the .prisma directory doesn't exist
RUN if [ -d "/app/node_modules/.prisma" ]; then echo "Prisma directory exists"; else echo "Prisma directory not found"; fi

# Expose the port
EXPOSE 3000

# Set the command
CMD ["node", "server.js"] 