const PRIME_CRM_SHEET_ID = "1FqWUPmg1alDzUMBEjprdq_zEJcXIm_LHwcqI8hvr4L8";
const PRIME_SHEET = "Prime Contractors";
const OPPORTUNITY_SHEET = "Opportunities";
const FOLLOW_UP_SHEET = "Follow-Ups";
const ACTIVITY_SHEET = "Activity Log";

const PRIME_HEADERS = [
  "id", "companyName", "website", "industry", "headquarters", "serviceAreas", "naics",
  "firstName", "lastName", "jobTitle", "email", "phone", "sbloName", "sbloEmail",
  "sbloPhone", "status", "dateFirstContacted", "lastContactDate", "nextFollowUpDate",
  "communicationNotes", "capabilitySent", "capabilityDateSent", "capabilityVersion",
  "opportunityName", "solicitationNumber", "contractType", "estimatedValue", "dueDate",
  "opportunityNotes", "services", "isDeleted", "createdAt", "updatedAt", "archivedAt",
];

const OPPORTUNITY_HEADERS = [
  "recordId", "companyName", "opportunityName", "solicitationNumber", "contractType",
  "estimatedValue", "dueDate", "status", "opportunityNotes", "updatedAt",
];

const FOLLOW_UP_HEADERS = [
  "recordId", "companyName", "contactName", "email", "phone", "status",
  "lastContactDate", "nextFollowUpDate", "communicationNotes", "updatedAt",
];

const ACTIVITY_HEADERS = ["timestamp", "action", "recordId", "companyName", "details"];

function doGet(e) {
  try {
    ensureWorkbook_();
    const action = String((e && e.parameter && e.parameter.action) || "list").toLowerCase();
    if (action === "health") {
      return respond_({ ok: true, service: "iGeo Prime Contractor CRM", timestamp: new Date().toISOString() }, e);
    }
    if (action !== "list") return respond_({ ok: false, error: `Unsupported GET action: ${action}` }, e);

    const includeDeleted = String(e && e.parameter && e.parameter.includeDeleted) === "true";
    const records = readPrimeRecords_().filter((record) => includeDeleted || !toBoolean_(record.isDeleted));
    return respond_({ ok: true, records, count: records.length }, e);
  } catch (error) {
    return respond_({ ok: false, error: error.message, stack: error.stack }, e);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ensureWorkbook_();
    const payload = parsePayload_(e);
    const action = String(payload.action || "upsert").toLowerCase();

    if (action === "upsert") return json_(upsertRecord_(payload.record));
    if (action === "archive") return json_(archiveRecord_(payload.id));
    if (action === "migrate") return json_(migrateRecords_(payload.records || []));
    if (action === "reconcile") {
      return json_(reconcileRecords_(payload.records || [], payload.confirmArchiveMissing));
    }
    return json_({ ok: false, error: `Unsupported POST action: ${action}` });
  } catch (error) {
    return json_({ ok: false, error: error.message, stack: error.stack });
  } finally {
    lock.releaseLock();
  }
}

function upsertRecord_(input) {
  if (!input || !input.id) throw new Error("A record with an id is required.");
  const sheet = getSheet_(PRIME_SHEET);
  const records = readPrimeRecords_();
  const existingIndex = records.findIndex((record) => String(record.id) === String(input.id));
  const now = new Date().toISOString();
  const existing = existingIndex >= 0 ? records[existingIndex] : {};
  const record = normalizeRecord_({
    ...existing,
    ...input,
    isDeleted: false,
    archivedAt: "",
    createdAt: existing.createdAt || input.createdAt || now,
    updatedAt: now,
  });

  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 2, 1, 1, PRIME_HEADERS.length).setValues([recordToRow_(record)]);
  } else {
    sheet.appendRow(recordToRow_(record));
  }

  syncProjectionSheets_();
  logActivity_(existingIndex >= 0 ? "UPDATE" : "CREATE", record, existingIndex >= 0 ? "Record updated." : "Record created.");
  return { ok: true, action: existingIndex >= 0 ? "updated" : "created", record };
}

