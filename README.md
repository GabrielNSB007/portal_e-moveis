# portal_e-moveis
**Portal E-móveis** is an active matchmaking real estate platform developed at CIn-UFPE. It eliminates manual searching for buyers and passivity for sellers by asynchronously crossing demand profiles with structured property listings. Through an Opportunity Hub, brokers execute direct negotiations.

## ⚙️ Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:
* [Node.js](https://nodejs.org/en/) (v18 ou superior)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Rodando)
* [pnpm](https://pnpm.io/pt/) (`npm install -g pnpm`)

---

## 🚀 Como rodar o projeto localmente

Como o projeto é dividido em duas partes, você precisará de **dois terminais** abertos.

### 1. Configurando o Back-end (Server)

Abra o primeiro terminal na raiz do projeto e acesse a pasta do servidor:
```bash
cd server
```
```bash
pnpm install
```

Duplique o arquivo `.env.example` e renomeie para `.env`

Suba o banco de dados:
```bash
docker-compose up -d
```
Rode as migrations:
```bash
pnpm prisma migrate dev --name init