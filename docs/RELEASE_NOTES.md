# iGeo Acquisition OS Version 1.0 Release Notes

## Release scope

This production release adds the authoritative Business Profile Registry foundation, explainable opportunity decision information, and focused application stabilization. It does not add a second registry, scoring engine, dashboard, or opportunity workflow.

## Operator-visible changes

- Today is the only dashboard. Guided Workflow, Morning Brief, My Day Checklist, Alerts, Partner View, and Owner View no longer repeat above other workspaces.
- Acquisition OS opens directly into Opportunity Intelligence, and its heading identifies the selected workspace.
- Settings behaves as a focused workspace and opens Operator Settings for immediate work.
- Opportunity Intelligence action buttons, collection metrics, filters, and record actions wrap to the iPhone viewport instead of relying on a clipped horizontal strip.
- Acquisition OS and the Full Bid Engine use the browser's natural page scroll instead of competing nested vertical scroll regions.
- Operator Settings expands in normal page flow and no longer relies on a height-capped parent workspace.
- Copilot is available beside Search and opens externally while iGeo remains open.
- Empty or legacy placeholder opportunity titles are not presented as active opportunities; the workflow displays **No Active Opportunities** when appropriate.
- Installed clients use the `igeo-operations-foundation-v6` service-worker cache.

## Business-data changes

- Existing business and opportunity records are preserved.
- Canonical opportunity identifiers, scoring rules, proposals, registrations, and pricing data are not migrated or reset by the stabilization changes.

## Confirmed limitations before live verification

- Mobile Safari and installed-PWA behavior require verification on a physical iPhone after production deployment.
- Source connectivity and opportunity activity remain subject to the live source status shown in Opportunity Intelligence.

## Release verification policy

Deployment is not considered verified until the canonical production URL opens, core modules load without blocking errors, and the deployed version is confirmed through the production runtime metadata.
