# iGeo OS Data Flow Map

## Data Architecture Summary

The system is browser-first and localStorage-first. The active cloud sync points are:

- Prime Contractor CRM to Google Sheets through Apps Script.
- Worker Intake to Google Sheets through Apps Script.
- Gmail Executive Alerts through a Cloudflare Worker API and Gmail API, but the live endpoint returned HTTP 500 during audit.

There is no shared server database for all modules.

## localStorage Keys

| Key | Owner | Purpose |
| --- | --- | --- |
| `igeo_prime_contractors` | Prime CRM | Active CRM records |
| `igeo-prime-contractor-crm-v1` | Prime CRM | Legacy CRM storage key |
| `igeo_prime_contractors_google_migration` | Prime CRM | Google Sheets migration receipt/state |
| `igeo_prime_contractors_pending_operations` | Prime CRM | Offline upsert/archive queue |
| `igeo_prime_contractors_recovery_snapshot` | Prime CRM | Local recovery snapshot |
| `igeo_workers` | Workforce | Manual/local worker records and imported intake rows |
| `igeo_quotes` | Quote Generator | Quote records |
| `igeo_vendor_registrations` | Vendor Registration | Vendor registration records |
| `igeo_acquisition_opportunities` | Acquisition OS Quick Entry | Quick-entry opportunity records |
| `igeo-acquisition-os` | Full Bid Engine | Full Bid Engine workspace state |
| `igeo_operator_view_mode` | Settings | View and notification preferences |
| `igeo_capability_statements_sent_count` | Capability Statements | Manual sent counter |

## Session Storage

Session storage is used for JSONP response caching, including:

- Prime CRM cache entries.
- Worker Intake list cache entries.

## Main Dashboard Data Flow

Source:

- Reads local arrays initialized in `public/app.js`.
- Calls Executive Alerts API when enabled.

Processing:

- `render()` updates all visible modules.
- Today metrics are calculated from in-memory arrays.

Output:

- Dashboard metric cards.
- Alert badges.
- Counts across modules.

Gap:

- Counts are local-browser dependent unless the related module syncs from cloud first.

## Acquisition Quick Entry Data Flow

Source:

- localStorage `igeo_acquisition_opportunities`.
- Seed records from `sampleAcquisitionOpportunities` if no matching records exist.

Input:

- Quick Entry dialog.

Processing:

- `buildAcquisitionOpportunityFromForm()`.
- `applySecurityGuardrails()`.
- `applyUrgencyRule()`.
- Score summary calculation.

Storage:

- Saves to `igeo_acquisition_opportunities`.
- Calls `syncFullBidEngineFromQuickEntries()` to mirror mapped records into `igeo-acquisition-os`.

Output:

- Acquisition metrics and table.
- CSV export.
- Full Bid Engine receives mapped copies.

Synchronization status:

- Quick Entry to Full Bid Engine: yes, one-way, same browser/localStorage.
- Full Bid Engine to Quick Entry: no.
- Cloud sync: no.

## Full Bid Engine Data Flow

Source:

- localStorage `igeo-acquisition-os`.
- Seed state embedded in `public/acquisition-os/full-bid-engine/index.html`.
- One-way mapped records from Quick Entry.

Input:

- Full Bid Engine forms and editable fields.
- Pasted solicitation text in Quick Intake Paste.

Processing:

- `parseIntakeIntoOpp()` extracts title, agency, source, deadline, NAICS, service, solicitation summary, instructions, requirements, missing items.
- `scoreOpp()` calculates numeric score.
- `decisionFor()` calculates decision label.
- `buildChecklist()` generates compliance tasks.
- `proposalHtml()` creates proposal content.
- Pricing rows calculate totals.

Storage:

- `save()` writes all Full Bid Engine state to `igeo-acquisition-os`.

Output:

- Opportunity dashboard.
- Bid record.
- Analyzer fields.
- Score and decision reasons.
- Compliance checklist.
- Proposal draft.
- Pricing worksheet.
- Partner tracker.
- Incumbent notes.
- Procurement contacts.
- Daily intel notes.
- Drive link fields.
- Word-compatible `.doc`.
- Browser print/PDF.

Synchronization status:

- Receives quick-entry records.
- Does not write back to Quick Entry.
- Does not sync to Google Sheets.
- Does not sync to Google Drive.

## Prime CRM Data Flow

Source:

- localStorage `igeo_prime_contractors`.
- Google Sheets through Apps Script.

Endpoint:

- Spreadsheet: `1FqWUPmg1alDzUMBEjprdq_zEJcXIm_LHwcqI8hvr4L8`.
- Apps Script: `https://script.google.com/macros/s/AKfycbyTccXyMv9_KMfQe9wFxlV8aNez7-T8efagw5TsTKOile_ZXCJ04ukXVLPunpHImju3sQ/exec`.

Input:

- CRM record dialog.

Processing:

- Saves local record first.
- Attempts Apps Script `upsert`.
- If cloud save fails, queues operation in `igeo_prime_contractors_pending_operations`.

