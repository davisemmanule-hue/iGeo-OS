const STORAGE_KEYS = {
  primes: "igeo_prime_contractors",
  legacyPrimes: "igeo-prime-contractor-crm-v1",
  primeMigration: "igeo_prime_contractors_google_migration",
  primePending: "igeo_prime_contractors_pending_operations",
  primeRecoverySnapshot: "igeo_prime_contractors_recovery_snapshot",
  workers: "igeo_workers",
  quotes: "igeo_quotes",
  vendors: "igeo_vendor_registrations",
};

const primeCrmIntegration = window.IGEO_INTEGRATIONS?.googleSheets?.primeCrm || {};

const statuses = [
  "Prospect",
  "Contacted",
  "Capability Statement Sent",
  "Meeting Scheduled",
  "Teaming Discussion",
  "Active Opportunity",
  "Contract Awarded",
  "Inactive",
];

const services = [
  "Commercial Cleaning",
  "Administrative Support",
  "Data Entry",
  "Documentation Support",
  "Business Process Support",
  "AI Automation",
  "Home Health Support",
  "ABA Therapy Support",
];

const workerServiceCategories = [
  "Commercial Cleaning",
  "Janitorial",
  "Facility Support",
  "Administrative Support",
  "Data Entry",
  "Documentation Support",
  "Home Health Support",
  "Disability Support",
  "ABA Support",
  "General Labor",
  "Transportation",
  "Office Support",
];

const workerStatuses = ["New", "Contacted", "Available", "Quoted", "Approved", "Do Not Use"];
const quoteStatuses = ["Draft", "Sent", "Follow Up", "Accepted", "Rejected"];
const vendorStatuses = ["Not Started", "In Progress", "Submitted", "Approved", "Waiting Response", "Follow Up Needed", "Rejected"];

const today = new Date();
const isoToday = toIsoDate(today);
const branding = window.IGEO_BRANDING || {
  companyName: "iGeo Solutions LLC",
  tagline: "Big Solutions For Small Business",
  logo: { src: "igeo-logo.png", alt: "iGeo Solutions LLC logo" },
  colors: {},
};
const commandCenter = {
  company: "iGeo Solutions LLC",
  phone: "(616) 224-2325",
  email: "admin@igeosolutionsllc.com",
  website: "https://igeosolutionsllc.com/",
  uei: "PQ6GHN6ZS287",
  coverage: ["Kentucky", "Michigan", "Nationwide Subcontract Support"],
};

const samplePrimeRecords = [
  {
    id: crypto.randomUUID(),
    companyName: "Northstar Federal Services",
    website: "https://example.com",
    industry: "Federal Facilities Support",
    headquarters: "Arlington, VA",
    serviceAreas: "DoD, DHS, civilian agencies",
    naics: "561720, 561110, 541611",
    firstName: "Maya",
    lastName: "Coleman",
    jobTitle: "Subcontractor Outreach Manager",
    email: "maya.coleman@example.com",
    phone: "(703) 555-0148",
    sbloName: "Tanya Ellis",
    sbloEmail: "sblo@example.com",
    sbloPhone: "(703) 555-0199",
    status: "Capability Statement Sent",
    dateFirstContacted: shiftDate(-18),
    lastContactDate: shiftDate(-5),
    nextFollowUpDate: isoToday,
    communicationNotes: "Sent updated capability statement and requested inclusion in upcoming janitorial and admin support bids.",
    capabilitySent: true,
    capabilityDateSent: shiftDate(-5),
    capabilityVersion: "iGeo Capabilities v2.1",
    opportunityName: "Regional Facilities Support BPA",
    solicitationNumber: "FA0000-26-R-1001",
    contractType: "BPA",
    estimatedValue: "$4.8M",
    dueDate: shiftDate(14),
    opportunityNotes: "Needs teaming decision and past performance alignment.",
    services: ["Commercial Cleaning", "Administrative Support", "Documentation Support"],
  },
  {
    id: crypto.randomUUID(),
    companyName: "CivicBridge Government Partners",
    website: "https://example.org",
    industry: "Professional Services",
    headquarters: "Atlanta, GA",
    serviceAreas: "HHS, CMS, state health agencies",
    naics: "541611, 561410, 621610",
    firstName: "Derrick",
    lastName: "Nguyen",
    jobTitle: "Capture Director",
    email: "derrick.nguyen@example.org",
    phone: "(404) 555-0137",
    sbloName: "Priya Shah",
    sbloEmail: "priya.shah@example.org",
    sbloPhone: "(404) 555-0118",
    status: "Meeting Scheduled",
    dateFirstContacted: shiftDate(-25),
    lastContactDate: shiftDate(-2),
    nextFollowUpDate: shiftDate(3),
    communicationNotes: "Intro call booked to discuss AI automation, data entry, and home health support desk capacity.",
    capabilitySent: true,
    capabilityDateSent: shiftDate(-10),
    capabilityVersion: "iGeo Capabilities v2.1",
    opportunityName: "Healthcare Administrative Support IDIQ",
    solicitationNumber: "75FCMC26R0042",
    contractType: "IDIQ",
    estimatedValue: "$12M",
    dueDate: shiftDate(28),
    opportunityNotes: "Prepare one-page summary for meeting.",
    services: ["Data Entry", "AI Automation", "Home Health Support", "Business Process Support"],
  },
  {
    id: crypto.randomUUID(),
    companyName: "Keystone Mission Solutions",
    website: "https://example.net",
    industry: "Mission Support",
    headquarters: "San Antonio, TX",
    serviceAreas: "VA, GSA, Air Force",
    naics: "561110, 561410, 624120",
    firstName: "Lauren",
    lastName: "Bryant",
    jobTitle: "Program Manager",
    email: "lauren.bryant@example.net",
    phone: "(210) 555-0120",
    sbloName: "Marcus Reed",
    sbloEmail: "marcus.reed@example.net",
    sbloPhone: "(210) 555-0182",
    status: "Active Opportunity",
    dateFirstContacted: shiftDate(-46),
    lastContactDate: shiftDate(-12),
    nextFollowUpDate: shiftDate(-2),
    communicationNotes: "Follow-up overdue. Need pricing assumptions and staffing availability for documentation support.",
    capabilitySent: true,
    capabilityDateSent: shiftDate(-31),
    capabilityVersion: "iGeo Capabilities v2.0",
    opportunityName: "Documentation Modernization Task Order",
    solicitationNumber: "47QRAA26Q0019",
    contractType: "Task Order",
    estimatedValue: "$850K",
    dueDate: shiftDate(9),
    opportunityNotes: "Requires quick response.",
    services: ["Documentation Support", "Business Process Support", "ABA Therapy Support"],
  },
  {
    id: crypto.randomUUID(),
    companyName: "Summit ClearPath Contractors",
    website: "https://example.co",
    industry: "Facilities and Administrative Services",
    headquarters: "Denver, CO",
    serviceAreas: "GSA Schedule, national facilities",
    naics: "561720, 561210",
    firstName: "Ellen",
    lastName: "Foster",
    jobTitle: "Teaming Lead",
    email: "ellen.foster@example.co",
    phone: "(720) 555-0155",
    sbloName: "Noah Ramirez",
    sbloEmail: "noah.ramirez@example.co",
    sbloPhone: "(720) 555-0164",
    status: "Contract Awarded",
    dateFirstContacted: shiftDate(-120),
    lastContactDate: shiftDate(-7),
    nextFollowUpDate: shiftDate(20),
    communicationNotes: "Won subcontract cleaning support. Track kickoff dates and insurance documentation.",
    capabilitySent: true,
    capabilityDateSent: shiftDate(-95),
    capabilityVersion: "iGeo Capabilities v1.9",
    opportunityName: "Federal Office Cleaning Support",
    solicitationNumber: "GS00Q26P0012",
    contractType: "Subcontract Award",
    estimatedValue: "$325K",
    dueDate: shiftDate(-14),
    opportunityNotes: "Awarded. Awaiting onboarding packet.",
    services: ["Commercial Cleaning"],
  },
];

