# Tatakae Nexus — Permission & Security Matrix

## 1. Application Role Hierarchy
Tatakae Nexus decouples Discord platform permissions from internal application authorization. A user's internal role determines access to dashboard capabilities, ticket reassignment, booking slot management, and audit inspection.

```
       [ ADMINISTRATOR ]
              │
              ▼
        [ MANAGER ]
              │
              ▼
       [ MODERATOR ]
              │
              ▼
        [ SUPPORT ]
              │
              ▼
        [ MEMBER ]
```

## 2. Capabilities Matrix

| Permission Capability | Administrator | Manager | Moderator | Support | Member |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Web Dashboard Access** | ✅ Full | ✅ Full | ⚠️ Limited | ⚠️ Limited | ❌ None |
| **Ticket Oversight** | ✅ All | ✅ All | ✅ All | ✅ Claimed | 👤 Own |
| **Claim & Close Tickets**| ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 👤 Own Close |
| **View Transcripts** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Booking Approvals** | ✅ Yes | ✅ Yes | ⚠️ View Only | ⚠️ View Only | 👤 Own |
| **Manage Availability** | ✅ All Staff| ⚠️ Assigned | ⚠️ Own | ❌ No | ❌ No |
| **Warn & Timeout** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Kick & Ban** | ✅ Yes | ⚠️ Escalation | ✅ Yes | ❌ No | ❌ No |
| **AutoMod Rule Config** | ✅ Yes | ⚠️ View Only | ❌ No | ❌ No | ❌ No |
| **Audit Logs Inspection**| ✅ Full | ✅ Full | ⚠️ Mod Cases | ❌ No | ❌ No |
| **Server Configuration** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |

## 3. Security Guidelines
- Secrets are stored exclusively in environment variables and never logged or serialized to client bundles.
- All database queries use Prisma parameterized models preventing SQL injection.
- Discord interaction deadlines (3s limit) are strictly respected via optimistic deferrals.
- Audit trails are append-only.

