window.IGEO_INTEGRATIONS = {
  googleSheets: {
    enabled: false,
    purpose: "Structured CRM, quote, workforce, and registration data sync.",
    scopes: ["spreadsheets.readonly", "spreadsheets"],
  },
  googleDrive: {
    enabled: false,
    purpose: "Capability statements, quote PDFs, registration documents, and contract files.",
    scopes: ["drive.file"],
  },
  gmail: {
    enabled: false,
    purpose: "Follow-up reminders, outreach history, vendor portal notifications, and workforce communications.",
    scopes: ["gmail.readonly", "gmail.send"],
  },
};
