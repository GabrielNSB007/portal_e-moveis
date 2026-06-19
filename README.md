<div align="center">

# 🏠 Portal E-móveis

**Matchmaking imobiliário ativo** — conectando compradores e vendedores automaticamente, sem busca manual.


[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.12.1-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## 📖 Sobre o projeto

**Portal E-móveis** é uma plataforma imobiliária de **matchmaking ativo**. Em vez do modelo tradicional — onde o comprador caça anúncios e o vendedor espera passivamente —, o sistema cruza de forma assíncrona os **perfis de demanda** dos clientes com os **anúncios estruturados** dos vendedores.

Quando uma compatibilidade é encontrada, ela alimenta o **Hub de Oportunidades**, onde corretores conduzem a negociação direta entre as partes — eliminando a fricção da busca manual e a inércia da espera.

### ✨ Principais funcionalidades

- 🔐 **Autenticação** de clientes e vendedores (JWT + recuperação de senha)
- 🏘️ **Anúncios estruturados** (tipo, mídia, comodidades, status)
- 🎯 **Matchmaking automático** entre preferências de busca e ofertas disponíveis
- 💬 **Hub de Oportunidades** com propostas e negociação direta
- 🔔 **Notificações** e histórico de visualizações/visitas
- ⭐ **Favoritos** (ofertas salvas)
- 📊 **Analytics** de desempenho dos anúncios

---

## 🧱 Stack tecnológica

| Camada | Tecnologias |
| --- | --- |
| **Frontend** | React 19 · TypeScript · Vite · TanStack Router/Start · TanStack Query · Tailwind CSS 4 · Radix UI |
| **Backend** | Node.js · Express · TypeScript · Prisma ORM · JWT · Zod |
| **Banco de dados** | PostgreSQL 15 (via Docker) |
| **Gerenciador de pacotes** | pnpm (workspaces) |

O repositório é um **monorepo pnpm**, dividido em dois pacotes:

```
portal_e-moveis/
├── client/   # Aplicação React (Vite + TanStack)
└── server/   # API REST (Express + Prisma)
```

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/en/) v18 ou superior
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (em execução)

---

## 🚀 Como rodar o projeto localmente

> O projeto roda em **dois processos simultâneos**: a API (back-end) e a aplicação web (front-end). Recomenda-se usar **dois terminais**.

### 1. Instale as dependências do monorepo

Na raiz do projeto:

```bash
pnpm install
```

### 2. Configure as variáveis de ambiente do servidor

Dentro de `server/`, crie um arquivo `.env` com a connection string do banco (compatível com o `docker-compose.yml`):

```env
DATABASE_URL="postgresql://admin:adminpassword@localhost:5433/emoveis?schema=public"
PORT=8080
```

### 3. Suba o banco de dados (PostgreSQL via Docker)

```bash
cd server
docker compose up -d
cd ..
```

### 4. Gere o client e sincronize o schema do Prisma

```bash
pnpm --dir server exec prisma generate
pnpm --dir server exec prisma db push
```

### 5. Inicie a API (back-end)

```bash
pnpm --dir server run dev
```

A API sobe por padrão em **http://localhost:8080**.

### 6. Em outro terminal, inicie o front-end

```bash
pnpm --dir client run dev
```

A aplicação web sobe por padrão em **http://localhost:5173**.

---

## 📜 Resumo rápido dos comandos

```bash
# instalação
pnpm install

# banco de dados
cd server
docker compose up -d
cd ..

# prisma
pnpm --dir server exec prisma generate
pnpm --dir server exec prisma db push

# back-end
pnpm --dir server run dev

# front-end (em outro terminal)
pnpm --dir client run dev
```

---

## 🧪 Testes

O back-end utiliza [Vitest](https://vitest.dev/) para testes automatizados:

```bash
pnpm --dir server run test        # executa os testes uma vez
pnpm --dir server run test:watch  # executa em modo watch
```

---

## 🌱 Populando o banco com dados de exemplo (seed)

O servidor inclui um script de *seed* para popular o banco com dados fictícios de imóveis:

```bash
pnpm --dir server run seed
```

> Veja `server/prisma/SEEDING.md` para detalhes sobre o processo de geração dos dados.

---

## 🗄️ Modelo de dados

O schema do Prisma (`server/prisma/schema.prisma`) define as principais entidades do domínio:

`User` · `UserProfile` · `Offer` (anúncio) · `OfferMedia` · `Preference` (perfil de demanda) · `Match` · `OfferView` · `OfferVisit` · `SavedOffer` · `Notification` · `Proposal`

---

## 📂 Estrutura do back-end

```
server/src/
├── controllers/    # Camada de entrada das requisições HTTP
├── services/        # Regras de negócio (ex.: MatchMakingService)
├── repositories/    # Acesso a dados via Prisma
├── routes/          # Definição de rotas (com decorators)
├── schemas/         # Validação de payloads com Zod
├── middleware/        # Autenticação, validação, etc.
└── DTOs/             # Contratos de entrada/saída
```