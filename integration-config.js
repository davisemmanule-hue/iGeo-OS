window.IGEO_INTEGRATIONS = {
  googleSheets: {
    enabled: true,
    purpose: "Structured CRM, quote, workforce, and registration data sync.",
    scopes: ["spreadsheets.readonly", "spreadsheets"],
    primeCrm: {
      enabled: true,
      spreadsheetId: "1FqWUPmg1alDzUMBEjprdq_zEJcXIm_LHwcqI8hvr4L8",
      spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1FqWUPmg1alDzUMBEjprdq_zEJcXIm_LHwcqI8hvr4L8/edit",
      endpointUrl: "https://script.google.com/macros/s/AKfycbyTccXyMv9_KMfQe9wFxlV8aNez7-T8efagw5TsTKOile_ZXCJ04ukXVLPunpHImju3sQ/exec",
    },
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
