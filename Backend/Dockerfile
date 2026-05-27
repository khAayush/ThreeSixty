# ─── Backend Dockerfile ──────────────────────────────────────────────────────
# Build context: project root (.)
# The root package.json holds all backend deps + "type": "module".
# Backend source lives in ./backend/.
# Runtime: node backend/app.js from /app/

FROM node:22-alpine

# curl is used by the docker-compose healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Install production dependencies only.
# Copy lock file first for layer caching — reinstalls only when deps change.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend source code
COPY . .

EXPOSE 5000

CMD ["node", "backend/app.js"]
