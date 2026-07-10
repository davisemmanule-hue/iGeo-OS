# iGeo Operations System Architecture

## Audit Scope

This document describes the current live iGeo Operations System as of July 10, 2026. The active repository is `iGeo-OS`, with the local working folder `igeo-os-release`. The production application is served from Cloudflare Workers at `https://igeosolutionsllc.com`.

This is a read-only architecture audit. It documents current behavior only. It does not propose UI changes, new modules, or production behavior changes.

## System Shape

iGeo OS is a static, plain HTML/CSS/JavaScript operations dashboard served by a Cloudflare Worker. The primary application shell is `public/index.html`, styled by `public/styles.css`, and controlled by `public/app.js`.

The system has one main dashboard route plus supporting public routes:

- `/`: main iGeo Operator Dashboard.
- `/index.html`: production redirects to `/`.
- `/acquisition-os/full-bid-engine/`: full standalone Bid Engine interface copied into the active repo and exposed as a dedicated public route.
- `/worker-intake`: public Worker Intake form.
- `/worker-intake.html`: production redirects to `/worker-intake`.
- `/api/acquisition-opportunities`: Cloudflare Worker API for canonical Acquisition opportunities when the `ACQUISITION_OPPORTUNITIES` KV namespace is bound.
- `/api/executive-email-alerts`: Cloudflare Worker API for Gmail executive alerts.

Historical standalone modules exist under `archive/`. They are reference-only and are not active production entry points.

## Active Files

Main app:

- `public/index.html`: dashboard HTML, top navigation, module sections, dialogs, form fields.
- `public/app.js`: state, rendering, localStorage persistence, filtering, scoring, exports, Google Sheets sync helpers, Worker Intake sync, Gmail alert calls.
- `public/styles.css`: shared layout, dashboard, module, dialog, table, and responsive styling.
- `public/branding-settings.js`: brand name, logo, colors, contact information.
- `public/integration-config.js`: Google Sheets, Google Drive, and Gmail client-side integration settings.
- `public/sw.js`: service worker cache.
- `public/manifest.json`: PWA metadata.

Full Bid Engine:

- `public/acquisition-os/full-bid-engine/index.html`: self-contained Full Bid Engine with embedded CSS and JavaScript.

Acquisition sync:

- `public/acquisition-sync.js`: canonical Acquisition opportunity schema, Quick Entry mapper, Full Bid Engine mapper, local migration, duplicate prevention, and cloud sync helper.
- `worker.js`: `/api/acquisition-opportunities` route for the canonical Cloudflare KV-backed opportunity store.

Worker Intake:

- `public/worker-intake.html`: public intake form.
- `public/worker-intake.js`: submission and verification logic.
- `public/worker-intake-config.js`: Worker Intake Google Sheet and Apps Script endpoint.

Cloudflare:

- `worker.js`: Worker request router, archived-route redirects, Worker Intake rewrite, Executive Alerts API.
- `wrangler.toml`: Worker name, asset directory, and custom-domain routes.

Documentation:

- `docs/architecture-map-v1.md`: prior architecture map.
- This audit set in `docs/`.

## Active Modules

### 1. Main iGeo Operator Dashboard

Purpose: Provide the operator landing page for daily work, alerts, key counts, quick access to active modules, and settings.

Navigation path: open `https://igeosolutionsllc.com/`, or click the iGeo brand lockup / Today.

Route or screen: `/`, hash `#today`.

Files controlling it:

- `public/index.html`: `#today`, `#my-day`, `#alerts`, partner view, owner view, settings.
- `public/app.js`: `renderToday()`, alert counts, settings toggles, `activateModule()`.
- `public/styles.css`: dashboard and responsive layout.

Data source: localStorage collections plus Worker API counts when available.

localStorage usage:

- `igeo_prime_contractors`
- `igeo_workers`
- `igeo_quotes`
- `igeo_vendor_registrations`
- `igeo_acquisition_opportunities`
- `igeo_operator_view_mode`
- `igeo_capability_statements_sent_count`

