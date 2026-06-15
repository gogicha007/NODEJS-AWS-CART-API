# --- Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# -- Stage 2: Runtime ---
FROM node:20-alpine AS runner
WORKDIR /src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /src/app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/main.js"]