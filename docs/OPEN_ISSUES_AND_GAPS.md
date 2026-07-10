# iGeo OS Open Issues and Gaps

## Critical Gaps

### 1. Gmail Executive Alerts API Fails in Production

Status: live route `/api/executive-email-alerts` returned HTTP 500 during audit.

Files:

- `worker.js`
- `public/app.js`

Likely dependency:

- Missing or invalid Cloudflare Worker secrets:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REFRESH_TOKEN`

Impact:

- Today and Alerts cannot reliably show Gmail-derived executive alert counts.

Needed next action:

- Verify Worker secrets and return a visible JSON error body for easier diagnosis.

### 2. No Shared Canonical Opportunity Database

Status: incomplete.

Current stores:

- Canonical Acquisition store: `igeo_canonical_acquisition_opportunities`.
- Quick Entry compatibility view: `igeo_acquisition_opportunities`.
- Full Bid Engine compatibility view: `igeo-acquisition-os`.
- Prime CRM opportunity fields: inside each CRM record.
- Quote Generator opportunity name: inside quote records.

Impact:

- Opportunity details can drift.
- Duplicate entry is required.
- Acquisition Quick Entry and Full Bid Engine work now share one canonical `opportunityId`.
- Proposal, quote, CRM, and partner work outside Acquisition are not yet tied to the canonical opportunity ID.

Needed next action:

- Define a canonical opportunity model and sync Quick Entry and Full Bid Engine both directions.

### 3. Acquisition Cloud Source Requires KV Binding

Status: implemented in code, configuration-dependent in production.

What works:

- Quick Entry and Full Bid Engine now share canonical records by `opportunityId`.
- Existing Quick Entry and Full Bid Engine records migrate into the canonical schema on load.
- Duplicates are prevented by `opportunityId` and normalized `solicitationNumber`.
- Local two-way sync works through localStorage compatibility stores and storage events.
- The UI exposes `Synced`, `Unsaved Changes`, `Sync Failed`, `Offline Backup`, and Last Synced states.

What does not work:

- Production cross-device sync requires a Cloudflare KV namespace bound as `ACQUISITION_OPPORTUNITIES`.
- If that binding is missing, the API returns a configuration error and the browser keeps using offline localStorage backup.

Impact:

- Laptop and iPhone will only show the same Acquisition opportunity data after the Cloudflare KV binding is active and both devices refresh/sync.

### 4. Proposal Automation Is Local and Manual

Status: partially working.

What works:

- Proposal draft generation from active Full Bid Engine opportunity.
- Word-compatible `.doc` export.
- Browser print/PDF export.

What does not work:

- No DOCX generation.
- No server-side PDF generation.
- No Google Drive storage.
- No submission checklist-to-document package workflow.
- No automatic use of solicitation attachments.

Impact:

- The user must manually review, complete, export, store, and submit proposal materials.

## Major Duplicate Entry Points

### Acquisition and CRM

Duplicate data:

- Opportunity name.
- Solicitation number.
- Estimated value.
- Due date.
- Notes.

Current reason:

- Prime CRM opportunity fields are embedded in CRM relationship records.
- Acquisition opportunities are separate records.

### Full Bid Engine and Quote Generator

Duplicate data:

- Pricing assumptions.
- Service type.
- Client/opportunity name.
- Final quote amount.

Current reason:

- Full Bid Engine Pricing Worksheet and Quote Generator are separate local modules.

### Full Bid Engine Contacts and CRM Contacts

Duplicate data:

- Agency/buyer/CO/specialist contacts.
- Prime contractor contacts.
- Outreach notes.

Current reason:

- Full Bid Engine Procurement Contact Database is separate from Prime CRM.

### Full Bid Engine Partners and Workforce

Duplicate data:

- Subcontractor or teaming partner names.
- Service coverage.
- License/credential status.
- Contact details.

Current reason:

- Partner Tracker and Workforce Management are separate local data models.

### Vendor Registration and CRM

Duplicate data:

- Company names.
- Websites.
- Contact names/emails.
- Follow-up dates.

Current reason:

- Vendor Registration Tracker has its own record model.

### Capability Statement Activity and CRM

Duplicate data:

- Capability statement sent status.
- Outreach notes.

Current reason:

- Capability Statement Library sent count is a global counter, not tied to CRM or Acquisition records.

## Integration Gaps

### Google Sheets

Active:

- Prime CRM.
- Worker Intake.

Inactive:

- Acquisition Quick Entry and Full Bid Engine do not use Google Sheets; they use the canonical Cloudflare API/KV path when configured.
- Quote Generator.
- Vendor Registration Tracker.
- Manual Workforce records.
- Capability Statement activity.

### Google Drive

Status: inactive.

Config:

- `googleDrive.enabled: false`.

Impact:

- Full Bid Engine Drive module is manual.
- Documents and exports are not automatically stored.

### Gmail

Status: Worker API implemented but failing during audit.

Config:

- Client-side `gmail.enabled: false`.
- Worker route uses Cloudflare secrets.

Impact:

- Settings and actual Worker API health are not clearly connected.

## Production and Deployment Gaps

### Wrangler Non-Interactive Deploy Requires Token

Status: observed during prior deploy attempt.

Issue:

- Wrangler requires `CLOUDFLARE_API_TOKEN` in non-interactive shell.

Impact:

- Manual deploy from automation shell can be blocked.

### OneDrive Git Index Noise

Status: recurring local issue.

Observed symptoms:

- `git status` shows stale or confusing modifications/deletions.
- Temporary index commits were needed for clean commits.

Impact:

- Risk of accidentally committing unrelated changes if normal staging is used casually.

Mitigation:

- Use clean temporary index or clean worktree for commits/deployments.

## Module-Specific Gaps

### Acquisition Quick Entry

- Cloud sync path exists through `/api/acquisition-opportunities`, but production requires the `ACQUISITION_OPPORTUNITIES` KV binding.
- No attachment handling.
- No PDF upload.
- No live solicitation import.
- CRM, Quotes, Vendors, Workforce, and Drive are not connected to canonical opportunity records.

### Full Bid Engine

- Self-contained single HTML file.
- Cloud sync path exists through `/api/acquisition-opportunities`, but production requires the `ACQUISITION_OPPORTUNITIES` KV binding.
- No external file storage.
- No true DOCX export.
- PDF is print-based.
- Browser-to-main-dashboard update path exists through canonical localStorage and storage events.

### Prime CRM

- Opportunity fields are not linked to Acquisition records.
- Offline queue has no detailed management screen.
- Requires Apps Script schema consistency.

### Workforce Management

- Manual records stay local.
- Worker Intake records can be read, but local edits do not write back.

### Worker Intake

- No offline fallback.
- Public form depends on Apps Script availability.

### Quote Generator

- No PDF export in active UI.
- No Google Sheets sync.
- Not linked to Full Bid Engine pricing.

### Vendor Registration Tracker

- Google Sheets config is disabled.
- Endpoint is placeholder.
- No document storage.

### Capability Statements

- Static library data.
- Sent activity not tied to CRM or Acquisition.
- Document URLs must be configured manually.

## Broken or Incomplete Connections

| Connection | Current State |
| --- | --- |
| Quick Entry -> Full Bid Engine | Implemented through canonical opportunity sync |
| Full Bid Engine -> Quick Entry | Implemented through canonical opportunity sync |
| Acquisition cloud source of truth | API implemented; requires `ACQUISITION_OPPORTUNITIES` KV binding |
| Acquisition -> Prime CRM | Missing |
| Full Bid Engine Pricing -> Quote Generator | Missing |
| Full Bid Engine Partners -> Workforce/CRM | Missing |
| Procurement Contacts -> CRM | Missing |
| Vendor Registration -> CRM/Contacts | Missing |
| Capability sent -> CRM activity | Missing |
| Full Bid Engine -> Google Drive | Manual only |
| Gmail Executive Alerts -> Dashboard | Implemented but production API failed during audit |

## Recommended Single Next Automation

Bind and validate the canonical Acquisition opportunity cloud store in Cloudflare.

Why this first:

- Acquisition OS is now built around one canonical opportunity record.
- The code path is in place, but production cross-device sync depends on the KV namespace binding.
- It is the smallest next step before connecting CRM, Quotes, Vendors, Drive, or proposal package automation.

Minimum scope:

- Create or reuse a Cloudflare KV namespace.
- Bind it to the Worker as `ACQUISITION_OPPORTUNITIES`.
- Deploy the Worker.
- Confirm `/api/acquisition-opportunities` returns `ok: true`.
- Test one Quick Entry record from laptop to iPhone and one Full Bid Engine edit from iPhone to laptop.

Later extension:

- Link CRM opportunity fields to canonical opportunities.
- Link Quote Generator records to canonical opportunities.
- Store proposal exports in Google Drive.
