export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/executive-email-alerts") {
      return handleExecutiveEmailAlerts(request, env);
    }

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
  if (configError) return json({ ok: false, error: configError }, 500);

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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
