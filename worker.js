export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/executive-email-alerts") {
      return handleExecutiveEmailAlerts(request, env);
    }
    if (url.pathname === "/api/opportunity-intelligence/collect") return handleOpportunityCollection(request, env);
    if (url.pathname === "/api/opportunity-intelligence/sources") return handleOpportunitySources(request, env);

    const acquisitionWorkspaceRoutes = new Set([
      "/acquisition-os/", "/acquisition-os/opportunities/", "/acquisition-os/documentation/",
      "/acquisition-os/calendar/", "/acquisition-os/proposal-versions/", "/acquisition-os/registrations/",
      "/acquisition-os/product-brokerage/", "/acquisition-os/opportunity-intelligence/",
    ]);
    if (acquisitionWorkspaceRoutes.has(url.pathname)) url.pathname = "/index.html";

    if (url.hostname === "www.igeosolutionsllc.com") {
      url.hostname = "igeosolutionsllc.com";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/worker-intake" || url.pathname === "/worker-intake/") {
      url.pathname = "/worker-intake.html";
    }

    const archivedRoutes = {
      "/executive": "/#today",
      "/executive/": "/#today",
      "/vendor": "/#vendor-registration",
      "/vendor/": "/#vendor-registration",
      "/workforce": "/#workforce-management",
      "/workforce/": "/#workforce-management",
    };
    if (archivedRoutes[url.pathname]) {
      return Response.redirect(new URL(archivedRoutes[url.pathname], url.origin).toString(), 301);
    }

    return env.ASSETS.fetch(new Request(url, request));
  },
};

const OPPORTUNITY_SOURCES = [
  { id:'sam-gov',sourceName:'SAM.gov',governmentLevel:'Federal',stateOrRegion:'Nationwide',buyerType:'Government',officialUrl:'https://sam.gov/content/opportunities',collectionMethod:'API',authenticationRequirement:'API key',checkFrequency:'Daily',enabled:true,manualReviewUrl:'https://sam.gov/content/opportunities' },
  { id:'michigan-sigma',sourceName:'Michigan SIGMA VSS',governmentLevel:'State',stateOrRegion:'Michigan',buyerType:'Government',officialUrl:'https://sigma.michigan.gov/webapp/PRDVSS2X1/AltSelfService',collectionMethod:'Manual',authenticationRequirement:'Portal access may be required',checkFrequency:'Daily manual review',enabled:true,manualReviewUrl:'https://sigma.michigan.gov/webapp/PRDVSS2X1/AltSelfService' },
  { id:'kentucky-eprocurement',sourceName:'Kentucky Vendor Self Service',governmentLevel:'State',stateOrRegion:'Kentucky',buyerType:'Government',officialUrl:'https://vss.ky.gov/',collectionMethod:'Manual',authenticationRequirement:'Portal access may be required',checkFrequency:'Daily manual review',enabled:true,manualReviewUrl:'https://vss.ky.gov/' },
  { id:'texas-esbd',sourceName:'Texas Electronic State Business Daily',governmentLevel:'State',stateOrRegion:'Texas',buyerType:'Government',officialUrl:'https://www.txsmartbuy.gov/esbd',collectionMethod:'Manual',authenticationRequirement:'None for public search',checkFrequency:'Daily manual review',enabled:true,manualReviewUrl:'https://www.txsmartbuy.gov/esbd' },
  { id:'dfw-local-portals',sourceName:'Dallas–Fort Worth Public Portals',governmentLevel:'Local',stateOrRegion:'Dallas–Fort Worth, Texas',buyerType:'Cities, counties, schools, transit, airports, utilities',officialUrl:'https://www.dallascityhall.com/departments/procurement/Pages/default.aspx',collectionMethod:'Manual',authenticationRequirement:'Varies by portal',checkFrequency:'Daily manual review',enabled:true,manualReviewUrl:'https://www.dallascityhall.com/departments/procurement/Pages/default.aspx' },
  { id:'prime-supplier-portals',sourceName:'Prime and Commercial Supplier Portals',governmentLevel:'Commercial',stateOrRegion:'Priority regions',buyerType:'Prime contractors and facility/property managers',officialUrl:'',collectionMethod:'Manual',authenticationRequirement:'Varies; authentication must not be bypassed',checkFrequency:'Weekly manual review',enabled:false,manualReviewUrl:'' }
];
function sourceStatus(source, env) { if(!source.enabled)return'Disabled';if(source.id==='sam-gov')return env.SAM_GOV_API_KEY?'Not Configured':'Not Configured';return source.collectionMethod==='Manual'?'Manual Review Required':'Unsupported'; }
function sourceView(source, env) { return {...source,connectionStatus:sourceStatus(source,env),lastSuccessfulCheck:null,lastAttemptedCheck:null,nextScheduledCheck:null,recordCount:0,errorState:'',operatorNotes:'',lastManualReviewDate:null}; }
async function handleOpportunitySources(request, env) { if(request.method!=='GET')return json({ok:false,error:'Method not allowed.'},405);return json({ok:true,generatedAt:new Date().toISOString(),sources:OPPORTUNITY_SOURCES.map(source=>sourceView(source,env))}); }

