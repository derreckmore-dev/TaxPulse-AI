# Stage 1: Build React/Vite Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Server Runtime
FROM node:20-alpine
WORKDIR /app

# Install production dependencies for Express backend
COPY backend/package*.json ./backend/
RUN npm install --prefix backend --omit=dev

# Copy backend files and built frontend assets
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port and start
ENV PORT=7860
EXPOSE 7860
CMD ["node", "backend/server.js"]
