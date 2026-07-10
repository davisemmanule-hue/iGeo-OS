# iGeo OS Module Navigation Map

## Production Routes

| Route | Status During Audit | Screen |
| --- | --- | --- |
| `https://igeosolutionsllc.com/` | HTTP 200 | Main iGeo Operator Dashboard |
| `https://igeosolutionsllc.com/index.html` | HTTP 307 to `/` | Main dashboard redirect |
| `https://igeosolutionsllc.com/acquisition-os/full-bid-engine/` | HTTP 200 | Full Bid Engine |
| `https://igeosolutionsllc.com/api/acquisition-opportunities` | HTTP 200 when KV is bound, HTTP 503 when not configured | Canonical Acquisition opportunity API |
| `https://igeosolutionsllc.com/worker-intake.html` | HTTP 307 to `/worker-intake` | Worker Intake redirect |
| `https://igeosolutionsllc.com/worker-intake` | HTTP 200 | Worker Intake |
| `https://igeosolutionsllc.com/api/executive-email-alerts` | HTTP 500 | Gmail Executive Alerts API, not operational during audit |

## Main Dashboard Navigation

The main navigation is defined in `public/index.html`.

| User Label | Control | Route or Screen | File/ID |
| --- | --- | --- | --- |
| Today | link | `/#today` | `section#today` |
| Acquisition OS | module button | `/#acquisition-os` | `section#acquisition-os` |
| Contacts | module button | `/#prime-crm` | `section#prime-crm` |
| Quotes | module button | `/#quote-generator` | `section#quote-generator` |
| Applications | module button | `/#workforce-management` | `section#workforce-management` |
| Registrations | module button | `/#vendor-registration` | `section#vendor-registration` |
| Capability Statements | module button | `/#capability-statements` | `section#capability-statements` |
| Settings | link | `/#settings` | `section#settings` |

## Dashboard Panels

### Today

Navigation: open `/` or click `Today`.

Purpose: high-level operating metrics.

Visible cards:

- Urgent Emails
- Follow Ups Due
- Worker Applications
- Open Opportunities
- Bid Engine Items
- Registrations Pending
- Quotes Waiting
- Contracts Active

### My Day

Navigation: visible on the main page; partner shortcut `Tasks` jumps to `#my-day`.

Purpose: simple manual checklist.

Checklist items:

- Check important emails
- Follow up with primes
- Review worker applications
- Submit registrations
- Send capability statements
- Review opportunities

Current limitation: checklist is not persisted as task data.

### Alerts

Navigation: owner shortcut `Alerts`, or hash `#alerts`.

Purpose: alert badges for contracts, payments, deadlines, applications, SAM, and vendor registrations.

Current limitation: Gmail Executive Alerts API is implemented but returned HTTP 500 during audit.

### Partner View

Navigation: main page panel.

Purpose: simplified shortcuts.

Links:

- Today
- Tasks
- Applications
- Contacts
- Opportunities
- Registrations
- Capability Statements

### Owner View

Navigation: main page panel.

Purpose: owner/admin shortcuts.

Links:

- Alerts
- Settings
- Email Notifications
- Automation Status

## Acquisition OS Quick Entry Navigation

Navigation path: Main dashboard > `Acquisition OS`.

Screen: `section#acquisition-os`.

Primary controls:

- `Return to Operator Dashboard`: returns to `#today`.
- `Open Full Bid Engine`: opens `/acquisition-os/full-bid-engine/` in a new browser tab.
- `Refresh Opportunity Data`: pulls canonical Acquisition records from the shared API when available.
- `CSV Export`: exports visible Quick Entry opportunities.
- `Opportunity`: opens the Quick Entry opportunity dialog.
- Sync status pill: shows `Synced`, `Unsaved Changes`, `Sync Failed`, or `Offline Backup`.
- Last Synced: shows the latest successful canonical sync timestamp.

Quick Entry dialog:

- Opportunity Name
- Source
- Source Link
- Solicitation Type
- Solicitation Number
- Buyer / Agency
- Service Type
- NAICS
- Priority Region
- Urgent for iGeo
- Due Date
- Estimated Value
- Performance Method
- Decision Label
- Contact Name
- Contact Email
- Urgency Reason
- Notes
- Score Fields

Filters:

- Search Opportunities
- Decision
- Performance Method
- NAICS
- Service

## Full Bid Engine Navigation

Navigation path: Main dashboard > Acquisition OS > `Open Full Bid Engine`.

