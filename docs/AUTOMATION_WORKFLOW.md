# iGeo OS Automation Workflow

## Automation Status Summary

The system has several small automations, but it is not yet a fully automated acquisition pipeline. Most modules require manual entry and manual review. The strongest live automations are:

- Prime CRM save/sync/offline queue to Google Sheets.
- Worker Intake submission to Google Sheets with readback verification.
- Acquisition Quick Entry security and urgency rules.
- Acquisition canonical opportunity sync between Quick Entry and Full Bid Engine, with Cloudflare KV as the intended source of truth and localStorage as offline backup.
- Full Bid Engine scoring, checklist generation, proposal draft generation, Word export, and print/PDF flow.

The largest incomplete automation is end-to-end opportunity intake through proposal package generation and cloud storage.

## Main Dashboard Automations

### Dashboard Metric Rendering

Trigger: page load, module save/delete, render cycle.

Files:

- `public/app.js`
- `public/index.html`

Behavior:

- Reads local collections.
- Updates Today cards and alert counts.
- Updates module metrics.

Limitations:

- Metrics reflect the current browser's local state plus any module-specific sync already completed.

### View Mode Settings

Trigger: user toggles settings.

Files:

- `public/app.js`

Behavior:

- Saves settings into `igeo_operator_view_mode`.
- Applies simple/advanced/partner classes and toggles.

Limitations:

- Settings are local to browser/device.

## Acquisition Quick Entry Automations

### Security Guardrail

Trigger:

- Changing Service Type.
- Changing score fields.
- Saving opportunity.

Files:

- `public/app.js`

Behavior:

- Detects service types containing security, guard, or patrol.
- Checks Security licensing required.
- Changes Self-perform to Subcontract for security work.
- Sets decision to Subcontractor Needed unless ignored.

Limitations:

- Does not verify actual licenses, insurance, personnel, or compliance documents.

### Michigan Urgency Rule

Trigger:

- Changing Priority Region.
- Changing score fields.
- Saving opportunity.

Files:

- `public/app.js`

Behavior:

- If region is one of the priority Michigan markets and opportunity fits criteria, marks `Urgent for iGeo` as YES and writes an urgency reason.

Priority regions:

- Grand Rapids
- Kalamazoo
- Lansing
- Holland
- West Michigan
- Detroit
- Kent County
- Ottawa County
- Ingham County
- Wayne County
- Oakland County
- Macomb County

Limitations:

- Requires selected Priority Region; there is no geocoding or automatic location extraction.

### Canonical Acquisition Opportunity Sync

Trigger:

- Main app load.
- Quick Entry save.
- Quick Entry delete.
- Full Bid Engine load.
- Full Bid Engine save/edit.
- Refresh Opportunity Data button.

Files:

- `public/app.js`
- `public/acquisition-sync.js`
- `public/acquisition-os/full-bid-engine/index.html`
- `worker.js`

Behavior:

- Migrates existing Quick Entry records and Full Bid Engine records into one canonical schema.
- Assigns and preserves a permanent `opportunityId`.
- Maps canonical records into Quick Entry fields and Full Bid Engine fields.
- Writes Quick Entry edits and Full Bid Engine edits back to the same canonical record.
- Prevents duplicates by merging on `opportunityId` and normalized `solicitationNumber`.
- Uses newest `updatedAt` as the conflict rule.
- Shows sync state as `Synced`, `Unsaved Changes`, `Sync Failed`, or `Offline Backup`.
- Shows Last Synced after a successful cloud pull or push.
- Attempts cloud sync through `/api/acquisition-opportunities` when the `ACQUISITION_OPPORTUNITIES` KV binding exists.

Limitations:

- Cross-device sharing requires the Cloudflare KV namespace binding to exist in production.
- CRM, Quotes, Vendors, Workforce, and Drive are intentionally not connected to the canonical opportunity record yet.
- LocalStorage remains the fallback if the API is unavailable.

## Full Bid Engine Automations

### Intake Parsing

Trigger: user pastes text and clicks `Parse Intake`.

Files:

- `public/acquisition-os/full-bid-engine/index.html`

Behavior:

- Attempts to extract title, agency, source, deadline, NAICS, service, solicitation text, instructions, requirements, and missing requirements from pasted text.

Limitations:

- Text parsing only.
- No live scraping.
- No PDF upload or OCR.
- Extraction can miss fields or require manual correction.

### Scoring

Trigger:

- User changes score checkboxes.
- Active opportunity changes.

Files:

- `public/acquisition-os/full-bid-engine/index.html`

Behavior:

- Adds points for favorable flags.
- Subtracts points for risk flags.
- Applies additional security logic.
- Produces a 0-100 score.

Limitations:

- Scoring model is hard-coded.

### Decision Label

Trigger: score calculation and opportunity render.

Files:

- `public/acquisition-os/full-bid-engine/index.html`

Behavior:

- Returns Ignore, Subcontractor Needed, Pursue Immediately, Worth Reviewing, or Build Relationship based on score, status, performance method, and security flags.

Limitations:

- Decision label is advisory; no approval workflow.

### Compliance Checklist Generation

Trigger: opening Compliance Checklist Generator.

Files:

- `public/acquisition-os/full-bid-engine/index.html`

Behavior:

