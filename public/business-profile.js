(function () {
  "use strict";

  const PROFILE_VERSION = 3;
  const baseServices = [
    ["Janitorial", "Facilities", "561720", "janitorial,custodial,cleaning", "Government, schools, commercial facilities", "Self-perform or subcontract"],
    ["Custodial", "Facilities", "561720", "custodial,cleaning,day porter", "Government, schools, healthcare", "Self-perform or subcontract"],
    ["Floor Care", "Facilities", "561720", "floor care,stripping,waxing,carpet", "Government, schools, property managers", "Self-perform or subcontract"],
    ["Porter Services", "Facilities", "561720", "porter,day porter,facility attendant", "Property managers, government, healthcare", "Self-perform or subcontract"],
    ["Commercial Cleaning", "Facilities", "561720", "commercial cleaning,building cleaning", "Government, property managers, primes", "Self-perform or subcontract"],
    ["Administrative Support", "Business Support", "561110", "administrative,office support,program support", "Government, primes, universities", "Self-perform or subcontract"],
    ["Clerical Support", "Business Support", "561110", "clerical,reception,office assistant", "Government, healthcare, universities", "Self-perform or subcontract"],
    ["Data Entry", "Business Support", "561110", "data entry,data processing,indexing", "Government, healthcare, primes", "Self-perform or subcontract"],
    ["Temporary Staffing", "Workforce", "561320", "temporary staffing,staff augmentation,personnel", "Government, healthcare, commercial buyers", "Self-perform or subcontract"],
    ["Records Management", "Business Support", "561110", "records management,document control,filing", "Government, healthcare, universities", "Self-perform or subcontract"],
    ["Courier Services", "Logistics", "492110", "courier,delivery,messenger", "Government, healthcare, universities", "Self-perform or subcontract"],
    ["Relocation Services", "Logistics", "484210,488510,541614,624229,624190,561210", "relocation,move management,housing search,utility transfer,household goods", "Government, housing authorities, commercial buyers", "Self-perform, coordinate, or subcontract"],
    ["Debris Removal", "Facilities", "562119", "debris removal,hauling,cleanup", "Government, property managers, primes", "Subcontract"],
    ["Grounds Maintenance", "Facilities", "561730", "grounds,landscaping,lawn,snow", "Government, schools, property managers", "Self-perform or subcontract"],
    ["Property Maintenance", "Facilities", "561210", "property maintenance,facility maintenance,building support", "Government, housing, property managers", "Self-perform or subcontract"],
    ["Documentation Support", "Business Support", "561110", "documentation,technical documentation,document preparation", "Government, primes, commercial buyers", "Self-perform"],
    ["Business Process Support", "Business Support", "541611", "business process,workflow,operations support", "Government, primes, commercial buyers", "Self-perform"],
    ["AI Automation", "Technology", "541511", "ai automation,workflow automation,artificial intelligence", "Government, primes, commercial buyers", "Self-perform or partner"],
    ["AI Automation Services", "Technology", "541511", "ai automation,process automation,integration", "Government, primes, commercial buyers", "Self-perform or partner"],
    ["Home Health Support", "Healthcare Support", "621610", "home health,nonclinical healthcare,patient support", "Healthcare, government, managed care", "Self-perform or subcontract"],
    ["ABA Therapy Support", "Healthcare Support", "621330", "aba,behavior support,therapy support", "Healthcare, schools, government", "Licensed partner or subcontract"],
    ["Armed Security", "Security", "561612", "armed security,armed guard,protective services", "Government, commercial facilities", "Licensed subcontract"],
    ["Unarmed Security", "Security", "561612", "unarmed security,security guard,protective services", "Government, commercial facilities", "Licensed subcontract"],
    ["Guard Services", "Security", "561612", "guard services,security officer,site security", "Government, commercial facilities", "Licensed subcontract"],
    ["Patrol Services", "Security", "561612", "patrol,mobile patrol,security patrol", "Government, commercial facilities", "Licensed subcontract"],
    ["Facility Security Support", "Security", "561612", "facility security,access control,security support", "Government, commercial facilities", "Licensed subcontract"],
    ["Office Leasing & Space Management", "Facilities", "531120,531210,531390,561210,484210,488510,541614", "office leasing,space procurement,lease administration,occupancy,space planning,office relocation", "Government, primes, commercial buyers", "Coordination or licensed partner"],
  ];

  const defaultServices = baseServices.map(([name, category, naics, keywords, typicalBuyers, deliveryModel]) => ({
    id: `service-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    name,
    category,
    description: `${name} opportunity delivery and support. Confirm solicitation-specific scope and requirements before pursuit.`,
    naics: naics.split(","),
    keywords: keywords.split(","),
    typicalBuyers: typicalBuyers.split(","),
    deliveryModel,
    canSubcontract: /subcontract|partner|licensed/.test(deliveryModel.toLowerCase()),
    capabilityTypes: [...(/self-perform/i.test(deliveryModel) ? ["Direct"] : []), ...(/subcontract|licensed partner/i.test(deliveryModel) ? ["Managed Subcontractor"] : [])],
    partnerRegion:"",partnerReady:false,partnerPersonnelAvailable:false,partnerEquipmentAvailable:false,significantCapitalRequired:false,
  }));
  defaultServices.push({
    id:"service-mobile-snow-cone-trucks-event-concessions",name:"Mobile Snow Cone Trucks / Event Concessions",category:"Event Services",
    description:"iGeo-managed event concessions delivered through a ready strategic partner with personnel and equipment.",naics:[],
    keywords:["snow cone","snowball","shaved ice","mobile concessions","food truck","festival vendor","event concessions","community event","employee appreciation","summer recreation","parks and recreation","special events","fair","carnival"],
    typicalBuyers:["Cities","counties","parks and recreation","schools","universities","commercial event buyers"],deliveryModel:"iGeo-managed strategic partner",canSubcontract:false,
    capabilityTypes:["Strategic Partner"],partnerRegion:"Frederick, Maryland",partnerReady:true,partnerPersonnelAvailable:true,partnerEquipmentAvailable:true,significantCapitalRequired:false
  });
  const searchProfileNames = ["Commercial Cleaning","Janitorial","Custodial","Administrative Support","Clerical Support","Data Entry","Staffing","Temporary Staffing","Facility Services","Facility Maintenance","Grounds Maintenance","Property Maintenance","Security","Courier Services","Transportation","AI Automation","Business Process Support","Home Health","ABA Services","Mobile Snow Cone Trucks / Event Concessions"];
  const defaultSearchProfiles = searchProfileNames.map((name) => {
    const service = defaultServices.find((item) => item.name === name || item.name.startsWith(name));
    return { id:`search-${name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`, name, keywords: service ? [...service.keywords] : [name.toLowerCase()], enabled:true };
  });

  const DEFAULT_PROFILE = {
    profileVersion: PROFILE_VERSION,
    company: {
      legalName: "iGeo Solutions LLC",
      dba: "",
      uei: "PQ6GHN6ZS287",
      cage: "",
      einReference: "Stored securely outside this browser",
      website: "https://igeosolutionsllc.com/",
      businessEmail: "admin@igeosolutionsllc.com",
      businessPhone: "(616) 224-2325",
      headquarters: "",
      operatingStates: ["Michigan", "Kentucky"],
    },
    structure: { entityType: "Limited Liability Company", ownership: "", smallBusinessStatus: "Small Business", socioeconomicDesignations: [] },
    services: defaultServices,
    searchProfiles: defaultSearchProfiles,
    certifications: [],
    insurance: [],
    licenses: [],
    bonding: { status: "Not recorded", capacity: "" },
    capacity: { workforce: "", vehicles: "", equipment: "", preferredContractSize: "", maximumStartupCapital: "", maximumPaymentGapDays: "" },
    geographicCoverage: ["Michigan", "Kentucky", "Nationwide Subcontract Support"],
    documents: {
      capabilityStatement: { status: "Available", reference: "Capability Statement Library" },
      w9: { status: "Not recorded", reference: "" },
      sam: { status: "Not configured", reference: "SAM.gov" },
      articles: { status: "Not recorded", reference: "" },
      insuranceCertificates: { status: "Not recorded", reference: "" },
    },
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const list = (value) => Array.isArray(value) ? value : String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
  function mergeServices(existing) {
    const supplied=Array.isArray(existing)?existing:[],byId=new Map(supplied.map(service=>[service.id,service]));
    const merged=defaultServices.map(base=>{const saved=byId.get(base.id)||{};return{...clone(base),...saved,capabilityTypes:Array.isArray(saved.capabilityTypes)&&saved.capabilityTypes.length?saved.capabilityTypes:clone(base.capabilityTypes)}});
    supplied.filter(service=>!defaultServices.some(base=>base.id===service.id)).forEach(service=>merged.push(service));
    return merged;
  }
  function mergeSearchProfiles(existing){const supplied=Array.isArray(existing)?existing:[],byId=new Map(supplied.map(profile=>[profile.id,profile]));return[...defaultSearchProfiles.map(base=>({...clone(base),...(byId.get(base.id)||{})})),...supplied.filter(profile=>!defaultSearchProfiles.some(base=>base.id===profile.id))]}
  function mergeProfile(existing) {
    const source = existing || {};
    return {
      ...clone(DEFAULT_PROFILE), ...source,
      company: { ...DEFAULT_PROFILE.company, ...(source.company || {}) },
      structure: { ...DEFAULT_PROFILE.structure, ...(source.structure || {}) },
      bonding: { ...DEFAULT_PROFILE.bonding, ...(source.bonding || {}) },
      capacity: { ...DEFAULT_PROFILE.capacity, ...(source.capacity || {}) },
      documents: { ...DEFAULT_PROFILE.documents, ...(source.documents || {}) },
      services: mergeServices(source.services),
      searchProfiles: mergeSearchProfiles(source.searchProfiles),
    };
  }
  function get() { return mergeProfile(window.IGEOData?.get()?.businessProfile); }
  function update(mutator) {
    let saved;
    window.IGEOData.update((state) => {
      const draft = get();
      saved = mergeProfile(mutator(draft) || draft);
      saved.profileVersion = PROFILE_VERSION;
      saved.updatedAt = new Date().toISOString();
      state.businessProfile = saved;
      return state;
    });
    window.dispatchEvent(new CustomEvent("igeo:business-profile-changed", { detail: saved }));
    return saved;
  }
  function serviceNames() { return get().services.filter((item) => item.name).map((item) => item.name); }
  function matchServices(opportunity = {}) {
    const haystack = [opportunity.title, opportunity.description, opportunity.scopeSummary, opportunity.service, opportunity.serviceType, opportunity.naics].join(" ").toLowerCase();
    return get().services.filter((service) => {
      const terms = [service.name, ...list(service.keywords), ...list(service.naics)].map((term) => String(term).toLowerCase()).filter(Boolean);
      return terms.some((term) => haystack.includes(term));
    });
  }

  function ensureProfile() {
    if (!window.IGEOData) return;
    const state = window.IGEOData.get();
    if (state.businessProfile) return;
    window.IGEOData.update((current) => { current.businessProfile = clone(DEFAULT_PROFILE); return current; });
  }

  function field(label, key, value, type = "text") {
    return `<label>${label}<input type="${type}" data-profile-field="${key}" value="${escapeHtml(value || "")}"></label>`;
  }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
  function renderSettings() {
    const host = document.getElementById("businessProfileRegistry");
    if (!host) return;
    const profile = get();
    host.innerHTML = `<details><summary><strong>Business Profile Registry</strong><span>Authoritative company, capability, and service data</span></summary>
      <form id="businessProfileForm" class="business-profile-form">
        <h3>Company Information</h3><div class="form-grid">
          ${field("Legal name", "company.legalName", profile.company.legalName)}${field("DBA", "company.dba", profile.company.dba)}
          ${field("UEI", "company.uei", profile.company.uei)}${field("CAGE", "company.cage", profile.company.cage)}
          ${field("EIN reference", "company.einReference", profile.company.einReference)}${field("Website", "company.website", profile.company.website, "url")}
          ${field("Business email", "company.businessEmail", profile.company.businessEmail, "email")}${field("Business phone", "company.businessPhone", profile.company.businessPhone, "tel")}
          ${field("Headquarters", "company.headquarters", profile.company.headquarters)}${field("Operating states (comma separated)", "company.operatingStates", profile.company.operatingStates.join(", "))}
        </div>
        <h3>Business Structure</h3><div class="form-grid">
          ${field("Entity type", "structure.entityType", profile.structure.entityType)}${field("Ownership", "structure.ownership", profile.structure.ownership)}
          ${field("Small business status", "structure.smallBusinessStatus", profile.structure.smallBusinessStatus)}${field("Socio-economic designations", "structure.socioeconomicDesignations", profile.structure.socioeconomicDesignations.join(", "))}
        </div>
        <h3>Qualifications and Capacity</h3><div class="form-grid">
          ${field("Certifications", "certifications", profile.certifications.join(", "))}${field("Insurance", "insurance", profile.insurance.join(", "))}
          ${field("Licenses", "licenses", profile.licenses.join(", "))}${field("Bonding status", "bonding.status", profile.bonding.status)}
          ${field("Bonding capacity", "bonding.capacity", profile.bonding.capacity)}${field("Workforce capacity", "capacity.workforce", profile.capacity.workforce)}
          ${field("Vehicles", "capacity.vehicles", profile.capacity.vehicles)}${field("Equipment", "capacity.equipment", profile.capacity.equipment)}
          ${field("Preferred contract size", "capacity.preferredContractSize", profile.capacity.preferredContractSize)}${field("Maximum startup capital", "capacity.maximumStartupCapital", profile.capacity.maximumStartupCapital)}
          ${field("Maximum supported payment gap (days)", "capacity.maximumPaymentGapDays", profile.capacity.maximumPaymentGapDays)}
          ${field("Geographic coverage", "geographicCoverage", profile.geographicCoverage.join(", "))}
        </div>
        <h3>Documents</h3><div class="form-grid">
          ${Object.entries(profile.documents).map(([key, document]) => `${field(`${key.replace(/([A-Z])/g, " $1")} status`, `documents.${key}.status`, document.status)}${field(`${key.replace(/([A-Z])/g, " $1")} reference`, `documents.${key}.reference`, document.reference)}`).join("")}
        </div>
        <h3>Service Library</h3><p>These services drive opportunity matching across Acquisition OS.</p>
        <div class="business-service-list">${profile.services.map((service, index) => `<details data-service-index="${index}"><summary>${escapeHtml(service.name)}</summary><div class="form-grid">
          ${field("Name", `services.${index}.name`, service.name)}${field("Category", `services.${index}.category`, service.category)}
          ${field("Description", `services.${index}.description`, service.description)}${field("NAICS", `services.${index}.naics`, list(service.naics).join(", "))}
          ${field("Keywords", `services.${index}.keywords`, list(service.keywords).join(", "))}${field("Typical buyers", `services.${index}.typicalBuyers`, list(service.typicalBuyers).join(", "))}
          ${field("Delivery model", `services.${index}.deliveryModel`, service.deliveryModel)}${field("Capability types (Direct, Managed Subcontractor, Strategic Partner)", `services.${index}.capabilityTypes`, list(service.capabilityTypes).join(", "))}<label>Can subcontract<select data-profile-field="services.${index}.canSubcontract"><option value="true" ${service.canSubcontract ? "selected" : ""}>Yes</option><option value="false" ${!service.canSubcontract ? "selected" : ""}>No</option></select></label>
          ${field("Strategic partner region", `services.${index}.partnerRegion`, service.partnerRegion||"")}<label>Partner ready<select data-profile-field="services.${index}.partnerReady"><option value="true" ${service.partnerReady?"selected":""}>Yes</option><option value="false" ${!service.partnerReady?"selected":""}>No</option></select></label>
          <label>Partner personnel available<select data-profile-field="services.${index}.partnerPersonnelAvailable"><option value="true" ${service.partnerPersonnelAvailable?"selected":""}>Yes</option><option value="false" ${!service.partnerPersonnelAvailable?"selected":""}>No</option></select></label><label>Partner equipment available<select data-profile-field="services.${index}.partnerEquipmentAvailable"><option value="true" ${service.partnerEquipmentAvailable?"selected":""}>Yes</option><option value="false" ${!service.partnerEquipmentAvailable?"selected":""}>No</option></select></label>
          <label>Significant iGeo capital required<select data-profile-field="services.${index}.significantCapitalRequired"><option value="false" ${!service.significantCapitalRequired?"selected":""}>No</option><option value="true" ${service.significantCapitalRequired?"selected":""}>Yes</option></select></label>
        </div></details>`).join("")}</div>
        <h3>Opportunity Search Profiles</h3><p>Active profiles control which collected notices enter the analysis queue. Edit keywords here without changing code.</p>
        <div class="business-service-list">${profile.searchProfiles.map((searchProfile,index)=>`<details><summary>${escapeHtml(searchProfile.name)}</summary><div class="form-grid">
          ${field("Profile name",`searchProfiles.${index}.name`,searchProfile.name)}${field("Keywords",`searchProfiles.${index}.keywords`,list(searchProfile.keywords).join(", "))}
          <label>Active<select data-profile-field="searchProfiles.${index}.enabled"><option value="true" ${searchProfile.enabled!==false?"selected":""}>Yes</option><option value="false" ${searchProfile.enabled===false?"selected":""}>No</option></select></label>
        </div></details>`).join("")}</div>
        <button class="button primary" type="submit">Save Business Profile</button><span id="businessProfileStatus" role="status" aria-live="polite"></span>
      </form></details>`;
    host.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      update((draft) => {
        host.querySelectorAll("[data-profile-field]").forEach((control) => {
          const path = control.dataset.profileField.split("."); let target = draft;
          path.slice(0, -1).forEach((part) => { target = target[Number.isNaN(Number(part)) ? part : Number(part)]; });
          const key = path[path.length - 1]; const current = target[key];
          target[key] = typeof current === "boolean" ? control.value === "true" : Array.isArray(current) ? list(control.value) : control.value.trim();
        });
        return draft;
      });
      document.getElementById("businessProfileStatus").textContent = "Business Profile saved.";
    });
  }

  function searchProfiles() { return get().searchProfiles.filter((profile) => profile.enabled !== false); }
  window.IGEOBusinessProfile = { PROFILE_VERSION, get, update, serviceNames, matchServices, searchProfiles };
  ensureProfile();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderSettings); else renderSettings();
})();
