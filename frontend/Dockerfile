# Estágio de Desenvolvimento
FROM node:20-alpine AS development

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de manifesto de pacotes
COPY package.json pnpm-lock.yaml ./

# Instala o pnpm e as dependências (baseado no seu backend/README.md)
RUN corepack enable
RUN pnpm install

# Copia o resto do código da aplicação
COPY . .

# Expõe a porta padrão do Vite
EXPOSE 5173

# Comando para iniciar o servidor de desenvolvimento do Vite
# A flag '--host' é crucial para expor o servidor para fora do container
CMD ["pnpm", "dev", "--", "--host"]