const collectionAttempts=new Map();
const SOURCE_ADAPTERS={
  'sam-gov':{async collect({env,days}){if(!env.SAM_GOV_API_KEY)return{status:'Not Configured',records:[]};const params=new URLSearchParams({api_key:env.SAM_GOV_API_KEY,postedFrom:formatSamDate(new Date(Date.now()-days*86400000)),postedTo:formatSamDate(new Date()),limit:'100',offset:'0'}),response=await fetch(`https://api.sam.gov/opportunities/v2/search?${params}`,{headers:{accept:'application/json'}});if(!response.ok)throw new Error('Official source temporarily unavailable.');const data=await response.json();return{status:'Connected',records:(data.opportunitiesData||[]).map(mapSamOpportunity)}}}
};
async function handleOpportunityCollection(request,env){
  if(!['GET','POST'].includes(request.method))return json({ok:false,error:'Method not allowed.'},405);
  const now=Date.now(),client=request.headers.get('CF-Connecting-IP')||'anonymous',previous=collectionAttempts.get(client)||0;
  if(request.method==='POST'&&now-previous<30000)return json({ok:false,error:'Refresh is available once every 30 seconds.',retryAfterSeconds:Math.ceil((30000-(now-previous))/1000)},429,{'retry-after':String(Math.ceil((30000-(now-previous))/1000))});
  collectionAttempts.set(client,now);const url=new URL(request.url),days=Math.min(Math.max(Number(url.searchParams.get('days')||30),1),90),sources=[],opportunities=[],startedAt=new Date().toISOString();
  for(const source of OPPORTUNITY_SOURCES){if(!source.enabled||source.collectionMethod==='Manual'){sources.push({...sourceView(source,env),lastAttemptedCheck:source.collectionMethod==='Manual'?null:startedAt});continue}const adapter=SOURCE_ADAPTERS[source.id];if(!adapter){sources.push({...sourceView(source,env),connectionStatus:'Unsupported'});continue}try{const result=await adapter.collect({env,days});opportunities.push(...result.records);sources.push({...sourceView(source,env),connectionStatus:result.status,lastAttemptedCheck:startedAt,lastSuccessfulCheck:result.status==='Connected'?new Date().toISOString():null,recordCount:result.records.length,errorState:''})}catch{sources.push({...sourceView(source,env),connectionStatus:'Temporarily Unavailable',lastAttemptedCheck:startedAt,errorState:'Collection unavailable; try again later.'})}}
  return json({ok:true,collectedAt:new Date().toISOString(),summary:{addedRecords:opportunities.length,changedRecords:0,expiredRecords:0,errors:sources.filter(x=>x.errorState).length},sources,opportunities});
}
function formatSamDate(date) { return `${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')}/${date.getFullYear()}`; }
function mapSamOpportunity(item) { const contact=item.pointOfContact?.[0]||{}; return { id:`sam-${item.noticeId||item.solicitationNumber}`, origin:'automated', source:'SAM.gov', sourceUrl:item.uiLink||item.resourceLinks?.[0]||'', solicitationNumber:item.solicitationNumber||item.noticeId||'', title:item.title||'Untitled solicitation', buyer:item.fullParentPathName||item.department||'', agency:item.organizationName||item.subTier||'', solicitationType:item.type||item.baseType||'', contractType:item.typeOfSetAsideDescription||'', postedDate:item.postedDate||'', dueDate:item.responseDeadLine||item.archiveDate||'', naics:item.naicsCode||'', psc:item.classificationCode||'', placeOfPerformance:[item.placeOfPerformance?.city?.name,item.placeOfPerformance?.state?.code].filter(Boolean).join(', '), setAside:item.typeOfSetAsideDescription||item.typeOfSetAside||'', contactName:contact.fullName||'', contactEmail:contact.email||'', contactPhone:contact.phone||'', attachments:item.resourceLinks||[], scopeSummary:item.description||'', status:'New', collectedAt:new Date().toISOString() }; }