- Builds checklist rows from opportunity data and risk fields.
- Allows user to mark items done.
- Allows user to copy checklist.

Limitations:

- Not tied to calendar, reminders, or assigned users.

### Proposal Draft Generation

Trigger: opening Proposal Draft Generator or exporting Word/PDF.

Files:

- `public/acquisition-os/full-bid-engine/index.html`

Behavior:

- Generates proposal content from active opportunity data.
- Allows copy.
- `Word` downloads Word-compatible `.doc`.
- `PDF` switches to proposal and opens print dialog.

Confirmed status:

- Proposal automation exists inside Full Bid Engine.
- It works from opportunity data already present in Full Bid Engine.
- Quick Entry can populate basic opportunity data into Full Bid Engine, but full proposal quality still depends on manual completion of solicitation/analyzer/pricing/compliance fields.

Limitations:

- Not true DOCX generation.
- PDF is browser print/save flow.
- No automatic Google Drive storage.
- No agency submission automation.

### Pricing Totals

Trigger: editing pricing worksheet rows.

Files:

- `public/acquisition-os/full-bid-engine/index.html`

Behavior:

- Stores pricing rows under active opportunity.
- Calculates totals for the pricing worksheet.

Limitations:

- Not connected to Quote Generator or accounting.

## Prime CRM Automations

### Google Sheets Save

Trigger: user saves CRM record.

Files:

- `public/app.js`
- `public/integration-config.js`

Behavior:

- Saves local record first.
- Sends Apps Script upsert.
- Replaces local record with cloud-normalized record if returned.
- Reloads cloud records when needed.

Endpoint:

- `https://script.google.com/macros/s/AKfycbyTccXyMv9_KMfQe9wFxlV8aNez7-T8efagw5TsTKOile_ZXCJ04ukXVLPunpHImju3sQ/exec`

### Offline Queue

Trigger: CRM cloud save/delete fails.

Files:

- `public/app.js`

Behavior:

- Queues failed operations in `igeo_prime_contractors_pending_operations`.
- Attempts to flush pending operations during sync.

Limitations:

- Requires Apps Script endpoint availability.
- Operator does not have a detailed queue management UI.

## Worker Intake Automations

### Submission and Verification

Trigger: public user submits Worker Intake form.

Files:

- `public/worker-intake.html`
- `public/worker-intake.js`
- `public/worker-intake-config.js`

Behavior:

- POSTs worker data to Apps Script.
- Reads rows back through JSONP.
- Confirms submitted phone/email appears.
- Shows success/error message.

Endpoint:

- `https://script.google.com/macros/s/AKfycbzhXotHCZbZVCwde17SlXMvugPL3M8xbe15LEGicSfB6LAoJq8wub-qWFgUHdH6aCKI5Q/exec`

Limitations:

- No offline fallback.

### Workforce Import

Trigger: main dashboard load / sync routine.

Files:

- `public/app.js`

Behavior:

- Reads Worker Intake rows from endpoint and uses them in Workforce display.

Limitations:

- Manual Workforce records do not write back to Worker Intake sheet.

## Gmail Executive Alerts Automation

Trigger: dashboard calls `/api/executive-email-alerts`.

Files:

- `worker.js`
- `public/app.js`

Intended behavior:

- Refresh Google OAuth token.
- Get or create labels:
  - iGeo - Urgent
  - iGeo - Contracts
  - iGeo - SAM CAGE
  - iGeo - Payments
  - iGeo - Workforce
- Classify recent messages.
- Return counts.

Production audit result:

- Route returned HTTP 500.
- Body was empty in read-only test.

Likely dependency:

- Cloudflare Worker secrets must be configured and valid:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REFRESH_TOKEN`

Limitations:

- Not operational during audit.
- No visible settings health check.

## Google Drive Automation

Status: not active.

Config:

- `public/integration-config.js` has `googleDrive.enabled: false`.

Full Bid Engine:

- Has Google Drive Document Storage module, but it is a manual storage/link workspace.

Limitations:

- No Drive folder creation.
- No upload.
- No document save.
- No automatic export storage.

## Cloudflare Deployment Automation

Files:

- `wrangler.toml`
- `worker.js`
- `public/`

Behavior:

- Static assets served from `public/`.
- Worker handles API and route rewrites.

Known deployment limitation:

- Manual Wrangler deploy from non-interactive shell requires `CLOUDFLARE_API_TOKEN`.
- GitHub push was completed for prior code work; production was observed serving latest Full Bid Engine route.

## Recommended Single Next Automation

Build a two-way Acquisition opportunity sync layer between Quick Entry and Full Bid Engine first.

Reason:

- Acquisition OS is the permanent core.
- Proposal, pricing, compliance, partners, contacts, and CRM all depend on opportunity records.
- Current one-way local bridge creates drift risk.
- A single canonical opportunity record would reduce duplicate entry across Quick Entry, Full Bid Engine, Prime CRM opportunity fields, Quote Generator, and future Google Sheets/Drive automation.

Minimum version:

- Keep the UI unchanged.
- Define a canonical opportunity object.
- Add import/export mappers for Quick Entry and Full Bid Engine.
- Sync both directions in localStorage.
- Add conflict handling based on `updatedAt`.
- Later connect the canonical opportunity store to Google Sheets or a cloud database.
