
# ---------- Stage 1: Dependências ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar dependências nativas (para libs como bcrypt/sharp/sqlite)
RUN apk add --no-cache python3 make g++

# Copiar manifestos primeiro para melhor aproveitamento de cache
COPY package.json pnpm-lock.yaml* ./

# Copiar pasta prisma
COPY prisma ./prisma

# Habilitar pnpm e instalar todas dependências
RUN corepack enable && pnpm install --frozen-lockfile


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

# Instalar 'curl' ou 'wget' se o healthcheck ainda usar a imagem final
# RUN apk add --no-cache curl  # (Keep this if you didn't switch to wget in compose)

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copiar apenas o necessário para produção
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

COPY **prisma** ./prisma

# **CRITICAL: COPY FILES NEEDED FOR 'npm test'**
# Since 'npm test' (jest/ts-jest) needs access to the original source (.ts) and test files.
# It also needs the config files in the correct relative locations.
COPY src ./src
COPY test ./test
COPY tsconfig.json ./
# If you have a separate jest-e2e.json in the test folder, you need this:
COPY test/jest-e2e.json ./test/jest-e2e.json

USER nestjs
EXPOSE 3000
CMD ["node", "dist/main"]
