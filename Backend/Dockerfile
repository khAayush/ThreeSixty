# ─── Backend Dockerfile ──────────────────────────────────────────────────────
# Build context: ./backend  (set in docker-compose.yml)
# Everything in backend/ is copied to /app/ — so app.js lands at /app/app.js.
# CMD runs "node app.js", NOT "node backend/app.js".

FROM node:22-alpine

# curl is required by the docker-compose healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Install production deps only.
# Copies backend/package.json + backend/package-lock.json into the layer.
# Docker cache skips reinstall when these files have not changed.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy all backend source files into /app/
COPY . .

EXPOSE 5000

CMD ["node", "app.js"]