Output:

- CRM table.
- Follow-up alerts.
- Reports.
- CSV export.

Synchronization status:

- Active cloud sync path exists.
- Offline queue exists.
- Needs endpoint health and Apps Script schema to remain aligned.

Gap:

- CRM opportunities are separate from Acquisition opportunities.

## Workforce Data Flow

Source:

- localStorage `igeo_workers`.
- Worker Intake Google Sheet readback.

Input:

- Manual `Add Worker` dialog.
- Worker Intake public form.

Processing:

- Manual records save to localStorage.
- Worker Intake rows are read from Apps Script and displayed/imported by dashboard logic.

Output:

- Workforce table.
- Worker metrics.
- CSV export.

Synchronization status:

- Worker Intake writes to Google Sheet.
- Workforce can read Worker Intake rows.
- Manual Workforce records do not sync to Google Sheets.

## Worker Intake Data Flow

Source:

- Public form fields.

Endpoint:

- Spreadsheet: `1RfKwfSjePnIQEFTsH1mcTbB16lGKPUKhkt4qtVqjh-c`.
- Apps Script: `https://script.google.com/macros/s/AKfycbzhXotHCZbZVCwde17SlXMvugPL3M8xbe15LEGicSfB6LAoJq8wub-qWFgUHdH6aCKI5Q/exec`.

Processing:

- `worker-intake.js` POSTs form data.
- Reads rows back with JSONP callback to verify submission.

Output:

- Google Sheet row.
- Success/error message.

Gap:

- No offline fallback for public submissions.

## Quote Generator Data Flow

Source:

- localStorage `igeo_quotes`.

Input:

- Quote dialog.

Processing:

- Calculates labor cost, subtotal, and final quote from hours, workers, costs, and markup.

Output:

- Quote table.
- CSV export.

Gap:

- Not connected to Full Bid Engine Pricing Worksheet.
- No Google Sheets sync.
- No active PDF export.

## Vendor Registration Data Flow

Source:

- localStorage `igeo_vendor_registrations`.

Input:

- Vendor registration dialog.

Output:

- Vendor table.
- CSV export.

Integration config:

- `vendorTracker.enabled` is false.
- Endpoint is `PASTE_VENDOR_TRACKER_WEB_APP_URL`.

Gap:

- No active Google Sheets sync.

## Capability Statement Data Flow

Source:

- Static `capabilityStatements` array in `public/app.js`.
- localStorage sent count.

Output:

- Capability statement cards.
- Copy/download/email/open actions depending on configured data.
- Sent counter.

Gap:

- Sent activity is not tied to CRM records or Acquisition opportunities.

## Gmail Executive Alerts Data Flow

Source:

- Gmail API through Cloudflare Worker secrets.

Route:

- `/api/executive-email-alerts`.

Processing:

- Validates secrets.
- Refreshes Google OAuth token.
- Creates/reads Gmail labels.
- Classifies recent messages.
- Returns alert counts.

Production status:

- Route returned HTTP 500 during audit with empty body.

Gap:

- Not currently operational in production audit.
- Dashboard cannot show actual Gmail alert counts while API fails.

## Cloudflare Data Flow

Request path:

1. Browser requests `igeosolutionsllc.com`.
2. Cloudflare Worker receives request.
3. Worker handles API or rewrites/redirects known routes.
4. Static files are served from `env.ASSETS` bound to `public/`.

Route handling:

- `/api/executive-email-alerts`: Worker API.
- `www.igeosolutionsllc.com`: redirects to root domain in Worker code, though audit saw HTTP 200 for `www` root after Cloudflare handling.
- `/worker-intake` and `/worker-intake/`: rewritten to `/worker-intake.html`.
- `/executive`, `/vendor`, `/workforce`: redirected to main dashboard hash sections.

## Confirmed Quick Entry and Full Bid Engine Sharing

They share data partially.

What works:

- Quick Entry records are mirrored into Full Bid Engine storage with mapped field names.
- The bridge uses `syncFullBidEngineFromQuickEntries()` in `public/app.js`.
- Mirrored records are marked `syncedFromQuickEntry: true`.

What does not work:

- Full Bid Engine edits do not update Quick Entry records.
- Existing Full Bid Engine seed records are separate from Quick Entry records.
- Sync is browser-local only and depends on localStorage.
- There is no cloud/shared database for these opportunity records.

## Duplicate Entry Points

Duplicate entry is currently required when the same real-world item must exist in multiple module-specific records:

- Acquisition opportunity and Prime CRM opportunity.
- Full Bid Engine partner and Workforce/Prime CRM contact.
- Full Bid Engine procurement contact and Prime CRM/Vendor contact.
- Full Bid Engine pricing and Quote Generator quote.
- Capability statement sent activity and CRM communication history.
- Vendor Registration company and Prime CRM company/contact.
- Workforce manual worker and Worker Intake Google Sheet record if created separately.