const sampleVendorRecords = [
  vendorSeed("Maximus", "Completed", "Approved"),
  vendorSeed("Amentum / Critical Mission Solutions", "Submitted", "Submitted"),
  vendorSeed("ABM", "Submitted", "Submitted"),
  vendorSeed("Sodexo", "Email Sent", "Follow Up Needed"),
  vendorSeed("KBS", "Submitted", "Submitted"),
];

let records = loadPrimeRecords();
capturePrimeRecoverySnapshot();
let workers = loadCollection(STORAGE_KEYS.workers, []);
let quotes = loadCollection(STORAGE_KEYS.quotes, []);
let vendors = seedVendorRegistrations(loadCollection(STORAGE_KEYS.vendors, []));
let activeReport = "all";
let toastTimer;
const els = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  applyBranding();
  hydrateControls();
  bindEvents();
  activateModule(getInitialModule());
  render();
  initializePrimeCrmData();
  syncWorkersFromGoogleSheet();
});

function bindElements() {
  [
    "metricTotal",
    "metricOpportunities",
    "metricDueToday",
    "metricCapability",
    "metricMeetings",
    "metricWon",
    "metricWorkersAvailable",
    "metricQuotesSent",
    "metricVendorSubmitted",
    "searchInput",
    "statusFilter",
    "serviceFilter",
    "followFilter",
    "sortSelect",
    "resetFilters",
    "alertList",
    "contractorTable",
    "recordCount",
    "reportContacted",
    "reportCapability",
    "reportActive",
    "reportMeetings",
    "reportAwarded",
    "reportFollowup",
    "recordDialog",
    "recordForm",
    "dialogTitle",
    "recordId",
    "deleteRecord",
    "closeDialog",
    "cancelDialog",
    "addRecord",
    "forcePrimeSync",
    "exportCsv",
    "exportExcel",
    "servicesChecklist",
    "brandLogo",
    "brandFallback",
    "toast",
    "addWorker",
    "workerDialog",
    "workerForm",
    "closeWorkerDialog",
    "cancelWorkerDialog",
    "workerServiceCategory",
    "workerStatus",
    "workerSearch",
    "workerServiceFilter",
    "workerCityFilter",
    "workerStateFilter",
    "workerStatusFilter",
    "workerTable",
    "exportWorkersCsv",
    "exportWorkersExcel",
    "addQuote",
    "quoteDialog",
    "quoteForm",
    "closeQuoteDialog",
    "cancelQuoteDialog",
    "quoteStatus",
    "quoteSearch",
    "quoteTable",
    "quoteLaborPreview",
    "quoteSubtotalPreview",
    "quoteFinal",
    "exportQuotesCsv",
    "exportQuotesExcel",
    "addRegistration",
    "vendorDialog",
    "vendorForm",
    "closeVendorDialog",
    "cancelVendorDialog",
    "vendorStatus",
    "vendorSearch",
    "vendorStatusFilter",
    "vendorTable",
    "exportVendorsCsv",
    "exportVendorsExcel",
    "downloadCapability",
    "quickShare",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function applyBranding() {
  document.title = `${branding.companyName} Operations System`;
  Object.entries(branding.colors || {}).forEach(([key, color]) => {
    document.documentElement.style.setProperty(toCssVariable(key), color);
  });
  document.querySelectorAll('[data-brand="companyName"]').forEach((element) => {
    element.textContent = branding.companyName;
  });
  document.querySelectorAll('[data-brand="tagline"]').forEach((element) => {
    element.textContent = branding.tagline;
  });
  if (els.brandLogo) {
    els.brandLogo.alt = branding.logo?.alt || `${branding.companyName} logo`;
    els.brandLogo.addEventListener("load", () => els.brandLogo.closest(".logo-frame")?.classList.add("has-logo"));
    els.brandLogo.addEventListener("error", () => {
      els.brandLogo.closest(".logo-frame")?.classList.remove("has-logo");
      els.brandFallback.textContent = getBrandInitials(branding.companyName);
    });
    els.brandLogo.src = branding.logo?.src || "";
  }
  if (els.brandFallback) els.brandFallback.textContent = getBrandInitials(branding.companyName);
}

function hydrateControls() {
  fillSelect(els.statusFilter, ["all", ...statuses], "All statuses");
  fillSelect(document.getElementById("status"), statuses);
  fillSelect(els.serviceFilter, ["all", ...services], "All services");
  fillSelect(els.workerServiceCategory, workerServiceCategories);
  fillSelect(els.workerServiceFilter, ["all", ...workerServiceCategories], "All services");
  fillSelect(els.workerStatus, workerStatuses);
  fillSelect(els.workerStatusFilter, ["all", ...workerStatuses], "All statuses");
  fillSelect(els.quoteStatus, quoteStatuses);
  fillSelect(els.vendorStatus, vendorStatuses);
  fillSelect(els.vendorStatusFilter, ["all", ...vendorStatuses], "All statuses");
  els.servicesChecklist.innerHTML = services
    .map(
      (service) => `
        <label class="check-field">
          <input type="checkbox" name="service" value="${escapeHtml(service)}" />
          <span>${escapeHtml(service)}</span>
        </label>
      `,
    )
    .join("");
}

function fillSelect(select, options, allLabel) {
  if (!select) return;
  select.innerHTML = options
    .map((option) => {
      const label = option === "all" && allLabel ? allLabel : option;
      return `<option value="${escapeHtml(option)}">${escapeHtml(label)}</option>`;
    })
    .join("");
}

function bindEvents() {
  ["searchInput", "statusFilter", "serviceFilter", "followFilter", "sortSelect"].forEach((id) => {
    els[id].addEventListener("input", () => {
      activeReport = "all";
      render();
    });
  });
  els.resetFilters.addEventListener("click", resetPrimeFilters);
  els.addRecord.addEventListener("click", () => openPrimeDialog());
  els.forcePrimeSync.addEventListener("click", async () => {
    try {
      await reconcileLaptopPrimeSnapshotToCloud();
    } catch (error) {
      console.error("Prime CRM recovery failed:", error);
      showToast(error.message || "Prime CRM recovery failed.");
    }
  });
  els.closeDialog.addEventListener("click", closePrimeDialog);
  els.cancelDialog.addEventListener("click", closePrimeDialog);
  els.deleteRecord.addEventListener("click", deleteCurrentRecord);
  els.recordForm.addEventListener("submit", savePrimeRecord);
  els.exportCsv.addEventListener("click", () => exportDataset("primes", "csv"));
  els.exportExcel.addEventListener("click", () => exportDataset("primes", "xls"));

  els.addWorker.addEventListener("click", () => openModal(els.workerDialog, els.workerForm));
  els.closeWorkerDialog.addEventListener("click", () => closeModal(els.workerDialog, els.workerForm));
  els.cancelWorkerDialog.addEventListener("click", () => closeModal(els.workerDialog, els.workerForm));
  els.workerForm.addEventListener("submit", saveWorker);
  ["workerSearch", "workerServiceFilter", "workerCityFilter", "workerStateFilter", "workerStatusFilter"].forEach((id) => {
    els[id].addEventListener("input", renderWorkers);
  });
  els.exportWorkersCsv.addEventListener("click", () => exportDataset("workers", "csv"));
  els.exportWorkersExcel.addEventListener("click", () => exportDataset("workers", "xls"));

  els.addQuote.addEventListener("click", () => {
    openModal(els.quoteDialog, els.quoteForm);
    updateQuoteMath();
  });
  els.closeQuoteDialog.addEventListener("click", () => closeModal(els.quoteDialog, els.quoteForm));
  els.cancelQuoteDialog.addEventListener("click", () => closeModal(els.quoteDialog, els.quoteForm));
  els.quoteForm.addEventListener("submit", saveQuote);
  ["quoteHours", "quoteWorkerCount", "quoteHourlyRate", "quoteSupplies", "quoteTravel", "quoteOther", "quoteMarkup"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateQuoteMath);
  });
  els.quoteSearch.addEventListener("input", renderQuotes);
  els.exportQuotesCsv.addEventListener("click", () => exportDataset("quotes", "csv"));
  els.exportQuotesExcel.addEventListener("click", () => exportDataset("quotes", "xls"));

  els.addRegistration.addEventListener("click", () => openModal(els.vendorDialog, els.vendorForm));
  els.closeVendorDialog.addEventListener("click", () => closeModal(els.vendorDialog, els.vendorForm));
  els.cancelVendorDialog.addEventListener("click", () => closeModal(els.vendorDialog, els.vendorForm));
  els.vendorForm.addEventListener("submit", saveVendorRegistration);
  ["vendorSearch", "vendorStatusFilter"].forEach((id) => els[id].addEventListener("input", renderVendors));
  els.exportVendorsCsv.addEventListener("click", () => exportDataset("vendors", "csv"));
  els.exportVendorsExcel.addEventListener("click", () => exportDataset("vendors", "xls"));

  document.querySelectorAll("[data-copy-target], [data-copy-value]").forEach((button) => {
    button.addEventListener("click", () => {
      const valueToCopy = button.dataset.copyValue || document.getElementById(button.dataset.copyTarget)?.textContent || "";
      copyText(valueToCopy, `${button.textContent.trim().replace("Copy ", "")} copied.`);
    });
  });
  els.downloadCapability.addEventListener("click", downloadCapabilityStatement);
  els.quickShare.addEventListener("click", quickShareBusinessCard);

  document.querySelectorAll("[data-module-tab]").forEach((tab) => {
    tab.addEventListener("click", () => activateModule(tab.dataset.moduleTab));
  });
  document.querySelectorAll("[data-report]").forEach((button) => {
    button.addEventListener("click", () => {
      activeReport = button.dataset.report;
      renderPrimeTable(getVisiblePrimeRecords());
    });
  });
  els.contractorTable.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit]");
    if (button) openPrimeDialog(records.find((record) => record.id === button.dataset.edit));
  });
}

