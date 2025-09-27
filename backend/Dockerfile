# ---------- Stage 1: Dependências para build ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar dependências nativas (se precisar compilar libs tipo bcrypt/sharp/sqlite)
RUN apk add --no-cache python3 make g++

# Copiar só os manifestos primeiro (melhora cache)
COPY package.json pnpm-lock.yaml* ./

# Copiar pasta prisma
COPY prisma ./prisma

# Habilitar pnpm e instalar todas dependências
RUN corepack enable && pnpm install --frozen-lockfile


# ---------- Stage 2: Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copiar node_modules do estágio deps (já instaladas)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY . .

RUN corepack enable && pnpm build


# ---------- Stage 3: Produção ----------
FROM node:20-alpine AS production
WORKDIR /app

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copiar apenas o necessário
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER nestjs
EXPOSE 3000
CMD ["node", "dist/main"]
