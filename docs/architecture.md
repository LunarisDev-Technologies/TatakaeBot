# Tatakae Nexus — Architectural Blueprint & Specification

## 1. System Vision
Tatakae Nexus is an enterprise-grade Discord management platform designed for Tatakae Labs. Rather than treating bot commands and web dashboard features as disparate scripts, Nexus unifies all business logic, authorization rules, state transitions, and audit records into a single shared core.

## 2. Shared Core Architecture
```
+-----------------------------------------------------------------+
|                         CLIENT CONSUMERS                        |
|   - Discord Bot Adapter (Discord.js 14)                         |
|   - Web Administration Dashboard (Next.js 15)                   |
|   - Background Automation Worker (BullMQ)                       |
+-----------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------+
|                       SHARED BUSINESS CORE                      |
|                  (@tatakae/core & @tatakae/shared)              |
|                                                                 |
|   - Ticket State Machine & Transcript Generator                 |
|   - Booking Engine & Atomic Double-Booking Lock                 |
|   - Moderation Enforcement & Escalation Manager                 |
|   - Immutable Audit Logger                                      |
+-----------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------+
|                         DATA PERSISTENCE                        |
|   - PostgreSQL 17 (Prisma ORM - Primary Authoritative Store)    |
|   - Redis 7 (BullMQ Job Queues & Distributed Heartbeats)        |
+-----------------------------------------------------------------+
```

## 3. Module Boundaries
1. **Tickets**: Full lifecycle state machine (`OPEN` -> `CLAIMED` -> `IN_PROGRESS` -> `WAITING` -> `RESOLVED` -> `CLOSED`), form schemas, channel isolation, transcripts, and ratings.
2. **Bookings**: Multi-service scheduling, staff availability matrices, time-slot generation, and PostgreSQL transactional locks against concurrent overlapping bookings.
3. **Moderation**: Case records, warnings, timeouts, kicks, bans, user restrictions, and appeal workflows.
4. **Audit Logs**: Immutable log recording every administrative decision and automated trigger.

