# Tatakae Nexus — Discord Management Platform

> Centralized Discord management platform and administration dashboard for Tatakae Labs. Built with a unified core business layer, Discord.js 14, Next.js, Fastify, PostgreSQL, Prisma, Redis, and BullMQ.

---

## 🏛️ Architecture Overview

Tatakae Nexus is built as a production-grade TypeScript monorepo where the **Discord Bot** and **Web Administration Dashboard** share the exact same business logic, database transactions, authorization checks, and audit trails.

```
                          ┌────────────────────────┐
                          │     Discord Server     │
                          │  (Commands / Modals)   │
                          └───────────┬────────────┘
                                      │
                                      ▼
┌────────────────────────┐    ┌────────────────────┐
│ Next.js Admin Web App  │───▶│   Discord Adapter  │
│  (Discord OAuth2 Auth) │    │  (apps/bot - d.js) │
└───────────┬────────────┘    └──────────┬─────────┘
            │                            │
            ▼                            ▼
   ┌───────────────────────────────────────────────┐
   │       Fastify REST API & Core Services        │
   │  (apps/api + packages/core business logic)   │
   └───────────────┬──────────────┬────────────────┘
                   │              │
                   ▼              ▼
          ┌────────────────┐  ┌───────────────────┐
          │   PostgreSQL   │  │   Redis & BullMQ  │
          │ (Prisma Model) │  │ (Background Queue)│
          └────────────────┘  └─────────┬─────────┘
                                        │
                                        ▼
                              ┌───────────────────┐
                              │ Background Worker │
                              │   (apps/worker)   │
                              └───────────────────┘
```

---

## 📦 Monorepo Structure

```
tatakae-nexus/
├── apps/
│   ├── api/             # Fastify REST API & shared server layer
│   ├── bot/             # Discord.js 14 Bot application
│   ├── dashboard/       # Next.js 15 App Router administration dashboard
│   └── worker/          # BullMQ queue processor & automation worker
├── packages/
│   ├── config/          # Unified Zod environment configuration
│   ├── core/            # Domain entities, repositories & business services
│   ├── database/        # Prisma schema, migrations & seeders
│   ├── logger/          # Structured Pino logger with correlation IDs
│   └── shared/          # Permission definitions, enums & shared DTOs
├── infrastructure/
│   ├── docker/          # Dockerfiles for each service
│   ├── nginx/           # Reverse proxy configuration
│   └── scripts/         # Automated backup & restore routines
├── docs/                # Architecture, API & deployment documentation
├── docker-compose.yml   # Local containerized development stack
└── turbo.json           # Turborepo task pipeline configuration
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20+ or v22 LTS
- **pnpm**: v9+ / v10+
- **Docker & Docker Compose**: For PostgreSQL 17 and Redis 7

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your Discord Application credentials:
```bash
cp .env.example .env
```

### 3. Start Database & Redis via Docker
```bash
docker compose up -d postgres redis
```

### 4. Install Dependencies & Migrate Database
```bash
pnpm install
pnpm db:generate
pnpm db:push
```

### 5. Run Development Suite
```bash
pnpm dev
```
- **Dashboard**: `http://localhost:3000`
- **REST API**: `http://localhost:4000` (Swagger docs at `/docs`)
- **Bot**: Connects automatically using `DISCORD_TOKEN`
- **Worker**: Processes reminders, ticket timeouts, and automations

