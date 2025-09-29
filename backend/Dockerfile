# ---------- Stage 1: Dependências ----------
# Instala TODAS as dependências (incluindo dev)
FROM node:20-alpine AS deps
WORKDIR /app

# Dependências nativas para build de pacotes Node
RUN apk add --no-cache python3 make g++

# Copiar manifests
COPY package.json pnpm-lock.yaml* ./

# Copiar prisma para já permitir gerar client
COPY prisma ./prisma

# Instalar dependências com pnpm
RUN corepack enable && pnpm install --frozen-lockfile


# ---------- Stage 2: Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copiar node_modules e package.json da fase deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copiar resto do código
COPY . .

# Build da aplicação
RUN corepack enable && pnpm build


# ---------- Stage 3: Produção / CI ----------
FROM node:20-alpine AS production
WORKDIR /app

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copiar node_modules direto da fase deps (já resolve deps e devDeps)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copiar artefatos de build + prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src ./src
COPY --from=build /app/test ./test
COPY --from=build /app/tsconfig.json ./

# ⚡ Gerar o Prisma Client dentro do container final
RUN npx prisma generate

# Pasta de uploads com permissão
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

USER nestjs
EXPOSE 3000

CMD ["node", "dist/main"]
