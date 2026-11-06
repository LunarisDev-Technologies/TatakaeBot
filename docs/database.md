# Tatakae Nexus — Database Data Model Specification

## 1. Relational Entity Overview
PostgreSQL 17 serves as the single source of truth across all 14 platform modules.

```
+-------------------------------------------------------------+
|                          GUILD                              |
| id (Snowflake PK), name, icon, ownerId, active              |
+-------------------------------------------------------------+
   │               │                   │
   ▼               ▼                   ▼
+-----------+   +---------------+   +-------------------------+
|  MEMBERS  |   | TICKET CATEG  |   | BOOKING SERVICES        |
+-----------+   +---------------+   +-------------------------+
   │               │                   │
   ▼               ▼                   ▼
+-----------+   +---------------+   +-------------------------+
| STAFF     |   | TICKETS       |   | BOOKINGS                |
+-----------+   +---------------+   +-------------------------+
                   │                   │
                   ▼                   ▼
                +---------------+   +-------------------------+
                | TRANSCRIPTS   |   | REMINDERS               |
                +---------------+   +-------------------------+
```

## 2. Key PostgreSQL Rules
1. **Multi-Tenancy Readiness**: Every tenant record carries `guildId`.
2. **Snowflake Integrity**: Discord IDs are stored as strings (`VARCHAR`) rather than 64-bit integers to prevent JavaScript precision loss.
3. **Double-Booking Prevention**: Transactional slot locking guarantees atomic appointment scheduling.
4. **Audit Immutability**: `audit_logs` records all state transitions and cannot be mutated by API callers.

