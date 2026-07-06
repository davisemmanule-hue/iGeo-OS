# iGeo OS Architecture Map v1

## Repository Scope

This report maps the existing `iGeo-OS` repository as a unified operations system. The active application is a Cloudflare Worker static-asset site served from `public/`, with a small Worker API layer in `worker.js`. Historical/legacy module copies live under `archive/` and should be treated as reference material unless intentionally restored.

## A. Current Modules

- Dashboard / Today: executive summary metrics, alerts, follow-up counts, worker applications, opportunities, registrations, quotes, contracts, and Bid Engine item counts.
- My Day: simple operator checklist.
- Alerts: operational alert badges and follow-up alert list.
- Acquisition OS / Bid Engine: opportunity dashboard, scoring, priority region urgency, security guardrails, acquisition module list, filters, opportunity table, opportunity dialog, and CSV export.
- Prime Contractor CRM: prime contractor records, contacts, SBLO fields, status, opportunity tracking, follow-up tracking, reports, Google Sheets sync, offline queue, migration/recovery helpers, and CSV/XLS export support.
- Quote Generator: quote records, quote math, quote status, and CSV/XLS export support.
- Workforce Management: worker/subcontractor records, worker intake sync, worker filters, and CSV/XLS export support.
- Worker Intake: standalone public intake form at `worker-intake.html` that writes to Google Sheets through Apps Script and verifies submissions.
- Vendor Registration Tracker: vendor portal/registration records, contact/login metadata, follow-up tracking, capability-sent status, and CSV/XLS export support.
- Capability Statement Library: capability statement cards, open/copy/download/email/mark-sent actions.
- Partner View: shortcut panel for simplified operator navigation.
- Owner View: shortcut panel for alerts, settings, notifications, and automation status.
- Settings: toggles for partner notifications, email alerts, simple mode, advanced mode, partner view, and automation status.
- Executive Email Alerts API: Worker route `/api/executive-email-alerts` that classifies Gmail messages and updates urgent/contract/payment/workforce/SAM-CAGE labels when Gmail credentials are configured.
- PWA/static caching: `public/sw.js` caches the app shell and static assets.

## B. Current Tabs

Top navigation in `public/index.html`:

- Today: hash link to `#today`.
- Acquisition: module tab for `#acquisition-os`.
- Contacts: module tab for `#prime-crm`.
- Quotes: module tab for `#quote-generator`.
- Applications: module tab for `#workforce-management`.
- Registrations: module tab for `#vendor-registration`.
- Capability Statements: module tab for `#capability-statements`.
- Settings: hash link to `#settings`.

## C. Current Pages

Active public pages and routes:

- `/` and `/index.html`: main iGeo Operator Dashboard.
- `/worker-intake.html`: public worker intake form.
- `/worker-intake` and `/worker-intake/`: Worker rewrites to `/worker-intake.html`.
- `/api/executive-email-alerts`: Worker API route for Gmail classification and dashboard counts.

Redirected legacy routes in `worker.js`:

- `/executive` and `/executive/` redirect to `/#today`.
- `/vendor` and `/vendor/` redirect to `/#vendor-registration`.
- `/workforce` and `/workforce/` redirect to `/#workforce-management`.

Archived/reference pages:

- `archive/workforce/index.html`, `archive/workforce/script.js`, `archive/workforce/styles.css`, `archive/workforce/worker-config.js`.
- `archive/executive/index.html`, `archive/executive/app.js`, `archive/executive/styles.css`, `archive/executive/config.js`.

## D. Current Reusable Components

The app is plain HTML/CSS/JavaScript rather than a component framework. Reusable UI patterns are implemented through shared classes and shared render/helper functions:

