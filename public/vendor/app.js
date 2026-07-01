const STATUS_VALUES = ["Pending", "Submitted", "Approved", "Rejected", "Expired"];
const TAB_SCHEMAS = {
  "Vendor Registrations": [
    field("Company Name", "text", true),
    field("Website", "url"),
    field("Portal Type", "text"),
    field("Status", "select", true),
    field("Date Submitted", "date"),
    field("Login Email", "email"),
    field("Username", "text"),
    field("Contact Name", "text"),
    field("Contact Email", "email"),
    field("Renewal Date", "date"),
    field("Expiration Date", "date"),
    field("Notes", "textarea"),
  ],
  Certifications: [
    field("Certification", "text", true),
    field("Agency", "text"),
    field("Status", "select", true),
    field("Submitted Date", "date"),
    field("Approved Date", "date"),
    field("Expiration Date", "date"),
    field("Renewal Date", "date"),
    field("Contact Email", "email"),
    field("Notes", "textarea"),
  ],
  "SAM Tracking": [
    field("Entity Name", "text", true),
    field("UEI", "text"),
    field("Status", "select", true),
    field("Submission Date", "date"),
    field("Activation Date", "date"),
    field("Expiration Date", "date"),
    field("Renewal Date", "date"),
    field("Government Contact", "text"),
    field("Notes", "textarea"),
  ],
  "CAGE Tracking": [
    field("Entity Name", "text", true),
    field("CAGE Code", "text"),
    field("Status", "select", true),
    field("Submitted Date", "date"),
    field("Assigned Date", "date"),
    field("Expiration Date", "date"),
    field("Renewal Date", "date"),
    field("Notes", "textarea"),
  ],
  Renewals: [
    field("Renewal Item", "text", true),
    field("Owner", "text"),
    field("Status", "select", true),
    field("Renewal Date", "date"),
    field("Expiration Date", "date"),
    field("Reminder Date", "date"),
    field("Priority", "text"),
    field("Notes", "textarea"),
  ],
  Documents: [
    field("Document Name", "text", true),
    field("Document Type", "text"),
    field("Status", "select", true),
    field("Folder Location", "text"),
    field("Drive Link", "url"),
    field("Uploaded Date", "date"),
    field("Expiration Date", "date"),
    field("Renewal Date", "date"),
    field("Notes", "textarea"),
  ],
};

const vendorIntegration = window.IGEO_VENDOR_TRACKER_CONFIG || window.IGEO_INTEGRATIONS?.googleSheets?.vendorTracker || {};
let activeTab = "Vendor Registrations";
let dataStore = {};
let selectedRecord = null;
let toastTimer;

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  initializeDataStore();
  hydrateFilters();
  bindEvents();
  renderShell();
  loadVendorData();
});

function field(label, type, required = false) {
  return { label, key: toKey(label), type, required };
}

function bindElements() {
  [
    "syncState",
    "syncTitle",
    "syncMessage",
    "refreshVendorData",
    "openVendorSheet",
    "metricTotalRecords",
    "metricSubmitted",
    "metricApproved",
    "metricExpiring",
    "metricRenewals",
    "metricDocuments",
    "vendorSearch",
    "vendorStatusFilter",
    "vendorAlertFilter",
    "exportVendorCsv",
    "exportVendorXls",
    "addVendorRecord",
    "alertCount",
    "vendorAlerts",
    "vendorTableHead",
    "vendorTableBody",
    "vendorRecordDialog",
    "vendorRecordForm",
    "dialogTabLabel",
    "dialogTitle",
    "closeVendorDialog",
    "cancelVendorDialog",
    "deleteVendorRecord",
    "recordId",
    "dynamicFields",
    "toast",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function initializeDataStore() {
  Object.keys(TAB_SCHEMAS).forEach((tab) => {
    dataStore[tab] = [];
  });
}

function hydrateFilters() {
  els.vendorStatusFilter.innerHTML = ["All statuses", ...STATUS_VALUES]
    .map((status, index) => `<option value="${index === 0 ? "all" : escapeHtml(status)}">${escapeHtml(status)}</option>`)
    .join("");
}

function bindEvents() {
  document.querySelectorAll("[data-vendor-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.vendorTab;
      document.querySelectorAll("[data-vendor-tab]").forEach((tab) => tab.classList.toggle("active", tab === button));
      els.vendorSearch.value = "";
      els.vendorStatusFilter.value = "all";
      els.vendorAlertFilter.value = "all";
      renderShell();
    });
  });
  els.refreshVendorData.addEventListener("click", loadVendorData);
  els.vendorSearch.addEventListener("input", renderShell);
  els.vendorStatusFilter.addEventListener("input", renderShell);
  els.vendorAlertFilter.addEventListener("input", renderShell);
  els.addVendorRecord.addEventListener("click", () => openRecordDialog());
  els.closeVendorDialog.addEventListener("click", closeRecordDialog);
  els.cancelVendorDialog.addEventListener("click", closeRecordDialog);
  els.deleteVendorRecord.addEventListener("click", deleteSelectedRecord);
  els.vendorRecordForm.addEventListener("submit", saveRecord);
  els.exportVendorCsv.addEventListener("click", () => exportRows("csv"));
  els.exportVendorXls.addEventListener("click", () => exportRows("xls"));
  els.vendorTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit]");
    if (button) openRecordDialog(getActiveRows().find((record) => record.id === button.dataset.edit));
  });
}