function render() {
  renderMetrics();
  renderReports();
  renderAlerts();
  renderPrimeTable(getVisiblePrimeRecords());
  renderWorkers();
  renderQuotes();
  renderVendors();
}

function renderMetrics() {
  els.metricTotal.textContent = records.length;
  els.metricOpportunities.textContent = records.filter(isActiveOpportunity).length;
  els.metricDueToday.textContent = records.filter((record) => record.nextFollowUpDate === isoToday).length;
  els.metricCapability.textContent = records.filter((record) => record.capabilitySent).length;
  els.metricMeetings.textContent = records.filter((record) => record.status === "Meeting Scheduled").length;
  els.metricWon.textContent = records.filter((record) => record.status === "Contract Awarded").length;
  els.metricWorkersAvailable.textContent = workers.filter((worker) => worker.status === "Available").length;
  els.metricQuotesSent.textContent = quotes.filter((quote) => ["Sent", "Follow Up", "Accepted"].includes(quote.quoteStatus)).length;
  els.metricVendorSubmitted.textContent = vendors.filter((vendor) =>
    ["Submitted", "Approved", "Waiting Response", "Follow Up Needed"].includes(vendor.registrationStatus),
  ).length;
}

function renderReports() {
  els.reportContacted.textContent = records.filter((record) => record.dateFirstContacted).length;
  els.reportCapability.textContent = records.filter((record) => record.capabilitySent).length;
  els.reportActive.textContent = records.filter(isActiveOpportunity).length;
  els.reportMeetings.textContent = records.filter((record) => record.status === "Meeting Scheduled").length;
  els.reportAwarded.textContent = records.filter((record) => record.status === "Contract Awarded").length;
  els.reportFollowup.textContent = records.filter((record) => record.nextFollowUpDate).length;
}

function renderAlerts() {
  const overdue = records.filter((record) => isBefore(record.nextFollowUpDate, isoToday));
  const dueSoon = records.filter((record) => {
    if (!record.nextFollowUpDate || isBefore(record.nextFollowUpDate, isoToday)) return false;
    return daysBetween(isoToday, record.nextFollowUpDate) <= 7;
  });
  const actionNeeded = records.filter((record) => requiresOpportunityAction(record) && isWithinDays(record.dueDate, 14));
  const alerts = [
    ...overdue.map((record) => ({ record, type: "overdue", label: `Overdue since ${formatDate(record.nextFollowUpDate)}` })),
    ...dueSoon.map((record) => ({ record, type: "soon", label: `Due ${formatDate(record.nextFollowUpDate)}` })),
    ...actionNeeded.map((record) => ({ record, type: "action", label: `Opportunity due ${formatDate(record.dueDate)}` })),
  ];
  els.alertList.innerHTML = alerts.length
    ? alerts
        .slice(0, 8)
        .map(
          ({ record, type, label }) => `
            <button class="alert-item ${type}" type="button" data-edit="${record.id}">
              <strong>${escapeHtml(record.companyName)}</strong>
              <span>${escapeHtml(label)}</span>
            </button>
          `,
        )
        .join("")
    : `<div class="empty-state">No alerts right now.</div>`;
  els.alertList.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => openPrimeDialog(records.find((record) => record.id === button.dataset.edit)));
  });
}

function renderPrimeTable(rows) {
  els.recordCount.textContent = `${rows.length} ${rows.length === 1 ? "record" : "records"}`;
  if (!rows.length) {
    els.contractorTable.innerHTML = `<tr><td class="empty-state" colspan="8">No records match the current view.</td></tr>`;
    return;
  }
  els.contractorTable.innerHTML = rows
    .map(
      (record) => `
        <tr>
          <td><strong>${escapeHtml(record.companyName)}</strong><small>${escapeHtml(record.industry || "No industry")} - ${escapeHtml(record.headquarters || "No headquarters")}</small></td>
          <td><span class="status-pill ${record.status === "Contract Awarded" ? "success" : ""}">${escapeHtml(record.status)}</span></td>
          <td><strong>${escapeHtml(fullName(record))}</strong><small>${escapeHtml(record.jobTitle || "No title")}<br />${escapeHtml(record.email || "No email")}</small></td>
          <td>${(record.services || []).slice(0, 3).map((service) => `<span class="service-pill">${escapeHtml(service)}</span>`).join("")}</td>
          <td><strong>${escapeHtml(record.opportunityName || "No opportunity")}</strong><small>${escapeHtml(record.solicitationNumber || "No solicitation")} - ${escapeHtml(record.estimatedValue || "No value")}</small></td>
          <td>${formatDate(record.lastContactDate)}</td>
          <td class="${dateClass(record.nextFollowUpDate)}">${formatDate(record.nextFollowUpDate)}</td>
          <td><div class="row-actions"><button class="button secondary" type="button" data-edit="${record.id}">Edit</button></div></td>
        </tr>
      `,
    )
    .join("");
}

