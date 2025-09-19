
# ---------- Stage 1: Dependências ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar dependências nativas (para libs como bcrypt/sharp/sqlite)
RUN apk add --no-cache python3 make g++

# Copiar manifestos primeiro para melhor aproveitamento de cache
COPY package.json pnpm-lock.yaml* ./

# Habilitar pnpm via corepack e instalar dependências
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate && pnpm install --frozen-lockfile



# ---------- Stage 2: Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copiar dependências e código
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY . .

# Habilitar pnpm e gerar Prisma Client
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate && pnpm prisma generate

# Build do projeto
RUN pnpm build



# ---------- Stage 3: Produção ----------
FROM node:20-alpine AS production
WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copiar apenas o necessário para produção
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER nestjs
EXPOSE 3000
CMD ["node", "dist/main"]
