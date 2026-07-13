const STORAGE_KEYS = {
  primes: "igeo_prime_contractors",
  legacyPrimes: "igeo-prime-contractor-crm-v1",
  primeMigration: "igeo_prime_contractors_google_migration",
  primePending: "igeo_prime_contractors_pending_operations",
  primeRecoverySnapshot: "igeo_prime_contractors_recovery_snapshot",
  workers: "igeo_workers",
  quotes: "igeo_quotes",
  vendors: "igeo_vendor_registrations",
  acquisitionOpportunities: "igeo_acquisition_opportunities",
  fullBidEngine: "igeo-acquisition-os",
  viewMode: "igeo_operator_view_mode",
  capabilitySentCount: "igeo_capability_statements_sent_count",
};

const primeCrmIntegration = window.IGEO_INTEGRATIONS?.googleSheets?.primeCrm || {};

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

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
  "Janitorial",
  "Custodial",
  "Floor Care",
  "Porter Services",
  "Commercial Cleaning",
  "Administrative Support",
  "Clerical Support",
  "Data Entry",
  "Temporary Staffing",
  "Records Management",
  "Courier Services",
  "Relocation Services",
  "Debris Removal",
  "Grounds Maintenance",
  "Property Maintenance",
  "Documentation Support",
  "Business Process Support",
  "AI Automation",
  "AI Automation Services",
  "Home Health Support",
  "ABA Therapy Support",
  "Armed Security",
  "Unarmed Security",
  "Guard Services",
  "Patrol Services",
  "Facility Security Support",
];

const acquisitionNaics = ["624190", "621610", "561110", "561720", "561612", "561210", "561990"];
const solicitationTypes = ["RFQ", "RFP", "IFB", "Sources Sought", "Combined Synopsis/Solicitation", "Subcontract Lead", "Other"];
const performanceMethods = ["Self-perform", "Subcontract", "Teaming partner", "Broker/referral", "Ignore"];
const decisionLabels = ["Pursue Immediately", "Worth Reviewing", "Build Relationship", "Subcontractor Needed", "Ignore"];
const priorityRegions = [
  "None",
  "Grand Rapids",
  "Kalamazoo",
  "Lansing",
  "Holland",
  "West Michigan",
  "Detroit",
  "Kent County",
  "Ottawa County",
  "Ingham County",
  "Wayne County",
  "Oakland County",
  "Macomb County",
];
const opportunityScoreFields = [
  field("Official source verified", "officialSourceVerified"),
  field("Open opportunity", "openOpportunity"),
  field("Deadline verified", "deadlineVerified"),
  field("Under $250,000", "under250k"),
  field("Service based", "serviceBased"),
  field("Low capital", "lowCapital"),
  field("Subcontractable", "subcontractable"),
  field("Brokerable", "brokerable"),
  field("No major equipment", "noMajorEquipment"),
  field("Fits iGeo services", "fitsIgeoServices"),
  field("Security licensing required", "securityLicensingRequired"),
  field("Bonding required", "bondingRequired"),
  field("Site visit required", "siteVisitRequired"),
];
const acquisitionModules = [
  "Documentation Library",
  "Procurement Calendar",
  "Proposal Version Control",
  "Vendor Registration Automation",
  "Supply & Product Brokerage",
  "Opportunity Intelligence Engine",
  "Opportunity Dashboard",
  "Bid Engine",
  "Solicitation Analyzer",
  "Opportunity Scoring Engine",
  "Compliance Checklist Generator",
  "Proposal Draft Generator",
  "Pricing Worksheet",
  "Subcontractor / Teaming Partner Tracker",
  "Incumbent Intelligence",
  "Procurement Contact Database",
  "Daily Acquisition Intelligence Integration",
  "Google Drive document storage",
  "Export to PDF and Word",
];
const acquisitionModuleIcons = {
  "Documentation Library": "D",
  "Procurement Calendar": "C",
  "Proposal Version Control": "V",
  "Vendor Registration Automation": "R",
  "Supply & Product Brokerage": "S",
  "Opportunity Intelligence Engine": "OI",
  "Opportunity Dashboard": "▦",
  "Bid Engine": "◆",
  "Solicitation Analyzer": "⌕",
  "Opportunity Scoring Engine": "◉",
  "Compliance Checklist Generator": "☑",
  "Proposal Draft Generator": "✎",
  "Pricing Worksheet": "$",
  "Subcontractor / Teaming Partner Tracker": "◈",
  "Incumbent Intelligence": "◎",
  "Procurement Contact Database": "☎",
  "Daily Acquisition Intelligence Integration": "◆",
  "Google Drive document storage": "▣",
  "Export to PDF and Word": "⇩",
};
const acquisitionModuleLabels = {
  "Documentation Library": "Documentation Library",
  "Procurement Calendar": "Procurement Calendar",
  "Proposal Version Control": "Proposal Versions",
  "Vendor Registration Automation": "Registration Center",
  "Supply & Product Brokerage": "Product Brokerage",
  "Opportunity Intelligence Engine": "Intelligence Engine",
  "Opportunity Scoring Engine": "Opportunity Scoring",
  "Compliance Checklist Generator": "Compliance Checklist",
  "Proposal Draft Generator": "Proposal Draft",
  "Subcontractor / Teaming Partner Tracker": "Teaming Tracker",
  "Procurement Contact Database": "Procurement Contacts",
  "Daily Acquisition Intelligence Integration": "Daily Intelligence",
  "Google Drive document storage": "Google Drive Storage",
  "Export to PDF and Word": "Export Word/PDF",
};
const acquisitionModuleTargets = {
  "Documentation Library": "acquisition-extension-documentation",
  "Procurement Calendar": "acquisition-extension-calendar",
  "Proposal Version Control": "acquisition-extension-versions",
  "Vendor Registration Automation": "acquisition-extension-registrations",
  "Supply & Product Brokerage": "acquisition-extension-brokerage",
  "Opportunity Intelligence Engine": "opportunity-intelligence-engine",
  "Opportunity Dashboard": "acquisition-module-opportunity-dashboard",
  "Bid Engine": "acquisition-module-bid-engine",
};
const acquisitionModulePlaceholders = {
  "Solicitation Analyzer": {
    purpose: "Review solicitation requirements, attachments, dates, and decision risks before pursuing.",
    nextAction: "Upload or paste solicitation details when analyzer storage is connected.",
  },
  "Opportunity Scoring Engine": {
    purpose: "Score opportunity fit, urgency, subcontracting need, and readiness criteria.",
    nextAction: "Use the current opportunity score fields while the full scoring workspace is prepared.",
  },
  "Compliance Checklist Generator": {
    purpose: "Build pursuit-specific compliance tasks for licensing, insurance, forms, and submission rules.",
    nextAction: "Select an opportunity once checklist generation is connected.",
  },
  "Proposal Draft Generator": {
    purpose: "Create first-draft proposal language from opportunity details and iGeo capability data.",
    nextAction: "Choose an opportunity after proposal document generation is added.",
  },
  "Pricing Worksheet": {
    purpose: "Estimate labor, supplies, travel, subcontractor costs, markup, and final bid pricing.",
    nextAction: "Use Quotes for pricing until the Acquisition worksheet is added.",
  },
  "Subcontractor / Teaming Partner Tracker": {
    purpose: "Track partners, subcontracting coverage, outreach status, and teaming notes.",
    nextAction: "Add partner records after the tracker is connected to Contacts.",
  },
  "Incumbent Intelligence": {
    purpose: "Capture incumbent contractor clues, past awards, buyer patterns, and competitive context.",
    nextAction: "Add incumbent research after intelligence fields are added.",
  },
  "Procurement Contact Database": {
    purpose: "Store buyer, specialist, contracting officer, and procurement contact details.",
    nextAction: "Use opportunity contact fields until the dedicated database is added.",
  },
  "Daily Acquisition Intelligence Integration": {
    purpose: "Collect daily opportunity signals and acquisition alerts into this workspace.",
    nextAction: "Connect the intelligence feed after the source is configured.",
  },
  "Google Drive document storage": {
    purpose: "Store solicitation files, drafts, checklists, pricing sheets, and exports in Google Drive.",
    nextAction: "Connect Drive folders before storing Acquisition OS documents.",
  },
  "Export to PDF and Word": {
    purpose: "Export proposal, checklist, and opportunity documents as PDF and Word files.",
    nextAction: "Use CSV export for opportunities until document export is added.",
  },
};

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
const capabilityStatements = [
  capabilityStatement("Master Capability Statement", "All iGeo services"),
  capabilityStatement("Commercial Cleaning", "Commercial Cleaning"),
  capabilityStatement("Administrative Support", "Administrative Support"),
  capabilityStatement("AI Automation", "AI Automation"),
  capabilityStatement("Home Health Support", "Home Health Support"),
  capabilityStatement("Disability / ABA Support", "Disability / ABA Support"),
  capabilityStatement("Workforce Support", "Workforce Support"),
  capabilityStatement("Vendor Packet", "Vendor Packet"),
];
const SHEET_CACHE_TTL_MS = 60000;
let executiveEmailCounts = { critical: 0, pending: 0, contracts: 0, payments: 0, applications: 0 };

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