function renderWorkers() {
  const rows = getVisibleWorkers();
  els.workerTable.innerHTML = rows.length
    ? rows
        .map(
          (worker) => `
            <tr>
              <td><strong>${escapeHtml(worker.workerName)}</strong><small>${escapeHtml(worker.email || "No email")}<br />${escapeHtml(worker.phone || "No phone")}</small></td>
              <td>${escapeHtml(worker.workerType || "Not set")}</td>
              <td><span class="service-pill">${escapeHtml(worker.serviceCategory || "Not set")}</span></td>
              <td>${escapeHtml([worker.city, worker.state].filter(Boolean).join(", ") || "Not set")}</td>
              <td><small>Hourly ${money(worker.hourlyRate)}<br />Day ${money(worker.dayRate)}<br />Job ${money(worker.perJobRate)}</small></td>
              <td><small>Insurance: ${escapeHtml(worker.insurance)}<br />Background: ${escapeHtml(worker.backgroundCheck)}<br />Gov Site: ${escapeHtml(worker.governmentSite)}</small></td>
              <td><span class="status-pill ${worker.status === "Available" || worker.status === "Approved" ? "success" : ""}">${escapeHtml(worker.status)}</span></td>
            </tr>
          `,
        )
        .join("")
    : `<tr><td class="empty-state" colspan="7">No worker records match the current view.</td></tr>`;
}

function syncWorkersFromGoogleSheet() {
  const endpoint = window.IGEO_WORKER_INTAKE?.endpointUrl;
  if (!endpoint) return;

  const callbackName = `igeoWorkerIntake${Date.now()}`;
  const script = document.createElement("script");
  const separator = endpoint.includes("?") ? "&" : "?";

  window[callbackName] = (response) => {
    try {
      if (response?.ok && Array.isArray(response.rows)) {
        workers = response.rows.filter((row) => row["First Name"] || row["Last Name"] || row.Email).map(sheetWorkerToAppWorker);
        renderMetrics();
        renderWorkers();
      }
    } finally {
      delete window[callbackName];
      script.remove();
    }
  };

  script.onerror = () => {
    delete window[callbackName];
    script.remove();
  };
  script.src = `${endpoint}${separator}callback=${callbackName}`;
  document.body.appendChild(script);
}

function sheetWorkerToAppWorker(row) {
  return {
    id: `${row["Submitted At"] || ""}-${row.Email || ""}`,
    workerName: [row["First Name"], row["Last Name"]].filter(Boolean).join(" ") || "Worker Intake Submission",
    workerType: "Worker Intake",
    serviceCategory: row["Service Category"] || "",
    city: row.City || "",
    state: row.State || "",
    phone: row.Phone || "",
    email: row.Email || "",
    availability: row.Availability || "",
    hourlyRate: Number(row["Hourly Rate"]) || 0,
    dayRate: 0,
    perJobRate: 0,
    insurance: "",
    backgroundCheck: row["Background Check"] || "",
    driversLicense: row["Driver License"] || "",
    vehicle: row.Vehicle || "",
    governmentSite: "",
    notes: row.Notes || "",
    status: row.Status || "New",
  };
}

function renderQuotes() {
  const rows = getVisibleQuotes();
  els.quoteTable.innerHTML = rows.length
    ? rows
        .map(
          (quote) => `
            <tr>
              <td><strong>${escapeHtml(quote.clientName)}</strong><small>${escapeHtml(quote.location || "No location")}</small></td>
              <td>${escapeHtml(quote.opportunityName || "No opportunity")}</td>
              <td>${escapeHtml(quote.serviceType || "Not set")}</td>
              <td>${money(quote.laborCost)}</td>
              <td>${money(quote.subtotal)}</td>
              <td><strong>${money(quote.finalQuoteAmount)}</strong></td>
              <td><span class="status-pill ${quote.quoteStatus === "Accepted" ? "success" : ""}">${escapeHtml(quote.quoteStatus)}</span></td>
            </tr>
          `,
        )
        .join("")
    : `<tr><td class="empty-state" colspan="7">No quote records yet.</td></tr>`;
}

function renderVendors() {
  const rows = getVisibleVendors();
  els.vendorTable.innerHTML = rows.length
    ? rows
        .map(
          (vendor) => `
            <tr>
              <td><strong>${escapeHtml(vendor.companyName)}</strong><small>${escapeHtml(vendor.website || "No website")}</small></td>
              <td>${escapeHtml(vendor.portalType || "Not set")}</td>
              <td><span class="status-pill ${vendor.registrationStatus === "Approved" ? "success" : ""}">${escapeHtml(vendor.registrationStatus)}</span></td>
              <td>${formatDate(vendor.dateSubmitted)}</td>
              <td><small>${escapeHtml(vendor.loginEmail || "No login email")}<br />${escapeHtml(vendor.username || "No username")}</small></td>
              <td><small>${escapeHtml(vendor.contactName || "No contact")}<br />${escapeHtml(vendor.contactEmail || "No contact email")}</small></td>
              <td class="${dateClass(vendor.followUpDate)}">${formatDate(vendor.followUpDate)}</td>
              <td>${escapeHtml(vendor.capabilityStatementSent || "No")}</td>
            </tr>
          `,
        )
        .join("")
    : `<tr><td class="empty-state" colspan="8">No vendor registrations match the current view.</td></tr>`;
}

function getVisiblePrimeRecords() {
  const query = els.searchInput.value.trim().toLowerCase();
  let rows = records.filter((record) => {
    const searchable = [
      record.companyName,
      record.website,
      record.industry,
      record.headquarters,
      record.serviceAreas,
      record.naics,
      fullName(record),
      record.email,
      record.sbloName,
      record.status,
      record.opportunityName,
      record.solicitationNumber,
      ...(record.services || []),
    ].join(" ").toLowerCase();
    if (query && !searchable.includes(query)) return false;
    if (els.statusFilter.value !== "all" && record.status !== els.statusFilter.value) return false;
    if (els.serviceFilter.value !== "all" && !(record.services || []).includes(els.serviceFilter.value)) return false;
    if (!passesFollowFilter(record)) return false;
    if (!passesReport(record)) return false;
    return true;
  });
  rows.sort((a, b) => {
    if (els.sortSelect.value === "oldest") return compareDates(a.lastContactDate, b.lastContactDate);
    if (els.sortSelect.value === "company") return a.companyName.localeCompare(b.companyName);
    if (els.sortSelect.value === "due") return compareDates(a.nextFollowUpDate, b.nextFollowUpDate);
    return compareDates(b.lastContactDate, a.lastContactDate);
  });
  return rows;
}

