# Tatakae Nexus — REST API Specification

The Fastify REST API powers the administration dashboard and automation webhooks. Live interactive Swagger documentation is served at `/docs`.

## 1. Core Endpoints

### Health & Telemetry
- `GET /health`: Platform heartbeat & uptime check

### System Overview
- `GET /api/guilds/:guildId/overview`: Consolidated telemetry stats & recent activity feed

### Ticket Management
- `GET /api/guilds/:guildId/tickets`: List tickets with optional status & category query filters
- `GET /api/guilds/:guildId/ticket-categories`: Retrieve active support categories
- `GET /api/tickets/:ticketId`: Complete ticket detail with notes, assignments, and participants
- `POST /api/tickets`: Create a ticket programmatically
- `POST /api/tickets/:ticketId/claim`: Claim ticket for a staff member
- `POST /api/tickets/:ticketId/assign`: Assign ticket to a staff member
- `PATCH /api/tickets/:ticketId/status`: Update status (e.g. resolve, close)
- `PATCH /api/tickets/:ticketId/priority`: Adjust ticket priority level
- `POST /api/tickets/:ticketId/notes`: Post internal staff-only note
- `GET /api/tickets/:ticketId/transcript`: Render conversation HTML transcript

### Booking & Appointments
- `GET /api/guilds/:guildId/bookings`: List scheduled appointments
- `GET /api/guilds/:guildId/booking-services`: Retrieve active booking services
- `GET /api/booking-services/:serviceId/slots?date=YYYY-MM-DD`: Compute available non-conflicting time slots
- `POST /api/bookings`: Book an appointment with atomic slot reservation
- `PATCH /api/bookings/:bookingId/status`: Confirm or cancel booking

### Moderation & Enforcement
- `GET /api/guilds/:guildId/moderation/cases`: Fetch recent disciplinary cases
- `GET /api/guilds/:guildId/moderation/users/:userId/history`: Fetch user moderation case history
- `POST /api/guilds/:guildId/moderation/cases`: Record warning, timeout, kick, or ban case

### Audit History
- `GET /api/guilds/:guildId/audit-logs?limit=50&offset=0`: Retrieve immutable administrative log entries