const sampleAcquisitionOpportunities = [
  {
    id: crypto.randomUUID(),
    opportunityName: "County Janitorial and Floor Care Support",
    source: "Official procurement portal",
    sourceLink: "https://sam.gov/search/?index=opp",
    solicitationType: "RFQ",
    solicitationNumber: "ACQ-26-001",
    buyer: "County Facilities Department",
    contactName: "Procurement Office",
    contactEmail: "procurement@example.gov",
    serviceType: "Janitorial",
    naics: "561720",
    dueDate: shiftDate(12),
    estimatedValue: "$185,000",
    performanceMethod: "Self-perform",
    decisionLabel: "Pursue Immediately",
    priorityRegion: "Kent County",
    urgentForIgeo: "YES",
    urgencyReason: "Kent County is a priority West Michigan growth market and this opportunity fits iGeo criteria.",
    notes: "Service-based opportunity under simplified acquisition threshold.",
    officialSourceVerified: true,
    openOpportunity: true,
    deadlineVerified: true,
    under250k: true,
    serviceBased: true,
    lowCapital: true,
    subcontractable: true,
    brokerable: false,
    noMajorEquipment: true,
    fitsIgeoServices: true,
    securityLicensingRequired: false,
    bondingRequired: false,
    siteVisitRequired: true,
  },
  {
    id: crypto.randomUUID(),
    opportunityName: "Facility Guard Services Subcontract Lead",
    source: "Prime contractor notice",
    sourceLink: "https://www.bidnetdirect.com/mitn",
    solicitationType: "Subcontract Lead",
    solicitationNumber: "TEAM-26-014",
    buyer: "Prime contractor",
    contactName: "Small business liaison",
    contactEmail: "sblo@example.com",
    serviceType: "Guard Services",
    naics: "561612",
    dueDate: shiftDate(20),
    estimatedValue: "$420,000",
    performanceMethod: "Subcontract",
    decisionLabel: "Subcontractor Needed",
    priorityRegion: "Detroit",
    urgentForIgeo: "YES",
    urgencyReason: "Detroit is a priority growth market and this security lead is subcontractor-supported.",
    notes: "Security work must stay subcontractor-supported unless licenses, insurance, trained personnel, and compliance documents are confirmed.",
    officialSourceVerified: true,
    openOpportunity: true,
    deadlineVerified: true,
    under250k: false,
    serviceBased: true,
    lowCapital: false,
    subcontractable: true,
    brokerable: true,
    noMajorEquipment: true,
    fitsIgeoServices: true,
    securityLicensingRequired: true,
    bondingRequired: false,
    siteVisitRequired: false,
  },
];

let records = loadPrimeRecords();
capturePrimeRecoverySnapshot();
let workers = loadCollection(STORAGE_KEYS.workers, []);
let quotes = loadCollection(STORAGE_KEYS.quotes, []);
let vendors = seedVendorRegistrations(loadCollection(STORAGE_KEYS.vendors, []));
let acquisitionOpportunities = seedAcquisitionOpportunities(loadCollection(STORAGE_KEYS.acquisitionOpportunities, []));
syncFullBidEngineFromQuickEntries(acquisitionOpportunities);
let workflowOpportunityId = "";
let capabilityStatementsSentCount = Number(loadCollection(STORAGE_KEYS.capabilitySentCount, 0)) || 0;
let activeReport = "all";
let toastTimer;
const els = {};

document.addEventListener("DOMContentLoaded", () => {
  const initialHash = window.location.hash ? window.location.hash.slice(1) : "";
  const initialModule = getInitialModule();
  const shouldResetScroll = !window.location.hash;
  bindElements();
  applyBranding();
  hydrateControls();
  loadViewMode();
  bindEvents();
  activateModule(initialModule, { preserveHash: true });
  setActiveNavigation(initialHash || "today");
  render();
  if (shouldResetScroll) resetInitialScrollPosition();
  initializePrimeCrmData();
  syncWorkersFromGoogleSheet();
  registerServiceWorker();
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
    "globalSearchInput",
    "globalSearchResults",
    "todayUrgentEmails",
    "todayFollowUps",
    "todayWorkerApplications",
    "todayOpenOpportunities",
    "todayBidEngineItems",
    "todayRegistrationsPending",
    "todayQuotesWaiting",
    "todayContractsActive",
    "workflowOpportunity",
    "workflowTracker",
    "workflowTitle",
    "workflowGuidance",
    "workflowNextAction",
    "workflowTodayRfqs",
    "workflowProposalDeadlines",
    "workflowFollowUps",
    "workflowGmailAlerts",
    "workflowWorkerShortages",
    "workflowPaymentsDue",
    "workflowAwards",
    "alertContracts",
    "alertPayments",
    "alertDeadlines",
    "alertApplications",
    "alertSam",
    "alertVendorRegistrations",
    "partnerNotificationsToggle",
    "emailAlertsToggle",
    "simpleModeToggle",
    "partnerViewToggle",
    "advancedModeToggle",
    "settingsAutomationStatus",
    "myDayPanelToggle",
    "myDayPanelContent",
    "settingsPanelToggle",
    "settingsPanelContent",
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
    "addOpportunity",
    "acquisitionDialog",
    "acquisitionForm",
    "acquisitionDialogTitle",
    "closeAcquisitionDialog",
    "cancelAcquisitionDialog",
    "deleteOpportunity",
    "acquisitionId",
    "acquisitionSearch",
    "acquisitionDecisionFilter",
    "acquisitionPerformanceFilter",
    "acquisitionNaicsFilter",
    "acquisitionServiceFilter",
    "acquisitionTable",
    "acquisitionScoreChecklist",
    "acquisitionModuleList",
    "acquisitionModulePlaceholder",
    "acquisitionPlaceholderName",
    "acquisitionPlaceholderPurpose",
    "acquisitionPlaceholderNextAction",
    "exportAcquisitionCsv",
    "acqMetricTotal",
    "acqMetricPursue",
    "acqMetricSubcontractor",
    "acqMetricDueSoon",
    "acqMetricUnder250",
    "acqMetricSecurity",
    "securityRuleNotice",
    "downloadCapability",
    "quickShare",
    "capabilityLibrary",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function applyBranding() {
  document.title = `${branding.companyName} Operator Dashboard`;
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
  fillSelect(els.acquisitionDecisionFilter, ["all", ...decisionLabels], "All decisions");
  fillSelect(els.acquisitionPerformanceFilter, ["all", ...performanceMethods], "All methods");
  fillSelect(els.acquisitionNaicsFilter, ["all", ...acquisitionNaics], "All NAICS");
  fillSelect(els.acquisitionServiceFilter, ["all", ...services], "All services");
  fillSelect(document.getElementById("acqServiceType"), services);
  fillSelect(document.getElementById("acqNaics"), acquisitionNaics);
  fillSelect(document.getElementById("acqSolicitationType"), solicitationTypes);
  fillSelect(document.getElementById("acqPriorityRegion"), priorityRegions);
  fillSelect(document.getElementById("acqPerformanceMethod"), performanceMethods);
  fillSelect(document.getElementById("acqDecisionLabel"), decisionLabels);
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
  hydrateAcquisitionScoreChecklist();
}

function hydrateAcquisitionScoreChecklist() {
  if (!els.acquisitionScoreChecklist) return;
  els.acquisitionScoreChecklist.innerHTML = opportunityScoreFields
    .map(
      (scoreField) => `
        <label class="check-field">
          <input type="checkbox" name="acquisitionScore" value="${escapeHtml(scoreField.value)}" />
          <span>${escapeHtml(scoreField.label)}</span>
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
  bindCollapsiblePanel(els.myDayPanelToggle, els.myDayPanelContent);
  bindCollapsiblePanel(els.settingsPanelToggle, els.settingsPanelContent);
  if (els.workflowOpportunity) els.workflowOpportunity.addEventListener("change", () => {
    workflowOpportunityId = els.workflowOpportunity.value;
    renderWorkflowPanel();
  });
  if (els.workflowNextAction) els.workflowNextAction.addEventListener("click", handleWorkflowNextAction);
  if (els.workflowTracker) els.workflowTracker.addEventListener("click", handleWorkflowStageClick);
  document.querySelectorAll("[data-workflow-action]").forEach((button) => button.addEventListener("click", () => runWorkflowAction(button.dataset.workflowAction)));

  if (els.globalSearchInput && els.globalSearchResults) {
    document.querySelector(".global-search")?.addEventListener("submit", (event) => event.preventDefault());
    els.globalSearchInput.addEventListener("input", renderGlobalSearchSuggestions);
    els.globalSearchInput.addEventListener("focus", renderGlobalSearchSuggestions);
    els.globalSearchInput.addEventListener("keydown", handleGlobalSearchKeydown);
    els.globalSearchResults.addEventListener("click", handleGlobalSearchSelection);
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".global-search")) closeGlobalSearch();
    });
    window.addEventListener("hashchange", () => setActiveNavigation(window.location.hash.slice(1) || "today"));
  }
  ["searchInput", "statusFilter", "serviceFilter", "followFilter", "sortSelect"].forEach((id) => {
    els[id].addEventListener("input", () => {
      activeReport = "all";
      render();
    });
  });
  els.resetFilters.addEventListener("click", resetPrimeFilters);
  els.addRecord.addEventListener("click", () => openPrimeDialog());
  if (els.forcePrimeSync) els.forcePrimeSync.addEventListener("click", async () => {
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
  if (els.exportExcel) els.exportExcel.addEventListener("click", () => exportDataset("primes", "xls"));

  els.addWorker.addEventListener("click", () => openModal(els.workerDialog, els.workerForm));
  els.closeWorkerDialog.addEventListener("click", () => closeModal(els.workerDialog, els.workerForm));
  els.cancelWorkerDialog.addEventListener("click", () => closeModal(els.workerDialog, els.workerForm));
  els.workerForm.addEventListener("submit", saveWorker);
  ["workerSearch", "workerServiceFilter", "workerCityFilter", "workerStateFilter", "workerStatusFilter"].forEach((id) => {
    els[id].addEventListener("input", renderWorkers);
  });
  els.exportWorkersCsv.addEventListener("click", () => exportDataset("workers", "csv"));
  if (els.exportWorkersExcel) els.exportWorkersExcel.addEventListener("click", () => exportDataset("workers", "xls"));

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
  if (els.exportQuotesExcel) els.exportQuotesExcel.addEventListener("click", () => exportDataset("quotes", "xls"));

  els.addRegistration.addEventListener("click", () => openModal(els.vendorDialog, els.vendorForm));
  els.closeVendorDialog.addEventListener("click", () => closeModal(els.vendorDialog, els.vendorForm));
  els.cancelVendorDialog.addEventListener("click", () => closeModal(els.vendorDialog, els.vendorForm));
  els.vendorForm.addEventListener("submit", saveVendorRegistration);
  ["vendorSearch", "vendorStatusFilter"].forEach((id) => els[id].addEventListener("input", renderVendors));
  els.exportVendorsCsv.addEventListener("click", () => exportDataset("vendors", "csv"));
  if (els.exportVendorsExcel) els.exportVendorsExcel.addEventListener("click", () => exportDataset("vendors", "xls"));

  els.addOpportunity.addEventListener("click", () => openAcquisitionDialog());
  els.closeAcquisitionDialog.addEventListener("click", closeAcquisitionDialog);
  els.cancelAcquisitionDialog.addEventListener("click", closeAcquisitionDialog);
  els.deleteOpportunity.addEventListener("click", deleteCurrentOpportunity);
  els.acquisitionForm.addEventListener("submit", saveAcquisitionOpportunity);
  ["acquisitionSearch", "acquisitionDecisionFilter", "acquisitionPerformanceFilter", "acquisitionNaicsFilter", "acquisitionServiceFilter"].forEach((id) => {
    els[id].addEventListener("input", renderAcquisitionOpportunities);
  });
  document.getElementById("acqServiceType").addEventListener("change", applyAcquisitionSecurityRule);
  document.getElementById("acqPriorityRegion").addEventListener("change", updateAcquisitionUrgencyPreview);
  els.acquisitionScoreChecklist.addEventListener("change", applyAcquisitionSecurityRule);
  els.acquisitionScoreChecklist.addEventListener("change", updateAcquisitionUrgencyPreview);
  els.acquisitionTable.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-opportunity]");
    if (editButton) {
      openAcquisitionDialog(acquisitionOpportunities.find((item) => item.id === editButton.dataset.editOpportunity));
      return;
    }
    const deleteButton = event.target.closest("[data-delete-opportunity]");
    if (deleteButton) deleteOpportunityById(deleteButton.dataset.deleteOpportunity);
  });
  els.exportAcquisitionCsv.addEventListener("click", () => exportDataset("acquisition", "csv"));
  els.acquisitionModuleList.addEventListener("click", handleAcquisitionModuleClick);

  document.querySelectorAll("[data-copy-target], [data-copy-value]").forEach((button) => {
    button.addEventListener("click", () => {
      const valueToCopy = button.dataset.copyValue || document.getElementById(button.dataset.copyTarget)?.textContent || "";
      copyText(valueToCopy, `${button.textContent.trim().replace("Copy ", "")} copied.`);
    });
  });
  if (els.downloadCapability) els.downloadCapability.addEventListener("click", downloadCapabilityStatement);
  if (els.quickShare) els.quickShare.addEventListener("click", quickShareBusinessCard);
  if (els.capabilityLibrary) {
    els.capabilityLibrary.addEventListener("click", handleCapabilityLibraryAction);
  }
  if (els.partnerNotificationsToggle) els.partnerNotificationsToggle.addEventListener("change", applyViewMode);
  if (els.emailAlertsToggle) els.emailAlertsToggle.addEventListener("change", applyViewMode);
  if (els.simpleModeToggle) els.simpleModeToggle.addEventListener("change", applyViewMode);
  if (els.partnerViewToggle) els.partnerViewToggle.addEventListener("change", applyViewMode);
  if (els.advancedModeToggle) els.advancedModeToggle.addEventListener("change", applyViewMode);

  document.querySelectorAll("[data-module-tab]").forEach((tab) => {
    tab.addEventListener("click", () => activateModule(tab.dataset.moduleTab, { scroll: true }));
  });
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href").slice(1);
      if (!targetId) return;
      event.preventDefault();
      if (document.querySelector(`[data-module-page="${targetId}"]`)) {
        activateModule(targetId, { scroll: true });
        return;
      }
      setActiveNavigation(targetId);
      scrollToSection(targetId);
      history.replaceState(null, "", `#${targetId}`);
    });
  });
  document.querySelectorAll("[data-report]").forEach((button) => {
    button.addEventListener("click", () => {
      activeReport = button.dataset.report;
      renderPrimeTable(getVisiblePrimeRecords());
    });
  });
  els.contractorTable.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit]");
    if (editButton) {
      openPrimeDialog(records.find((record) => record.id === editButton.dataset.edit));
      return;
    }
    const deleteButton = event.target.closest("[data-delete]");
    if (deleteButton) deletePrimeRecordById(deleteButton.dataset.delete);
  });
}

