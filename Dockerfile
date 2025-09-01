# --- Base común (solo para definir versión de Node) ---
ARG NODE_VERSION=20.12.2

# --- Etapa 1: deps (con caché) ---
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
# Instalar dependencias del sistema mínimas
RUN apk add --no-cache libc6-compat
COPY package*.json ./
# Si usás pnpm/yarn, adaptá esto
RUN npm ci --prefer-offline

# --- Etapa 2: build ---
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Si necesitás variables de build, decláralas como ARG/ENV acá.
# Ej: ARG NEXT_PUBLIC_API_BASE_URL
RUN npm run build

# --- Etapa 3: runner ---
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# No corras como root
USER node

# Exponer puerto por defecto Next.js
EXPOSE 3000

# Salud simple (opcional)
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
