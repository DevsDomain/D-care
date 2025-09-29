# ---------- Stage 1: Dependências ----------
# Esta fase instala todas as dependências (incluindo dev) e prepara o ambiente.
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar dependências nativas para compilação
RUN apk add --no-cache python3 make g++

# Copiar ficheiros de manifesto de dependências
COPY package.json pnpm-lock.yaml* ./

# Copiar a pasta prisma para gerar o cliente
COPY prisma ./prisma

# Habilitar pnpm e instalar todas as dependências
RUN corepack enable && pnpm install --frozen-lockfile


# ---------- Stage 2: Build ----------
# Esta fase copia o código-fonte e faz o build da aplicação.
FROM node:20-alpine AS build
WORKDIR /app

# Copiar as dependências já instaladas da fase anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copiar o resto do código-fonte e ficheiros de configuração
COPY . .

# Habilitar pnpm e fazer o build. Os testes serão executados na pipeline de CI, não aqui.
RUN corepack enable && pnpm build


# ---------- Stage 3: Produção & Teste em CI ----------
# Esta é a imagem final, que contém o necessário para executar E testar a aplicação.
FROM node:20-alpine AS production
WORKDIR /app

# Criar um grupo e um utilizador não-root para a aplicação
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copiar os manifestos de dependência
COPY package.json pnpm-lock.yaml* ./

# Instalar TODAS as dependências (incluindo devDependencies como jest)
# para que o comando 'npm test' funcione no contentor.
RUN corepack enable && pnpm install --frozen-lockfile

# Copiar os artefactos do build da fase anterior
COPY --from=build /app/dist ./dist

# Copiar o código-fonte e ficheiros de configuração necessários para os testes
COPY --from=build /app/src ./src
COPY --from=build /app/test ./test
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/prisma ./prisma

# Criar a pasta de uploads e atribuir a propriedade ao utilizador da aplicação
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

# Mudar para o utilizador não-root
USER nestjs

# Expor a porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/main"]
