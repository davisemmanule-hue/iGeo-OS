# Phase 1 Worker Intake Automation

## Public Form URL

Local:

`worker-intake.html`

After deployment:

`https://igeosolutionsllc.com/worker-intake.html`

## Google Sheet

Worker Intake Database:

`https://docs.google.com/spreadsheets/d/1RfKwfSjePnIQEFTsH1mcTbB16lGKPUKhkt4qtVqjh-c/edit`

## Required Google Apps Script Deployment

Static websites cannot securely write directly to a private Google Sheet. The included Apps Script file creates the secure intake endpoint.

1. Open the Worker Intake Database.
2. Go to `Extensions > Apps Script`.
3. Paste the contents of `google-apps-script-worker-intake.js`.
4. Click `Deploy > New deployment`.
5. Select type: `Web app`.
6. Execute as: `Me`.
7. Who has access: `Anyone`.
8. Deploy and copy the Web App URL.
9. Paste that URL into `worker-intake-config.js` as `endpointUrl`.

After that, public form submissions will append to the Google Sheet.

## Phase 1 Scope

- Public worker intake form.
- Mobile-friendly design.
- Google Sheet database created.
- Form posts to Google Sheets through Apps Script endpoint.
- No changes to Prime Contractor CRM, Vendor Registration Tracker, or Quote Generator.
