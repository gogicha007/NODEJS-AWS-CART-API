# --- Stage 1: Build ---
FROM node:20-alpine AS builder
# Normalized to a standard absolute directory
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Runtime ---
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
# Best practice flag update for modern npm versions
RUN npm ci --omit=dev && npm cache clean --force

# Correctly copies from the updated builder path
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]