function render() {
  renderMetrics();
  renderToday();
  renderReports();
  renderAlerts();
  renderPrimeTable(getVisiblePrimeRecords());
  renderWorkers();
  renderQuotes();
  renderVendors();
  renderAcquisitionOpportunities();
  renderAcquisitionModules();
  renderCapabilityLibrary();
  renderGlobalSearchSuggestions();
  renderWorkflowPanel();
}

const procurementWorkflowStages = [
  ["found", "Opportunity Found"], ["imported", "Imported"], ["analyzed", "Analyzed"], ["decision", "GO / NO GO"],
  ["drafting", "Proposal Drafting"], ["pricing", "Pricing"], ["ready", "Ready to Submit"], ["submitted", "Submitted"],
  ["award", "Awaiting Award"], ["awarded", "Awarded"], ["contract", "Active Contract"], ["closed", "Closed"],
];

function renderWorkflowPanel() {
  if (!els.workflowTracker || !els.workflowOpportunity) return;
  const options = [...acquisitionOpportunities].sort((a, b) => compareDates(a.dueDate, b.dueDate));
  if (!workflowOpportunityId || !options.some((item) => item.id === workflowOpportunityId)) workflowOpportunityId = chooseCurrentWorkflowOpportunity(options)?.id || "";
  els.workflowOpportunity.innerHTML = `<option value="">No opportunity selected</option>${options.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.opportunityName || "Untitled opportunity")}</option>`).join("")}`;
  els.workflowOpportunity.value = workflowOpportunityId;
  const opportunity = getWorkflowOpportunity();
  const state = deriveWorkflowState(opportunity);
  els.workflowTitle.textContent = opportunity ? `${opportunity.opportunityName}: ${procurementWorkflowStages[state.index][1]}` : "What do I do next?";
  els.workflowGuidance.textContent = state.guidance;
  els.workflowNextAction.textContent = state.actionLabel;
  els.workflowNextAction.dataset.action = state.action;
  els.workflowTracker.innerHTML = procurementWorkflowStages.map(([key, label], index) => {
    const stageClass = index < state.index ? "complete" : index === state.index ? "current" : "future";
    const disabled = index > state.index ? " disabled" : "";
    const status = index < state.index ? "Completed" : index === state.index ? "Current stage" : "Not available yet";
    return `<li class="workflow-stage ${stageClass}"><button type="button" data-stage="${key}" data-index="${index}"${disabled}><span>${escapeHtml(label)}</span><small>${status}</small></button></li>`;
  }).join("");
  renderDailyWorkflowMetrics();
}

function chooseCurrentWorkflowOpportunity(options) {
  return options.find((item) => !/ignore/i.test(item.decisionLabel || "")) || options[0];
}

function getWorkflowOpportunity() {
  return acquisitionOpportunities.find((item) => item.id === workflowOpportunityId) || null;
}

function deriveWorkflowState(opportunity) {
  if (!opportunity) return { index: 0, action: "find", actionLabel: "Find New Opportunity", guidance: "Find or import an opportunity. iGeo OS will guide the next step." };
  const full = (loadFullBidEngineState().opportunities || []).find((item) => item.id === opportunity.id) || {};
  const text = [full.status, full.stage, full.notes, full.nextAction].join(" ").toLowerCase();
  if (/closed|closeout/.test(text) || opportunity.openOpportunity === false) return workflowState(11, "dashboard", "Review Closeout", "Archive the record, capture lessons learned, and preserve past performance.");
  if (/active contract|in performance/.test(text)) return workflowState(10, "workforce", "Manage Contract", "Coordinate workforce, contacts, compliance, payments, and contract tasks.");
  if (/awarded|contract awarded/.test(text)) return workflowState(9, "contacts", "Start Award Setup", "Confirm the award, buyer contacts, staffing, compliance, and kickoff requirements.");
  if (/submitted/.test(full.status || "")) return workflowState(8, "continue", "Track Award", "Monitor buyer communications, record follow-up, and request a debrief if lost.");
  if (/ready to submit/.test(text)) return workflowState(6, "continue", "Review Submission Package", "Confirm final files, submission method, contacts, and deadline before submitting.");
  if ((full.pricing || []).length) return workflowState(5, "continue", "Approve Pricing", "Manually review labor, materials, subcontractors, overhead, profit, and final price.");
  if (/drafting/.test(full.status || "") || (full.checklist || []).length) return workflowState(4, "continue", "Continue Proposal", "Complete the checklist, draft, staffing plan, capability statement, and required documents.");
  if (/ignore/i.test(opportunity.decisionLabel || "")) return workflowState(3, "acquisition", "Review NO GO", "Confirm the no-go decision and retain the record for reporting.");
  if (opportunity.decisionLabel && opportunity.decisionLabel !== "Worth Reviewing") return workflowState(4, "continue", "Open Proposal Workspace", "The opportunity has a pursuit path. Continue into the existing Full Bid Engine.");
  if (full.solicitation || full.requirements || full.instructions) return workflowState(3, "continue", "Make GO / NO GO Decision", "Review score, risks, capital, insurance, subcontracting, and probability of success.");
  if (opportunity.buyer && opportunity.solicitationNumber && opportunity.dueDate && opportunity.naics && opportunity.serviceType) return workflowState(2, "continue", "Analyze Opportunity", "Open the existing analyzer and verify scope, requirements, deadlines, and risk.");
  return workflowState(1, "intake", "Verify Opportunity Intake", "Verify agency, solicitation, NAICS, buyer, source URL, due date, service, value, attachments, and contact.");
}

function workflowState(index, action, actionLabel, guidance) { return { index, action, actionLabel, guidance }; }

function handleWorkflowNextAction() { runWorkflowAction(els.workflowNextAction.dataset.action); }
function handleWorkflowStageClick(event) {
  const button = event.target.closest("[data-stage]");
  if (!button || button.disabled) return;
  const index = Number(button.dataset.index);
  runWorkflowAction(index <= 1 ? "intake" : index >= 4 ? "continue" : "acquisition");
}
function runWorkflowAction(action) {
  if (action === "find") { activateModule("acquisition-os", { scroll: true }); openAcquisitionDialog(); return; }
  if (action === "intake") { activateModule("acquisition-os", { scroll: true }); const item = getWorkflowOpportunity(); if (item) openAcquisitionDialog(item); return; }
  if (action === "continue") { window.open("/acquisition-os/full-bid-engine/", "_blank", "noopener,noreferrer"); return; }
  if (action === "alerts") { setActiveNavigation("alerts"); scrollToSection("alerts"); return; }
  if (action === "dashboard") { setActiveNavigation("today"); scrollToSection("today"); return; }
  if (["contacts", "workforce", "acquisition"].includes(action)) {
    activateModule(action === "contacts" ? "prime-crm" : action === "workforce" ? "workforce-management" : "acquisition-os", { scroll: true });
  }
}

function renderDailyWorkflowMetrics() {
  const full = loadFullBidEngineState().opportunities || [];
  const todayRfqs = acquisitionOpportunities.filter((item) => /rfq/i.test(item.solicitationType || "") && isWithinDays(item.dueDate, 1)).length;
  const deadlines = acquisitionOpportunities.filter((item) => isWithinDays(item.dueDate, 7)).length;
  const followUps = records.filter((item) => item.nextFollowUpDate === isoToday || isBefore(item.nextFollowUpDate, isoToday)).length;
  const shortages = acquisitionOpportunities.filter((item) => /staff|worker|labor/i.test(item.notes || "") && !workers.some((worker) => worker.status === "Available")).length;
  const awards = records.filter((item) => item.status === "Contract Awarded").length + full.filter((item) => /awarded/i.test([item.status, item.stage, item.notes].join(" "))).length;
  setText("workflowTodayRfqs", todayRfqs); setText("workflowProposalDeadlines", deadlines); setText("workflowFollowUps", followUps);
  setText("workflowGmailAlerts", Number(els.todayUrgentEmails?.textContent) || 0); setText("workflowWorkerShortages", shortages);
  setText("workflowPaymentsDue", Number(els.alertPayments?.textContent) || 0); setText("workflowAwards", awards);
}

function bindCollapsiblePanel(toggle, content) {
  if (!toggle || !content) return;
  toggle.setAttribute("aria-expanded", "false");
  content.hidden = true;
  const arrow = toggle.querySelector(".collapsible-panel-arrow");
  if (arrow) arrow.textContent = "\u25bc";
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    content.hidden = isOpen;
    if (arrow) arrow.textContent = isOpen ? "\u25bc" : "\u25b2";
  });
}

function renderMetrics() {
  const capabilitySentTotal = getCapabilitySentTotal();
  els.metricTotal.textContent = records.length;
  els.metricOpportunities.textContent = records.filter(isActiveOpportunity).length;
  els.metricDueToday.textContent = records.filter((record) => record.nextFollowUpDate === isoToday).length;
  els.metricCapability.textContent = capabilitySentTotal;
  els.metricMeetings.textContent = records.filter((record) => record.status === "Meeting Scheduled").length;
  els.metricWon.textContent = records.filter((record) => record.status === "Contract Awarded").length;
  els.metricWorkersAvailable.textContent = workers.filter((worker) => worker.status === "Available").length;
  els.metricQuotesSent.textContent = quotes.filter((quote) => ["Sent", "Follow Up", "Accepted"].includes(quote.quoteStatus)).length;
  els.metricVendorSubmitted.textContent = vendors.filter((vendor) =>
    ["Submitted", "Approved", "Waiting Response", "Follow Up Needed"].includes(vendor.registrationStatus),
  ).length;
}

function renderToday() {
  const followUpsToday = records.filter((record) => record.nextFollowUpDate === isoToday).length;
  const workerApplications = workers.filter((worker) => ["New", "Contacted"].includes(worker.status)).length;
  const bidEngineOpen = acquisitionOpportunities.filter((opportunity) => opportunity.openOpportunity && opportunity.decisionLabel !== "Ignore").length;
  const openOpportunities = records.filter(isActiveOpportunity).length + bidEngineOpen;
  const registrationsPending = vendors.filter((vendor) =>
    ["Not Started", "In Progress", "Waiting Response", "Follow Up Needed"].includes(vendor.registrationStatus),
  ).length;
  const quotesWaiting = quotes.filter((quote) => ["Draft", "Sent", "Follow Up"].includes(quote.quoteStatus)).length;
  const contractsActive = records.filter((record) => record.status === "Contract Awarded").length;
  const deadlines = records.filter((record) => record.nextFollowUpDate === isoToday || isWithinDays(record.dueDate, 7)).length;
  const samRegistrations = vendors.filter((vendor) => String(vendor.portalType || vendor.companyName || "").toLowerCase().includes("sam")).length;

  setText("todayUrgentEmails", executiveEmailCounts.critical);
  setText("todayWorkerApplications", workerApplications);
  setText("todayFollowUps", followUpsToday);
  setText("todayOpenOpportunities", openOpportunities);
  setText("todayBidEngineItems", acquisitionOpportunities.length);
  setText("todayRegistrationsPending", registrationsPending);
  setText("todayQuotesWaiting", quotesWaiting);
  setText("todayContractsActive", contractsActive);
  setText("alertContracts", executiveEmailCounts.contracts || openOpportunities);
  setText("alertPayments", executiveEmailCounts.payments || 0);
  setText("alertDeadlines", deadlines);
  setText("alertApplications", executiveEmailCounts.applications || workerApplications);
  setText("alertSam", samRegistrations);
  setText("alertVendorRegistrations", registrationsPending);
  setText("settingsAutomationStatus", els.emailAlertsToggle?.checked ? "Monitoring" : "Paused");
}

async function refreshExecutiveEmailAlerts() {
  if (els.emailAlertsToggle && !els.emailAlertsToggle.checked) {
    executiveEmailCounts = { critical: 0, pending: 0, contracts: 0, payments: 0, applications: 0 };
    renderToday();
    return;
  }
  try {
    const response = await fetch(`/api/executive-email-alerts?${new URLSearchParams({
      partnerNotifications: String(els.partnerNotificationsToggle?.checked !== false),
    })}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Email alerts unavailable.");
    executiveEmailCounts = { ...executiveEmailCounts, ...(result.gmail || {}) };
  } catch (error) {
    console.warn("Executive email alerts are unavailable:", error);
  } finally {
    renderToday();
  }
}