function getVisibleWorkers() {
  const query = els.workerSearch.value.trim().toLowerCase();
  const city = els.workerCityFilter.value.trim().toLowerCase();
  const state = els.workerStateFilter.value.trim().toLowerCase();
  return workers.filter((worker) => {
    const searchable = [worker.workerName, worker.workerType, worker.serviceCategory, worker.phone, worker.email, worker.notes].join(" ").toLowerCase();
    if (query && !searchable.includes(query)) return false;
    if (els.workerServiceFilter.value !== "all" && worker.serviceCategory !== els.workerServiceFilter.value) return false;
    if (city && !worker.city.toLowerCase().includes(city)) return false;
    if (state && !worker.state.toLowerCase().includes(state)) return false;
    if (els.workerStatusFilter.value !== "all" && worker.status !== els.workerStatusFilter.value) return false;
    return true;
  });
}

function getVisibleQuotes() {
  const query = els.quoteSearch.value.trim().toLowerCase();
  return quotes.filter((quote) => {
    const searchable = [quote.clientName, quote.opportunityName, quote.serviceType, quote.location, quote.quoteStatus, quote.notes].join(" ").toLowerCase();
    return !query || searchable.includes(query);
  });
}

function getVisibleVendors() {
  const query = els.vendorSearch.value.trim().toLowerCase();
  return vendors.filter((vendor) => {
    const searchable = [vendor.companyName, vendor.website, vendor.portalType, vendor.registrationStatus, vendor.loginEmail, vendor.username, vendor.contactName, vendor.contactEmail, vendor.notes].join(" ").toLowerCase();
    if (query && !searchable.includes(query)) return false;
    if (els.vendorStatusFilter.value !== "all" && vendor.registrationStatus !== els.vendorStatusFilter.value) return false;
    return true;
  });
}

function resetPrimeFilters() {
  els.searchInput.value = "";
  els.statusFilter.value = "all";
  els.serviceFilter.value = "all";
  els.followFilter.value = "all";
  els.sortSelect.value = "recent";
  activeReport = "all";
  render();
}

function passesFollowFilter(record) {
  const value = els.followFilter.value;
  if (value === "all") return true;
  if (value === "none") return !record.nextFollowUpDate;
  if (!record.nextFollowUpDate) return false;
  if (value === "overdue") return isBefore(record.nextFollowUpDate, isoToday);
  if (value === "today") return record.nextFollowUpDate === isoToday;
  if (value === "week") return !isBefore(record.nextFollowUpDate, isoToday) && daysBetween(isoToday, record.nextFollowUpDate) <= 7;
  if (value === "future") return isBefore(isoToday, record.nextFollowUpDate);
  return true;
}

function passesReport(record) {
  if (activeReport === "contacted") return Boolean(record.dateFirstContacted);
  if (activeReport === "capability") return record.capabilitySent;
  if (activeReport === "active") return isActiveOpportunity(record);
  if (activeReport === "meetings") return record.status === "Meeting Scheduled";
  if (activeReport === "awarded") return record.status === "Contract Awarded";
  if (activeReport === "followup") return Boolean(record.nextFollowUpDate);
  return true;
}

function openPrimeDialog(record) {
  const current = record || emptyPrimeRecord();
  els.dialogTitle.textContent = record ? "Edit Contractor" : "Add Contractor";
  els.deleteRecord.style.visibility = record ? "visible" : "hidden";
  setFormValue("recordId", current.id);
  [
    "companyName",
    "website",
    "industry",
    "headquarters",
    "serviceAreas",
    "naics",
    "firstName",
    "lastName",
    "jobTitle",
    "email",
    "phone",
    "sbloName",
    "sbloEmail",
    "sbloPhone",
    "status",
    "dateFirstContacted",
    "lastContactDate",
    "nextFollowUpDate",
    "communicationNotes",
    "capabilityDateSent",
    "capabilityVersion",
    "opportunityName",
    "solicitationNumber",
    "contractType",
    "estimatedValue",
    "dueDate",
    "opportunityNotes",
  ].forEach((field) => setFormValue(field, current[field] || ""));
  document.getElementById("capabilitySent").checked = Boolean(current.capabilitySent);
  document.querySelectorAll('input[name="service"]').forEach((input) => {
    input.checked = (current.services || []).includes(input.value);
  });
  els.recordDialog.showModal();
}

function closePrimeDialog() {
  closeModal(els.recordDialog, els.recordForm);
}

async function savePrimeRecord(event) {
  event.preventDefault();
  const record = {
    id: value("recordId") || crypto.randomUUID(),
    companyName: value("companyName"),
    website: value("website"),
    industry: value("industry"),
    headquarters: value("headquarters"),
    serviceAreas: value("serviceAreas"),
    naics: value("naics"),
    firstName: value("firstName"),
    lastName: value("lastName"),
    jobTitle: value("jobTitle"),
    email: value("email"),
    phone: value("phone"),
    sbloName: value("sbloName"),
    sbloEmail: value("sbloEmail"),
    sbloPhone: value("sbloPhone"),
    status: value("status"),
    dateFirstContacted: value("dateFirstContacted"),
    lastContactDate: value("lastContactDate"),
    nextFollowUpDate: value("nextFollowUpDate"),
    communicationNotes: value("communicationNotes"),
    capabilitySent: document.getElementById("capabilitySent").checked,
    capabilityDateSent: value("capabilityDateSent"),
    capabilityVersion: value("capabilityVersion"),
    opportunityName: value("opportunityName"),
    solicitationNumber: value("solicitationNumber"),
    contractType: value("contractType"),
    estimatedValue: value("estimatedValue"),
    dueDate: value("dueDate"),
    opportunityNotes: value("opportunityNotes"),
    services: [...document.querySelectorAll('input[name="service"]:checked')].map((input) => input.value),
  };
  const index = records.findIndex((item) => item.id === record.id);
  if (index >= 0) records[index] = record;
  else records.unshift(record);
  saveCollection(STORAGE_KEYS.primes, records);
  closePrimeDialog();
  render();
  try {
    const result = await postPrimeCrmAction({ action: "upsert", record });
    if (!result.ok) throw new Error(result.error || "Google Sheets rejected the save.");
    if (result.record) {
      const savedIndex = records.findIndex((item) => item.id === record.id);
      if (savedIndex >= 0) records[savedIndex] = normalizePrimeRecord(result.record);
      saveCollection(STORAGE_KEYS.primes, records);
    } else {
      const cloudRecords = await loadPrimeRecordsFromGoogleSheets();
      if (!cloudRecords.some((item) => item.id === record.id)) throw new Error("Saved record was not returned by Google Sheets.");
    }
    showToast("Prime contractor saved to Google Sheets.");
  } catch (error) {
    queuePrimeOperation({ action: "upsert", record });
    showToast("Saved offline. Google Sheets sync will retry automatically.");
    console.error("Prime CRM save queued:", error);
  }
}

async function deleteCurrentRecord() {
  const id = value("recordId");
  if (!id) return;
  const archivedRecord = records.find((record) => record.id === id);
  records = records.filter((record) => record.id !== id);
  saveCollection(STORAGE_KEYS.primes, records);
  closePrimeDialog();
  render();
  try {
    const result = await postPrimeCrmAction({ action: "archive", id });
    if (!result.ok) throw new Error(result.error || "Google Sheets rejected the archive.");
    const cloudRecords = await loadPrimeRecordsFromGoogleSheets();
    if (cloudRecords.some((record) => record.id === id)) throw new Error("Archived record is still active in Google Sheets.");
    showToast("Prime contractor archived in Google Sheets.");
  } catch (error) {
    queuePrimeOperation({ action: "archive", id, record: archivedRecord });
    showToast("Archived offline. Google Sheets sync will retry automatically.");
    console.error("Prime CRM archive queued:", error);
  }
}