Buttons and functions:

- Today: top navigation hash link back to dashboard.
- Settings toggles: partner notifications, email alerts, simple mode, advanced mode, partner view.
- Partner and Owner shortcut links: jump to module sections.

Outputs generated: dashboard metrics, alerts, follow-up counts, module counts.

Exports: none directly from Today; exports live inside modules.

Connections: summarizes CRM, Workforce, Quotes, Vendor Registration, Acquisition OS, Capability Library, and Executive Alerts.

Manual actions: review metrics, click module tabs, use settings toggles.

Automated actions: render metrics from local state; call Executive Alerts API when email alerts are enabled.

Known limitations: localStorage is the main client-side database; dashboard metrics can differ by browser/device unless cloud sync is active and refreshed.

Mobile behavior: responsive CSS collapses layouts and controls for smaller screens.

Laptop behavior: full navigation and module tables are visible with more columns.

### 2. Acquisition OS Quick Entry

Purpose: Fast capture, scoring, filtering, and CSV export of opportunities inside the main iGeo OS dashboard.

Navigation path: top navigation `Acquisition OS`.

Route or screen: `/` with hash/section `#acquisition-os`.

Files controlling it:

- `public/index.html`: Acquisition OS section and `#acquisitionDialog`.
- `public/app.js`: acquisition arrays, scoring flags, urgency rules, security guardrails, CSV export, full-engine bridge.
- `public/styles.css`: module and table styling.

Data source: canonical Acquisition opportunity records. Cloud source is `/api/acquisition-opportunities` backed by Cloudflare KV binding `ACQUISITION_OPPORTUNITIES`; offline backup is browser localStorage key `igeo_canonical_acquisition_opportunities`.

Google Sheet or Apps Script endpoint used: none for Quick Entry.

localStorage usage:

- Canonical offline backup: `igeo_canonical_acquisition_opportunities`.
- Quick Entry compatibility view: `igeo_acquisition_opportunities`.
- Full Bid Engine compatibility view: `igeo-acquisition-os`.

Buttons and functions:

- `Return to Operator Dashboard`: jumps to `#today`.
- `Open Full Bid Engine`: opens `/acquisition-os/full-bid-engine/` in a new tab with `target="_blank"`.
- `CSV Export`: exports visible acquisition records to CSV.
- `Opportunity`: opens quick-entry opportunity dialog.
- Edit/Delete row actions: edit or delete individual opportunities.
- Filters: search, decision, performance method, NAICS, service.

Required inputs:

- Opportunity Name is required.
- Optional fields include Source, Source Link, Solicitation Type, Solicitation Number, Buyer/Agency, Service Type, NAICS, Priority Region, Urgent for iGeo, Due Date, Estimated Value, Performance Method, Decision Label, Contact Name, Contact Email, Urgency Reason, Notes, and score checkboxes.

Outputs generated:

- Opportunity table.
- Metrics for total, pursue immediately, subcontractor needed, due soon, under $250k, and security review.
- Decision labels and score summary.
- CSV export.
- Canonical opportunity records mirrored into the Full Bid Engine compatibility store.

Connections:

- Updates Today dashboard Bid Engine counts.
- Mirrors quick-entry records into Full Bid Engine localStorage when main app loads, saves, or deletes.
- Does not sync to Google Sheets.

Manual actions: add, edit, delete, score, filter, export.

Automated actions:

- Security services default to subcontractor-supported decision handling.
- Michigan priority regions can mark opportunities urgent.
- Quick Entry records are mapped into Full Bid Engine storage.

Known limitations:

- Quick Entry and Full Bid Engine share canonical opportunity records by `opportunityId`; records are also deduplicated by `solicitationNumber`.
- Quick Entry does not generate Word/PDF proposal documents.
- Quick Entry does not store attachments or Google Drive links.

Mobile behavior: table is wrapped in responsive scrolling; dialog and controls stack.

