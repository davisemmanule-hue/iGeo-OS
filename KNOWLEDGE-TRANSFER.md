# iGeo Acquisition OS Knowledge Transfer

## What a Brand-New Employee Needs to Learn

1. Start at **Today**, then open **Acquisition OS → Morning Brief**.
2. Work the highest-priority verified deadline before researching new leads.
3. Use **Opportunity Intelligence** for collection, manual entry, source verification, and pipeline approval.
4. Never approve a record without checking the official source and attachments.
5. Treat scores and recommendations as deterministic decision support. Review confidence, facts, assumptions, missing information, risks, funding, timeline, delivery method, and next actions.
6. Use **Open Full Bid Engine** for Thinker's Recon, analysis, compliance, pricing, proposal preparation, and submission evidence.
7. Keep buyer follow-ups in **Contacts**, deadlines in **Procurement Calendar**, and registration status in **Registration Center**.
8. Never store passwords or secrets in browser fields. Export backups and retain important documents outside the browser.

## What the Owner Needs to Know

- **Business Profile Registry** in Settings is the authoritative source for company information, service capabilities, NAICS, qualifications, capacity, geography, and document status.
- Missing registry facts are deliberately reported as unverified and can reduce decision confidence.
- Opportunity Intelligence and Full Bid Engine share canonical opportunity IDs; do not recreate the same solicitation.
- A source is not connected unless a live collection succeeds. Manual-review portals require human review.
- SAM.gov automatic collection requires the server-side API key. Manual operations remain usable without it.
- The official production environment is `https://igeosolutionsllc.com/`.

## Unfinished Features

- Validated automated collection for Harris County Bonfire and Houston City College Bonfire.
- Canonical buyer-intelligence relationships between opportunities, buyers, contacts, incumbents, and outreach history.
- Direct Business Profile document relationships in Documentation Library and compliance checklists.
- Proposal-ready selection of certifications, insurance, licenses, and verified capability evidence.
- Production verification and deployment of local checkpoints after approval.

## Existing but Easy-to-Miss Features

- Source Registry is inside Opportunity Intelligence rather than a separate sidebar workspace.
- Business Profile Registry is inside expandable Operator Settings.
- Thinker's Recon is inside the Full Bid Engine before Solicitation Analyzer.
- Global command palette opens with **Ctrl+K** on Windows or **Cmd+K** on macOS.
- **Export backup** is available from Morning Brief.
- **Copilot** in Simple Work is an external link only and leaves iGeo open.

## Technical Debt After Credits Reset

- Validate and safely retire legacy compatibility projections only after production-data comparison.
- Resolve older hard-coded parsing heuristics that remain in the Full Bid Engine intake parser.
- Add focused automated browser fixtures for canonical migration, registry edits, decision explanations, and cross-workspace identity.
- Revisit browser-local records and attachment portability without replacing the current architecture.
- Complete the mobile scrolling/expansion audit that was superseded before its CSS correction was applied.

## Replace Custom Development with Existing Services

- Use official procurement APIs, RSS, structured feeds, email notices, and portal notifications before custom collection.
- Use Microsoft Copilot through the external shortcut rather than building a custom Copilot integration.
- Use official portal submission workflows rather than automated bid submission.
- Use existing document storage and backup services for authoritative files instead of browser-local storage as the only copy.
- Use Cloudflare scheduled Workers only when a verified source permits automated collection; do not introduce separate hosting infrastructure.