function renderShell() {
  renderMetrics();
  renderAlerts();
  renderTable();
}

async function loadVendorData() {
  if (!isEndpointConfigured()) {
    updateSyncState("Setup Required", "Vendor Google Sheets endpoint is not configured.", "Deploy google-apps-script-vendor-tracker.js as a Web App, then paste its /exec URL into integration-config.js.");
    renderShell();
    return;
  }
  updateSyncState("Syncing", "Loading Google Sheets records.", "Google Sheets is the source of truth for this tracker.");
  try {
    const result = await getVendorData({ action: "listAll", _: Date.now() });
    if (!result.ok || !result.tabs) throw new Error(result.error || "Invalid vendor tracker response.");
    Object.keys(TAB_SCHEMAS).forEach((tab) => {
      dataStore[tab] = Array.isArray(result.tabs[tab]) ? result.tabs[tab].map(normalizeRecord) : [];
    });
    if (result.spreadsheetUrl) els.openVendorSheet.href = result.spreadsheetUrl;
    updateSyncState("Synced", "Google Sheets synchronized.", `Loaded ${getAllRows().length} records across ${Object.keys(TAB_SCHEMAS).length} tracker tabs.`);
    renderShell();
  } catch (error) {
    console.error("Vendor tracker sync failed:", error);
    updateSyncState("Sync Error", "Google Sheets sync failed.", error.message || "Check the Apps Script deployment and endpoint URL.");
    showToast("Vendor tracker sync failed.");
  }
}

function renderMetrics() {
  const all = getAllRows();
  els.metricTotalRecords.textContent = all.length;
  els.metricSubmitted.textContent = all.filter((row) => row.status === "Submitted").length;
  els.metricApproved.textContent = all.filter((row) => row.status === "Approved").length;
  els.metricExpiring.textContent = all.filter((row) => isWithinDays(row.expirationDate, 30)).length;
  els.metricRenewals.textContent = all.filter((row) => isDueOrSoon(row.renewalDate || row.reminderDate)).length;
  els.metricDocuments.textContent = (dataStore.Documents || []).length;
}

function renderAlerts() {
  const alerts = getAllRows()
    .flatMap((record) => {
      const title = record.companyName || record.entityName || record.documentName || record.certification || record.renewalItem || "Vendor record";
      const items = [];
      if (record.expirationDate && isDueOrSoon(record.expirationDate)) items.push({ title, date: record.expirationDate, type: isBefore(record.expirationDate, todayIso()) ? "expired" : "soon", label: "Expiration" });
      const renewalDate = record.renewalDate || record.reminderDate;
      if (renewalDate && isDueOrSoon(renewalDate)) items.push({ title, date: renewalDate, type: isBefore(renewalDate, todayIso()) ? "due" : "soon", label: "Renewal" });
      return items;
    })
    .sort((a, b) => compareDates(a.date, b.date));

  els.alertCount.textContent = `${alerts.length} ${alerts.length === 1 ? "alert" : "alerts"}`;
  els.vendorAlerts.innerHTML = alerts.length
    ? alerts.slice(0, 12).map((alert) => `<article class="vendor-alert-card ${alert.type}"><strong>${escapeHtml(alert.title)}</strong><span>${escapeHtml(alert.label)}: ${formatDate(alert.date)}</span></article>`).join("")
    : `<div class="empty-state">No renewal or expiration alerts right now.</div>`;
}

