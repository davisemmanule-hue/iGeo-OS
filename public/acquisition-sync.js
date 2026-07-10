(function () {
  const CANONICAL_KEY = "igeo_canonical_acquisition_opportunities";
  const QUICK_KEY = "igeo_acquisition_opportunities";
  const FULL_KEY = "igeo-acquisition-os";
  const API_URL = "/api/acquisition-opportunities";
  const SCORE_MAP = [
    ["Official source verified", "officialSourceVerified"],
    ["Open opportunity", "openOpportunity"],
    ["Deadline verified", "deadlineVerified"],
    ["Under $250,000", "under250k"],
    ["Service based", "serviceBased"],
    ["Low capital", "lowCapital"],
    ["Subcontractable", "subcontractable"],
    ["Brokerable", "brokerable"],
    ["No major equipment", "noMajorEquipment"],
    ["Fits iGeo services", "fitsIgeoServices"],
    ["Security licensing required", "securityLicensingRequired"],
    ["Bonding required", "bondingRequired"],
    ["Site visit required", "siteVisitRequired"],
  ];

  function now() {
    return new Date().toISOString();
  }

  function loadJson(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uniqueId(prefix = "opp") {
    if (window.crypto?.randomUUID) return crypto.randomUUID();
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalizeValue(value) {
    return String(value || "").trim().toLowerCase();
  }

  function scoreObjectFromQuick(record) {
    return Object.fromEntries(SCORE_MAP.map(([label, key]) => [label, Boolean(record?.[key])]));
  }

  function riskFlagsFromQuick(record) {
    return {
      securityLicensingRequired: Boolean(record?.securityLicensingRequired),
      bondingRequired: Boolean(record?.bondingRequired),
      siteVisitRequired: Boolean(record?.siteVisitRequired),
    };
  }

  function riskFlagsFromFull(record) {
    return {
      securityLicensingRequired: Boolean(record?.score?.["Security licensing required"]),
      bondingRequired: Boolean(record?.score?.["Bonding required"]),
      siteVisitRequired: Boolean(record?.score?.["Site visit required"]),
    };
  }

  function quickFlagsFromScore(score = {}) {
    return Object.fromEntries(SCORE_MAP.map(([label, key]) => [key, Boolean(score[label])]));
  }

  function canonicalFromQuick(record = {}) {
    const timestamp = record.updatedAt || now();
    const score = scoreObjectFromQuick(record);
    return normalizeCanonical({
      opportunityId: record.opportunityId || record.id || uniqueId(),
      opportunityName: record.opportunityName || "",
      source: record.source || "",
      sourceLink: record.sourceLink || "",
      solicitationType: record.solicitationType || "",
      solicitationNumber: record.solicitationNumber || "",
      buyerAgency: record.buyerAgency || record.buyer || "",
      serviceType: record.serviceType || "",
      naics: record.naics || "",
      priorityRegion: record.priorityRegion || "None",
      urgentForIgeo: record.urgentForIgeo || "NO",
      urgencyReason: record.urgencyReason || "",
      dueDate: record.dueDate || "",
      estimatedValue: record.estimatedValue || "",
      performanceMethod: record.performanceMethod || "Subcontract",
      decisionLabel: record.decisionLabel || "Worth Reviewing",
      contactName: record.contactName || "",
      contactEmail: record.contactEmail || "",
      status: record.status || (record.openOpportunity === false ? "Closed" : "Open"),
      stage: record.stage || record.decisionLabel || "Quick Entry",
      score,
      riskFlags: riskFlagsFromQuick(record),
      operatingNotes: record.operatingNotes || record.notes || "",
      solicitationAnalysis: record.solicitationAnalysis || {},
      complianceChecklist: record.complianceChecklist || [],
      proposalDraft: record.proposalDraft || "",
      pricingData: record.pricingData || [],
      partnerRequirements: record.partnerRequirements || [],
      incumbentIntelligence: record.incumbentIntelligence || "",
      procurementContacts: record.procurementContacts || [],
      createdAt: record.createdAt || timestamp,
      updatedAt: timestamp,
      archivedAt: record.archivedAt || "",
    });
  }

  function canonicalFromFull(record = {}, fullState = {}) {
    const timestamp = record.updatedAt || now();
    const contacts = Array.isArray(fullState.contacts) ? fullState.contacts : [];
    const partners = Array.isArray(fullState.partners) ? fullState.partners : [];
    return normalizeCanonical({
      opportunityId: record.opportunityId || record.id || uniqueId(),
      opportunityName: record.title || "",
      source: record.source || "",
      sourceLink: record.sourceUrl || "",
      solicitationType: record.solicitationType || "",
      solicitationNumber: record.solicitationNumber || "",
      buyerAgency: record.agency || "",
      serviceType: record.service || "",
      naics: record.naics || "",
      priorityRegion: record.priorityRegion || "None",
      urgentForIgeo: record.urgentForIgeo || "NO",
      urgencyReason: record.urgencyReason || "",
      dueDate: record.deadline || "",
      estimatedValue: record.estimatedValue || "",
      performanceMethod: record.performanceMethod || "Subcontract",
      decisionLabel: record.decisionLabel || record.stage || "",
      contactName: record.contactName || record.contactId || "",
      contactEmail: record.contactEmail || "",
      status: record.status || "Open",
      stage: record.stage || "",
      score: { ...scoreObjectFromQuick({}), ...(record.score || {}) },
      riskFlags: riskFlagsFromFull(record),
      operatingNotes: record.notes || "",
      solicitationAnalysis: {
        summary: record.solicitation || "",
        instructions: record.instructions || "",
        requirements: record.requirements || "",
        missingRequirements: record.missingRequirements || "",
        nextAction: record.nextAction || "",
        driveFolder: record.driveFolder || "",
      },
      complianceChecklist: record.checklist || [],
      proposalDraft: record.proposalDraft || "",
      pricingData: record.pricing || [],
      partnerRequirements: partners,
      incumbentIntelligence: record.incumbent || "",
      procurementContacts: contacts,
      createdAt: record.createdAt || timestamp,
      updatedAt: timestamp,
      archivedAt: record.archivedAt || "",
    });
  }

  function normalizeCanonical(record = {}) {
    const opportunityId = record.opportunityId || uniqueId();
    const timestamp = record.updatedAt || now();
    return {
      opportunityId,
      opportunityName: record.opportunityName || "",
      source: record.source || "",
      sourceLink: record.sourceLink || "",
      solicitationType: record.solicitationType || "",
      solicitationNumber: record.solicitationNumber || "",
      buyerAgency: record.buyerAgency || "",
      serviceType: record.serviceType || "",
      naics: record.naics || "",
      priorityRegion: record.priorityRegion || "None",
      urgentForIgeo: record.urgentForIgeo || "NO",
      urgencyReason: record.urgencyReason || "",
      dueDate: record.dueDate || "",
      estimatedValue: record.estimatedValue || "",
      performanceMethod: record.performanceMethod || "Subcontract",
      decisionLabel: record.decisionLabel || "",
      contactName: record.contactName || "",
      contactEmail: record.contactEmail || "",
      status: record.status || "Open",
      stage: record.stage || "",
      score: { ...scoreObjectFromQuick({}), ...(record.score || {}) },
      riskFlags: {
        securityLicensingRequired: false,
        bondingRequired: false,
        siteVisitRequired: false,
        ...(record.riskFlags || {}),
      },
      operatingNotes: record.operatingNotes || "",
      solicitationAnalysis: {
        summary: "",
        instructions: "",
        requirements: "",
        missingRequirements: "",
        nextAction: "",
        driveFolder: "",
        ...(record.solicitationAnalysis || {}),
      },
      complianceChecklist: Array.isArray(record.complianceChecklist) ? record.complianceChecklist : [],
      proposalDraft: record.proposalDraft || "",
      pricingData: Array.isArray(record.pricingData) ? record.pricingData : [],
      partnerRequirements: Array.isArray(record.partnerRequirements) ? record.partnerRequirements : [],
      incumbentIntelligence: record.incumbentIntelligence || "",
      procurementContacts: Array.isArray(record.procurementContacts) ? record.procurementContacts : [],
      createdAt: record.createdAt || timestamp,
      updatedAt: timestamp,
      archivedAt: record.archivedAt || "",
    };
  }

  function quickFromCanonical(record) {
    const flags = quickFlagsFromScore(record.score);
    return {
      id: record.opportunityId,
      opportunityId: record.opportunityId,
      opportunityName: record.opportunityName,
      source: record.source,
      sourceLink: record.sourceLink,
      solicitationType: record.solicitationType,
      solicitationNumber: record.solicitationNumber,
      buyer: record.buyerAgency,
      buyerAgency: record.buyerAgency,
      serviceType: record.serviceType,
      naics: record.naics,
      priorityRegion: record.priorityRegion,
      urgentForIgeo: record.urgentForIgeo,
      urgencyReason: record.urgencyReason,
      dueDate: record.dueDate,
      estimatedValue: record.estimatedValue,
      performanceMethod: record.performanceMethod,
      decisionLabel: record.decisionLabel,
      contactName: record.contactName,
      contactEmail: record.contactEmail,
      status: record.status,
      stage: record.stage,
      notes: record.operatingNotes,
      operatingNotes: record.operatingNotes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      archivedAt: record.archivedAt,
      ...flags,
      securityLicensingRequired: Boolean(record.riskFlags.securityLicensingRequired || flags.securityLicensingRequired),
      bondingRequired: Boolean(record.riskFlags.bondingRequired || flags.bondingRequired),
      siteVisitRequired: Boolean(record.riskFlags.siteVisitRequired || flags.siteVisitRequired),
      openOpportunity: record.status !== "Closed",
    };
  }

  function fullFromCanonical(record) {
    return {
      id: record.opportunityId,
      opportunityId: record.opportunityId,
      title: record.opportunityName,
      agency: record.buyerAgency,
      source: record.source,
      sourceUrl: record.sourceLink,
      solicitationType: record.solicitationType,
      solicitationNumber: record.solicitationNumber,
      deadline: record.dueDate,
      status: record.status,
      naics: record.naics,
      service: record.serviceType,
      estimatedValue: parseMoneyValue(record.estimatedValue),
      performanceMethod: record.performanceMethod,
      stage: record.stage || record.decisionLabel,
      decisionLabel: record.decisionLabel,
      priorityRegion: record.priorityRegion,
      urgentForIgeo: record.urgentForIgeo,
      urgencyReason: record.urgencyReason,
      driveFolder: record.solicitationAnalysis.driveFolder || "",
      solicitation: record.solicitationAnalysis.summary || "",
      instructions: record.solicitationAnalysis.instructions || "",
      requirements: record.solicitationAnalysis.requirements || "",
      missingRequirements: record.solicitationAnalysis.missingRequirements || "",
      nextAction: record.solicitationAnalysis.nextAction || record.urgencyReason || "",
      incumbent: record.incumbentIntelligence,
      contactId: [record.contactName, record.contactEmail].filter(Boolean).join(" / "),
      contactName: record.contactName,
      contactEmail: record.contactEmail,
      notes: record.operatingNotes,
      score: { ...scoreObjectFromQuick({}), ...record.score },
      checklist: record.complianceChecklist,
      pricing: record.pricingData,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      archivedAt: record.archivedAt,
      syncedFromCanonical: true,
    };
  }

  function parseMoneyValue(value) {
    const parsed = Number(String(value || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function mergeCanonicalCollections(...collections) {
    const byId = new Map();
    const solicitationToId = new Map();
    collections.flat().filter(Boolean).map(normalizeCanonical).forEach((record) => {
      const solicitationKey = normalizeValue(record.solicitationNumber);
      const duplicateId = solicitationKey ? solicitationToId.get(solicitationKey) : "";
      const targetId = duplicateId || record.opportunityId;
      const existing = byId.get(targetId);
      const selected = pickNewer(existing, { ...record, opportunityId: targetId });
      byId.set(targetId, selected);
      if (solicitationKey) solicitationToId.set(solicitationKey, targetId);
    });
    return [...byId.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  function pickNewer(a, b) {
    if (!a) return b;
    if (!b) return a;
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")) >= 0 ? { ...a, ...b } : { ...b, ...a };
  }

  function loadCanonicalLocal() {
    return loadJson(CANONICAL_KEY, []);
  }

  function saveCanonicalLocal(records) {
    const canonical = mergeCanonicalCollections(records);
    saveJson(CANONICAL_KEY, canonical);
    return canonical;
  }

  function migrateFromExistingStores() {
    const canonical = loadCanonicalLocal();
    const quick = loadJson(QUICK_KEY, []).map(canonicalFromQuick);
    const fullState = loadJson(FULL_KEY, {});
    const full = (fullState.opportunities || []).map((record) => canonicalFromFull(record, fullState));
    return saveCanonicalLocal(mergeCanonicalCollections(canonical, quick, full));
  }

  async function pullRemote() {
    const response = await fetch(API_URL, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`Cloud sync unavailable (${response.status})`);
    const payload = await response.json();
    if (!payload.ok || !Array.isArray(payload.opportunities)) throw new Error(payload.error || "Invalid opportunity sync response.");
    return payload.opportunities.map(normalizeCanonical);
  }

  async function pushRemote(records) {
    const response = await fetch(API_URL, {
      method: "PUT",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ opportunities: mergeCanonicalCollections(records) }),
    });
    if (!response.ok) throw new Error(`Cloud sync failed (${response.status})`);
    const payload = await response.json();
    if (!payload.ok || !Array.isArray(payload.opportunities)) throw new Error(payload.error || "Invalid opportunity sync response.");
    return payload.opportunities.map(normalizeCanonical);
  }

  async function syncWithCloud(records) {
    const local = saveCanonicalLocal(records);
    const remote = await pullRemote();
    const merged = saveCanonicalLocal(mergeCanonicalCollections(remote, local));
    const saved = await pushRemote(merged);
    return saveCanonicalLocal(saved);
  }

  window.IGEO_ACQUISITION_SYNC = {
    CANONICAL_KEY,
    QUICK_KEY,
    FULL_KEY,
    API_URL,
    SCORE_MAP,
    now,
    loadJson,
    saveJson,
    normalizeCanonical,
    canonicalFromQuick,
    canonicalFromFull,
    quickFromCanonical,
    fullFromCanonical,
    mergeCanonicalCollections,
    loadCanonicalLocal,
    saveCanonicalLocal,
    migrateFromExistingStores,
    pullRemote,
    pushRemote,
    syncWithCloud,
    parseMoneyValue,
  };
})();
