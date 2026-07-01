const config = window.IGEO_EXECUTIVE || {};
const dashboardCacheTtlMs = 60000;
const ids = [
  "primeTotal", "primeOpportunities", "primeFollowUps", "workerTotal", "workerNew",
  "workerAvailable", "vendorTotal", "vendorFollowUps", "vendorPending", "gmailCritical",
  "gmailPending", "gmailContracts", "gmailPayments", "gmailApplications", "revenueActive",
  "revenueValue", "revenueSubmitted", "revenueAwarded",
];
const elements = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
elements.refreshButton = document.getElementById("refreshButton");
elements.syncStatus = document.getElementById("syncStatus");
elements.lastUpdated = document.getElementById("lastUpdated");
elements.alertThreshold = document.getElementById("alertThreshold");
elements.ownerModeToggle = document.getElementById("ownerModeToggle");
elements.partnerNotificationsToggle = document.getElementById("partnerNotificationsToggle");
elements.smsFutureToggle = document.getElementById("smsFutureToggle");
elements.alertModeStatus = document.getElementById("alertModeStatus");

elements.refreshButton.addEventListener("click", refreshDashboard);
elements.alertThreshold.addEventListener("change", handleAlertSettingsChange);
elements.ownerModeToggle.addEventListener("change", handleAlertSettingsChange);
elements.partnerNotificationsToggle.addEventListener("change", handleAlertSettingsChange);
loadAlertSettings();
registerServiceWorker();
refreshDashboard();

async function refreshDashboard() {
  setSync("pending", "Syncing");
  elements.refreshButton.disabled = true;
  hydrateLocalMetrics();

  const results = await Promise.allSettled([
    loadExecutiveSummary(),
    loadExecutiveEmailAlerts(),
    checkJsonp(config.primeEndpointUrl, { action: "health" }),
    checkJsonp(config.workforceEndpointUrl, {}),
    checkGithub(),
  ]);

  const executive = results[0];
  if (executive.status === "fulfilled" && executive.value?.ok) {
    renderCloudSummary(executive.value);
    setHealth("healthSheets", true, "Synced");
    setHealth("healthScript", true, "Operational");
    setSync("synced", "Cloud Synced");
  } else {
    setHealth("healthSheets", false, "Unavailable");
    setHealth("healthScript", false, "Unavailable");
    setSync("failed", "Partial Data");
  }

  const alerts = results[1];
  if (alerts.status === "fulfilled" && alerts.value?.ok) {
    renderExecutiveAlerts(alerts.value.gmail || {});
  }

  setHealth("healthCloudflare", true, "Online");
  setHealth("healthGithub", results[4].status === "fulfilled", results[4].status === "fulfilled" ? "Connected" : "Unavailable");
  elements.lastUpdated.textContent = `Updated ${new Date().toLocaleString()}`;
  elements.refreshButton.disabled = false;
}

function hydrateLocalMetrics() {
  const vendors = readLocalArray("igeo_vendor_registrations");
  const quotes = readLocalArray("igeo_quotes");
  const today = new Date().toISOString().slice(0, 10);
  setText("vendorTotal", vendors.length);
  setText("vendorFollowUps", vendors.filter((vendor) => vendor.followUpDate && vendor.followUpDate <= today).length);
  setText("vendorPending", vendors.filter((vendor) =>
    ["Not Started", "In Progress", "Submitted", "Waiting Response", "Follow Up Needed"].includes(vendor.registrationStatus)
  ).length);
  setText("revenueSubmitted", quotes.filter((quote) => ["Sent", "Follow Up"].includes(quote.quoteStatus)).length);
}

function renderCloudSummary(data) {
  const prime = data.prime || {};
  const workforce = data.workforce || {};
  const gmail = data.gmail || {};
  const revenue = data.revenue || {};

  setText("primeTotal", prime.total);
  setText("primeOpportunities", prime.opportunities);
  setText("primeFollowUps", prime.followUpsDueToday);
  setText("workerTotal", workforce.total);
  setText("workerNew", workforce.newApplications);
  setText("workerAvailable", workforce.available);
  setText("gmailCritical", gmail.critical);
  setText("gmailPending", gmail.pending);
  setText("gmailContracts", gmail.contracts);
  setText("gmailPayments", gmail.payments);
  setText("gmailApplications", gmail.applications);
  setText("revenueActive", revenue.activeOpportunities);
  setText("revenueValue", formatCurrency(revenue.estimatedContractValue));
  setText("revenueAwarded", revenue.awarded);
}