Laptop behavior: filters, metrics, table, and dialog are available in full layout.

### 3. Full Bid Engine

Purpose: Full bid operations workspace for opportunity review, scoring, analysis, compliance, proposals, pricing, partners, incumbent intelligence, contacts, daily intelligence notes, Drive links, Word export, and PDF/print export.

Navigation path: iGeo OS > Acquisition OS > `Open Full Bid Engine`.

Route or screen: `/acquisition-os/full-bid-engine/`.

Files controlling it:

- `public/acquisition-os/full-bid-engine/index.html`: self-contained HTML/CSS/JS.

Data source: canonical Acquisition opportunity records plus Full Bid Engine workspace state.

Google Sheet or Apps Script endpoint used: none.

localStorage usage:

- `igeo_canonical_acquisition_opportunities`: canonical offline backup.
- `igeo-acquisition-os`: stores Full Bid Engine compatibility state, active module, active opportunity, opportunities, partners, contacts, and intel.

Buttons and functions:

- `New`: creates a new Full Bid Engine opportunity.
- `Save`: saves the Full Bid Engine workspace to `igeo-acquisition-os`.
- `Word`: downloads a Word-compatible `.doc` brief generated from the active opportunity.
- `PDF`: switches to Proposal and calls browser print so the user can save as PDF.
- Sidebar module buttons: navigate between Full Bid Engine modules.
- Pipeline search and decision filter: filter visible opportunities.
- Module-specific add/copy buttons: add pricing rows, partners, contacts, intel notes, copy checklist, copy proposal.

Required inputs:

- The engine can operate from seed records or quick-entry mirrored records.
- Bid Engine fields include title, status, agency, source, source URL, deadline, estimated value, stage, NAICS, service, performance method, next action, notes, missing requirements.

Outputs generated:

- Opportunity dashboard rows and metrics.
- Scoring and decision label.
- Compliance checklist.
- Proposal text.
- Pricing totals.
- Partner/contact/intel records.
- Word-compatible `.doc`.
- Browser print/PDF output.

Connections:

- Receives canonical records from Quick Entry.
- Writes Full Bid Engine edits back into the canonical record and Quick Entry compatibility store.
- Does not connect to Google Sheets or Google Drive directly.

Manual actions: create/edit records, paste solicitation text, score, check compliance tasks, build pricing, add partners/contacts/intel, export Word/PDF.

Automated actions:

- Score calculation.
- Decision label calculation.
- Intake parsing from pasted text.
- Checklist generation from opportunity risk/requirements.
- Proposal text generation from active opportunity data.

Known limitations:

- Full Bid Engine is self-contained and localStorage-only.
- Word export is Word-compatible HTML saved as `.doc`, not a generated `.docx`.
- PDF export uses browser print, not a server-generated PDF file.
- Google Drive document storage is a manual field/workspace, not an active Drive API integration.
- Cross-device sync depends on the `/api/acquisition-opportunities` route and the `ACQUISITION_OPPORTUNITIES` Cloudflare KV binding. Without that binding, local two-way sync still works in the same browser and localStorage remains the offline backup.

Mobile behavior: the Full Bid Engine has responsive CSS that collapses sidebar/layout/tabs into a single-column flow.

Laptop behavior: sidebar, pipeline, metrics, and active module content display in a two-column operations workspace.

### 4. Opportunity Dashboard

Purpose: Full Bid Engine summary view of opportunities, deadlines, decisions, performance method, and score.

Navigation path: Open Full Bid Engine > sidebar `Opportunity Dashboard`.

Route or screen: `/acquisition-os/full-bid-engine/`, internal module `dashboard`.

Files controlling it: `public/acquisition-os/full-bid-engine/index.html`, functions `renderDashboard()`, `renderMetrics()`, `renderOppList()`.

Data source: `igeo-acquisition-os`.

Buttons and functions: sidebar dashboard button, pipeline search, decision filter.

Outputs generated: opportunity table, module summary cards, metrics.