Route: `/acquisition-os/full-bid-engine/`.

The link uses `target="_blank"`.

Top buttons:

- `New`: create opportunity.
- `Save`: save local workspace.
- `Refresh Opportunity Data`: pulls canonical Acquisition records from the shared API when available.
- `Word`: download Word-compatible `.doc`.
- `PDF`: switch to proposal and open browser print.
- Sync status pill: shows `Synced`, `Unsaved Changes`, `Sync Failed`, or `Offline Backup`.
- Last Synced: shows the latest successful canonical sync timestamp.

Pipeline controls:

- Search title, agency, NAICS, service.
- Filter by decision.
- Select opportunity from Opportunity Pipeline.

Full Bid Engine sidebar modules:

| Module | Purpose |
| --- | --- |
| Opportunity Dashboard | Pipeline, status, deadline, source, and decision view |
| Bid Engine | Core record, performance method, score, and pursuit decision |
| Solicitation Analyzer | Scope, instructions, documents, and extracted requirements |
| Opportunity Scoring Engine | Fit, risk, subcontractability, brokerability, and urgency |
| Compliance Checklist Generator | Submission tasks, registrations, insurance, bonding, and licenses |
| Proposal Draft Generator | Generated cover, approach, staffing, and past-performance sections |
| Pricing Worksheet | Labor, supplies, partner margin, overhead, and profit |
| Subcontractor / Teaming Partner Tracker | Partner fit, services, license status, and next action |
| Incumbent Intelligence | Current vendor, contract clues, contacts, and relationship plan |
| Procurement Contact Database | Buyer, CO, specialist, and outreach history |
| Daily Acquisition Intelligence Integration | Daily source scan notes and opportunities to import |
| Google Drive Document Storage | Folder, solicitation files, drafts, pricing, and final response links |

## Prime Contractor CRM Navigation

Navigation path: top nav `Contacts`.

Screen: `section#prime-crm`.

Primary controls:

- `CSV Export`
- `Contact`
- Reset filters
- Search Companies
- Filter By Status
- Filter By Service Type
- Filter By Follow-Up Date
- Sort By Last Contact Date
- Report cards

Dialog sections:

- Company Information
- Primary Contact
- Small Business Contact
- Relationship & Communication
- Capability Statement
- Opportunity Tracking
- Services of Interest

## Workforce Management Navigation

Navigation path: top nav `Applications`.

Screen: `section#workforce-management`.

Primary controls:

- `Worker Intake Form`: opens `worker-intake.html` in a new tab; production redirects to `/worker-intake`.
- `CSV Export`
- `Add Worker`

Filters:

- Search Workers
- Service Category
- City
- State
- Status

## Worker Intake Navigation

Navigation path: Workforce Management > `Worker Intake Form`.

Live route: `/worker-intake`.

Form buttons:

- `Back to Dashboard`
- `Submit Worker Intake`

## Quote Generator Navigation

Navigation path: top nav `Quotes`.

Screen: `section#quote-generator`.

Primary controls:

- `CSV Export`
- `New Quote`
- Search Quotes

Dialog inputs:

- Client / Company Name
- Opportunity Name
- Service Type
- Location
- Estimated Hours
- Number of Workers Needed
- Worker Hourly Rate
- Supplies Cost
- Travel Cost
- Other Cost
- Markup Percentage
- Final Quote Amount
- Quote Status
- Notes

## Vendor Registration Tracker Navigation

Navigation path: top nav `Registrations`.

Screen: `section#vendor-registration`.

Primary controls:

- `CSV Export`
- `Add Registration`
- Search Registrations
- Registration Status filter

Dialog inputs:

- Company Name
- Website
- Portal Type
- Registration Status
- Date Submitted
- Login Email
- Username
- Password Hint
- Contact Name
- Contact Email
- Follow-Up Date
- Capability Statement Sent
- Notes

## Capability Statement Library Navigation

Navigation path: top nav `Capability Statements`.

Screen: `section#capability-statements`.

Controls are rendered by `public/app.js` from the `capabilityStatements` array. Actions include opening/copying/downloading/emailing capability statement content where URLs/content are configured, plus marking a statement sent.

## Settings Navigation

Navigation path: top nav `Settings`.

Screen: `section#settings`.

Controls:

- Partner Notifications
- Email Alerts
- Simple Mode
- Advanced Mode
- Partner View
- Automation Status display
