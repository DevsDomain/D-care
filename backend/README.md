<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# Backend (NestJS) — Guia de Execução

Backend em **NestJS** para o projeto

---

## 📦 Pré-requisitos

- **Node.js 20+** e **pnpm**
  ```bash
  node -v
  corepack enable
  corepack prepare pnpm@9.6.0 --activate
  ```

- **Docker + Docker Compose**
  ```bash
  docker -v
  docker compose version
  ```

- **Sistema Operacional**
  - Ubuntu 22.04 (ou compatível)

---

## 🔽 Clonar o repositório

```bash
git clone https://github.com/DevsDomain/D-care.git
cd D-care
```

---

## ⚙️ Variáveis de Ambiente

Nunca versionamos segredos reais. O fluxo é:

- **`.env.example`** → arquivo versionado com placeholders (pode ser commitado).  
- **`.env.docker`** → arquivo local (não commitado), usado pelo `docker-compose`.  
- **`backend/.env`** → arquivo local (não commitado), usado pelo backend NestJS.  

### Exemplo de arquivos

#### `.env.docker` (na raiz do repo, **NÃO versionar**)
```env
POSTGRES_USER=care
POSTGRES_PASSWORD=carepass
POSTGRES_DB=caredb
DB_PORT=5432
```

#### `backend/.env` (**NÃO versionar**)
```env
NODE_ENV=development
PORT=3000
API_GLOBAL_PREFIX=/api/v1

JWT_SECRET=dev-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

AWS_REGION=us-east-1
AWS_S3_BUCKET=my-care-bucket

DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${DB_PORT}/caredb?schema=public

AWS_REGION=us-east-1
AWS_S3_BUCKET=my-care-bucket
```

---

## 🐘 Subir PostgreSQL com Docker

O `docker-compose.yml` está versionado, mas não contém segredos (eles vêm do `.env.docker`).

```bash
docker compose up -d
```

> ⚠️ Se a porta **5432** já estiver em uso, altere no `.env.docker`:
> ```env
> DB_PORT=5433
> ```
> e ajuste o `DATABASE_URL` em `backend/.env`.

---

## 📥 Instalar dependências e configurar ORM

```bash
cd backend
pnpm install
pnpx prisma migrate dev
pnpm prisma generate
```

> ⚠️ As migrations serão adicionadas quando o schema estiver pronto.

---

## 🚀 Rodar a API em modo desenvolvimento

```bash
pnpm start:dev
```

A API ficará disponível em:

👉 [http://localhost:3000/api/v1](http://localhost:3000/api/v1)

## Arquitetura do Backend

```
backend/
└── src/
    ├── app.module.ts
    ├── main.ts
    │
    ├── common/                      # Recursos compartilhados (cross-cutting)
    │   ├── dto/
    │   ├── guards/
    │   ├── interceptors/
    │   ├── filters/
    │   ├── pipes/
    │   └── utils/
    │
    ├── database/                    # Infra de dados (ORM/Prisma/TypeORM)
    │   ├── database.module.ts
    │   ├── entities/
    │   ├── migrations/
    │   └── repositories/
    │
    ├── auth/                        # Autenticação/Autorização (JWT, refresh, etc.)
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   └── dto/
    │
    ├── perfis/                      # Perfis de usuário (CRUD)
    │   ├── perfis.module.ts
    │   ├── perfis.controller.ts
    │   ├── perfis.service.ts
    │   └── dto/
    │
    ├── idosos/                      # Domínio Idosos (CRUD e regras)
    │   ├── idosos.module.ts
    │   ├── idosos.controller.ts
    │   ├── idosos.service.ts
    │   └── dto/
    │
    ├── disponibilidade/             # Janelas de disponibilidade
    │   ├── disponibilidade.module.ts
    │   ├── disponibilidade.controller.ts
    │   ├── disponibilidade.service.ts
    │   └── dto/
    │
    ├── agendamentos/                # Agendamentos/consultas
    │   ├── agendamentos.module.ts
    │   ├── agendamentos.controller.ts
    │   ├── agendamentos.service.ts
    │   └── dto/
    │
    ├── reviews/                     # Avaliações e feedbacks
    │   ├── reviews.module.ts
    │   ├── reviews.controller.ts
    │   ├── reviews.service.ts
    │   └── dto/
    │
    ├── ivcf/                        # IVCF-20 (índice de vulnerabilidade)
    │   ├── ivcf.module.ts
    │   ├── ivcf.controller.ts
    │   ├── ivcf.service.ts
    │   └── dto/
    │
    ├── ai-proxy/                    # Proxy para serviços de IA
    │   ├── ai-proxy.module.ts
    │   ├── ai-proxy.controller.ts
    │   ├── ai-proxy.service.ts
    │   └── dto/
    │
    └── uploads/                     # Upload e gerenciamento de arquivos
        ├── uploads.module.ts
        ├── uploads.controller.ts
        ├── uploads.service.ts
        └── dto/
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