function archiveRecord_(id) {
  if (!id) throw new Error("A record id is required.");
  const sheet = getSheet_(PRIME_SHEET);
  const records = readPrimeRecords_();
  const index = records.findIndex((record) => String(record.id) === String(id));
  if (index < 0) return { ok: true, action: "not_found", id };

  const now = new Date().toISOString();
  const record = normalizeRecord_({ ...records[index], isDeleted: true, archivedAt: now, updatedAt: now });
  sheet.getRange(index + 2, 1, 1, PRIME_HEADERS.length).setValues([recordToRow_(record)]);
  syncProjectionSheets_();
  logActivity_("ARCHIVE", record, "Record archived; source row retained.");
  return { ok: true, action: "archived", id };
}

function migrateRecords_(incoming) {
  if (!Array.isArray(incoming)) throw new Error("records must be an array.");
  const sheet = getSheet_(PRIME_SHEET);
  const existing = readPrimeRecords_();
  const existingIds = new Set(existing.map((record) => String(record.id)));
  const now = new Date().toISOString();
  const additions = [];
  let skipped = 0;

  incoming.forEach((input) => {
    if (!input || !input.id || existingIds.has(String(input.id))) {
      skipped += 1;
      return;
    }
    const record = normalizeRecord_({
      ...input,
      isDeleted: false,
      createdAt: input.createdAt || now,
      updatedAt: now,
      archivedAt: "",
    });
    additions.push(record);
    existingIds.add(String(record.id));
  });

  if (additions.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, additions.length, PRIME_HEADERS.length)
      .setValues(additions.map(recordToRow_));
  }
  syncProjectionSheets_();
  additions.forEach((record) => logActivity_("MIGRATE", record, "Migrated from browser localStorage."));
  return { ok: true, action: "migrated", migrated: additions.length, skipped, totalReceived: incoming.length };
}

function reconcileRecords_(incoming, confirmArchiveMissing) {
  if (confirmArchiveMissing !== true) throw new Error("Cloud archive confirmation is required.");
  if (!Array.isArray(incoming) || incoming.length === 0) {
    throw new Error("At least one recovery record is required.");
  }

  const sheet = getSheet_(PRIME_SHEET);
  const existing = readPrimeRecords_();
  const existingById = new Map(existing.map((record) => [String(record.id), record]));
  const incomingIds = new Set();
  const now = new Date().toISOString();
  let created = 0;
  let updated = 0;
  let archived = 0;

  const activeRecords = incoming.map((input) => {
    if (!input || !input.id) throw new Error("Every recovery record must have an id.");
    const id = String(input.id);
    if (incomingIds.has(id)) throw new Error(`Duplicate recovery record id: ${id}`);
    incomingIds.add(id);

    const previous = existingById.get(id) || {};
    if (previous.id) updated += 1;
    else created += 1;
    return normalizeRecord_({
      ...previous,
      ...input,
      isDeleted: false,
      archivedAt: "",
      createdAt: previous.createdAt || input.createdAt || now,
      updatedAt: now,
    });
  });

  const retainedArchivedRecords = existing
    .filter((record) => !incomingIds.has(String(record.id)))
    .map((record) => {
      if (toBoolean_(record.isDeleted)) return normalizeRecord_(record);
      archived += 1;
      return normalizeRecord_({
        ...record,
        isDeleted: true,
        archivedAt: now,
        updatedAt: now,
      });
    });

  replaceData_(
    sheet,
    PRIME_HEADERS,
    [...activeRecords, ...retainedArchivedRecords].map(recordToRow_),
  );
  syncProjectionSheets_();
  activeRecords.forEach((record) => logActivity_(
    existingById.has(String(record.id)) ? "RECOVER_UPDATE" : "RECOVER_CREATE",
    record,
    "Reconciled from approved laptop recovery snapshot.",
  ));
  retainedArchivedRecords
    .filter((record) => record.archivedAt === now)
    .forEach((record) => logActivity_(
      "RECOVER_ARCHIVE",
      record,
      "Archived because record was absent from approved laptop recovery snapshot.",
    ));

  return {
    ok: true,
    action: "reconciled",
    active: activeRecords.length,
    created,
    updated,
    archived,
  };
}

