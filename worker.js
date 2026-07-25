export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "www.igeosolutionsllc.com") {
      url.hostname = "igeosolutionsllc.com";
      return Response.redirect(url.toString(), 308);
    }

    if (url.pathname === "/api/executive-email-alerts") {
      return handleExecutiveEmailAlerts(request, env);
    }
    if (url.pathname === "/api/build-info") return handleBuildInfo(url, env);
    if (url.pathname === "/api/opportunity-intelligence/attachment-check") return handleAttachmentCheck(request);
    if (url.pathname === "/api/opportunity-intelligence/collect") return handleOpportunityCollection(request, env);
    if (url.pathname === "/api/opportunity-intelligence/sources") return handleOpportunitySources(request, env);

    const acquisitionWorkspaceRoutes = new Set([
      "/acquisition-os/", "/acquisition-os/opportunities/", "/acquisition-os/documentation/",
      "/acquisition-os/calendar/", "/acquisition-os/proposal-versions/", "/acquisition-os/registrations/",
      "/acquisition-os/product-brokerage/", "/acquisition-os/opportunity-intelligence/",
    ]);
    if (acquisitionWorkspaceRoutes.has(url.pathname)) url.pathname = "/index.html";

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

function handleBuildInfo(url, env) {
  const metadata = env.CF_VERSION_METADATA || {};
  return json({
    environment: url.hostname === "igeosolutionsllc.com" ? "Production" : "Development",
    productionUrl: "https://igeosolutionsllc.com/",
    deploymentVersion: metadata.id || "Unavailable",
    deployedAt: metadata.timestamp || null,
  });
}

