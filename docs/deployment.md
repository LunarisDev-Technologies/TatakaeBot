# Tatakae Nexus — Deployment Guide

## 1. Local Containerized Stack
The entire Tatakae Nexus platform runs out of the box with Docker Compose.

```bash
# 1. Clone repository & configure environment
cp .env.example .env
# Edit .env with your Discord Token and Client ID

# 2. Launch PostgreSQL & Redis
docker compose up -d postgres redis

# 3. Initialize Prisma Database Schema
pnpm db:push
pnpm db:seed

# 4. Launch all micro-applications
docker compose up -d
```

## 2. Ports & Routing
- **Administration Dashboard**: `http://localhost:3000`
- **Fastify REST API**: `http://localhost:4000`
- **Swagger Documentation**: `http://localhost:4000/docs`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **Discord Bot**: Outgoing connection to Discord Gateway WebSocket
- **Automation Worker**: Internal queue consumer

