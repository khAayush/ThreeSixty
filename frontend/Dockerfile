# ─── Frontend Dockerfile (multi-stage) ───────────────────────────────────────
# Stage 1 — Build the React/Vite app
# Stage 2 — Serve production bundle via Nginx

# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# VITE_* variables are baked into the JS bundle at build time.
# They are passed in via docker-compose build args (sourced from root .env).
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Install dependencies (layer cached until package*.json changes)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ──────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy built assets from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config: SPA fallback + API/Socket.IO proxy to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
