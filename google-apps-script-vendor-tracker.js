const VENDOR_SPREADSHEET_PROPERTY = "IGEO_VENDOR_TRACKER_SPREADSHEET_ID";
const VENDOR_TABS = {
  "Vendor Registrations": ["id", "companyName", "website", "portalType", "status", "dateSubmitted", "loginEmail", "username", "contactName", "contactEmail", "renewalDate", "expirationDate", "notes"],
  Certifications: ["id", "certification", "agency", "status", "submittedDate", "approvedDate", "expirationDate", "renewalDate", "contactEmail", "notes"],
  "SAM Tracking": ["id", "entityName", "uei", "status", "submissionDate", "activationDate", "expirationDate", "renewalDate", "governmentContact", "notes"],
  "CAGE Tracking": ["id", "entityName", "cageCode", "status", "submittedDate", "assignedDate", "expirationDate", "renewalDate", "notes"],
  Renewals: ["id", "renewalItem", "owner", "status", "renewalDate", "expirationDate", "reminderDate", "priority", "notes"],
  Documents: ["id", "documentName", "documentType", "status", "folderLocation", "driveLink", "uploadedDate", "expirationDate", "renewalDate", "notes"],
};

function setupIgeoVendorTracker() {
  const spreadsheet = getVendorSpreadsheet();
  Object.entries(VENDOR_TABS).forEach(([tabName, headers]) => ensureVendorSheet(spreadsheet, tabName, headers));
  return {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    tabs: Object.keys(VENDOR_TABS),
  };
}

function doGet(e) {
  try {
    const action = e.parameter.action || "listAll";
    const result = action === "setup" ? setupIgeoVendorTracker() : listAllVendorTabs();
    return respond_(result, e.parameter.callback);
  } catch (error) {
    return respond_({ ok: false, error: error.message }, e.parameter.callback);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    if (payload.action === "upsert") return json_(upsertVendorRecord(payload.tab, payload.record));
    if (payload.action === "delete") return json_(deleteVendorRecord(payload.tab, payload.id));
    if (payload.action === "setup") return json_(setupIgeoVendorTracker());
    throw new Error("Unsupported action.");
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function listAllVendorTabs() {
  const spreadsheet = getVendorSpreadsheet();
  const tabs = {};
  Object.entries(VENDOR_TABS).forEach(([tabName, headers]) => {
    const sheet = ensureVendorSheet(spreadsheet, tabName, headers);
    tabs[tabName] = readSheetObjects(sheet);
  });
  return {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    tabs,
  };
}

function upsertVendorRecord(tabName, record) {
  const headers = getHeadersForTab(tabName);
  const spreadsheet = getVendorSpreadsheet();
  const sheet = ensureVendorSheet(spreadsheet, tabName, headers);
  const rows = sheet.getDataRange().getValues();
  const id = record.id || Utilities.getUuid();
  const normalized = { ...record, id };
  const rowIndex = rows.findIndex((row, index) => index > 0 && String(row[0]) === String(id));
  const values = headers.map((header) => normalized[header] || "");
  if (rowIndex >= 0) {
    sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
  return { ok: true, id, tab: tabName };
}

function deleteVendorRecord(tabName, id) {
  const headers = getHeadersForTab(tabName);
  const spreadsheet = getVendorSpreadsheet();
  const sheet = ensureVendorSheet(spreadsheet, tabName, headers);
  const rows = sheet.getDataRange().getValues();
  const rowIndex = rows.findIndex((row, index) => index > 0 && String(row[0]) === String(id));
  if (rowIndex >= 0) sheet.deleteRow(rowIndex + 1);
  return { ok: true, id, tab: tabName };
}

function getVendorSpreadsheet() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty(VENDOR_SPREADSHEET_PROPERTY);
  if (existingId) return SpreadsheetApp.openById(existingId);
  const spreadsheet = SpreadsheetApp.create("iGeo Vendor Registration Tracker");
  properties.setProperty(VENDOR_SPREADSHEET_PROPERTY, spreadsheet.getId());
  return spreadsheet;
}

function ensureVendorSheet(spreadsheet, tabName, headers) {
  let sheet = spreadsheet.getSheetByName(tabName);
  if (!sheet) sheet = spreadsheet.insertSheet(tabName);
  const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  if (currentHeaders.join("|") !== headers.join("|")) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readSheetObjects(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).filter((row) => row.some(Boolean)).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] instanceof Date
        ? Utilities.formatDate(row[index], Session.getScriptTimeZone(), "yyyy-MM-dd")
        : row[index];
    });
    return record;
  });
}

function getHeadersForTab(tabName) {
  const headers = VENDOR_TABS[tabName];
  if (!headers) throw new Error(`Unknown vendor tracker tab: ${tabName}`);
  return headers;
}

function respond_(payload, callback) {
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${JSON.stringify(payload)})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(payload);
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
