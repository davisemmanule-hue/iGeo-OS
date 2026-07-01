const EXECUTIVE_PRIME_SHEET_ID = "1FqWUPmg1alDzUMBEjprdq_zEJcXIm_LHwcqI8hvr4L8";
const EXECUTIVE_WORKFORCE_SHEET_ID = "1RfKwfSjePnIQEFTsH1mcTbB16lGKPUKhkt4qtVqjh-c";
const EXECUTIVE_IMPORTANT_LABEL = "iGeo Important";
const EXECUTIVE_ADMIN_EMAIL = "admin@igeosolutionsllc.com";
const EXECUTIVE_PARTNER_EMAIL = PropertiesService.getScriptProperties().getProperty("PARTNER_EMAIL") || "";

const HIGH_PRIORITY_TERMS = [
  "sam.gov", "solicitation", "contract", "award", "proposal", "payment", "invoice",
  "wire transfer", "capability statement", "prime contractor", "government",
  "vendor registration", "urgent", "deadline", "follow up", "worker application",
];

const LOW_PRIORITY_TERMS = [
  "promotions", "shopping", "marketing", "social", "subscriptions", "advertisements",
  "newsletter", "newsletters", "webinar", "sale", "coupon",
];

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const alertSettings = {
      ownerMode: params.ownerMode !== "false",
      partnerNotifications: params.partnerNotifications !== "false",
      alertThreshold: params.alertThreshold || "high",
    };
    const summary = {
      ok: true,
      generatedAt: new Date().toISOString(),
      prime: readPrimeSummary_(),
      workforce: readWorkforceSummary_(),
      gmail: readGmailSummary_(alertSettings),
    };
    summary.revenue = readRevenueSummary_(summary.prime.records);
    delete summary.prime.records;
    return executiveRespond_(summary, e);
  } catch (error) {
    return executiveRespond_({ ok: false, error: error.message }, e);
  }
}

function readPrimeSummary_() {
  const sheet = SpreadsheetApp.openById(EXECUTIVE_PRIME_SHEET_ID).getSheetByName("Prime Contractors");
  const records = rowsAsObjects_(sheet).filter((row) => !toBoolean_(row.isDeleted));
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  return {
    total: records.length,
    opportunities: records.filter((row) => row.opportunityName || row.solicitationNumber).length,
    followUpsDueToday: records.filter((row) => dateOnly_(row.nextFollowUpDate) === today).length,
    records,
  };
}

function readWorkforceSummary_() {
  const sheet = SpreadsheetApp.openById(EXECUTIVE_WORKFORCE_SHEET_ID).getSheetByName("Worker Intake");
  const records = rowsAsObjects_(sheet).filter((row) => row["Record State"] !== "Deleted");
  return {
    total: records.length,
    newApplications: records.filter((row) => String(row.Status || "New").toLowerCase() === "new").length,
    available: records.filter((row) => {
      const availability = String(row.Availability || "").toLowerCase();
      const status = String(row.Status || "").toLowerCase();
      return status === "available" || (availability && availability !== "unavailable");
    }).length,
  };
}

function readGmailSummary_(settings) {
  const label = getOrCreateLabel_(EXECUTIVE_IMPORTANT_LABEL);
  classifyRecentExecutiveAlerts_(label, settings);
  const threads = label.getThreads(0, 100).filter((thread) => thread.isUnread());
  const counts = {
    critical: threads.length,
    pending: threads.length,
    contracts: 0,
    payments: 0,
    applications: 0,
  };
  threads.forEach((thread) => {
    const text = threadSearchText_(thread);
    if (containsAny_(text, ["solicitation", "contract", "award", "proposal", "prime contractor", "government"])) {
      counts.contracts += 1;
    }
    if (containsAny_(text, ["payment", "invoice", "wire transfer", "bluevine"])) {
      counts.payments += 1;
    }
    if (containsAny_(text, ["worker application", "application", "workforce", "home health", "aba therapy"])) {
      counts.applications += 1;
    }
  });
  return counts;
}

