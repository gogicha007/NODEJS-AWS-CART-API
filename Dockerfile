# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps
WORKDIR /usr/src/app

COPY package*.json ./
# Install production dependencies only
RUN npm ci --omit=dev

# --- Stage 2: Build ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy dependencies and source code
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Install all dependencies for build, then build
RUN npm install && npm run build

# --- Stage 3: Production ---
FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy only necessary artifacts from previous stages
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

USER nonroot
EXPOSE 3000
CMD ["dist/main.js"]