- Shell and navigation: `.top-nav`, `.brand-lockup`, `.module-tabs`, `.nav-tab`, `.app-shell`.
- Panels and headings: `.panel`, `.module-page`, `.module-heading`, `.command-header`, `.panel-heading`.
- Metrics/cards: `.metric-grid`, `.metric`, `.today-grid`, `.today-card`, `.alert-badge-grid`, `.report-grid`, `.report-card`.
- Controls: `.field`, `.module-tools`, `.filters`, `.check-grid`, `.check-field`, `.setting-toggle`.
- Tables: `.table-panel`, `.table-wrap`, `table`, `.row-actions`.
- Pills/status: `.status-pill`, `.service-pill`, `.count-pill`.
- Dialogs/forms: `<dialog>`, `.dialog-header`, `.dialog-actions`, `.form-section`, `.form-grid`.
- Toast: `.toast` with `showToast()`.
- Capability cards: `.capability-grid`, `.capability-card`, `.capability-actions`.
- Acquisition-specific UI: `.acquisition-command`, `.acquisition-module-list`, `.security-rule`.

Reusable JavaScript helpers:

- Collection persistence: `loadCollection()`, `saveCollection()`.
- Export: `exportDataset()`, `getExportConfig()`, `csvCell()`, `download()`.
- Dates/currency: `toIsoDate()`, `shiftDate()`, `formatDate()`, `dateClass()`, `daysBetween()`, `isWithinDays()`, `money()`.
- Rendering/filtering: `fillSelect()`, `setText()`, `activateModule()`, `scrollToSection()`.
- Sync/network: `jsonpRequest()`, `readSessionCache()`, `writeSessionCache()`.
- Modal handling: `openModal()`, `closeModal()`.
- Branding/sharing: `applyBranding()`, `copyText()`, `quickShareBusinessCard()`.

## E. Current Data Models

All active app data models are plain JavaScript objects stored in browser local storage, with optional Google Sheets sync for Prime CRM and Worker Intake.

Prime contractor record:

- `id`, `companyName`, `website`, `industry`, `headquarters`, `serviceAreas`, `naics`.
- Primary contact: `firstName`, `lastName`, `jobTitle`, `email`, `phone`.
- SBLO: `sbloName`, `sbloEmail`, `sbloPhone`.
- Relationship: `status`, `dateFirstContacted`, `lastContactDate`, `nextFollowUpDate`, `communicationNotes`.
- Capability: `capabilitySent`, `capabilityDateSent`, `capabilityVersion`.
- Opportunity tracking: `opportunityName`, `solicitationNumber`, `contractType`, `estimatedValue`, `dueDate`, `opportunityNotes`.
- Services: `services`.

Acquisition opportunity record:

- Identity/source: `id`, `opportunityName`, `source`, `sourceLink`, `solicitationType`, `solicitationNumber`, `buyer`.
- Service: `serviceType`, `naics`.
- Region/urgency: `priorityRegion`, `urgentForIgeo`, `urgencyReason`.
- Deadline/value/contact: `dueDate`, `estimatedValue`, `contactName`, `contactEmail`.
- Bid decision: `performanceMethod`, `decisionLabel`, `notes`.
- Scoring flags: `officialSourceVerified`, `openOpportunity`, `deadlineVerified`, `under250k`, `serviceBased`, `lowCapital`, `subcontractable`, `brokerable`, `noMajorEquipment`, `fitsIgeoServices`, `securityLicensingRequired`, `bondingRequired`, `siteVisitRequired`.

Worker record:

- `id`, `workerName`, `workerType`, `serviceCategory`, `city`, `state`, `phone`, `email`, `availability`.
- Rates: `hourlyRate`, `dayRate`, `perJobRate`.
- Credentials: `insurance`, `backgroundCheck`, `driversLicense`, `vehicle`, `governmentSite`.
- `notes`, `status`.

Quote record:

- `id`, `clientName`, `opportunityName`, `serviceType`, `location`.
- Inputs: `estimatedHours`, `workersNeeded`, `workerHourlyRate`, `suppliesCost`, `travelCost`, `otherCost`, `markupPercentage`.
- Calculated fields: `laborCost`, `subtotal`, `finalQuoteAmount`.
- `notes`, `quoteStatus`.

Vendor registration record:

- `id`, `companyName`, `website`, `portalType`, `registrationStatus`, `dateSubmitted`.
- Login/contact: `loginEmail`, `username`, `passwordHint`, `contactName`, `contactEmail`.
- `followUpDate`, `capabilityStatementSent`, `notes`.

