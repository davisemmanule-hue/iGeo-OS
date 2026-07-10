# User Guide Source Notes

These notes are written for a future start-to-finish operating guide. They describe what a user actually sees and does in the current live iGeo Operations System.

## Start Here

Open:

`https://igeosolutionsllc.com/`

The landing screen is the iGeo Operator Dashboard. The top navigation contains:

- Today
- Acquisition OS
- Contacts
- Quotes
- Applications
- Registrations
- Capability Statements
- Settings

## Daily Operator Workflow

1. Open the main dashboard.
2. Review Today cards:
   - Urgent Emails
   - Follow Ups Due
   - Worker Applications
   - Open Opportunities
   - Bid Engine Items
   - Registrations Pending
   - Quotes Waiting
   - Contracts Active
3. Review My Day checklist.
4. Review Alerts.
5. Open the module that needs work.

Important note for the guide: Today metrics depend on local data in the browser, except where a module successfully syncs from Google Sheets.

## Acquisition OS Quick Entry Guide Notes

Navigation:

Main dashboard > `Acquisition OS`.

Use this for fast opportunity capture and triage.

Primary buttons:

- `Return to Operator Dashboard`: returns to Today.
- `Open Full Bid Engine`: opens the full bid workspace in a new tab.
- `CSV Export`: downloads visible opportunity records.
- `Opportunity`: opens the quick-entry form.

Quick-entry steps:

1. Click `Opportunity`.
2. Enter Opportunity Name.
3. Add Source and Source Link when known.
4. Select Solicitation Type.
5. Enter Solicitation Number and Buyer / Agency.
6. Select Service Type and NAICS.
7. Select Priority Region.
8. Enter Due Date and Estimated Value.
9. Select Performance Method.
10. Select Decision Label.
11. Add contact and notes.
12. Check score fields.
13. Save.

What happens automatically:

- Security work is treated as subcontractor-supported unless requirements are confirmed.
- Priority Michigan regions can mark the opportunity urgent.
- Saved Quick Entry records are mirrored into the Full Bid Engine local workspace.

Guide warning:

- Full Bid Engine edits do not flow back into Quick Entry.

## Full Bid Engine Guide Notes

Navigation:

Main dashboard > Acquisition OS > `Open Full Bid Engine`.

Route:

`https://igeosolutionsllc.com/acquisition-os/full-bid-engine/`

This opens in a separate browser tab.

Use this for complete bid work.

Top buttons:

- `New`: create a new Full Bid Engine opportunity.
- `Save`: save the Full Bid Engine workspace.
- `Word`: export the active opportunity proposal as a Word-compatible `.doc`.
- `PDF`: open the browser print/save-as-PDF flow.

Left area:

- Opportunity Pipeline list.
- Search field.
- Decision filter.

Sidebar/module navigation:

- Opportunity Dashboard
- Bid Engine
- Solicitation Analyzer
- Opportunity Scoring Engine
- Compliance Checklist Generator
- Proposal Draft Generator
- Pricing Worksheet
- Subcontractor / Teaming Partner Tracker
- Incumbent Intelligence
- Procurement Contact Database
- Daily Acquisition Intelligence Integration
- Google Drive Document Storage

Recommended operating sequence:

1. Select or create opportunity.
2. Use Bid Engine to enter core record data.
3. Paste solicitation text into Quick Intake Paste and parse if available.
4. Review Solicitation Analyzer fields.
5. Complete score flags.
6. Review decision label and reasons.
7. Open Compliance Checklist Generator.
8. Mark checklist items complete as work progresses.
9. Build Proposal Draft.
10. Complete Pricing Worksheet.
11. Add partners if subcontracting or teaming is needed.
12. Add procurement contacts.
13. Add incumbent intelligence.
14. Save.
15. Export Word or PDF.

Proposal automation note:

- Proposal text is generated from the active opportunity fields.
- Word export is a `.doc` file generated from HTML.
- PDF export uses browser print/save-to-PDF.
- The user must manually review and complete missing solicitation details.

## Prime Contractor CRM Guide Notes

Navigation:

Main dashboard > `Contacts`.

Use this to track prime contractors and relationship development.

Buttons:

- `Contact`: add a new prime contractor record.
- `CSV Export`: export visible records.
- Reset filters button.
- Report cards filter CRM records.

Main filters:

- Search Companies.
- Filter By Status.
- Filter By Service Type.
- Filter By Follow-Up Date.
- Sort By Last Contact Date.

Record sections:

- Company Information.
- Primary Contact.
- Small Business Contact.
- Relationship & Communication.
- Capability Statement.
- Opportunity Tracking.
- Services of Interest.

Cloud sync note:

- CRM saves locally first.
- Then it attempts Google Sheets sync.
- If cloud sync fails, the record is queued for retry.

Duplicate entry warning:

- CRM opportunity fields are not the same record as Acquisition OS opportunities.

## Workforce Management Guide Notes

Navigation:

Main dashboard > `Applications`.

Use this to track workers, subcontractors, availability, rates, and credentials.

Buttons:

- `Worker Intake Form`: opens public intake form.
- `CSV Export`: export visible worker records.
- `Add Worker`: manually add a worker.

Filters:

- Search Workers.
- Service Category.
- City.
- State.
- Status.

Worker Intake relationship:

- Public Worker Intake writes to Google Sheets.
- Workforce can read Worker Intake rows.
- Manual Workforce records are stored locally.

## Worker Intake Guide Notes

Navigation:

Applications > `Worker Intake Form`, or direct:

`https://igeosolutionsllc.com/worker-intake`

User enters:

- First Name
- Last Name
- Phone
- Email
- City
- State
- Service Category
- Availability
- Hourly Rate
- Driver License
- Vehicle
- Background Check
- Notes

Buttons:

- `Back to Dashboard`
- `Submit Worker Intake`

What happens:

- Form submits to Google Apps Script.
- Script verifies the record by reading the sheet back.
- Success message tells user Workforce database will update from Google Sheets.

## Quote Generator Guide Notes

Navigation:

Main dashboard > `Quotes`.

Use this for quick service quote calculations.

Buttons:

- `New Quote`
- `CSV Export`

Inputs:

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
- Quote Status
- Notes

Outputs:

- Labor Cost.
- Subtotal.
- Final Quote Amount.
- Quote table.
- CSV export.

Guide warning:

- Quote Generator is not connected to Full Bid Engine Pricing Worksheet.

## Vendor Registration Tracker Guide Notes

Navigation:

Main dashboard > `Registrations`.

Use this to track vendor portals and registration status.

Buttons:

- `Add Registration`
- `CSV Export`

Filters:

- Search Registrations.
- Registration Status.

Inputs:

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

Guide warning:

- Vendor Tracker Google Sheets sync is not active.

## Capability Statement Library Guide Notes

Navigation:

Main dashboard > `Capability Statements`.

Use this to access and send capability statement assets.

Actions depend on configured capability statement data and may include:

- Open document.
- Copy email text.
- Download text.
- Email.
- Mark sent.

Guide warning:

- Mark Sent increments a counter but does not automatically attach activity to CRM or Acquisition records.

## Settings Guide Notes

Navigation:

Main dashboard > `Settings`.

Toggles:

- Partner Notifications.
- Email Alerts.
- Simple Mode.
- Advanced Mode.
- Partner View.

Guide warning:

- Settings are saved locally in the browser.
- Email Alerts toggle does not guarantee Gmail API health.

## Gmail Executive Alerts Guide Notes

User-facing location:

- Today dashboard and Alerts panels.

Behind the scenes:

- Dashboard calls `/api/executive-email-alerts`.

Audit result:

- Production API returned HTTP 500.

Guide warning:

- Treat Gmail alerts as not operational until Cloudflare Gmail secrets are confirmed and the endpoint returns JSON counts.

## Mobile Notes

Mobile behavior is responsive but not a separate mobile app.

Expected behavior:

- Layout stacks into a single column.
- Tables scroll horizontally where needed.
- Dialogs fit smaller screens.
- Full Bid Engine collapses sidebar/layout for mobile.

## Laptop Notes

Laptop/desktop behavior:

- Full top navigation is visible.
- Module tables show more columns.
- Full Bid Engine uses sidebar plus pipeline plus content panel.

## Data Safety Notes

Tell users:

- Most data is saved in the current browser.
- Prime CRM and Worker Intake have active Google Sheets paths.
- Acquisition, Full Bid Engine, Quotes, Vendors, manual Workforce, Settings, and Capability sent count are local unless exported or synced later.

## Recommended User Guide Emphasis

The user guide should teach users to:

1. Use Quick Entry for fast capture.
2. Use Full Bid Engine for full pursuit work.
3. Export important bid outputs.
4. Avoid duplicate entry by choosing one source of truth per task where possible.
5. Remember that Quick Entry to Full Bid Engine sync is one-way.
6. Use CRM for relationship tracking, not as the primary bid workspace.