function saveWorker(event) {
  event.preventDefault();
  const worker = {
    id: crypto.randomUUID(),
    workerName: value("workerName"),
    workerType: value("workerType"),
    serviceCategory: value("workerServiceCategory"),
    city: value("workerCity"),
    state: value("workerState").toUpperCase(),
    phone: value("workerPhone"),
    email: value("workerEmail"),
    availability: value("workerAvailability"),
    hourlyRate: numberValue("workerHourlyRate"),
    dayRate: numberValue("workerDayRate"),
    perJobRate: numberValue("workerJobRate"),
    insurance: value("workerInsurance"),
    backgroundCheck: value("workerBackground"),
    driversLicense: value("workerLicense"),
    vehicle: value("workerVehicle"),
    governmentSite: value("workerGovernmentSite"),
    notes: value("workerNotes"),
    status: value("workerStatus"),
  };
  workers.unshift(worker);
  saveCollection(STORAGE_KEYS.workers, workers);
  closeModal(els.workerDialog, els.workerForm);
  render();
  showToast("Worker saved.");
}

function saveQuote(event) {
  event.preventDefault();
  const math = calculateQuoteMath();
  const quote = {
    id: crypto.randomUUID(),
    clientName: value("quoteClient"),
    opportunityName: value("quoteOpportunity"),
    serviceType: value("quoteServiceType"),
    location: value("quoteLocation"),
    estimatedHours: numberValue("quoteHours"),
    workersNeeded: numberValue("quoteWorkerCount"),
    workerHourlyRate: numberValue("quoteHourlyRate"),
    suppliesCost: numberValue("quoteSupplies"),
    travelCost: numberValue("quoteTravel"),
    otherCost: numberValue("quoteOther"),
    markupPercentage: numberValue("quoteMarkup"),
    laborCost: math.laborCost,
    subtotal: math.subtotal,
    finalQuoteAmount: math.finalQuoteAmount,
    notes: value("quoteNotes"),
    quoteStatus: value("quoteStatus"),
  };
  quotes.unshift(quote);
  saveCollection(STORAGE_KEYS.quotes, quotes);
  closeModal(els.quoteDialog, els.quoteForm);
  render();
  showToast("Quote saved.");
}

function saveVendorRegistration(event) {
  event.preventDefault();
  const vendor = {
    id: crypto.randomUUID(),
    companyName: value("vendorCompany"),
    website: value("vendorWebsite"),
    portalType: value("vendorPortalType"),
    registrationStatus: value("vendorStatus"),
    dateSubmitted: value("vendorDateSubmitted"),
    loginEmail: value("vendorLoginEmail"),
    username: value("vendorUsername"),
    passwordHint: value("vendorPasswordHint"),
    contactName: value("vendorContactName"),
    contactEmail: value("vendorContactEmail"),
    followUpDate: value("vendorFollowUpDate"),
    capabilityStatementSent: value("vendorCapabilitySent"),
    notes: value("vendorNotes"),
  };
  vendors.unshift(vendor);
  saveCollection(STORAGE_KEYS.vendors, vendors);
  closeModal(els.vendorDialog, els.vendorForm);
  render();
  showToast("Vendor registration saved.");
}

function openModal(dialog, form) {
  form.reset();
  dialog.showModal();
}

function closeModal(dialog, form) {
  dialog.close();
  form.reset();
}

function updateQuoteMath() {
  const math = calculateQuoteMath();
  els.quoteLaborPreview.textContent = money(math.laborCost);
  els.quoteSubtotalPreview.textContent = money(math.subtotal);
  els.quoteFinal.value = math.finalQuoteAmount.toFixed(2);
}

function calculateQuoteMath() {
  const laborCost = numberValue("quoteHours") * numberValue("quoteWorkerCount") * numberValue("quoteHourlyRate");
  const subtotal = laborCost + numberValue("quoteSupplies") + numberValue("quoteTravel") + numberValue("quoteOther");
  const finalQuoteAmount = subtotal + subtotal * (numberValue("quoteMarkup") / 100);
  return { laborCost, subtotal, finalQuoteAmount };
}

function exportDataset(dataset, type) {
  const config = getExportConfig(dataset);
  const rows = config.rows();
  const data = rows.map((row) => config.fields.map((field) => field.value(row)));
  if (type === "xls") {
    const table = `<table><tr>${config.fields.map((field) => `<th>${escapeHtml(field.label)}</th>`).join("")}</tr>${data
      .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell ?? "")}</td>`).join("")}</tr>`)
      .join("")}</table>`;
    download(`${config.filename}.xls`, "application/vnd.ms-excel", table);
    return;
  }
  const csv = [config.fields.map((field) => field.label), ...data].map((row) => row.map(csvCell).join(",")).join("\n");
  download(`${config.filename}.csv`, "text/csv", csv);
}

function getExportConfig(dataset) {
  const configs = {
    primes: {
      filename: "igeo-prime-contractors",
      rows: getVisiblePrimeRecords,
      fields: [
        field("Company Name", (r) => r.companyName),
        field("Website", (r) => r.website),
        field("Industry", (r) => r.industry),
        field("Headquarters Location", (r) => r.headquarters),
        field("Service Areas", (r) => r.serviceAreas),
        field("NAICS Codes", (r) => r.naics),
        field("Primary Contact", fullName),
        field("Job Title", (r) => r.jobTitle),
        field("Email", (r) => r.email),
        field("Phone Number", (r) => r.phone),
        field("SBLO Name", (r) => r.sbloName),
        field("SBLO Email", (r) => r.sbloEmail),
        field("SBLO Phone", (r) => r.sbloPhone),
        field("Status", (r) => r.status),
        field("Date First Contacted", (r) => r.dateFirstContacted),
        field("Last Contact Date", (r) => r.lastContactDate),
        field("Next Follow-Up Date", (r) => r.nextFollowUpDate),
        field("Communication Notes", (r) => r.communicationNotes),
        field("Capability Sent", (r) => (r.capabilitySent ? "Yes" : "No")),
        field("Opportunity Name", (r) => r.opportunityName),
        field("Services of Interest", (r) => (r.services || []).join("; ")),
      ],
    },
    workers: {
      filename: "igeo-workers",
      rows: getVisibleWorkers,
      fields: [
        field("Worker / Company Name", (r) => r.workerName),
        field("Worker Type", (r) => r.workerType),
        field("Service Category", (r) => r.serviceCategory),
        field("City", (r) => r.city),
        field("State", (r) => r.state),
        field("Phone", (r) => r.phone),
        field("Email", (r) => r.email),
        field("Availability", (r) => r.availability),
        field("Hourly Rate", (r) => r.hourlyRate),
        field("Day Rate", (r) => r.dayRate),
        field("Per Job Rate", (r) => r.perJobRate),
        field("Insurance", (r) => r.insurance),
        field("Background Check OK", (r) => r.backgroundCheck),
        field("Driver's License", (r) => r.driversLicense),
        field("Vehicle", (r) => r.vehicle),
        field("Can Work Government Site", (r) => r.governmentSite),
        field("Notes", (r) => r.notes),
        field("Status", (r) => r.status),
      ],
    },
    quotes: {
      filename: "igeo-quotes",
      rows: getVisibleQuotes,
      fields: [
        field("Client / Company Name", (r) => r.clientName),
        field("Opportunity Name", (r) => r.opportunityName),
        field("Service Type", (r) => r.serviceType),
        field("Location", (r) => r.location),
        field("Estimated Hours", (r) => r.estimatedHours),
        field("Number of Workers Needed", (r) => r.workersNeeded),
        field("Worker Hourly Rate", (r) => r.workerHourlyRate),
        field("Supplies Cost", (r) => r.suppliesCost),
        field("Travel Cost", (r) => r.travelCost),
        field("Other Cost", (r) => r.otherCost),
        field("Markup Percentage", (r) => r.markupPercentage),
        field("Labor Cost", (r) => r.laborCost),
        field("Subtotal", (r) => r.subtotal),
        field("Final Quote Amount", (r) => r.finalQuoteAmount),
        field("Notes", (r) => r.notes),
        field("Quote Status", (r) => r.quoteStatus),
      ],
    },
    vendors: {
      filename: "igeo-vendor-registrations",
      rows: getVisibleVendors,
      fields: [
        field("Company Name", (r) => r.companyName),
        field("Website", (r) => r.website),
        field("Portal Type", (r) => r.portalType),
        field("Registration Status", (r) => r.registrationStatus),
        field("Date Submitted", (r) => r.dateSubmitted),
        field("Login Email", (r) => r.loginEmail),
        field("Username", (r) => r.username),
        field("Password Hint", (r) => r.passwordHint),
        field("Contact Name", (r) => r.contactName),
        field("Contact Email", (r) => r.contactEmail),
        field("Follow-Up Date", (r) => r.followUpDate),
        field("Capability Statement Sent", (r) => r.capabilityStatementSent),
        field("Notes", (r) => r.notes),
      ],
    },
  };
  return configs[dataset];
}