Limitations: dashboard is local to Full Bid Engine storage.

### 5. Solicitation Analyzer

Purpose: Store solicitation summary, instructions, extracted requirements, and missing requirements.

Navigation path: Open Full Bid Engine > `Solicitation Analyzer`.

Route or screen: `/acquisition-os/full-bid-engine/`, internal module `analyzer`.

Files controlling it: `renderAnalyzer()` in `public/acquisition-os/full-bid-engine/index.html`.

Data source: active Full Bid Engine opportunity.

Buttons and functions: field edits save to local state; parse intake is in Bid Engine module.

Inputs: Solicitation Summary, Instructions, Extracted Requirements, Missing Requirements.

Outputs: edited opportunity analysis fields.

Automation: parse intake can populate some fields from pasted SAM.gov/VSS/MITN text.

Limitations: no PDF upload, OCR, attachment parsing, or live scraping.

### 6. Opportunity Scoring Engine

Purpose: Score opportunity fit and risk based on configured scoring flags.

Navigation path: Open Full Bid Engine > `Opportunity Scoring Engine`.

Route or screen: `/acquisition-os/full-bid-engine/`, internal module `scoring`.

Files controlling it: `scoreFields`, `scoreOpp()`, `decisionFor()`, `decisionReasons()`, `renderScoring()`.

Data source: active Full Bid Engine opportunity.

Inputs: scoring checkboxes.

Outputs: numeric score, decision label, decision reasons.

Automation: recalculates when score flags change.

Limitations: scoring weights are embedded in the HTML script and are not externally configurable.

### 7. Compliance Checklist Generator

Purpose: Generate submission/compliance tasks for the active opportunity.

Navigation path: Open Full Bid Engine > `Compliance Checklist Generator`.

Route or screen: `/acquisition-os/full-bid-engine/`, internal module `compliance`.

Files controlling it: `renderCompliance()`, `buildChecklist()`.

Data source: active Full Bid Engine opportunity.

Buttons and functions:

- `Copy Checklist`: copies checklist text.
- Checklist checkboxes: save done status.

Outputs: compliance task table.

Automation: checklist is generated from opportunity fields, score flags, and risk requirements.

Limitations: checklist is not assigned to a separate task database.

### 8. Proposal Draft Generator

Purpose: Generate proposal language from active opportunity fields.

Navigation path: Open Full Bid Engine > `Proposal Draft Generator`.

Route or screen: `/acquisition-os/full-bid-engine/`, internal module `proposal`.

Files controlling it: `renderProposal()`, `proposalHtml()`, `exportWord()`, `exportPdf()`.

Data source: active Full Bid Engine opportunity.

Buttons and functions:

- `Copy Proposal`: copies generated proposal content.
- `Word`: downloads a Word-compatible `.doc`.
- `PDF`: opens print flow for PDF.

Outputs: proposal preview, copied text, `.doc` export, print/PDF export.

Automation: proposal content is generated from entered opportunity data.

Limitations:

- Not a full proposal package builder.
- No server-side document generation.
- No Google Drive storage connection.
- From Quick Entry to proposal is partially automated only when Quick Entry fields have been mirrored into Full Bid Engine.

### 9. Pricing Worksheet

Purpose: Estimate bid price from pricing rows.

Navigation path: Open Full Bid Engine > `Pricing Worksheet`.

Route or screen: `/acquisition-os/full-bid-engine/`, internal module `pricing`.

Files controlling it: `renderPricing()`.

Data source: active Full Bid Engine opportunity pricing array.

Buttons and functions:

- Add pricing row.
- Delete pricing row.
- Edit pricing inputs.

Inputs: labor, supplies, partner margin, overhead/profit style rows depending on the current worksheet structure.

Outputs: pricing table and totals.

Limitations: not connected to Quote Generator; no accounting sync.

### 10. Subcontractor / Teaming Partner Tracker

Purpose: Track partner organizations, service coverage, license status, contact, and status.