function renderTable() {
  const schema = TAB_SCHEMAS[activeTab];
  const rows = getFilteredRows();
  els.vendorTableHead.innerHTML = `<tr>${schema.map((item) => `<th>${escapeHtml(item.label)}</th>`).join("")}<th>Actions</th></tr>`;
  els.vendorTableBody.innerHTML = rows.length
    ? rows
        .map((record) => `<tr>${schema.map((item) => renderCell(record, item)).join("")}<td><button class="button secondary" type="button" data-edit="${escapeHtml(record.id)}">Edit</button></td></tr>`)
        .join("")
    : `<tr><td class="empty-state" colspan="${schema.length + 1}">No ${escapeHtml(activeTab.toLowerCase())} records match this view.</td></tr>`;
}

function renderCell(record, item) {
  const value = record[item.key] || "";
  if (item.key === "status") return `<td><span class="status-pill ${value === "Approved" ? "success" : ""}">${escapeHtml(value || "Pending")}</span></td>`;
  if (item.type === "date") return `<td class="${dateClass(value)}">${formatDate(value)}</td>`;
  if (item.type === "url" && value) return `<td><a href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a></td>`;
  return `<td>${escapeHtml(value || "Not set")}</td>`;
}

function getFilteredRows() {
  const query = els.vendorSearch.value.trim().toLowerCase();
  const status = els.vendorStatusFilter.value;
  const alertFilter = els.vendorAlertFilter.value;
  return getActiveRows().filter((record) => {
    const text = Object.values(record).join(" ").toLowerCase();
    if (query && !text.includes(query)) return false;
    if (status !== "all" && record.status !== status) return false;
    if (alertFilter === "renewal" && !isDueOrSoon(record.renewalDate || record.reminderDate)) return false;
    if (alertFilter === "expiration" && !isDueOrSoon(record.expirationDate)) return false;
    return true;
  });
}

function openRecordDialog(record = null) {
  selectedRecord = record;
  els.vendorRecordForm.reset();
  els.recordId.value = record?.id || "";
  els.dialogTabLabel.textContent = activeTab;
  els.dialogTitle.textContent = record ? "Edit Record" : "Add Record";
  els.deleteVendorRecord.style.visibility = record ? "visible" : "hidden";
  els.dynamicFields.innerHTML = TAB_SCHEMAS[activeTab].map(renderField).join("");
  if (record) TAB_SCHEMAS[activeTab].forEach((item) => setFieldValue(item.key, record[item.key] || ""));
  els.vendorRecordDialog.showModal();
}

function renderField(item) {
  const required = item.required ? "required" : "";
  if (item.type === "select") {
    return `<label class="field ${required}"><span>${escapeHtml(item.label)}</span><select id="${escapeHtml(item.key)}" ${required}>${STATUS_VALUES.map((status) => `<option>${escapeHtml(status)}</option>`).join("")}</select></label>`;
  }
  if (item.type === "textarea") {
    return `<label class="field wide"><span>${escapeHtml(item.label)}</span><textarea id="${escapeHtml(item.key)}" rows="3" ${required}></textarea></label>`;
  }
  return `<label class="field ${required}"><span>${escapeHtml(item.label)}</span><input id="${escapeHtml(item.key)}" type="${escapeHtml(item.type)}" ${required} /></label>`;
}

async function saveRecord(event) {
  event.preventDefault();
  if (!isEndpointConfigured()) {
    showToast("Configure the Vendor Tracker Web App URL before saving.");
    return;
  }
  const schema = TAB_SCHEMAS[activeTab];
  const record = { id: els.recordId.value || crypto.randomUUID() };
  schema.forEach((item) => {
    record[item.key] = document.getElementById(item.key).value.trim();
  });
  try {
    await postVendorAction({ action: "upsert", tab: activeTab, record });
    closeRecordDialog();
    showToast("Vendor record saved to Google Sheets.");
    await loadVendorData();
  } catch (error) {
    console.error("Vendor save failed:", error);
    showToast(error.message || "Vendor save failed.");
  }
}