function field(label, value) {
  return { label, value };
}

function loadPrimeRecords() {
  const current = loadCollection(STORAGE_KEYS.primes, null);
  if (current) return current;
  const legacy = loadCollection(STORAGE_KEYS.legacyPrimes, null);
  const recordsToUse = legacy || samplePrimeRecords;
  saveCollection(STORAGE_KEYS.primes, recordsToUse);
  return recordsToUse;
}

async function initializePrimeCrmData() {
  if (!isPrimeCrmEndpointConfigured()) {
    console.warn("Prime CRM Google Sheets endpoint is not configured; using localStorage fallback.");
    return;
  }

  try {
    await loadPrimeRecordsFromGoogleSheets();
    const pendingResult = await flushPendingPrimeOperations();
    if (pendingResult.synced > 0) await loadPrimeRecordsFromGoogleSheets();
  } catch (error) {
    console.error("Prime CRM is using the offline fallback:", error);
    showToast("Google Sheets unavailable. Using offline CRM data.");
  }
}

async function loadPrimeRecordsFromGoogleSheets() {
  const result = await getPrimeCrmData({ action: "list", _: Date.now() });
  if (!result.ok || !Array.isArray(result.records)) throw new Error(result.error || "Invalid Google Sheets response.");

  records = result.records.map(normalizePrimeRecord).filter((record) => !record.isDeleted);
  saveCollection(STORAGE_KEYS.primes, records);
  render();
  return records;
}

async function migratePrimeRecordsToGoogleSheets(options = {}) {
  if (!isPrimeCrmEndpointConfigured()) throw new Error("Prime CRM Google Sheets endpoint is not configured.");
  const localRecords = loadCollection(STORAGE_KEYS.primes, []);
  const previous = loadCollection(STORAGE_KEYS.primeMigration, null);
  if (!options.force && previous && previous.completed) return previous;
  if (!Array.isArray(localRecords) || localRecords.length === 0) {
    const emptyResult = { completed: true, migrated: 0, skipped: 0, totalReceived: 0, completedAt: new Date().toISOString() };
    saveCollection(STORAGE_KEYS.primeMigration, emptyResult);
    return emptyResult;
  }

  const before = await getPrimeCrmData({ action: "list", includeDeleted: true, _: Date.now() });
  const existingIds = new Set((before.records || []).map((record) => String(record.id)));
  const result = await postPrimeCrmAction({ action: "migrate", records: localRecords });
  if (!result.ok) throw new Error(result.error || "Migration failed.");
  let migrated = result.migrated;
  let skipped = result.skipped;
  if (migrated == null || skipped == null) {
    const after = await getPrimeCrmData({ action: "list", includeDeleted: true, _: Date.now() });
    const afterIds = new Set((after.records || []).map((record) => String(record.id)));
    migrated = localRecords.filter((record) => !existingIds.has(String(record.id)) && afterIds.has(String(record.id))).length;
    skipped = localRecords.length - migrated;
  }
  const receipt = { ...result, migrated, skipped, totalReceived: localRecords.length, completed: true, completedAt: new Date().toISOString() };
  saveCollection(STORAGE_KEYS.primeMigration, receipt);
  window.IGEO_PRIME_CRM_LAST_MIGRATION = receipt;
  console.info(`Prime CRM migration complete: ${result.migrated} migrated, ${result.skipped} skipped.`);
  if (options.announce !== false) showToast(`${result.migrated} CRM records migrated; ${result.skipped} duplicates skipped.`);
  return receipt;
}

async function reconcileLaptopPrimeSnapshotToCloud(options = {}) {
  if (!isPrimeCrmEndpointConfigured()) throw new Error("Prime CRM Google Sheets endpoint is not configured.");
  const snapshot = loadCollection(STORAGE_KEYS.primeRecoverySnapshot, null);
  if (!Array.isArray(snapshot) || snapshot.length === 0) {
    throw new Error("No laptop recovery snapshot is available.");
  }

  const approved = options.confirm === false || window.confirm(
    `Replace the active cloud CRM with this laptop's ${snapshot.length} contractor record(s)? `
      + "Cloud contractors missing from the laptop snapshot will be archived.",
  );
  if (!approved) return { ok: false, cancelled: true };

  const result = await postPrimeCrmAction({
    action: "reconcile",
    records: snapshot,
    confirmArchiveMissing: true,
  });
  if (!result.ok) throw new Error(result.error || "Cloud reconciliation failed.");

  saveCollection(STORAGE_KEYS.primeMigration, {
    completed: true,
    reconciled: true,
    active: result.active,
    archived: result.archived,
    completedAt: new Date().toISOString(),
  });
  saveCollection(STORAGE_KEYS.primePending, []);
  await loadPrimeRecordsFromGoogleSheets();
  showToast(`Cloud CRM synchronized: ${result.active} active, ${result.archived} archived.`);
  return result;
}

async function flushPendingPrimeOperations() {
  const pending = loadCollection(STORAGE_KEYS.primePending, []);
  if (!Array.isArray(pending) || pending.length === 0) return { synced: 0 };

  const remaining = [];
  let synced = 0;
  for (const operation of pending) {
    try {
      const result = await postPrimeCrmAction(operation);
      if (!result.ok) throw new Error(result.error || "Pending operation failed.");
      synced += 1;
    } catch (error) {
      remaining.push(operation);
      console.error("Prime CRM pending operation still queued:", error);
    }
  }
  saveCollection(STORAGE_KEYS.primePending, remaining);
  return { synced, remaining: remaining.length };
}

async function postPrimeCrmAction(payload) {
  if (!isPrimeCrmEndpointConfigured()) throw new Error("Prime CRM Google Sheets endpoint is not configured.");
  try {
    const response = await fetch(primeCrmIntegration.endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Google Sheets request failed (${response.status}).`);
    return response.json();
  } catch (corsError) {
    await fetch(primeCrmIntegration.endpointUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return { ok: true, accepted: true, verificationRequired: true };
  }
}

function getPrimeCrmData(parameters) {
  if (!isPrimeCrmEndpointConfigured()) return Promise.reject(new Error("Prime CRM Google Sheets endpoint is not configured."));
  return new Promise((resolve, reject) => {
    const callback = `igeoPrimeCrmCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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
    const query = new URLSearchParams({ ...parameters, callback });
    script.src = `${primeCrmIntegration.endpointUrl}?${query.toString()}`;
    document.head.appendChild(script);
  });
}