function classifyRecentExecutiveAlerts_(label, settings) {
  const query = [
    "in:inbox",
    "is:unread",
    "newer_than:14d",
    "-category:promotions",
    "-category:social",
    "-category:forums",
  ].join(" ");
  GmailApp.search(query, 0, 50).forEach((thread) => {
    const text = threadSearchText_(thread);
    if (!isHighPriority_(text)) return;
    thread.addLabel(label);
    if (settings.ownerMode) notifyOwners_(thread, text, settings);
  });
}

function notifyOwners_(thread, text, settings) {
  const properties = PropertiesService.getScriptProperties();
  const key = `notified:${thread.getId()}`;
  if (properties.getProperty(key)) return;
  const recipients = [EXECUTIVE_ADMIN_EMAIL];
  if (settings.partnerNotifications && EXECUTIVE_PARTNER_EMAIL) recipients.push(EXECUTIVE_PARTNER_EMAIL);
  const firstMessage = thread.getMessages()[0];
  const subject = firstMessage.getSubject() || "Executive email alert";
  const body = [
    "A high-priority iGeo email was classified for owner review.",
    "",
    `Subject: ${subject}`,
    `From: ${firstMessage.getFrom()}`,
    `Matched terms: ${matchedTerms_(text, HIGH_PRIORITY_TERMS).join(", ")}`,
    "",
    "Open Gmail and review the iGeo Important label.",
  ].join("\n");
  MailApp.sendEmail(recipients.join(","), `iGeo Important: ${subject}`, body);
  properties.setProperty(key, new Date().toISOString());
}

function isHighPriority_(text) {
  if (!containsAny_(text, HIGH_PRIORITY_TERMS)) return false;
  return !containsAny_(text, LOW_PRIORITY_TERMS) || containsAny_(text, ["urgent", "deadline", "award", "payment", "invoice"]);
}

function threadSearchText_(thread) {
  return thread.getMessages()
    .map((message) => [message.getFrom(), message.getSubject(), message.getPlainBody().slice(0, 1500)].join(" "))
    .join(" ")
    .toLowerCase();
}

function containsAny_(text, terms) {
  return terms.some((term) => text.indexOf(term.toLowerCase()) !== -1);
}

function matchedTerms_(text, terms) {
  return terms.filter((term) => text.indexOf(term.toLowerCase()) !== -1);
}

function getOrCreateLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}

function readRevenueSummary_(records) {
  const activeStatuses = ["Active Opportunity", "Teaming Discussion", "Meeting Scheduled"];
  return {
    activeOpportunities: records.filter((row) => activeStatuses.includes(String(row.status))).length,
    estimatedContractValue: records.reduce((total, row) => total + moneyValue_(row.estimatedValue), 0),
    awarded: records.filter((row) => String(row.status) === "Contract Awarded").length,
  };
}

function rowsAsObjects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(String);
  return values
    .filter((row) => row.some((value) => value !== ""))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
}

function moneyValue_(value) {
  const text = String(value || "").replace(/[$,\s]/g, "").toUpperCase();
  const match = text.match(/^(-?\d+(?:\.\d+)?)([KMB])?$/);
  if (!match) return Number(text) || 0;
  const multipliers = { K: 1000, M: 1000000, B: 1000000000 };
  return Number(match[1]) * (multipliers[match[2]] || 1);
}

function dateOnly_(value) {
  if (!value) return "";
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  return String(value).slice(0, 10);
}

function toBoolean_(value) {
  return value === true || String(value).toLowerCase() === "true" || String(value) === "1";
}

function executiveRespond_(data, e) {
  const callback = e && e.parameter && e.parameter.callback;
  const json = JSON.stringify(data);
  if (!callback) return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
  if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Invalid callback." }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(`${callback}(${json});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