async function deleteSelectedRecord() {
  if (!selectedRecord || !isEndpointConfigured()) return;
  try {
    await postVendorAction({ action: "delete", tab: activeTab, id: selectedRecord.id });
    closeRecordDialog();
    showToast("Vendor record deleted from Google Sheets.");
    await loadVendorData();
  } catch (error) {
    console.error("Vendor delete failed:", error);
    showToast(error.message || "Vendor delete failed.");
  }
}

function closeRecordDialog() {
  els.vendorRecordDialog.close();
  els.vendorRecordForm.reset();
  selectedRecord = null;
}

async function postVendorAction(payload) {
  try {
    const response = await fetch(vendorIntegration.endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Google Sheets request failed (${response.status}).`);
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Google Sheets rejected the request.");
    return result;
  } catch (corsError) {
    await fetch(vendorIntegration.endpointUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return { ok: true, accepted: true, verificationRequired: true };
  }
}

function getVendorData(parameters) {
  return new Promise((resolve, reject) => {
    const callback = `igeoVendorTracker_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Google Sheets load timed out."));
    }, 20000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      delete window[callback];
      script.remove();
    };
    window[callback] = (data) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("Google Sheets load failed."));
    };
    script.src = `${vendorIntegration.endpointUrl}?${new URLSearchParams({ ...parameters, callback }).toString()}`;
    document.head.appendChild(script);
  });
}

function exportRows(type) {
  const schema = TAB_SCHEMAS[activeTab];
  const rows = getFilteredRows();
  const filename = `igeo-${activeTab.toLowerCase().replaceAll(" ", "-")}`;
  const data = rows.map((row) => schema.map((item) => row[item.key] || ""));
  if (type === "xls") {
    const table = `<table><tr>${schema.map((item) => `<th>${escapeHtml(item.label)}</th>`).join("")}</tr>${data.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</table>`;
    download(`${filename}.xls`, "application/vnd.ms-excel", table);
    return;
  }
  const csv = [schema.map((item) => item.label), ...data].map((row) => row.map(csvCell).join(",")).join("\n");
  download(`${filename}.csv`, "text/csv", csv);
}

function updateSyncState(state, title, message) {
  els.syncState.textContent = state;
  els.syncTitle.textContent = title;
  els.syncMessage.textContent = message;
}

function isEndpointConfigured() {
  return Boolean(vendorIntegration.enabled && vendorIntegration.endpointUrl && !vendorIntegration.endpointUrl.includes("PASTE_VENDOR_TRACKER_WEB_APP_URL"));
}

function getActiveRows() {
  return dataStore[activeTab] || [];
}

function getAllRows() {
  return Object.values(dataStore).flat();
}

function normalizeRecord(record) {
  return { ...record, id: record.id || crypto.randomUUID(), status: record.status || "Pending" };
}

function setFieldValue(id, value) {
  const element = document.getElementById(id);
  if (element) element.value = value;
}

function toKey(label) {
  return label.replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase()).replace(/[^a-zA-Z0-9]/g, "").replace(/^./, (char) => char.toLowerCase());
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isDueOrSoon(dateValue) {
  return Boolean(dateValue && !isBefore(addDays(30), dateValue));
}

function isWithinDays(dateValue, days) {
  return Boolean(dateValue && !isBefore(dateValue, todayIso()) && !isBefore(addDays(days), dateValue));
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isBefore(a, b) {
  return a && b && new Date(`${a}T00:00:00`) < new Date(`${b}T00:00:00`);
}

function compareDates(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(`${a}T00:00:00`) - new Date(`${b}T00:00:00`);
}

function dateClass(dateValue) {
  if (!dateValue) return "";
  if (isBefore(dateValue, todayIso())) return "date-overdue";
  if (isWithinDays(dateValue, 30)) return "date-warning";
  return "";
}

function formatDate(dateValue) {
  if (!dateValue) return "Not set";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function download(filename, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
}