function queuePrimeOperation(operation) {
  const pending = loadCollection(STORAGE_KEYS.primePending, []);
  const queue = Array.isArray(pending) ? pending : [];
  const withoutOlderCopy = queue.filter((item) => {
    const itemId = item.id || item.record?.id;
    const operationId = operation.id || operation.record?.id;
    return !operationId || itemId !== operationId;
  });
  withoutOlderCopy.push({ ...operation, queuedAt: new Date().toISOString() });
  saveCollection(STORAGE_KEYS.primePending, withoutOlderCopy);
}

function normalizePrimeRecord(record) {
  return {
    ...record,
    capabilitySent: record.capabilitySent === true || String(record.capabilitySent).toLowerCase() === "true",
    isDeleted: record.isDeleted === true || String(record.isDeleted).toLowerCase() === "true",
    services: Array.isArray(record.services)
      ? record.services
      : String(record.services || "").split("|").map((service) => service.trim()).filter(Boolean),
  };
}

function isPrimeCrmEndpointConfigured() {
  return Boolean(
    primeCrmIntegration.enabled
      && primeCrmIntegration.endpointUrl
      && !primeCrmIntegration.endpointUrl.includes("PASTE_WEB_APP_URL"),
  );
}

function capturePrimeRecoverySnapshot() {
  const existing = loadCollection(STORAGE_KEYS.primeRecoverySnapshot, null);
  if (Array.isArray(existing)) return existing;
  const snapshot = Array.isArray(records) ? records.map((record) => ({ ...record })) : [];
  saveCollection(STORAGE_KEYS.primeRecoverySnapshot, snapshot);
  return snapshot;
}

window.forcePrimeCrmMigration = (options = {}) =>
  migratePrimeRecordsToGoogleSheets({
    force: true,
    announce: true,
    ...options,
  });

window.forcePrimeCrmRecovery = (options = {}) =>
  reconcileLaptopPrimeSnapshotToCloud({ confirm: true, ...options });

function loadCollection(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveCollection(key, collection) {
  localStorage.setItem(key, JSON.stringify(collection));
}

function seedVendorRegistrations(existing) {
  const current = Array.isArray(existing) ? [...existing] : [];
  let changed = false;
  sampleVendorRecords.forEach((sample) => {
    if (!current.some((vendor) => vendor.companyName.toLowerCase() === sample.companyName.toLowerCase())) {
      current.push(sample);
      changed = true;
    }
  });
  if (changed) saveCollection(STORAGE_KEYS.vendors, current);
  return current;
}

function vendorSeed(companyName, portalType, registrationStatus) {
  return {
    id: crypto.randomUUID(),
    companyName,
    website: "",
    portalType,
    registrationStatus,
    dateSubmitted: registrationStatus === "Submitted" || registrationStatus === "Approved" ? shiftDate(-7) : "",
    loginEmail: "",
    username: "",
    passwordHint: "",
    contactName: "",
    contactEmail: "",
    followUpDate: shiftDate(7),
    capabilityStatementSent: "Yes",
    notes: "Preloaded registration record.",
  };
}

function emptyPrimeRecord() {
  return { id: crypto.randomUUID(), status: "Prospect", services: [] };
}

function value(id) {
  return document.getElementById(id).value.trim();
}

function numberValue(id) {
  return Number.parseFloat(document.getElementById(id).value) || 0;
}

function setFormValue(id, formValue) {
  document.getElementById(id).value = formValue;
}

function isActiveOpportunity(record) {
  return record.status === "Active Opportunity";
}

function requiresOpportunityAction(record) {
  return Boolean(record.opportunityName) && !["Contract Awarded", "Inactive"].includes(record.status);
}

function fullName(record) {
  return [record.firstName, record.lastName].filter(Boolean).join(" ") || "No contact";
}

function dateClass(date) {
  if (!date) return "";
  if (isBefore(date, isoToday)) return "date-overdue";
  if (daysBetween(isoToday, date) <= 7) return "date-warning";
  return "";
}

function compareDates(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(a) - new Date(b);
}

function isBefore(a, b) {
  if (!a || !b) return false;
  return new Date(`${a}T00:00:00`) < new Date(`${b}T00:00:00`);
}

function isWithinDays(date, days) {
  if (!date || isBefore(date, isoToday)) return false;
  return daysBetween(isoToday, date) <= days;
}

function daysBetween(a, b) {
  const start = new Date(`${a}T00:00:00`);
  const end = new Date(`${b}T00:00:00`);
  return Math.round((end - start) / 86400000);
}

function shiftDate(days) {
  const date = new Date(today);
  date.setDate(today.getDate() + days);
  return toIsoDate(date);
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(date) {
  if (!date) return "Not set";
  const text = String(date);
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00` : text);
  if (Number.isNaN(parsed.getTime())) return text;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) || 0);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function download(filename, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message);
  } catch {
    showToast("Copy failed. Select the text and copy manually.");
  }
}

function getBusinessCardText() {
  return [
    commandCenter.company,
    branding.tagline,
    `Phone: ${commandCenter.phone}`,
    `Email: ${commandCenter.email}`,
    `Website: ${commandCenter.website}`,
    `UEI: ${commandCenter.uei}`,
    `Coverage: ${commandCenter.coverage.join(", ")}`,
  ].join("\n");
}

function downloadCapabilityStatement() {
  const content = [
    "iGeo Solutions LLC Capability Statement",
    "",
    branding.tagline,
    "",
    `Phone: ${commandCenter.phone}`,
    `Email: ${commandCenter.email}`,
    `Website: ${commandCenter.website}`,
    `UEI: ${commandCenter.uei}`,
    `Coverage: ${commandCenter.coverage.join(", ")}`,
    "",
    "Core Services:",
    "- Commercial Cleaning",
    "- Administrative Support",
    "- Data Entry",
    "- Documentation Support",
    "- Business Process Support",
    "- AI Automation",
    "- Home Health Support",
    "- ABA Therapy Support",
  ].join("\n");
  download("igeo-capability-statement.txt", "text/plain", content);
  showToast("Capability statement downloaded.");
}

async function quickShareBusinessCard() {
  const text = getBusinessCardText();
  if (navigator.share) {
    try {
      await navigator.share({
        title: commandCenter.company,
        text,
        url: commandCenter.website,
      });
      showToast("Business card shared.");
      return;
    } catch {
      return;
    }
  }
  await copyText(text, "Digital business card copied.");
}

function activateModule(moduleId) {
  if (!document.querySelector(`[data-module-page="${moduleId}"]`)) moduleId = "prime-crm";
  document.querySelectorAll("[data-module-tab]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.moduleTab === moduleId);
  });
  document.querySelectorAll("[data-module-page]").forEach((page) => {
    page.classList.toggle("active", page.dataset.modulePage === moduleId);
  });
  history.replaceState(null, "", `#${moduleId}`);
}

function getInitialModule() {
  return window.location.hash ? window.location.hash.slice(1) : "prime-crm";
}

function toCssVariable(key) {
  return `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

function getBrandInitials(companyName) {
  return companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