function loadViewMode() {
  const mode = readViewMode();
  if (els.simpleModeToggle) els.simpleModeToggle.checked = mode.simpleMode;
  if (els.advancedModeToggle) els.advancedModeToggle.checked = mode.advancedMode;
  if (els.partnerViewToggle) els.partnerViewToggle.checked = mode.partnerView;
  if (els.partnerNotificationsToggle) els.partnerNotificationsToggle.checked = mode.partnerNotifications;
  if (els.emailAlertsToggle) els.emailAlertsToggle.checked = mode.emailAlerts;
  applyViewMode();
}

function readViewMode() {
  try {
    return {
      simpleMode: true,
      advancedMode: false,
      partnerView: false,
      partnerNotifications: true,
      emailAlerts: true,
      ...JSON.parse(localStorage.getItem(STORAGE_KEYS.viewMode)),
    };
  } catch {
    return {
      simpleMode: true,
      advancedMode: false,
      partnerView: false,
      partnerNotifications: true,
      emailAlerts: true,
    };
  }
}

function applyViewMode(event) {
  if (event?.target === els.advancedModeToggle && els.advancedModeToggle.checked && els.simpleModeToggle) {
    els.simpleModeToggle.checked = false;
  }
  if (event?.target === els.simpleModeToggle && els.simpleModeToggle.checked && els.advancedModeToggle) {
    els.advancedModeToggle.checked = false;
  }
  if (els.simpleModeToggle && els.advancedModeToggle && !els.simpleModeToggle.checked && !els.advancedModeToggle.checked) {
    els.simpleModeToggle.checked = true;
  }

  document.body.classList.toggle("simple-mode", els.simpleModeToggle?.checked !== false);
  document.body.classList.toggle("advanced-mode", Boolean(els.advancedModeToggle?.checked));
  try {
    localStorage.setItem(STORAGE_KEYS.viewMode, JSON.stringify({
      simpleMode: els.simpleModeToggle?.checked !== false,
      advancedMode: Boolean(els.advancedModeToggle?.checked),
      partnerView: Boolean(els.partnerViewToggle?.checked),
      partnerNotifications: els.partnerNotificationsToggle?.checked !== false,
      emailAlerts: els.emailAlertsToggle?.checked !== false,
    }));
  } catch {
    // Local preference storage is non-critical.
  }
  if (els.emailAlertsToggle?.checked) refreshExecutiveEmailAlerts();
  renderToday();
}

function setText(id, value) {
  if (els[id]) els[id].textContent = value;
}

