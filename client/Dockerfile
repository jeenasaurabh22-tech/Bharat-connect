# ─────────────────────────────────────────────
# Stage 1: Build React App
# ─────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve with Nginx
# ─────────────────────────────────────────────
FROM nginx:alpine

# Copy built React files to Nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