Capability statement record:

- `title`, `service`, `status`, `pdfUrl`, `docUrl`, `emailSubject`, `emailBody`.

View/settings model:

- `simpleMode`, `advancedMode`, `partnerView`, `partnerNotifications`, `emailAlerts`.

## F. Current Local Storage Objects

Defined in `STORAGE_KEYS`:

- `igeo_prime_contractors`: active Prime CRM records.
- `igeo-prime-contractor-crm-v1`: legacy Prime CRM storage key.
- `igeo_prime_contractors_google_migration`: Prime CRM Google Sheets migration receipt/state.
- `igeo_prime_contractors_pending_operations`: offline upsert/archive queue for Prime CRM Google Sheets sync.
- `igeo_prime_contractors_recovery_snapshot`: local Prime CRM recovery snapshot used by reconciliation tooling.
- `igeo_workers`: local Workforce records.
- `igeo_quotes`: local Quote Generator records.
- `igeo_vendor_registrations`: local Vendor Registration records.
- `igeo_acquisition_opportunities`: local Acquisition OS / Bid Engine records.
- `igeo_operator_view_mode`: settings and view-mode preferences.
- `igeo_capability_statements_sent_count`: manual capability statement sent counter.

Session storage:

- JSONP response cache entries such as `prime-crm:{...}` and `worker-intake:list`, wrapped as `{ cachedAt, value }`.

## G. Current Exports

Shared export system:

- `exportDataset(dataset, type)` handles CSV and XLS-style HTML-table downloads.
- `getExportConfig(dataset)` defines headers and row mapping.

Datasets:

- `primes`: CSV and XLS support. Active UI exposes CSV. XLS support exists in code when an `exportExcel` element is present.
- `workers`: CSV and XLS support. Active UI exposes CSV. XLS support exists in code when an `exportWorkersExcel` element is present.
- `quotes`: CSV and XLS support. Active UI exposes CSV. XLS support exists in code when an `exportQuotesExcel` element is present.
- `vendors`: CSV and XLS support. Active UI exposes CSV. XLS support exists in code when an `exportVendorsExcel` element is present.
- `acquisition`: CSV support exposed by the Acquisition tab; uses the shared export pipeline.

Other downloads:

- Capability statement text download via `downloadCapabilityStatement()`.
- Capability PDF open/download actions are link-based and currently depend on configured `pdfUrl` values.

## H. Current Workflows

Daily operator workflow:

1. Land on Today dashboard.
2. Review urgent emails, follow-ups, worker applications, opportunities, registrations, quotes, contracts, and Bid Engine items.
3. Use My Day checklist.
4. Open Alerts for follow-ups and action-needed items.

Acquisition workflow:

1. Open Acquisition tab.
2. Add or review opportunity.
3. Capture source/source link, buyer, service, NAICS, region, deadline, estimated value, performance method, decision, contact, and notes.
4. Mark scoring flags.
5. Apply automatic security guardrail and Michigan priority urgency rule.
6. Filter by decision, method, NAICS, service, or search.
7. Export acquisition records to CSV.

Prime CRM workflow:

1. Add/edit prime contractor.
2. Track company/contact/SBLO information.
3. Track relationship stage, follow-ups, capability statement status, and opportunity details.
4. Save locally first.
5. Sync to Google Sheets when configured; queue pending operations if offline/unavailable.
6. Export visible records.

Worker workflow:

1. Collect workers locally through Workforce modal or publicly through Worker Intake.
2. Worker Intake posts to Apps Script and verifies by JSONP readback.
3. Main dashboard syncs Worker Intake rows into Workforce display.
4. Filter by service, city, state, status, and search.
5. Export visible workers.

Quote workflow:

1. Create quote.
2. Enter client, service, location, hours, worker count, hourly rate, supplies, travel, other costs, and markup.
3. Calculate labor, subtotal, and final quote.
4. Track quote status.
5. Export visible quotes.

Vendor registration workflow:

1. Add registration record.
2. Track portal, status, submission date, login hint, contact, follow-up, capability sent, and notes.
3. Filter by registration status and search.
4. Export visible registrations.

Capability workflow:

1. Review library.
2. Open configured document/PDF links.
3. Copy prepared email text.
4. Send by email.
5. Mark sent to increment dashboard/reporting count.

Executive email workflow:

1. Settings allow email alerts on/off.
2. Dashboard calls `/api/executive-email-alerts`.
3. Worker validates Google OAuth env vars.
4. Worker classifies Gmail messages into urgent, contracts, payments, workforce, and SAM/CAGE categories.
5. Dashboard receives counts and updates Today/Alerts.

## I. Duplicate Functionality Found

- Opportunity tracking exists in both Prime CRM and Acquisition OS:
  - CRM has opportunity fields tied to prime relationships.
  - Acquisition OS has standalone opportunity records, scoring, source link, priority region, security guardrail, and export.
- Service lists are duplicated/overlapping:
  - Main `services`.
  - `workerServiceCategories`.
  - Worker Intake `intakeServices`.
- Google Sheets / JSONP patterns exist in multiple places:
  - Main app shared `jsonpRequest()`.
  - Worker Intake standalone `readWorkerRows()`.
- Export code is centralized in `exportDataset()`, but each data model still defines separate field maps with similar patterns.
- Archived standalone Workforce and Executive apps duplicate concepts now present in the unified dashboard.
- Capability statement contact/email content overlaps with Prime CRM outreach and vendor/partner workflows.
- Settings toggles and Gmail/Google integrations are partially duplicated between `integration-config.js`, Worker env requirements, and Settings UI.

## J. Features That Should Be Merged

- Prime CRM opportunity fields and Acquisition OS opportunities should be related, not duplicated. CRM should reference linked Acquisition records or show relationship context for opportunities already tracked in Acquisition OS.
- Worker Intake service categories should use the same canonical service taxonomy as Workforce and Acquisition.
- Capability Statement Library should connect to CRM and Acquisition workflows so "Mark Sent" can optionally record where it was sent.
- Vendor Registration and Procurement Contact tracking should converge into a shared Contacts/Organizations model with different relationship types.
- Gmail alert categories should feed Today/Alerts and Daily Intelligence as one intelligence stream.

## K. Features That Should Be Extended Instead of Duplicated

- Extend Acquisition OS for Solicitation Analyzer, Compliance Checklist, Proposal Drafts, Pricing Worksheet, Incumbent Intelligence, Procurement Contacts, Daily Intelligence, Google Drive storage, and PDF/Word export instead of creating separate apps or tabs.
- Extend Prime CRM for relationship history and partner/contact intelligence instead of creating a second Contacts app.
- Extend Quote Generator into a future Pricing Worksheet/Finance surface instead of building another pricing tool.
- Extend Capability Statement Library into Proposal Engine document assets instead of creating a disconnected proposal library.
- Extend Settings for integration status and credentials health instead of adding separate admin pages.
- Extend Worker Intake/Workforce for subcontractor and teaming partner tracking instead of creating separate staffing databases.

## L. Technical Debt

- Single large `public/app.js` file owns state, rendering, forms, storage, exports, sync, and utilities.
- No formal module boundaries, build step, typed models, or automated test runner.
- Static HTML contains every module and dialog, which makes future growth harder to reason about.
- Local storage is the primary app database; cloud sync is partial and mostly Prime CRM/Worker Intake.
- Google Apps Script URLs are stored in public config files.
- Gmail API behavior depends on Worker environment secrets and is not represented in Settings beyond toggles.
- Git/index behavior is fragile in the current OneDrive workspace; recent commits required a temporary-index workaround.
- `worker.js` has unrelated local modifications in the working tree that are not part of this architecture report.
- Service worker cache name is static and must be manually bumped when assets change.
- Archived docs still describe older root/static deployment assumptions and standalone modules.
- CSV/XLS export support is code-based but XLS buttons are not consistently present in active HTML.

## M. Recommended Folder Structure