const OPPORTUNITY_SOURCES = [
  { id:'sam-gov',sourceName:'SAM.gov',sourceType:'Federal procurement API',governmentLevel:'Federal',stateOrRegion:'Nationwide',buyerType:'Government',officialUrl:'https://sam.gov/content/opportunities',collectionMethod:'API',searchMethod:'Official public API',loginRequired:false,authenticationRequirement:'API key',checkFrequency:'Daily',enabled:true,operatorNotes:'Requires the server-side SAM_GOV_API_KEY secret.',manualReviewUrl:'https://sam.gov/content/opportunities' },
  { id:'michigan-sigma',sourceName:'Michigan SIGMA VSS',governmentLevel:'State',stateOrRegion:'Michigan',buyerType:'Government',officialUrl:'https://sigma.michigan.gov/webapp/PRDVSS2X1/AltSelfService',collectionMethod:'Manual',authenticationRequirement:'Portal access may be required',checkFrequency:'Daily manual review',enabled:true,manualReviewUrl:'https://sigma.michigan.gov/webapp/PRDVSS2X1/AltSelfService' },
  { id:'kentucky-eprocurement',sourceName:'Kentucky Vendor Self Service',governmentLevel:'State',stateOrRegion:'Kentucky',buyerType:'Government',officialUrl:'https://vss.ky.gov/',collectionMethod:'Manual',authenticationRequirement:'Portal access may be required',checkFrequency:'Daily manual review',enabled:true,manualReviewUrl:'https://vss.ky.gov/' },
  { id:'texas-esbd',sourceName:'Texas Electronic State Business Daily',sourceType:'STATE',governmentLevel:'State',jurisdiction:'Texas statewide',state:'TX',stateOrRegion:'Texas',buyerType:'Government',platform:'Texas SmartBuy ESBD',officialUrl:'https://www.txsmartbuy.gov/esbd',publicSearchUrl:'https://www.txsmartbuy.gov/esbd',collectionMethod:'Public HTML',collectorType:'PUBLIC_HTML',searchMethod:'Official public listing',loginRequired:false,authenticationRequirement:'No sign-in required to view solicitations',checkFrequency:'Daily',collectionFrequency:'Daily',enabled:true,operatorNotes:'Public listing collection is limited to active, future-due ESBD notices.',manualReviewUrl:'https://www.txsmartbuy.gov/esbd' },
  { id:'dfw-local-portals',sourceName:'Dallas–Fort Worth Public Portals',governmentLevel:'Local',stateOrRegion:'Dallas–Fort Worth, Texas',buyerType:'Cities, counties, schools, transit, airports, utilities',officialUrl:'https://www.dallascityhall.com/departments/procurement/Pages/default.aspx',collectionMethod:'Manual',authenticationRequirement:'Varies by portal',checkFrequency:'Daily manual review',enabled:true,manualReviewUrl:'https://www.dallascityhall.com/departments/procurement/Pages/default.aspx' },
  { id:'georgia-procurement-registry',sourceName:'Georgia Procurement Registry',sourceType:'STATE',governmentLevel:'State and Local',jurisdiction:'Georgia',state:'GA',stateOrRegion:'Georgia',buyerType:'Government',platform:'Georgia Procurement Registry / Team Georgia Marketplace',officialUrl:'https://www.doas.ga.gov/state-purchasing/bids-and-contracts',publicSearchUrl:'https://ssl.doas.state.ga.us/PRSapp/PR_index.jsp',collectionMethod:'Manual',collectorType:'MANUAL',authenticationRequirement:'Registration may be required for Team Georgia Marketplace',checkFrequency:'Daily manual review',collectionFrequency:'Daily manual review',enabled:true,operatorNotes:'Registry covers state and local notices. Manual review only until a lawful public listing endpoint is verified.',manualReviewUrl:'https://ssl.doas.state.ga.us/PRSapp/PR_index.jsp' },
  { id:'dallas-procurement',sourceName:'City of Dallas Procurement',sourceType:'LOCAL',governmentLevel:'Local',jurisdiction:'Dallas, Texas',state:'TX',stateOrRegion:'Dallas-Fort Worth, Texas',buyerType:'City government',platform:'City of Dallas Procurement',officialUrl:'https://dallascityhall.com/departments/procurement/Pages/default.aspx',publicSearchUrl:'https://dallascityhall.com/departments/procurement/Pages/default.aspx',collectionMethod:'Manual',collectorType:'MANUAL',authenticationRequirement:'Portal access varies by solicitation',checkFrequency:'Daily manual review',collectionFrequency:'Daily manual review',enabled:true,operatorNotes:'Manual review only until a lawful public listing endpoint is verified.',manualReviewUrl:'https://dallascityhall.com/departments/procurement/Pages/default.aspx' },
  { id:'houston-procurement',sourceName:'City of Houston Strategic Procurement',sourceType:'LOCAL',governmentLevel:'Local',jurisdiction:'Houston, Texas',state:'TX',stateOrRegion:'Houston, Texas',buyerType:'City government',platform:'City of Houston Strategic Procurement',officialUrl:'https://www.houstontx.gov/bizwithhou/',publicSearchUrl:'https://www.houstontx.gov/bizwithhou/',collectionMethod:'Manual',collectorType:'MANUAL',authenticationRequirement:'Portal access varies by solicitation',checkFrequency:'Daily manual review',collectionFrequency:'Daily manual review',enabled:true,operatorNotes:'Manual review only until a lawful public listing endpoint is verified.',manualReviewUrl:'https://www.houstontx.gov/bizwithhou/' },
  { id:'texas-local-registry',sourceName:'Texas Local Procurement Registry',sourceType:'LOCAL',governmentLevel:'Local',jurisdiction:'Dallas, Dallas County, Fort Worth, Tarrant County, Arlington, Irving, Garland, Plano, Denton, Houston, Harris County, Fort Bend County, Montgomery County, Sugar Land, Pearland, Pasadena, and Baytown',state:'TX',stateOrRegion:'Dallas-Fort Worth and Houston, Texas',buyerType:'Cities and counties',platform:'Approved local portals',officialUrl:'https://www.txsmartbuy.gov/esbd',publicSearchUrl:'https://www.txsmartbuy.gov/esbd',collectionMethod:'Manual',collectorType:'MANUAL',authenticationRequirement:'Varies by local portal',checkFrequency:'Daily manual review',collectionFrequency:'Daily manual review',enabled:true,operatorNotes:'Registry placeholder for approved local sources; each portal remains manual until public access and collection method are verified.',manualReviewUrl:'https://www.txsmartbuy.gov/esbd' },
  { id:'prime-supplier-portals',sourceName:'Prime and Commercial Supplier Portals',governmentLevel:'Commercial',stateOrRegion:'Priority regions',buyerType:'Prime contractors and facility/property managers',officialUrl:'',collectionMethod:'Manual',authenticationRequirement:'Varies; authentication must not be bypassed',checkFrequency:'Weekly manual review',enabled:false,manualReviewUrl:'' }
];
function sourceStatus(source, env) { if(!source.enabled)return'Disabled';if(source.id==='sam-gov')return env.SAM_GOV_API_KEY?'Not Checked':'Not Configured';if(source.collectionMethod==='Manual')return'Manual Review Required';if(source.collectionMethod==='Public HTML')return'Not Checked';return'Unsupported'; }
function sourceView(source, env) { const inferredLogin=source.loginRequired===undefined?/portal access may be required|varies/i.test(source.authenticationRequirement||''):Boolean(source.loginRequired);return {...source,sourceType:source.sourceType||`${source.governmentLevel||'Public'} procurement portal`,loginRequired:inferredLogin,searchMethod:source.searchMethod||source.collectionMethod,active:Boolean(source.enabled),connectionStatus:sourceStatus(source,env),lastSuccessfulCheck:null,lastAttemptedCheck:null,nextScheduledCheck:null,recordCount:0,errorState:'',operatorNotes:source.operatorNotes||'',lastManualReviewDate:null}; }
async function handleOpportunitySources(request, env) { if(request.method!=='GET')return json({ok:false,error:'Method not allowed.'},405);return json({ok:true,generatedAt:new Date().toISOString(),sources:OPPORTUNITY_SOURCES.map(source=>sourceView(source,env))}); }
async function handleAttachmentCheck(request){
  if(request.method!=='GET')return json({ok:false,error:'Method not allowed.'},405);
  const candidate=new URL(request.url).searchParams.get('url')||'';
  let attachment;
  try{attachment=new URL(candidate)}catch{return json({ok:true,available:false,reason:'Invalid attachment URL.'})}
  const approved=attachment.protocol==='https:'&&(/(^|\.)sam\.gov$/i.test(attachment.hostname)||/(^|\.)amazonaws\.com$/i.test(attachment.hostname));
  if(!approved)return json({ok:true,available:null,reason:'Attachment host cannot be checked safely.'});
  try{
    let response=await fetch(attachment.toString(),{method:'HEAD',redirect:'manual'});
    if(response.status===405)response=await fetch(attachment.toString(),{headers:{Range:'bytes=0-0'},redirect:'manual'});
    const available=(response.status>=200&&response.status<400),disposition=response.headers.get('content-disposition')||'',match=/filename\*?=(?:UTF-8''|"?)([^;\"]+)/i.exec(disposition);
    return json({ok:true,available,status:response.status,filename:match?decodeURIComponent(match[1]):''});
  }catch{return json({ok:true,available:false,reason:'Attachment unavailable from source.'})}
}

const collectionAttempts=new Map();
const SOURCE_ADAPTERS={
  'sam-gov':{async collect({env,days}){if(!env.SAM_GOV_API_KEY)return{status:'Not Configured',records:[],totalRecords:0};const params=new URLSearchParams({api_key:env.SAM_GOV_API_KEY,postedFrom:formatSamDate(new Date(Date.now()-days*86400000)),postedTo:formatSamDate(new Date()),status:'active',limit:'1000',offset:'0'}),response=await fetch(`https://api.sam.gov/opportunities/v2/search?${params}`,{headers:{accept:'application/json'}});if(response.status===429)throw new Error('SAM.gov rate limit reached; collection will retry later.');if(!response.ok)throw new Error('SAM.gov collection is temporarily unavailable.');const data=await response.json(),active=Array.isArray(data.opportunitiesData)?data.opportunitiesData.filter(isActiveSamOpportunity):[],records=active.map(mapSamOpportunity);return{status:'Connected',records,totalRecords:Number(data.totalRecords||records.length)}}},
  'texas-esbd':{async collect(){const response=await fetch('https://www.txsmartbuy.gov/esbd',{headers:{accept:'text/html'}});if(!response.ok)throw new Error('Texas ESBD listing is temporarily unavailable.');const records=parseTexasEsbd(await response.text());return{status:'Connected',records,totalRecords:records.length}}}
};
async function handleOpportunityCollection(request,env){
  if(!['GET','POST'].includes(request.method))return json({ok:false,error:'Method not allowed.'},405);
  const now=Date.now(),client=request.headers.get('CF-Connecting-IP')||'anonymous',previous=collectionAttempts.get(client)||0;
  if(request.method==='POST'&&now-previous<30000)return json({ok:false,error:'Refresh is available once every 30 seconds.',retryAfterSeconds:Math.ceil((30000-(now-previous))/1000)},429,{'retry-after':String(Math.ceil((30000-(now-previous))/1000))});
  collectionAttempts.set(client,now);const collectionStarted=Date.now(),url=new URL(request.url),days=Math.min(Math.max(Number(url.searchParams.get('days')||30),1),90),body=request.method==='POST'?await request.json().catch(()=>({})): {},profiles=normalizeSearchProfiles(body.searchProfiles),selectedSourceIds=new Set((Array.isArray(body.sourceIds)?body.sourceIds:[]).map(String)),sources=[],opportunities=[],startedAt=new Date(collectionStarted).toISOString();
  for(const source of OPPORTUNITY_SOURCES){if(selectedSourceIds.size&&!selectedSourceIds.has(source.id))continue;if(!source.enabled||source.collectionMethod==='Manual'){sources.push({...sourceView(source,env),lastAttemptedCheck:source.collectionMethod==='Manual'?null:startedAt,durationMs:0,resultCount:0});continue}const adapter=SOURCE_ADAPTERS[source.id];if(!adapter){sources.push({...sourceView(source,env),connectionStatus:'Unsupported',lastAttemptedCheck:startedAt,durationMs:0,resultCount:0});continue}const sourceStarted=Date.now();try{const result=await adapter.collect({env,days}),durationMs=Date.now()-sourceStarted;opportunities.push(...result.records);sources.push({...sourceView(source,env),connectionStatus:result.status,lastAttemptedCheck:startedAt,lastSuccessfulCheck:result.status==='Connected'?new Date().toISOString():null,recordCount:result.records.length,resultCount:result.records.length,recordsDiscovered:result.records.length,recordsImported:result.records.length,sourceCount:Number(result.totalRecords||result.records.length),durationMs,errorState:''})}catch(error){sources.push({...sourceView(source,env),connectionStatus:'Temporarily Unavailable',lastAttemptedCheck:startedAt,durationMs:Date.now()-sourceStarted,resultCount:0,errorState:error?.message||'Collection unavailable; try again later.'})}}
  const matched=profiles.length?opportunities.filter(record=>matchesSearchProfile(record,profiles)):opportunities;
  const completedAt=new Date().toISOString(),attemptedSources=sources.filter(source=>source.lastAttemptedCheck),successfulSources=sources.filter(source=>source.connectionStatus==='Connected');
  return json({ok:true,collectedAt:completedAt,summary:{collectionStatus:successfulSources.length?'Success':'No Connected Sources',sourceCount:attemptedSources.length,automatedSourceCount:attemptedSources.length,successfulSourceCount:successfulSources.length,durationMs:Date.now()-collectionStarted,discoveredRecords:opportunities.length,matchedRecords:matched.length,resultCount:matched.length,filteredRecords:opportunities.length-matched.length,addedRecords:matched.length,changedRecords:0,expiredRecords:0,errors:sources.filter(x=>x.errorState).length},sources,opportunities:matched});
}
function normalizeSearchProfiles(profiles){return(Array.isArray(profiles)?profiles:[]).filter(profile=>profile&&profile.enabled!==false).slice(0,50).map(profile=>({id:String(profile.id||'').slice(0,80),name:String(profile.name||'').slice(0,120),keywords:(Array.isArray(profile.keywords)?profile.keywords:[]).map(String).map(value=>value.trim().toLowerCase()).filter(Boolean).slice(0,30)})).filter(profile=>profile.name||profile.keywords.length)}
function matchesSearchProfile(record,profiles){const text=[record.title,record.scopeSummary,record.naics,record.agency,record.buyer,record.contractType].filter(Boolean).join(' ').toLowerCase();return profiles.some(profile=>[profile.name,...profile.keywords].some(term=>term&&text.includes(String(term).toLowerCase())))}
function formatSamDate(date) { return `${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')}/${date.getFullYear()}`; }
function isActiveSamOpportunity(item){const text=[item.active,item.status,item.type,item.baseType,item.archiveType].filter(Boolean).join(' ').toLowerCase();return !/inactive|cancelled|canceled|archived|deleted|award notice|justification/.test(text)}
function mapSamOpportunity(item) { const contact=item.pointOfContact?.[0]||{},collectedAt=new Date().toISOString(),location=[item.placeOfPerformance?.city?.name,item.placeOfPerformance?.state?.code].filter(Boolean).join(', '); return { id:`sam-${item.noticeId||item.solicitationNumber}`, externalSourceId:item.noticeId||item.solicitationNumber||'', origin:'automated', source:'SAM.gov', procurementSource:'SAM.gov', governmentLevel:'Federal', sourceUrl:item.uiLink||item.resourceLinks?.[0]||'', opportunityUrl:item.uiLink||item.resourceLinks?.[0]||'', solicitationNumber:item.solicitationNumber||item.noticeId||'', title:item.title||'Title not published', buyer:item.fullParentPathName||item.department||'', agency:item.organizationName||item.subTier||'', solicitationType:item.type||item.baseType||'', contractType:item.type||item.baseType||'', postedDate:item.postedDate||'', issueDate:item.postedDate||'', dueDate:item.responseDeadLine||item.archiveDate||'', naics:item.naicsCode||'', psc:item.classificationCode||'', placeOfPerformance:location,location,state:item.placeOfPerformance?.state?.code||'',region:mapRegion(location),setAside:item.typeOfSetAsideDescription||item.typeOfSetAside||'',certificationRequired:item.typeOfSetAsideDescription||item.typeOfSetAside||'',estimatedValue:item.award?.amount||'',contactName:contact.fullName||'',contactEmail:contact.email||'',contactPhone:contact.phone||'',attachments:item.resourceLinks||[],scopeSummary:item.description||'',sourceTimestamp:item.modifiedDate||item.postedDate||'',dateCollected:collectedAt,collectedAt,lastVerified:collectedAt,intelligenceStatus:'Verified',status:'NEW',stage:'READY FOR ANALYSIS',analysisStatus:'PENDING',verificationStatus:'Source Confirmed' }; }
function textFromHtml(value=''){return String(value).replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
function esbdValue(row,label){const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),match=new RegExp(`<strong>\\s*${escaped}\\s*<\\/strong>\\s*([^<]+)`, 'i').exec(row);return textFromHtml(match?.[1]||'')}
function parseTexasEsbd(html){const collectedAt=new Date().toISOString(),rows=String(html).match(/<div class="esbd-result-row">[\s\S]*?<\/div><\/div>(?=<div class="esbd-result-row">|<\/div><\/div>|$)/gi)||[];return rows.map(row=>{const link=/<div class="esbd-result-title">\s*<a href="([^"]+)">([\s\S]*?)<\/a>/i.exec(row),title=textFromHtml(link?.[2]||''),solicitationNumber=esbdValue(row,'Solicitation ID:'),status=esbdValue(row,'Status:'),dueDate=esbdValue(row,'Due Date:'),dueTime=esbdValue(row,'Due Time:'),postedDate=esbdValue(row,'Posting Date:'),sourceLastModified=esbdValue(row,'Last Updated:');if(!title||!solicitationNumber||!/posted|addendum posted/i.test(status)||!isFutureEsbdDate(dueDate))return null;const officialSourceUrl=new URL(link?.[1]||'/esbd','https://www.txsmartbuy.gov').toString();return{id:`texas-esbd-${solicitationNumber}`,externalSourceId:solicitationNumber,origin:'automated',source:'Texas Electronic State Business Daily',sourceName:'Texas Electronic State Business Daily',sourceType:'STATE',procurementSource:'Texas ESBD',governmentLevel:'State',state:'TX',region:'Texas',city:'',solicitationNumber,title,description:'Public ESBD listing. Open the official source for solicitation details and attachments.',buyer:esbdValue(row,'Agency/Texas SmartBuy Member Number:'),agency:esbdValue(row,'Agency/Texas SmartBuy Member Number:'),opportunityType:'Solicitation',postedDate,issueDate:postedDate,responseDeadline:dueTime?`${dueDate} ${dueTime}`:dueDate,dueDate:dueTime?`${dueDate} ${dueTime}`:dueDate,placeOfPerformance:'Texas',officialSourceUrl,sourceUrl:officialSourceUrl,opportunityUrl:officialSourceUrl,attachmentUrls:[],attachments:[],loginRequired:false,registrationRequired:false,collectionTimestamp:collectedAt,dateCollected:collectedAt,collectedAt,sourceLastModified,sourceTimestamp:sourceLastModified,rawSourceMetadata:{status,dueTime},status:'NEW',stage:'READY FOR ANALYSIS',analysisStatus:'PENDING',verificationStatus:'Source Confirmed'}}).filter(Boolean)}
function isFutureEsbdDate(value){const normalized=String(value||'').trim();if(!normalized)return false;const parsed=new Date(`${normalized} 11:59 PM`);return Number.isFinite(parsed.getTime())&&parsed.getTime()>=Date.now()-86400000}
function mapRegion(location=''){const text=location.toLowerCase();if(/michigan|\bmi\b/.test(text))return'Michigan';if(/kentucky|\bky\b/.test(text))return'Kentucky';if(/dallas|fort worth|\bdfw\b/.test(text))return'Dallas–Fort Worth';if(/georgia|atlanta|\bga\b/.test(text))return'Georgia';return'Federal / Other'}

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
