# Tatakae Nexus — Discord Slash Command Reference

| Command | Subcommand | Description | Required Permissions |
| :--- | :--- | :--- | :--- |
| `/setup` | - | Initialize guild database records and configure audit channels | `Administrator` |
| `/dashboard` | - | Retrieve single-sign-on link for the Web Control Center | None |
| `/ticket` | `panel` | Publish interactive support center panel with categories | `ManageGuild` |
| `/ticket` | `claim` | Claim the active ticket channel to your staff identity | Registered Staff |
| `/ticket` | `close` | Mark ticket closed, generate HTML transcript, archive channel | Staff / Creator |
| `/ticket` | `add` | Add another user to the active private ticket channel | Staff |
| `/ticket` | `transcript`| Generate and attach the complete HTML transcript | Staff |
| `/booking` | `services` | View available appointment services & trigger booking modal | None |
| `/booking` | `list` | View your scheduled appointments and consultations | None |
| `/mod` | `warn` | Issue an official recorded warning to a member | `ModerateMembers` |
| `/mod` | `timeout` | Apply temporary timeout to a member (minutes) | `ModerateMembers` |
| `/mod` | `kick` | Kick a member with reason recorded to database | `KickMembers` |
| `/mod` | `ban` | Ban a member from the guild with reason recorded | `BanMembers` |
| `/mod` | `history` | Inspect disciplinary case history and warning points | `ModerateMembers` |