Recommended future organization without changing behavior immediately:

```text
igeo-os-release/
  docs/
    architecture-map-v1.md
    deployment.md
    integrations.md
  public/
    index.html
    worker-intake.html
    assets/
      icons/
    config/
      branding-settings.js
      integration-config.js
      worker-intake-config.js
    scripts/
      app.js
      worker-intake.js
      sw.js
    styles/
      styles.css
  worker/
    worker.js
  archive/
    executive/
    workforce/
    *.md
  package.json
  wrangler.toml
```

Near-term low-risk step:

- Keep runtime paths as-is until a deliberate refactor is planned.
- Add docs first.
- Later move files only with redirects/import path updates and a smoke test.

## N. Future Extension Points

- Acquisition OS:
  - Solicitation Analyzer.
  - Compliance Checklist Generator.
  - Proposal Draft Generator.
  - Pricing Worksheet.
  - Subcontractor / Teaming Partner Tracker.
  - Incumbent Intelligence.
  - Procurement Contact Database.
  - Daily Acquisition Intelligence Integration.
  - Google Drive document storage.
  - Export to PDF and Word.
- CRM:
  - Contact activity history.
  - Opportunity relationship links.
  - Capability statement send history.
- Proposal Engine:
  - Shared document templates.
  - Capability statement variants.
  - Proposal drafts tied to Acquisition opportunities.
- Daily Intelligence:
  - Gmail alerts.
  - Acquisition source review queue.
  - Follow-ups and deadline digest.
- Operations:
  - Workforce availability.
  - Subcontractor readiness.
  - Site visit and compliance task tracking.
- Finance:
  - Quote status.
  - Pricing worksheet.
  - Invoice/payment alert summaries.
- Settings:
  - Integration status checks.
  - Cache/version visibility.
  - Simple/advanced operator modes.

## O. Suggested Module Relationships

```text
Dashboard
│
├── Acquisition OS
│   ├── Bid Engine
│   ├── Solicitation Analyzer
│   ├── Opportunity Scoring
│   ├── Compliance Checklist
│   ├── Proposal Drafts
│   ├── Pricing Worksheet
│   ├── Subcontractor / Teaming Partner Tracker
│   ├── Incumbent Intelligence
│   └── Procurement Contacts
│
├── CRM
│   ├── Prime Contractor Records
│   ├── Relationship Follow-ups
│   ├── Capability Statement Activity
│   └── Linked Acquisition Opportunities
│
├── Proposal Engine
│   ├── Capability Statements
│   ├── Proposal Draft Generator
│   ├── Compliance Checklist
│   └── PDF / Word Export
│
├── Contacts
│   ├── Prime Contacts
│   ├── Procurement Contacts
│   ├── Vendor Portal Contacts
│   └── Subcontractor / Partner Contacts
│
├── Daily Intelligence
│   ├── Executive Email Alerts
│   ├── Acquisition Source Review
│   ├── Deadline Alerts
│   └── Follow-up Alerts
│
├── Operations
│   ├── Workforce
│   ├── Worker Intake
│   ├── Vendor Registrations
│   └── Subcontractor Readiness
│
├── Finance
│   ├── Quotes
│   ├── Pricing Worksheet
│   ├── Payments
│   └── Invoice Signals
│
└── Settings
    ├── Branding
    ├── View Mode
    ├── Notifications
    ├── Google Sheets
    ├── Gmail
    └── Google Drive
```

Requested high-level map:

```text
Dashboard
│
├── Acquisition OS
│
├── CRM
│
├── Proposal Engine
│
├── Contacts
│
├── Daily Intelligence
│
├── Operations
│
├── Finance
│
└── Settings
```

## Current Architecture Summary

iGeo OS is currently one unified static dashboard with module sections in a single HTML page and a single JavaScript controller. Acquisition OS is correctly integrated as a core module, not a separate app. The most important next architectural move is not new UI; it is to define shared data relationships so Acquisition opportunities, CRM records, contacts, proposals, quotes, workforce, and intelligence can reference each other without duplicating records.