const IMPORTANT_LABEL = "iGeo Important";
const OWNER_EMAIL = "admin@igeosolutionsllc.com";
const HIGH_PRIORITY_TERMS = [
  "sam.gov",
  "solicitation",
  "contract",
  "award",
  "proposal",
  "payment",
  "invoice",
  "wire transfer",
  "capability statement",
  "prime contractor",
  "government",
  "vendor registration",
  "urgent",
  "deadline",
  "follow up",
  "worker application",
];
const LOW_PRIORITY_TERMS = [
  "promotions",
  "shopping",
  "marketing",
  "social",
  "subscriptions",
  "advertisements",
  "newsletters",
  "newsletter",
  "webinar",
  "coupon",
];

async function handleExecutiveEmailAlerts(request, env) {
  if (request.method !== "GET") {
    return json({ ok: false, error: "Method not allowed." }, 405);
  }

  const configError = validateGmailConfig(env);
  if (configError) {
    return json({
      ok: true,
      configured: false,
      gmail: { critical: 0, pending: 0, contracts: 0, payments: 0, applications: 0 },
    });
  }

  try {
    const url = new URL(request.url);
    const settings = {
      ownerMode: url.searchParams.get("ownerMode") !== "false",
      partnerNotifications: url.searchParams.get("partnerNotifications") !== "false",
      alertThreshold: url.searchParams.get("alertThreshold") || "high",
    };
    const token = await getGoogleAccessToken(env);
    const labelId = await getOrCreateGmailLabel(token, IMPORTANT_LABEL);
    await classifyRecentMessages(token, labelId, settings, env);
    const counts = await readImportantAlertCounts(token, labelId);

    return json({
      ok: true,
      generatedAt: new Date().toISOString(),
      label: IMPORTANT_LABEL,
      ownerMode: settings.ownerMode,
      gmail: counts,
    });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}

function validateGmailConfig(env) {
  const required = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"];
  const missing = required.filter((key) => !env[key]);
  return missing.length ? `Missing email alert settings: ${missing.join(", ")}` : "";
}

async function getGoogleAccessToken(env) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Unable to refresh Gmail access token.");
  }
  return data.access_token;
}

async function classifyRecentMessages(token, labelId, settings, env) {
  const messages = await gmailList(token, "in:inbox is:unread newer_than:14d -category:promotions -category:social -category:forums", 25);
  await Promise.all(messages.map(async (message) => {
    const detail = await gmailMessage(token, message.id);
    const text = messageSearchText(detail);
    if (!isHighPriority(text)) return;

    const alreadyLabeled = (detail.labelIds || []).includes(labelId);
    if (!alreadyLabeled) {
      await gmailModify(token, message.id, { addLabelIds: [labelId] });
      if (settings.ownerMode) {
        await sendOwnerNotification(token, detail, text, settings, env);
      }
    }
  }));
}