Navigation path: Open Full Bid Engine > `Subcontractor / Teaming Partner Tracker`.

Route or screen: `/acquisition-os/full-bid-engine/`, internal module `partners`.

Files controlling it: `renderPartners()`.

Data source: Full Bid Engine `partners` array in `igeo-acquisition-os`.

Buttons and functions: add partner row; edit partner fields.

Outputs: partner table.

Limitations: not connected to Prime CRM, Workforce, or Contacts records.

### 11. Incumbent Intelligence

Purpose: Capture incumbent contractor clues, prior award context, and relationship plan.

Navigation path: Open Full Bid Engine > `Incumbent Intelligence`.

Route or screen: `/acquisition-os/full-bid-engine/`, internal module `incumbent`.

Files controlling it: `renderIncumbent()`.

Data source: active opportunity field `incumbent`.

Inputs: incumbent notes.

Outputs: saved local intelligence field.

Limitations: no SAM.gov/FPDS/USAspending lookup integration.

### 12. Procurement Contact Database

Purpose: Store buyer, contracting officer, specialist, and outreach contact information.

Navigation path: Open Full Bid Engine > `Procurement Contact Database`.

Route or screen: `/acquisition-os/full-bid-engine/`, internal module `contacts`.

Files controlling it: `renderContacts()`.

Data source: Full Bid Engine `contacts` array and active opportunity `contactId`.

Buttons and functions: add contact row; edit contact fields.

Outputs: procurement contacts table.

Limitations: not connected to Prime CRM contacts or Vendor Registration contacts.

### 13. Prime Contractor CRM

Purpose: Track primes, contacts, SBLOs, relationship status, follow-ups, capability statements, and CRM opportunity notes.

Navigation path: top navigation `Contacts`.

Route or screen: `/` with section `#prime-crm`.

Files controlling it:

- `public/index.html`: Prime CRM section and record dialog.
- `public/app.js`: Prime CRM render, save, delete, filters, alerts, reports, Google Sheets sync.
- `public/integration-config.js`: Prime CRM Apps Script endpoint.

Data source:

- Local primary cache: `igeo_prime_contractors`.
- Google Sheets endpoint when available.

Google Sheet or Apps Script endpoint used:

- Spreadsheet ID: `1FqWUPmg1alDzUMBEjprdq_zEJcXIm_LHwcqI8hvr4L8`.
- Endpoint: `https://script.google.com/macros/s/AKfycbyTccXyMv9_KMfQe9wFxlV8aNez7-T8efagw5TsTKOile_ZXCJ04ukXVLPunpHImju3sQ/exec`.

localStorage usage:

- `igeo_prime_contractors`
- `igeo-prime-contractor-crm-v1`
- `igeo_prime_contractors_google_migration`
- `igeo_prime_contractors_pending_operations`
- `igeo_prime_contractors_recovery_snapshot`

Buttons and functions:

- `CSV Export`: export visible prime records.
- `Contact`: open add/edit dialog.
- `Reset filters`: clear filters.
- Report cards: filter records by report category.
- Dialog save/delete/cancel/close.

Inputs: company, website, industry, headquarters, services, NAICS, primary contact, SBLO, status, contact dates, follow-up, notes, capability statement info, opportunity fields.

Outputs: CRM table, follow-up alerts, reports, dashboard metrics, CSV.

Connections: dashboard metrics, Google Sheets sync, capability statement count, offline queue.

Automated actions: load cloud records, save local first, upsert to Google Sheets, queue pending operations if sync fails.

Limitations: CRM opportunity fields are separate from Acquisition OS opportunities, requiring duplicate entry for opportunities.

### 14. Workforce Management

Purpose: Track worker/subcontractor availability, service categories, contact information, rates, credentials, and status.

Navigation path: top navigation `Applications`.

Route or screen: `/` with section `#workforce-management`.

Files controlling it:

- `public/index.html`: Workforce section and worker dialog.
- `public/app.js`: Workforce rendering, filtering, local saves, Worker Intake sync.
- `public/worker-intake-config.js`: external Worker Intake source.

Data source:

- Local key `igeo_workers`.
- Worker Intake Google Sheet readback through Apps Script.

Google Sheet or Apps Script endpoint used:

- Worker Intake Spreadsheet ID: `1RfKwfSjePnIQEFTsH1mcTbB16lGKPUKhkt4qtVqjh-c`.
- Endpoint: `https://script.google.com/macros/s/AKfycbzhXotHCZbZVCwde17SlXMvugPL3M8xbe15LEGicSfB6LAoJq8wub-qWFgUHdH6aCKI5Q/exec`.

localStorage usage:

- `igeo_workers`.

Buttons and functions:

- `Worker Intake Form`: opens public intake form in new tab.
- `CSV Export`: exports visible workers.
- `Add Worker`: opens worker dialog.
- Filters: search, service category, city, state, status.

Inputs: worker/company name, type, service category, city, state, phone, email, availability, rates, insurance, background check, license, vehicle, government site, status, notes.

Outputs: worker table, dashboard worker counts, CSV.

Connections: Worker Intake submissions can populate Workforce display.

Limitations: Workforce does not sync its manually entered records to Google Sheets; it reads Worker Intake rows separately.

### 15. Worker Intake

Purpose: Public form for workers/subcontractors to submit availability and service details.

Navigation path: Workforce Management > `Worker Intake Form`, or direct `/worker-intake`.

Route or screen: `/worker-intake` live; `/worker-intake.html` redirects.

Files controlling it:

- `public/worker-intake.html`.
- `public/worker-intake.js`.
- `public/worker-intake-config.js`.

Data source: Google Sheet via Apps Script endpoint.

Google Sheet or Apps Script endpoint used:

- Spreadsheet ID: `1RfKwfSjePnIQEFTsH1mcTbB16lGKPUKhkt4qtVqjh-c`.
- Endpoint: `https://script.google.com/macros/s/AKfycbzhXotHCZbZVCwde17SlXMvugPL3M8xbe15LEGicSfB6LAoJq8wub-qWFgUHdH6aCKI5Q/exec`.

Buttons and functions:

- `Submit Worker Intake`: POSTs form payload.
- `Back to Dashboard`: links to `index.html#workforce-management`.

Inputs: first name, last name, phone, email, city, state, service category, availability, hourly rate, driver license, vehicle, background check, notes.

Outputs: Google Sheet row, success/error message.

Automation: after submit, reads rows through JSONP to verify the submitted record exists.

Limitations: if Apps Script endpoint fails, submission fails; no local backup for public intake form.

### 16. Quote Generator

Purpose: Create and export simple service quotes.

Navigation path: top navigation `Quotes`.

Route or screen: `/` with section `#quote-generator`.

Files controlling it:

- `public/index.html`: Quote section and dialog.
- `public/app.js`: quote math, save, render, export.

Data source: localStorage key `igeo_quotes`.

Google Sheet or Apps Script endpoint used: none.

Buttons and functions:

- `CSV Export`: export visible quotes.
- `New Quote`: open quote dialog.
- Dialog save/cancel/close.

Inputs: client, opportunity name, service type, location, hours, workers, hourly rate, supplies, travel, other costs, markup, status, notes.

Outputs: quote table, labor/subtotal/final amount previews, CSV.

Connections: not connected to Acquisition OS Pricing Worksheet.

Limitations: no PDF quote export in active UI; no Google Sheets sync.

### 17. Vendor Registration Tracker

Purpose: Track vendor registration portals, statuses, login hints, contacts, follow-ups, and capability statement status.

Navigation path: top navigation `Registrations`.

Route or screen: `/` with section `#vendor-registration`.

Files controlling it:

- `public/index.html`: Vendor Registration section and dialog.
- `public/app.js`: save, render, filter, export.
- `public/integration-config.js`: disabled vendor Google Sheets placeholder.