function renderReports() {
  els.reportContacted.textContent = records.filter((record) => record.dateFirstContacted).length;
  els.reportCapability.textContent = getCapabilitySentTotal();
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
          <td>
            <div class="row-actions">
              <button class="button secondary" type="button" data-edit="${escapeHtml(record.id)}">Edit</button>
              <button class="button danger" type="button" data-delete="${escapeHtml(record.id)}">Delete</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

function renderCapabilityLibrary() {
  if (!els.capabilityLibrary) return;
  els.capabilityLibrary.innerHTML = capabilityStatements
    .map(
      (statement) => `
        <article class="capability-card">
          <div>
            <span class="status-pill ${statement.status === "Ready" ? "success" : ""}">${escapeHtml(statement.status)}</span>
            <h3>${escapeHtml(statement.title)}</h3>
            <p>${escapeHtml(statement.service)}</p>
          </div>
          <div class="capability-actions">
            <button class="button secondary" type="button" data-capability-action="open" data-capability-title="${escapeHtml(statement.title)}">Open</button>
            <button class="button secondary" type="button" data-capability-action="copy" data-capability-title="${escapeHtml(statement.title)}">Copy Email Text</button>
            <button class="button secondary" type="button" data-capability-action="download" data-capability-title="${escapeHtml(statement.title)}">${statement.pdfUrl ? "Download PDF" : "Needs PDF Link"}</button>
            <button class="button primary" type="button" data-capability-action="email" data-capability-title="${escapeHtml(statement.title)}">Send by Email</button>
            <button class="button secondary" type="button" data-capability-action="sent" data-capability-title="${escapeHtml(statement.title)}">Mark Sent</button>
          </div>
        </article>
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

  jsonpRequest(endpoint, {}, {
    cacheKey: "worker-intake:list",
    cacheTtl: SHEET_CACHE_TTL_MS,
    timeout: 12000,
    errorMessage: "Worker intake sync failed.",
  })
    .then((response) => {
      if (response?.ok && Array.isArray(response.rows)) {
        workers = response.rows.filter((row) => row["First Name"] || row["Last Name"] || row.Email).map(sheetWorkerToAppWorker);
        renderMetrics();
        renderWorkers();
      }
    })
    .catch((error) => console.warn("Worker intake sync unavailable:", error));
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

function renderAcquisitionModules() {
  if (!els.acquisitionModuleList) return;
  els.acquisitionModuleList.innerHTML = acquisitionModules
    .map((moduleName, index) => {
      const label = acquisitionModuleLabels[moduleName] || moduleName;
      const icon = acquisitionModuleIcons[moduleName] || "•";
      return `
        <button class="${index === 0 ? "active" : ""}" type="button" data-acquisition-module="${escapeHtml(moduleName)}" title="${escapeHtml(moduleName)}">
          <span class="acquisition-module-icon">${escapeHtml(icon)}</span>
          <span>${escapeHtml(label)}</span>
        </button>
      `;
    })
    .join("");
}

function handleAcquisitionModuleClick(event) {
  const button = event.target.closest("[data-acquisition-module]");
  if (!button) return;
  showAcquisitionModule(button.dataset.acquisitionModule);
}

function showAcquisitionModule(moduleName) {
  document.querySelectorAll("[data-acquisition-module]").forEach((button) => {
    button.classList.toggle("active", button.dataset.acquisitionModule === moduleName);
  });
  const targetId = acquisitionModuleTargets[moduleName];
  if (window.IGEOAcquisitionExtensions) window.IGEOAcquisitionExtensions.show(moduleName);
  if (targetId && document.getElementById(targetId)) {
    if (els.acquisitionModulePlaceholder) els.acquisitionModulePlaceholder.hidden = true;
    scrollToSection(targetId);
    return;
  }
  showAcquisitionPlaceholder(moduleName);
}

function showAcquisitionPlaceholder(moduleName) {
  if (!els.acquisitionModulePlaceholder) return;
  const placeholder = acquisitionModulePlaceholders[moduleName] || {
    purpose: "Support this Acquisition OS workflow inside the unified workspace.",
    nextAction: "Define the fields and source records needed for this module.",
  };
  els.acquisitionPlaceholderName.textContent = moduleName;
  els.acquisitionPlaceholderPurpose.textContent = placeholder.purpose;
  els.acquisitionPlaceholderNextAction.textContent = placeholder.nextAction;
  els.acquisitionModulePlaceholder.hidden = false;
  scrollToSection("acquisitionModulePlaceholder");
}

function renderAcquisitionOpportunities() {
  const rows = getVisibleAcquisitionOpportunities();
  renderAcquisitionMetrics();
  els.acquisitionTable.innerHTML = rows.length
    ? rows
        .map((opportunity) => {
          const score = calculateOpportunityScore(opportunity);
          const securityClass = opportunity.securityLicensingRequired ? " urgent" : "";
          return `
            <tr>
              <td><strong>${escapeHtml(opportunity.opportunityName)}</strong><small>${renderSourceLine(opportunity)}</small></td>
              <td><span class="service-pill">${escapeHtml(opportunity.serviceType || "Not set")}</span><small>${escapeHtml(opportunity.naics || "No NAICS")} - ${escapeHtml(opportunity.estimatedValue || "No value")}</small></td>
              <td><span class="status-pill ${opportunity.urgentForIgeo === "YES" ? "urgent" : ""}">${escapeHtml(opportunity.urgentForIgeo === "YES" ? "Urgent" : "Standard")}</span><small>${escapeHtml(opportunity.priorityRegion || "No priority region")}</small></td>
              <td><strong>${score.points}/${score.total}</strong><small>${escapeHtml(score.summary)}</small></td>
              <td><span class="status-pill ${opportunity.decisionLabel === "Pursue Immediately" ? "success" : ""}${securityClass}">${escapeHtml(opportunity.decisionLabel)}</span></td>
              <td>${escapeHtml(opportunity.performanceMethod || "Not set")}</td>
              <td class="${dateClass(opportunity.dueDate)}">${formatDate(opportunity.dueDate)}</td>
              <td><strong>${escapeHtml(opportunity.buyer || "No buyer")}</strong><small>${escapeHtml(opportunity.contactName || "No contact")}<br />${escapeHtml(opportunity.contactEmail || "No email")}</small></td>
              <td>
                <div class="row-actions">
                  <button class="button secondary" type="button" data-edit-opportunity="${escapeHtml(opportunity.id)}">Edit</button>
                  <button class="button danger" type="button" data-delete-opportunity="${escapeHtml(opportunity.id)}">Delete</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td class="empty-state" colspan="9">No acquisition opportunities match the current view.</td></tr>`;
}

function renderSourceLine(opportunity) {
  const sourceText = [opportunity.source || "No source", opportunity.solicitationType || "", opportunity.solicitationNumber || "No solicitation"]
    .filter(Boolean)
    .join(" - ");
  if (!opportunity.sourceLink) return escapeHtml(sourceText);
  return `<a href="${escapeHtml(opportunity.sourceLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sourceText)}</a>`;
}

function renderAcquisitionMetrics() {
  setText("acqMetricTotal", acquisitionOpportunities.length);
  setText("acqMetricPursue", acquisitionOpportunities.filter((item) => item.decisionLabel === "Pursue Immediately").length);
  setText("acqMetricSubcontractor", acquisitionOpportunities.filter((item) =>
    item.decisionLabel === "Subcontractor Needed" || item.performanceMethod === "Subcontract",
  ).length);
  setText("acqMetricDueSoon", acquisitionOpportunities.filter((item) => isWithinDays(item.dueDate, 14)).length);
  setText("acqMetricUnder250", acquisitionOpportunities.filter((item) => item.under250k).length);
  setText("acqMetricSecurity", acquisitionOpportunities.filter((item) => item.securityLicensingRequired).length);
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

function getVisibleAcquisitionOpportunities() {
  const query = els.acquisitionSearch.value.trim().toLowerCase();
  return acquisitionOpportunities.filter((opportunity) => {
    const searchable = [
      opportunity.opportunityName,
      opportunity.source,
      opportunity.sourceLink,
      opportunity.solicitationType,
      opportunity.solicitationNumber,
      opportunity.buyer,
      opportunity.contactName,
      opportunity.contactEmail,
      opportunity.serviceType,
      opportunity.naics,
      opportunity.estimatedValue,
      opportunity.performanceMethod,
      opportunity.decisionLabel,
      opportunity.priorityRegion,
      opportunity.urgentForIgeo,
      opportunity.urgencyReason,
      opportunity.notes,
    ].join(" ").toLowerCase();
    if (query && !searchable.includes(query)) return false;
    if (els.acquisitionDecisionFilter.value !== "all" && opportunity.decisionLabel !== els.acquisitionDecisionFilter.value) return false;
    if (els.acquisitionPerformanceFilter.value !== "all" && opportunity.performanceMethod !== els.acquisitionPerformanceFilter.value) return false;
    if (els.acquisitionNaicsFilter.value !== "all" && opportunity.naics !== els.acquisitionNaicsFilter.value) return false;
    if (els.acquisitionServiceFilter.value !== "all" && opportunity.serviceType !== els.acquisitionServiceFilter.value) return false;
    return true;
  }).sort((a, b) => compareDates(a.dueDate, b.dueDate));
}

function calculateOpportunityScore(opportunity) {
  const positiveFields = opportunityScoreFields.filter((scoreField) => !["securityLicensingRequired", "bondingRequired", "siteVisitRequired"].includes(scoreField.value));
  const positivePoints = positiveFields.filter((scoreField) => Boolean(opportunity[scoreField.value])).length;
  const cautionCount = ["securityLicensingRequired", "bondingRequired", "siteVisitRequired"].filter((key) => opportunity[key]).length;
  const points = Math.max(0, positivePoints - cautionCount);
  return {
    points,
    total: positiveFields.length,
    summary: cautionCount ? `${cautionCount} caution flag${cautionCount === 1 ? "" : "s"}` : "No caution flags",
  };
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
      const cloudRecords = await loadPrimeRecordsFromGoogleSheets({ cache: false });
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
  await deletePrimeRecordById(id, { closeDialog: true });
}

async function deletePrimeRecordById(id, options = {}) {
  if (!id || !confirm("Delete this prime contractor record?")) return;
  const archivedRecord = records.find((record) => record.id === id);
  records = records.filter((record) => record.id !== id);
  saveCollection(STORAGE_KEYS.primes, records);
  if (options.closeDialog) closePrimeDialog();
  render();
  try {
    const result = await postPrimeCrmAction({ action: "archive", id });
    if (!result.ok) throw new Error(result.error || "Google Sheets rejected the archive.");
    const cloudRecords = await loadPrimeRecordsFromGoogleSheets({ cache: false });
    if (cloudRecords.some((record) => record.id === id)) throw new Error("Archived record is still active in Google Sheets.");
    showToast("Prime contractor archived in Google Sheets.");
  } catch (error) {
    queuePrimeOperation({ action: "archive", id, record: archivedRecord });
    showToast("Archived offline. Google Sheets sync will retry automatically.");
    console.error("Prime CRM archive queued:", error);
  }
}

function handleCapabilityLibraryAction(event) {
  const button = event.target.closest("[data-capability-action]");
  if (!button) return;
  const statement = capabilityStatements.find((item) => item.title === button.dataset.capabilityTitle);
  if (!statement) return;
  const action = button.dataset.capabilityAction;
  if (action === "open") {
    openCapabilityStatement(statement);
    return;
  }
  if (action === "copy") {
    copyText(statement.emailBody, "Email text copied.");
    return;
  }
  if (action === "download") {
    downloadCapabilityPdf(statement);
    return;
  }
  if (action === "email") {
    sendCapabilityEmail(statement);
    return;
  }
  if (action === "sent") {
    markCapabilityStatementSent();
  }
}

function openAcquisitionDialog(opportunity) {
  const current = opportunity || emptyAcquisitionOpportunity();
  els.acquisitionDialogTitle.textContent = opportunity ? "Edit Opportunity" : "Add Opportunity";
  els.deleteOpportunity.style.visibility = opportunity ? "visible" : "hidden";
  setFormValue("acquisitionId", current.id);
  setFormValue("acqOpportunityName", current.opportunityName || "");
  setFormValue("acqSource", current.source || "");
  setFormValue("acqSourceLink", current.sourceLink || "");
  setFormValue("acqSolicitationType", current.solicitationType || "RFQ");
  setFormValue("acqSolicitationNumber", current.solicitationNumber || "");
  setFormValue("acqBuyer", current.buyer || "");
  setFormValue("acqServiceType", current.serviceType || services[0]);
  setFormValue("acqNaics", current.naics || acquisitionNaics[0]);
  setFormValue("acqPriorityRegion", current.priorityRegion || "None");
  setFormValue("acqUrgentForIgeo", current.urgentForIgeo || "NO");
  setFormValue("acqDueDate", current.dueDate || "");
  setFormValue("acqEstimatedValue", current.estimatedValue || "");
  setFormValue("acqPerformanceMethod", current.performanceMethod || "Subcontract");
  setFormValue("acqDecisionLabel", current.decisionLabel || "Worth Reviewing");
  setFormValue("acqContactName", current.contactName || "");
  setFormValue("acqContactEmail", current.contactEmail || "");
  setFormValue("acqUrgencyReason", current.urgencyReason || "");
  setFormValue("acqNotes", current.notes || "");
  document.querySelectorAll('input[name="acquisitionScore"]').forEach((input) => {
    input.checked = Boolean(current[input.value]);
  });
  applyAcquisitionSecurityRule();
  updateAcquisitionUrgencyPreview();
  els.acquisitionDialog.showModal();
}

function closeAcquisitionDialog() {
  closeModal(els.acquisitionDialog, els.acquisitionForm);
}

function saveAcquisitionOpportunity(event) {
  event.preventDefault();
  const opportunity = buildAcquisitionOpportunityFromForm();
  const index = acquisitionOpportunities.findIndex((item) => item.id === opportunity.id);
  if (index >= 0) acquisitionOpportunities[index] = opportunity;
  else acquisitionOpportunities.unshift(opportunity);
  saveCollection(STORAGE_KEYS.acquisitionOpportunities, acquisitionOpportunities);
  syncFullBidEngineFromQuickEntries(acquisitionOpportunities);
  closeAcquisitionDialog();
  render();
  showToast("Opportunity saved.");
}

function buildAcquisitionOpportunityFromForm() {
  const opportunity = {
    id: value("acquisitionId") || crypto.randomUUID(),
    opportunityName: value("acqOpportunityName"),
    source: value("acqSource"),
    sourceLink: value("acqSourceLink"),
    solicitationType: value("acqSolicitationType"),
    solicitationNumber: value("acqSolicitationNumber"),
    buyer: value("acqBuyer"),
    serviceType: value("acqServiceType"),
    naics: value("acqNaics"),
    priorityRegion: value("acqPriorityRegion"),
    urgentForIgeo: value("acqUrgentForIgeo"),
    urgencyReason: value("acqUrgencyReason"),
    dueDate: value("acqDueDate"),
    estimatedValue: value("acqEstimatedValue"),
    performanceMethod: value("acqPerformanceMethod"),
    decisionLabel: value("acqDecisionLabel"),
    contactName: value("acqContactName"),
    contactEmail: value("acqContactEmail"),
    notes: value("acqNotes"),
  };
  opportunityScoreFields.forEach((scoreField) => {
    opportunity[scoreField.value] = document.querySelector(`input[name="acquisitionScore"][value="${scoreField.value}"]`)?.checked || false;
  });
  return applyUrgencyRule(applySecurityGuardrails(opportunity));
}

function applyAcquisitionSecurityRule() {
  const serviceType = value("acqServiceType");
  const securityFlag = document.querySelector('input[name="acquisitionScore"][value="securityLicensingRequired"]');
  const isSecurityService = isSecurityOpportunity({ serviceType });
  if (isSecurityService && securityFlag) securityFlag.checked = true;
  if ((isSecurityService || securityFlag?.checked) && value("acqPerformanceMethod") === "Self-perform") {
    setFormValue("acqPerformanceMethod", "Subcontract");
  }
  if (isSecurityService || securityFlag?.checked) {
    setFormValue("acqDecisionLabel", "Subcontractor Needed");
  }
  if (els.securityRuleNotice) {
    els.securityRuleNotice.classList.toggle("show", Boolean(isSecurityService || securityFlag?.checked));
  }
  updateAcquisitionUrgencyPreview();
}

function applySecurityGuardrails(opportunity) {
  if (!isSecurityOpportunity(opportunity) && !opportunity.securityLicensingRequired) return opportunity;
  return {
    ...opportunity,
    securityLicensingRequired: true,
    performanceMethod: opportunity.performanceMethod === "Self-perform" ? "Subcontract" : opportunity.performanceMethod,
    decisionLabel: opportunity.decisionLabel === "Ignore" ? "Ignore" : "Subcontractor Needed",
  };
}

function updateAcquisitionUrgencyPreview() {
  const preview = applyUrgencyRule({
    priorityRegion: value("acqPriorityRegion"),
    decisionLabel: value("acqDecisionLabel"),
    fitsIgeoServices: document.querySelector('input[name="acquisitionScore"][value="fitsIgeoServices"]')?.checked || false,
    serviceBased: document.querySelector('input[name="acquisitionScore"][value="serviceBased"]')?.checked || false,
    subcontractable: document.querySelector('input[name="acquisitionScore"][value="subcontractable"]')?.checked || false,
    lowCapital: document.querySelector('input[name="acquisitionScore"][value="lowCapital"]')?.checked || false,
    under250k: document.querySelector('input[name="acquisitionScore"][value="under250k"]')?.checked || false,
  });
  setFormValue("acqUrgentForIgeo", preview.urgentForIgeo || "NO");
  setFormValue("acqUrgencyReason", preview.urgencyReason || "");
}

function applyUrgencyRule(opportunity) {
  const region = opportunity.priorityRegion || "None";
  const isPriorityRegion = priorityRegions.slice(1).includes(region);
  const fitsCriteria = opportunity.decisionLabel !== "Ignore" && (
    opportunity.fitsIgeoServices
      || (opportunity.serviceBased && (opportunity.subcontractable || opportunity.lowCapital || opportunity.under250k))
  );
  if (!isPriorityRegion || !fitsCriteria) {
    return {
      ...opportunity,
      urgentForIgeo: "NO",
      urgencyReason: opportunity.urgencyReason && opportunity.urgentForIgeo === "YES" ? "" : opportunity.urgencyReason,
    };
  }
  return {
    ...opportunity,
    urgentForIgeo: "YES",
    urgencyReason: `${region} is a priority Michigan growth market for iGeo and this opportunity fits iGeo criteria.`,
  };
}

function isSecurityOpportunity(opportunity) {
  return /security|guard|patrol/i.test(opportunity.serviceType || "");
}

function deleteCurrentOpportunity() {
  deleteOpportunityById(value("acquisitionId"), { closeDialog: true });
}

function deleteOpportunityById(id, options = {}) {
  if (!id || !confirm("Delete this acquisition opportunity?")) return;
  acquisitionOpportunities = acquisitionOpportunities.filter((item) => item.id !== id);
  saveCollection(STORAGE_KEYS.acquisitionOpportunities, acquisitionOpportunities);
  syncFullBidEngineFromQuickEntries(acquisitionOpportunities);
  if (options.closeDialog) closeAcquisitionDialog();
  render();
  showToast("Opportunity deleted.");
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
    acquisition: {
      filename: "igeo-acquisition-opportunities",
      rows: getVisibleAcquisitionOpportunities,
      fields: [
        field("Opportunity Name", (r) => r.opportunityName),
        field("Source", (r) => r.source),
        field("Source Link", (r) => r.sourceLink),
        field("Solicitation Type", (r) => r.solicitationType),
        field("Solicitation Number", (r) => r.solicitationNumber),
        field("Buyer / Agency", (r) => r.buyer),
        field("Service Type", (r) => r.serviceType),
        field("NAICS", (r) => r.naics),
        field("Priority Region", (r) => r.priorityRegion),
        field("Urgent for iGeo", (r) => r.urgentForIgeo),
        field("Urgency Reason", (r) => r.urgencyReason),
        field("Due Date", (r) => r.dueDate),
        field("Estimated Value", (r) => r.estimatedValue),
        field("Performance Method", (r) => r.performanceMethod),
        field("Decision Label", (r) => r.decisionLabel),
        field("Score", (r) => `${calculateOpportunityScore(r).points}/${calculateOpportunityScore(r).total}`),
        field("Security Licensing Required", (r) => (r.securityLicensingRequired ? "Yes" : "No")),
        field("Subcontractable", (r) => (r.subcontractable ? "Yes" : "No")),
        field("Brokerable", (r) => (r.brokerable ? "Yes" : "No")),
        field("Contact Name", (r) => r.contactName),
        field("Contact Email", (r) => r.contactEmail),
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

function seedAcquisitionOpportunities(existing) {
  const current = Array.isArray(existing) ? [...existing] : [];
  let changed = false;
  sampleAcquisitionOpportunities.forEach((sample) => {
    if (!current.some((opportunity) => opportunity.solicitationNumber === sample.solicitationNumber)) {
      current.push(sample);
      changed = true;
    }
  });
  if (changed) saveCollection(STORAGE_KEYS.acquisitionOpportunities, current);
  return current;
}

function syncFullBidEngineFromQuickEntries(opportunities) {
  const quickEntries = Array.isArray(opportunities) ? opportunities : [];
  const fullState = loadFullBidEngineState();
  const fullOpportunities = Array.isArray(fullState.opportunities) ? [...fullState.opportunities] : [];
  const quickIds = new Set(quickEntries.map((opportunity) => opportunity.id));
  const retained = fullOpportunities.filter((opportunity) => !opportunity.syncedFromQuickEntry || quickIds.has(opportunity.id));
  quickEntries.forEach((opportunity) => {
    const mapped = mapQuickEntryToFullBidEngineOpportunity(opportunity);
    const index = retained.findIndex((item) => item.id === mapped.id);
    if (index >= 0) retained[index] = { ...retained[index], ...mapped };
    else retained.unshift(mapped);
  });
  fullState.opportunities = retained;
  if (!fullState.activeId && retained[0]) fullState.activeId = retained[0].id;
  saveCollection(STORAGE_KEYS.fullBidEngine, fullState);
}

function loadFullBidEngineState() {
  return {
    activeModule: "dashboard",
    activeId: "",
    partners: [],
    contacts: [],
    intel: [],
    ...loadCollection(STORAGE_KEYS.fullBidEngine, {}),
  };
}

function mapQuickEntryToFullBidEngineOpportunity(opportunity) {
  const score = Object.fromEntries(
    opportunityScoreFields.map((scoreField) => [scoreField.label, Boolean(opportunity[scoreField.value])])
  );
  return {
    id: opportunity.id,
    title: opportunity.opportunityName || "Untitled opportunity",
    agency: opportunity.buyer || "",
    source: [opportunity.source, opportunity.solicitationNumber].filter(Boolean).join(" "),
    sourceUrl: opportunity.sourceLink || "",
    deadline: opportunity.dueDate || "",
    status: opportunity.openOpportunity === false ? "Closed" : "Open",
    naics: opportunity.naics || "",
    service: opportunity.serviceType || "",
    estimatedValue: parseMoneyValue(opportunity.estimatedValue),
    performanceMethod: opportunity.performanceMethod || "Subcontract",
    stage: opportunity.decisionLabel || "Quick Entry",
    driveFolder: "",
    solicitation: opportunity.notes || "",
    instructions: "",
    requirements: "",
    missingRequirements: "",
    nextAction: opportunity.urgencyReason || "",
    incumbent: "",
    contactId: [opportunity.contactName, opportunity.contactEmail].filter(Boolean).join(" / "),
    notes: opportunity.notes || "",
    score,
    checklist: [],
    pricing: [],
    syncedFromQuickEntry: true,
  };
}

function parseMoneyValue(valueToParse) {
  const parsed = Number(String(valueToParse || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
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

async function loadPrimeRecordsFromGoogleSheets(options = {}) {
  const result = await getPrimeCrmData({ action: "list" }, options);
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

  const before = await getPrimeCrmData({ action: "list", includeDeleted: true }, { cache: false });
  const existingIds = new Set((before.records || []).map((record) => String(record.id)));
  const result = await postPrimeCrmAction({ action: "migrate", records: localRecords });
  if (!result.ok) throw new Error(result.error || "Migration failed.");
  let migrated = result.migrated;
  let skipped = result.skipped;
  if (migrated == null || skipped == null) {
    const after = await getPrimeCrmData({ action: "list", includeDeleted: true }, { cache: false });
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

function getPrimeCrmData(parameters, options = {}) {
  if (!isPrimeCrmEndpointConfigured()) return Promise.reject(new Error("Prime CRM Google Sheets endpoint is not configured."));
  const cacheKey = options.cache === false ? "" : `prime-crm:${JSON.stringify(parameters)}`;
  return jsonpRequest(primeCrmIntegration.endpointUrl, parameters, {
    cacheKey,
    cacheTtl: SHEET_CACHE_TTL_MS,
    timeout: 20000,
    errorMessage: "Google Sheets load failed.",
  });
}

function jsonpRequest(url, parameters = {}, options = {}) {
  return new Promise((resolve, reject) => {
    const cached = options.cacheKey ? readSessionCache(options.cacheKey, options.cacheTtl || 0) : null;
    if (cached) {
      resolve(cached);
      return;
    }

    const callback = `igeoJsonp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error(options.errorMessage || "Request timed out."));
    }, options.timeout || 15000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      delete window[callback];
      script.remove();
    };
    window[callback] = (data) => {
      cleanup();
      if (options.cacheKey) writeSessionCache(options.cacheKey, data);
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error(options.errorMessage || "Request failed."));
    };
    const query = new URLSearchParams({ ...parameters, callback });
    const separator = url.includes("?") ? "&" : "?";
    script.async = true;
    script.src = `${url}${separator}${query.toString()}`;
    document.head.appendChild(script);
  });
}

function readSessionCache(key, ttl) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(key));
    if (!cached || Date.now() - cached.cachedAt > ttl) return null;
    return cached.value;
  } catch {
    return null;
  }
}

function writeSessionCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ cachedAt: Date.now(), value }));
  } catch {
    // Cache writes can fail in private browsing or under tight storage quotas.
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker registration skipped:", error);
    });
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

function capabilityStatement(title, service, links = {}) {
  const pdfUrl = links.pdfUrl || "";
  const docUrl = links.docUrl || "";
  const emailSubject = `iGeo Solutions LLC Capability Statement - ${title}`;
  const emailBody = [
    "Hello,",
    "",
    `I am sharing the iGeo Solutions LLC ${title} for your review.`,
    "",
    "iGeo Solutions LLC supports prime contractors and partner organizations with commercial cleaning, administrative support, AI automation, home health support, disability and ABA support, workforce support, and vendor packet readiness.",
    "",
    "Please let me know if there is a good opportunity to discuss subcontracting, vendor registration, or teaming support.",
    "",
    "Thank you,",
    "iGeo Solutions LLC",
    commandCenter.email,
    commandCenter.phone,
  ].join("\n");
  return {
    title,
    service,
    status: pdfUrl || docUrl ? "Ready" : "Needs PDF Link",
    pdfUrl,
    docUrl,
    emailSubject,
    emailBody,
  };
}

function emptyPrimeRecord() {
  return { id: crypto.randomUUID(), status: "Prospect", services: [] };
}

function emptyAcquisitionOpportunity() {
  return {
    id: crypto.randomUUID(),
    serviceType: "Janitorial",
    naics: "561720",
    solicitationType: "RFQ",
    priorityRegion: "None",
    urgentForIgeo: "NO",
    urgencyReason: "",
    performanceMethod: "Subcontract",
    decisionLabel: "Worth Reviewing",
    openOpportunity: true,
    serviceBased: true,
    lowCapital: true,
    subcontractable: true,
  };
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

function getCapabilitySentTotal() {
  return records.filter((record) => record.capabilitySent).length + capabilityStatementsSentCount;
}

function openCapabilityStatement(statement) {
  const target = statement.docUrl || statement.pdfUrl;
  if (!target) {
    showToast("Needs PDF Link.");
    return;
  }
  window.open(target, "_blank", "noopener,noreferrer");
}

function downloadCapabilityPdf(statement) {
  if (!statement.pdfUrl) {
    showToast("Needs PDF Link.");
    return;
  }
  window.open(statement.pdfUrl, "_blank", "noopener,noreferrer");
}

function sendCapabilityEmail(statement) {
  const url = `mailto:?subject=${encodeURIComponent(statement.emailSubject)}&body=${encodeURIComponent(statement.emailBody)}`;
  window.location.href = url;
}

function markCapabilityStatementSent() {
  capabilityStatementsSentCount += 1;
  saveCollection(STORAGE_KEYS.capabilitySentCount, capabilityStatementsSentCount);
  renderMetrics();
  renderReports();
  showToast("Capability statement marked sent.");
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

function renderGlobalSearchSuggestions() {
  if (!els.globalSearchInput || !els.globalSearchResults) return;
  const query = els.globalSearchInput.value.trim();
  if (query.length < 2) {
    closeGlobalSearch();
    return;
  }
  const matches = getGlobalSearchMatches(query);
  els.globalSearchResults.innerHTML = matches.length
    ? matches
        .map(
          (item, index) => `
            <button class="global-search-result ${index === 0 ? "active" : ""}" type="button" role="option" data-search-id="${escapeHtml(item.id)}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.type)} - ${escapeHtml(item.detail)}</span>
            </button>
          `,
        )
        .join("")
    : `<div class="global-search-result" role="option"><strong>No matches</strong><span>Try a company, agency, NAICS, buyer, opportunity, or module name.</span></div>`;
  els.globalSearchResults.hidden = false;
  els.globalSearchInput.setAttribute("aria-expanded", "true");
}

function handleGlobalSearchKeydown(event) {
  if (!els.globalSearchResults || els.globalSearchResults.hidden) return;
  const options = [...els.globalSearchResults.querySelectorAll("[data-search-id]")];
  if (!options.length) return;
  const activeIndex = Math.max(0, options.findIndex((option) => option.classList.contains("active")));
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const nextIndex = event.key === "ArrowDown"
      ? Math.min(options.length - 1, activeIndex + 1)
      : Math.max(0, activeIndex - 1);
    options.forEach((option, index) => option.classList.toggle("active", index === nextIndex));
    options[nextIndex].scrollIntoView({ block: "nearest" });
  }
  if (event.key === "Enter") {
    event.preventDefault();
    openGlobalSearchResult(options[activeIndex].dataset.searchId);
  }
  if (event.key === "Escape") closeGlobalSearch();
}

function handleGlobalSearchSelection(event) {
  const button = event.target.closest("[data-search-id]");
  if (!button) return;
  openGlobalSearchResult(button.dataset.searchId);
}

function closeGlobalSearch() {
  if (!els.globalSearchInput || !els.globalSearchResults) return;
  els.globalSearchResults.hidden = true;
  els.globalSearchResults.innerHTML = "";
  els.globalSearchInput.setAttribute("aria-expanded", "false");
}

function getGlobalSearchMatches(query) {
  return buildGlobalSearchIndex()
    .map((item) => ({ ...item, score: scoreSearchItem(query, item.searchText) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 10);
}

function buildGlobalSearchIndex() {
  const index = [];
  const addItem = (item) => {
    const searchText = [item.title, item.type, item.detail, item.keywords].flat().filter(Boolean).join(" ");
    index.push({ ...item, searchText });
  };

  [
    ["page:today", "Today", "Page", "Operator dashboard, alerts, follow ups, bid engine items", "today operator dashboard alerts follow ups urgent emails"],
    ["page:acquisition-os", "Acquisition OS", "Page", "Opportunities, Bid Engine, NAICS, agencies, buyers, solicitations", "opportunities bid engine acquisition contracts agencies buyers naics"],
    ["page:prime-crm", "Contacts", "Page", "Prime contractor CRM and opportunity contacts", "contacts prime contractors buyers agencies sblo capability statements"],
    ["page:quote-generator", "Quotes", "Page", "Quote generator and pricing records", "quotes pricing estimate bid"],
    ["page:workforce-management", "Applications", "Page", "Worker applications and workforce records", "applications workers workforce staffing"],
    ["page:vendor-registration", "Registrations", "Page", "Vendor registration tracker", "registrations vendor portals sam gov"],
    ["page:capability-statements", "Capability Statements", "Page", "Capability library and send tracking", "capability statements pdf email services"],
    ["page:settings", "Settings", "Page", "Owner mode, partner notifications, automation status", "settings owner partner notifications automation"],
  ].forEach(([id, title, type, detail, keywords]) => addItem({ id, title, type, detail, keywords }));

  records.forEach((record) => {
    addItem({
      id: `prime:${record.id}`,
      title: record.companyName || fullName(record),
      type: "Contact",
      detail: [fullName(record), record.opportunityName, record.solicitationNumber, record.naics, record.status].filter(Boolean).join(" - "),
      keywords: [
        record.website,
        record.industry,
        record.headquarters,
        record.serviceAreas,
        record.email,
        record.sbloName,
        record.sbloEmail,
        record.contractType,
        record.estimatedValue,
        ...(record.services || []),
        record.communicationNotes,
        record.opportunityNotes,
      ],
    });
  });

  acquisitionOpportunities.forEach((opportunity) => {
    addItem({
      id: `acquisition:${opportunity.id}`,
      title: opportunity.opportunityName || opportunity.buyer || "Acquisition Opportunity",
      type: "Opportunity",
      detail: [opportunity.buyer, opportunity.solicitationNumber, opportunity.naics, opportunity.decisionLabel].filter(Boolean).join(" - "),
      keywords: [
        opportunity.source,
        opportunity.sourceLink,
        opportunity.solicitationType,
        opportunity.serviceType,
        opportunity.priorityRegion,
        opportunity.performanceMethod,
        opportunity.contactName,
        opportunity.contactEmail,
        opportunity.estimatedValue,
        opportunity.urgencyReason,
        opportunity.notes,
      ],
    });
  });

  quotes.forEach((quote) => {
    addItem({
      id: `quote:${quote.id}`,
      title: quote.clientName || quote.opportunityName || "Quote",
      type: "Quote",
      detail: [quote.opportunityName, quote.serviceType, quote.location, quote.quoteStatus].filter(Boolean).join(" - "),
      keywords: [quote.notes, quote.finalQuoteAmount, quote.estimatedHours, quote.workersNeeded],
    });
  });

  workers.forEach((worker) => {
    addItem({
      id: `worker:${worker.id}`,
      title: worker.workerName || "Worker Application",
      type: "Application",
      detail: [worker.workerType, worker.serviceCategory, worker.city, worker.state, worker.status].filter(Boolean).join(" - "),
      keywords: [worker.email, worker.phone, worker.availability, worker.notes, worker.insurance, worker.backgroundCheck],
    });
  });

  vendors.forEach((vendor) => {
    addItem({
      id: `vendor:${vendor.id}`,
      title: vendor.companyName || "Vendor Registration",
      type: "Registration",
      detail: [vendor.portalType, vendor.registrationStatus, vendor.contactName, vendor.followUpDate].filter(Boolean).join(" - "),
      keywords: [vendor.website, vendor.loginEmail, vendor.username, vendor.contactEmail, vendor.capabilityStatementSent, vendor.notes],
    });
  });

  capabilityStatements.forEach((statement) => {
    addItem({
      id: `capability:${statement.title}`,
      title: statement.title,
      type: "Capability Statement",
      detail: [statement.service, statement.status].filter(Boolean).join(" - "),
      keywords: [statement.pdfUrl, statement.docUrl, statement.emailSubject, statement.emailBody],
    });
  });

  [...services, ...acquisitionNaics, ...solicitationTypes, ...performanceMethods, ...decisionLabels, ...priorityRegions].forEach((keyword) => {
    addItem({
      id: `keyword:${keyword}`,
      title: keyword,
      type: acquisitionNaics.includes(keyword) ? "NAICS" : "Index",
      detail: acquisitionNaics.includes(keyword) ? "Acquisition OS classification" : "Indexed iGeo OS term",
      keywords: "opportunity contact quote application registration capability settings",
    });
  });

  return index;
}

function scoreSearchItem(query, text) {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedText = normalizeSearchText(text);
  if (!normalizedQuery || !normalizedText) return 0;
  if (normalizedText === normalizedQuery) return 200;
  if (normalizedText.includes(normalizedQuery)) return 140 - Math.min(normalizedText.indexOf(normalizedQuery), 40);
  const tokens = normalizedQuery.split(" ").filter(Boolean);
  if (tokens.length && tokens.every((token) => normalizedText.includes(token))) return 95 + tokens.length;
  if (tokens.some((token) => token.length > 1 && normalizedText.includes(token))) return 45;
  return isSubsequence(normalizedQuery.replace(/\s+/g, ""), normalizedText.replace(/\s+/g, "")) ? 25 : 0;
}

function normalizeSearchText(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isSubsequence(needle, haystack) {
  if (needle.length < 3 || needle.length > 5) return false;
  let index = 0;
  for (const char of haystack) {
    if (char === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return false;
}

function openGlobalSearchResult(id) {
  const item = buildGlobalSearchIndex().find((entry) => entry.id === id);
  if (!item) return;
  closeGlobalSearch();
  els.globalSearchInput.value = "";
  const [type, rawId] = id.split(/:(.*)/);
  if (type === "page") {
    navigateToPage(rawId);
    return;
  }
  if (type === "prime") {
    activateModule("prime-crm", { scroll: true });
    openPrimeDialog(records.find((record) => record.id === rawId));
    return;
  }
  if (type === "acquisition") {
    activateModule("acquisition-os", { scroll: true });
    openAcquisitionDialog(acquisitionOpportunities.find((opportunity) => opportunity.id === rawId));
    return;
  }
  if (type === "quote") {
    activateModule("quote-generator", { scroll: true });
    els.quoteSearch.value = item.title;
    renderQuotes();
    return;
  }
  if (type === "worker") {
    activateModule("workforce-management", { scroll: true });
    els.workerSearch.value = item.title;
    renderWorkers();
    return;
  }
  if (type === "vendor") {
    activateModule("vendor-registration", { scroll: true });
    els.vendorSearch.value = item.title;
    renderVendors();
    return;
  }
  if (type === "capability") {
    activateModule("capability-statements", { scroll: true });
    return;
  }
  if (type === "keyword") {
    activateModule(acquisitionNaics.includes(rawId) ? "acquisition-os" : "prime-crm", { scroll: true });
    if (acquisitionNaics.includes(rawId)) {
      els.acquisitionNaicsFilter.value = rawId;
      renderAcquisitionOpportunities();
    } else {
      els.searchInput.value = rawId;
      render();
    }
  }
}

function navigateToPage(pageId) {
  if (document.querySelector(`[data-module-page="${pageId}"]`)) {
    activateModule(pageId, { scroll: true });
    return;
  }
  setActiveNavigation(pageId);
  scrollToSection(pageId);
  history.replaceState(null, "", `#${pageId}`);
}

function activateModule(moduleId, options = {}) {
  if (!document.querySelector(`[data-module-page="${moduleId}"]`)) moduleId = "prime-crm";
  setActiveNavigation(moduleId);
  document.querySelectorAll("[data-module-page]").forEach((page) => {
    page.classList.toggle("active", page.dataset.modulePage === moduleId);
  });
  if (!options.preserveHash) history.replaceState(null, "", `#${moduleId}`);
  if (options.scroll) scrollToSection(moduleId);
}

function setActiveNavigation(activeId) {
  document.querySelectorAll(".module-tabs .nav-tab").forEach((tab) => {
    const tabId = tab.dataset.moduleTab || (tab.getAttribute("href") || "").replace("#", "");
    tab.classList.toggle("active", tabId === activeId);
  });
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function resetInitialScrollPosition() {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }), 0);
  });
}

function getInitialModule() {
  if (window.location.pathname.startsWith("/acquisition-os/") && !window.location.pathname.startsWith("/acquisition-os/full-bid-engine")) return "acquisition-os";
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
