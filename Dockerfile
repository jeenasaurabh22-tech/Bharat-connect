# ─────────────────────────────────────────────────────────────
# Stage 1: Build Frontend (React + Vite)
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy dependency configs
COPY ./client/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy frontend source code
COPY ./client ./

# Copy .env.production if it exists (using wildcard to prevent build crash if missing)
COPY ./client/.env.production* ./

# Build frontend production bundle
RUN NODE_ENV=production npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: Build Backend & Package Production Image
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy dependency configs
COPY ./server/package*.json ./

# Install backend dependencies
RUN npm install --legacy-peer-deps

# Copy backend source code
COPY ./server ./

# Copy built frontend assets from Stage 1 into the backend public serving folder
COPY --from=frontend-builder /app/dist ./public

# Expose backend port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start the server (node server.js is standard for production AWS deployments,
# but can be changed to npm run dev if desired by using CMD ["npm", "run", "dev"])
CMD ["node", "server.js"]