function renderExecutiveAlerts(gmail) {
  setText("gmailCritical", gmail.critical);
  setText("gmailPending", gmail.pending);
  setText("gmailContracts", gmail.contracts);
  setText("gmailPayments", gmail.payments);
  setText("gmailApplications", gmail.applications);
}

function loadExecutiveSummary() {
  if (!config.endpointUrl || config.endpointUrl.includes("PASTE_")) {
    return Promise.reject(new Error("Executive endpoint is not configured."));
  }
  const settings = readAlertSettings();
  return jsonp(config.endpointUrl, {
    action: "summary",
    alertThreshold: settings.alertThreshold,
    ownerMode: String(settings.ownerMode),
    partnerNotifications: String(settings.partnerNotifications),
  }, { cacheKey: `executive:summary:${JSON.stringify(settings)}` });
}

async function loadExecutiveEmailAlerts() {
  const settings = readAlertSettings();
  const response = await fetch(`${config.emailAlertsUrl}?${new URLSearchParams({
    alertThreshold: settings.alertThreshold,
    ownerMode: String(settings.ownerMode),
    partnerNotifications: String(settings.partnerNotifications),
  })}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Executive email alerts unavailable.");
  }
  return data;
}

function checkJsonp(url, parameters) {
  return jsonp(url, parameters, { cacheKey: `executive:health:${url}:${JSON.stringify(parameters)}` });
}

async function checkGithub() {
  const response = await fetch(config.githubUrl, { cache: "no-store" });
  if (!response.ok) throw new Error("GitHub unavailable.");
  return response.json();
}

function jsonp(url, parameters, options = {}) {
  return new Promise((resolve, reject) => {
    if (!url) return reject(new Error("Missing endpoint."));
    const cached = options.cacheKey ? readCache(options.cacheKey) : null;
    if (cached) {
      resolve(cached);
      return;
    }

    const callback = `igeoExecutive_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => cleanup(new Error("Request timed out.")), 15000);

    function cleanup(error, value) {
      clearTimeout(timer);
      delete window[callback];
      script.remove();
      error ? reject(error) : resolve(value);
    }

    window[callback] = (value) => {
      if (options.cacheKey) writeCache(options.cacheKey, value);
      cleanup(null, value);
    };
    script.onerror = () => cleanup(new Error("Request failed."));
    script.async = true;
    script.src = `${url}?${new URLSearchParams({ ...parameters, callback })}`;
    document.head.appendChild(script);
  });
}

function readCache(key) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(key));
    if (!cached || Date.now() - cached.cachedAt > dashboardCacheTtlMs) return null;
    return cached.value;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ cachedAt: Date.now(), value }));
  } catch {
    // Non-critical cache.
  }
}

function readAlertSettings() {
  try {
    return {
      ...defaultAlertSettings(),
      ...JSON.parse(localStorage.getItem("igeo_executive_alert_settings")),
    };
  } catch {
    return defaultAlertSettings();
  }
}

function defaultAlertSettings() {
  return {
    alertThreshold: "high",
    ownerMode: true,
    partnerNotifications: true,
    smsFutureSupport: false,
  };
}

function loadAlertSettings() {
  const settings = readAlertSettings();
  elements.alertThreshold.value = settings.alertThreshold === "all" ? "all" : "high";
  elements.ownerModeToggle.checked = settings.ownerMode !== false;
  elements.partnerNotificationsToggle.checked = settings.partnerNotifications !== false;
  elements.smsFutureToggle.checked = false;
  updateAlertModeStatus();
}

function handleAlertSettingsChange() {
  const settings = {
    alertThreshold: elements.alertThreshold.value,
    ownerMode: elements.ownerModeToggle.checked,
    partnerNotifications: elements.partnerNotificationsToggle.checked,
    smsFutureSupport: false,
  };
  localStorage.setItem("igeo_executive_alert_settings", JSON.stringify(settings));
  clearExecutiveCache();
  updateAlertModeStatus();
  refreshDashboard();
}

function updateAlertModeStatus() {
  elements.alertModeStatus.textContent = elements.ownerModeToggle.checked ? "Owner Mode" : "Monitor Only";
}

function clearExecutiveCache() {
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith("executive:summary"))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Non-critical cache.
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("../sw.js").catch(() => {});
  });
}

function readLocalArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function setText(id, value) {
  elements[id].textContent = value ?? 0;
}

function setSync(className, label) {
  elements.syncStatus.className = `sync-status ${className}`;
  elements.syncStatus.textContent = label;
}

function setHealth(id, ok, label) {
  const element = document.getElementById(id);
  element.className = `health ${ok ? "ok" : "error"}`;
  element.textContent = label;
}

function formatCurrency(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: number >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: number >= 1000000 ? 1 : 0,
  }).format(number);
}