function readPrimeRecords_() {
  const sheet = getSheet_(PRIME_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, PRIME_HEADERS.length).getValues()
    .filter((row) => row.some((value) => value !== ""))
    .map((row) => {
      const record = {};
      PRIME_HEADERS.forEach((header, index) => {
        record[header] = serializeCell_(row[index]);
      });
      record.capabilitySent = toBoolean_(record.capabilitySent);
      record.isDeleted = toBoolean_(record.isDeleted);
      record.services = Array.isArray(record.services)
        ? record.services
        : String(record.services || "").split("|").map((value) => value.trim()).filter(Boolean);
      return record;
    });
}

function syncProjectionSheets_() {
  const active = readPrimeRecords_().filter((record) => !toBoolean_(record.isDeleted));
  replaceData_(getSheet_(OPPORTUNITY_SHEET), OPPORTUNITY_HEADERS, active
    .filter((record) => record.opportunityName || record.solicitationNumber)
    .map((record) => [
      record.id, record.companyName, record.opportunityName, record.solicitationNumber,
      record.contractType, record.estimatedValue, record.dueDate, record.status,
      record.opportunityNotes, record.updatedAt,
    ]));
  replaceData_(getSheet_(FOLLOW_UP_SHEET), FOLLOW_UP_HEADERS, active
    .filter((record) => record.nextFollowUpDate)
    .map((record) => [
      record.id, record.companyName, [record.firstName, record.lastName].filter(Boolean).join(" "),
      record.email, record.phone, record.status, record.lastContactDate, record.nextFollowUpDate,
      record.communicationNotes, record.updatedAt,
    ]));
}

function replaceData_(sheet, headers, rows) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, sheet.getMaxColumns()).clearContent();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function logActivity_(action, record, details) {
  getSheet_(ACTIVITY_SHEET).appendRow([new Date().toISOString(), action, record.id, record.companyName, details]);
}

function ensureWorkbook_() {
  const specs = [
    [PRIME_SHEET, PRIME_HEADERS],
    [OPPORTUNITY_SHEET, OPPORTUNITY_HEADERS],
    [FOLLOW_UP_SHEET, FOLLOW_UP_HEADERS],
    [ACTIVITY_SHEET, ACTIVITY_HEADERS],
  ];
  specs.forEach(([name, headers]) => {
    const sheet = getSheet_(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  });
}

function getSheet_(name) {
  const workbook = SpreadsheetApp.openById(PRIME_CRM_SHEET_ID);
  return workbook.getSheetByName(name) || workbook.insertSheet(name);
}

function normalizeRecord_(record) {
  const normalized = {};
  PRIME_HEADERS.forEach((header) => {
    if (header === "services") normalized[header] = Array.isArray(record[header]) ? record[header] : [];
    else if (header === "capabilitySent" || header === "isDeleted") normalized[header] = toBoolean_(record[header]);
    else normalized[header] = record[header] == null ? "" : record[header];
  });
  return normalized;
}

function recordToRow_(record) {
  return PRIME_HEADERS.map((header) => {
    if (header === "services") return (record.services || []).join(" | ");
    return record[header] == null ? "" : record[header];
  });
}

function parsePayload_(e) {
  if (!e) return {};
  const raw = e.postData && e.postData.contents;
  if (raw) return JSON.parse(raw);
  return e.parameter || {};
}

function serializeCell_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ssXXX");
  return value == null ? "" : value;
}

function toBoolean_(value) {
  return value === true || String(value).toLowerCase() === "true" || String(value) === "1";
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function respond_(data, e) {
  const callback = e && e.parameter && e.parameter.callback;
  if (!callback) return json_(data);
  if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) return json_({ ok: false, error: "Invalid callback." });
  return ContentService.createTextOutput(`${callback}(${JSON.stringify(data)});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