async function readImportantAlertCounts(token, labelId) {
  const messages = await gmailList(token, "is:unread newer_than:30d", 100, [labelId]);
  const counts = { critical: 0, pending: 0, contracts: 0, payments: 0, applications: 0 };
  await Promise.all(messages.map(async (message) => {
    const detail = await gmailMessage(token, message.id);
    const text = messageSearchText(detail);
    if (!isHighPriority(text)) return;
    counts.critical += 1;
    counts.pending += 1;
    if (containsAny(text, ["solicitation", "contract", "award", "proposal", "prime contractor", "government"])) {
      counts.contracts += 1;
    }
    if (containsAny(text, ["payment", "invoice", "wire transfer", "deposit"])) {
      counts.payments += 1;
    }
    if (containsAny(text, ["worker application", "application", "workforce"])) {
      counts.applications += 1;
    }
  }));
  return counts;
}

async function getOrCreateGmailLabel(token, name) {
  const labels = await gmailFetch(token, "/labels");
  const existing = (labels.labels || []).find((label) => label.name === name);
  if (existing) return existing.id;

  const created = await gmailFetch(token, "/labels", {
    method: "POST",
    body: {
      name,
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    },
  });
  return created.id;
}

async function gmailList(token, query, maxResults, labelIds = []) {
  const params = new URLSearchParams({ q: query, maxResults: String(maxResults) });
  labelIds.forEach((labelId) => params.append("labelIds", labelId));
  const data = await gmailFetch(token, `/messages?${params}`);
  return data.messages || [];
}

async function gmailMessage(token, id) {
  const params = new URLSearchParams({ format: "metadata" });
  ["From", "Subject", "Date"].forEach((header) => params.append("metadataHeaders", header));
  return gmailFetch(token, `/messages/${id}?${params}`);
}

async function gmailModify(token, id, body) {
  return gmailFetch(token, `/messages/${id}/modify`, { method: "POST", body });
}

async function sendOwnerNotification(token, message, text, settings, env) {
  const recipients = [OWNER_EMAIL];
  if (settings.partnerNotifications && env.PARTNER_EMAIL) recipients.push(env.PARTNER_EMAIL);
  const subject = headerValue(message, "Subject") || "Executive email alert";
  const from = headerValue(message, "From") || "Unknown sender";
  const matched = HIGH_PRIORITY_TERMS.filter((term) => text.includes(term)).join(", ");
  const body = [
    "A high-priority iGeo email was classified for owner review.",
    "",
    `Subject: ${subject}`,
    `From: ${from}`,
    `Matched terms: ${matched || "business-critical keyword"}`,
    "",
    "Open Gmail and review the iGeo Important label.",
  ].join("\n");
  const raw = [
    `To: ${recipients.join(", ")}`,
    `Subject: iGeo Important: ${subject}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body,
  ].join("\r\n");
  await gmailFetch(token, "/messages/send", {
    method: "POST",
    body: { raw: base64Url(raw) },
  });
}

async function gmailFetch(token, path, options = {}) {
  const init = {
    method: options.method || "GET",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  };
  if (options.body) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Gmail API request failed.");
  return data;
}

function messageSearchText(message) {
  const headers = message.payload?.headers || [];
  return [
    headerValueFrom(headers, "From"),
    headerValueFrom(headers, "Subject"),
    message.snippet || "",
  ].join(" ").toLowerCase();
}

function headerValue(message, name) {
  return headerValueFrom(message.payload?.headers || [], name);
}

function headerValueFrom(headers, name) {
  const header = headers.find((item) => item.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : "";
}

function isHighPriority(text) {
  if (!containsAny(text, HIGH_PRIORITY_TERMS)) return false;
  if (!containsAny(text, LOW_PRIORITY_TERMS)) return true;
  return containsAny(text, ["urgent", "deadline", "award", "payment", "invoice", "wire transfer"]);
}

function containsAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function base64Url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}
