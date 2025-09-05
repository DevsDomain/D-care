
# Estágio de Desenvolvimento
FROM node:20-alpine AS development

# Instalar dependências do sistema para compilar libs nativas (se precisar)
RUN apk add --no-cache python3 make g++

# Diretório de trabalho
WORKDIR /app

# Copiar apenas arquivos de manifesto primeiro (melhor pro cache)
COPY package.json pnpm-lock.yaml* ./

# Habilitar pnpm e instalar dependências
RUN corepack enable && pnpm install --frozen-lockfile

# Copiar o resto do código da aplicação
COPY . .

# Expor a porta padrão do Vite
EXPOSE 5173

# Comando para iniciar o servidor de desenvolvimento do Vite
# A flag '--host' é crucial para expor o servidor para fora do container
CMD ["pnpm", "dev", "--", "--host"]
