# Production Onboarding Notes

The authoritative operating documentation is the [Acquisition OS Production Guide](https://igeosolutionsllc.com/guide/). These notes provide a short onboarding path and must not override the visible production interface.

## Start Here

1. Open `https://igeosolutionsllc.com/`.
2. Review **Today** and the guided procurement workflow.
3. Click **Acquisition OS**, then **Morning Brief**.
4. Follow **Recommended First Task** and review deadlines.
5. Open **Opportunity Intelligence** to review collected or manually entered opportunities and Source Registry status.

## One Opportunity Workflow

1. Enter or collect the opportunity in **Opportunity Intelligence**.
2. Verify the official source, buyer, solicitation number, deadline, attachments, and requirements.
3. Approve a verified opportunity for the canonical pipeline.
4. Review the shared Fit Score, recommendation, confidence, verified facts, assumptions, missing information, risks, financial considerations, timeline urgency, delivery recommendation, next actions, and what would change the recommendation.
5. Click **Open Full Bid Engine** for Thinker's Recon, solicitation analysis, compliance, pricing, proposal preparation, final review, and submission recording.
6. Record buyer follow-up in **Contacts** and deadlines in **Procurement Calendar**.

## Business Profile Registry

Open **Settings**, expand **Operator Settings**, then expand **Business Profile Registry**. Maintain verified company information, business structure, certifications, insurance, licenses, bonding, capacity, geographic coverage, documents, and the Service Library. Click **Save Business Profile** after changes.

The registry supplies company and service information to Opportunity Intelligence, shared scoring, the Acquisition OS Bid Engine, proposal output, and capability-statement output. Missing registry facts are warnings; they are not assumed capabilities.

## Data and Source Safety

- Canonical opportunity IDs are shared by Opportunity Intelligence and the Full Bid Engine.
- Do not create a second opportunity for the same solicitation.
- A source is **Connected** only after a successful live collection.
- **Manual Review Required** means the operator must open the official portal.
- SAM.gov collection requires the server-side `SAM_GOV_API_KEY`; manual entry, search, filtering, scoring, and pipeline work remain available without it.
- Some records and attachments remain browser-local. Use **Export backup** and retain important documents outside browser storage.
- Never store passwords or secrets in notes, Password Hint, localStorage, or public files.

## External Shortcuts

The **Copilot** link beside **Search iGeo OS** opens `https://copilot.microsoft.com/` in a separate tab. It is an external shortcut, not an iGeo module or API integration.

## Scrolling and Settings

The application uses the browser's natural page scroll on desktop and mobile. Acquisition OS workspaces expand within the page; do not look for a second workspace scrollbar. **Operator Settings** expands in normal page flow and pushes the footer downward. If an installed PWA retains older scrolling behavior after this release, close it completely and reopen it so the current service-worker cache can activate.

## Production Verification

Verify user-facing behavior only at `https://igeosolutionsllc.com/`. Preview and GitHub Pages URLs are development/testing environments.