Data source: localStorage key `igeo_vendor_registrations`.

Google Sheet or Apps Script endpoint used: none active. `vendorTracker.enabled` is false and endpoint is placeholder.

Buttons and functions:

- `CSV Export`: export visible registrations.
- `Add Registration`: open vendor dialog.
- Status filter and search.
- Dialog save/cancel/close.

Inputs: company, website, portal type, status, submission date, login email, username, password hint, contact, contact email, follow-up date, capability sent, notes.

Outputs: vendor table, dashboard registration count, CSV.

Limitations: no active cloud sync; no direct document storage.

### 18. Gmail Executive Alerts

Purpose: Classify recent Gmail messages into urgent, contracts, SAM/CAGE, payments, and workforce alert categories.

Navigation path: dashboard loads alerts automatically when settings allow email alerts.

Route or screen: Worker API `/api/executive-email-alerts`.

Files controlling it:

- `worker.js`: API handler, Gmail OAuth refresh, label creation/classification, counts.
- `public/app.js`: `loadExecutiveEmailAlerts()` dashboard call.
- `public/integration-config.js`: Gmail client-side setting is disabled, but Worker API is independent and uses Cloudflare secrets.

Data source: Gmail API through Cloudflare Worker secrets.

Required secrets:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

Production status: live route returns HTTP 500 with empty body during audit, indicating configuration or runtime failure.

Outputs: intended JSON alert counts; currently not operational in production audit.

Limitations: Settings UI does not show secret health; failure is not clearly explained to the operator.

### 19. Google Sheets Integrations

Purpose: Sync selected operational data to Google Sheets.

Active:

- Prime Contractor CRM: enabled.
- Worker Intake: enabled through its own config and Apps Script endpoint.

Inactive or placeholder:

- Vendor Tracker: disabled.
- Quotes: no active Sheets sync.
- Workforce manual records: no active write sync.
- Acquisition Quick Entry: no Sheets sync.
- Full Bid Engine: no Sheets sync.

### 20. Cloudflare Deployment and Data Flow

Purpose: Host the static dashboard and provide Worker API routes.

Files:

- `wrangler.toml`
- `worker.js`
- `public/`

Cloudflare config:

- Worker name: `igeosolutionsllc`.
- Assets directory: `./public`.
- Custom domains: `igeosolutionsllc.com`, `www.igeosolutionsllc.com`.
- Workers preview enabled.

Production observations:

- `/` returns iGeo Operator Dashboard.
- `/index.html` redirects to `/`.
- `/worker-intake.html` redirects to `/worker-intake`.
- `/worker-intake` returns Worker Intake.
- `/acquisition-os/full-bid-engine/` returns Full Bid Engine.
- `/api/executive-email-alerts` returns HTTP 500 during audit.

## Current System Workflow Summary

The live system is a unified browser-based operations console. The operator starts on Today, reviews counts, then opens Contacts, Acquisition OS, Quotes, Applications, Registrations, Capability Statements, or Settings.

Most modules are localStorage-first. Prime CRM and Worker Intake are the two active Google Sheets paths. Acquisition OS now has a canonical opportunity sync layer shared by Quick Entry and the Full Bid Engine. The intended cloud source of truth is the Cloudflare `/api/acquisition-opportunities` route backed by the `ACQUISITION_OPPORTUNITIES` KV namespace, with localStorage as offline backup. Proposal work happens inside Full Bid Engine and is manually exported by Word/PDF buttons.

## Key Architecture Gaps

- No shared server database.
- Acquisition cloud sync requires the `ACQUISITION_OPPORTUNITIES` Cloudflare KV binding before it can be treated as the production source of truth across devices.
- No Google Sheets sync for Acquisition, Quotes, Vendors, or manual Workforce records.
- No active Google Drive integration.
- Gmail Executive Alerts API exists but fails in production during audit.
- Proposal generation is manual and local; not a full automated submission package.
- Several modules duplicate opportunity/contact/service concepts.
