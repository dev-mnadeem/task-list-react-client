# syntax=docker/dockerfile:1

# ---------- build ----------
# Vite inlines every VITE_* value at build time, so the API base URL is a
# build argument, not a runtime environment variable. Leave it empty and the
# image ships in demo mode, which is what makes `docker compose up` produce a
# working board with no backend.
FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=""
ARG VITE_DEMO_MODE=""
ARG VITE_AI_PROVIDER="local"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_DEMO_MODE=$VITE_DEMO_MODE \
    VITE_AI_PROVIDER=$VITE_AI_PROVIDER

# Dependencies are installed from the lockfile in their own layer so a source
# change does not re-resolve the tree.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- runtime ----------
FROM nginx:1.30-alpine AS runtime

# nginx's own unprivileged user already exists; give it the paths it writes to
# and move the pid out of /var/run so the container can drop root entirely.
RUN mkdir -p /var/cache/nginx /var/log/nginx \
    && chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

USER nginx

# A non-root process cannot bind below 1024.
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
