const MAX_EVENTS = 100;

function ensureStore() {
  if (!global.__LIVE_THREATS__) {
    global.__LIVE_THREATS__ = [];
  }

  return global.__LIVE_THREATS__;
}

function titleCase(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function inferSeverity(type = "", action = "") {
  const source = `${type} ${action}`.toLowerCase();

  if (source.includes("sql") || source.includes("rce") || source.includes("ddos")) {
    return "critical";
  }

  if (source.includes("xss") || source.includes("csrf") || source.includes("honeypot")) {
    return "high";
  }

  if (source.includes("flag") || source.includes("anomaly")) {
    return "medium";
  }

  return "low";
}

function inferAction(type = "", metadata = {}) {
  if (metadata?.action) {
    return titleCase(metadata.action);
  }

  const source = String(type || "").toLowerCase();

  if (source.includes("flagged")) return "Flagged";
  if (source.includes("mitigated")) return "Mitigated";
  if (source.includes("honeypot")) return "Intercepted";

  return "Blocked";
}

export function normalizeThreatEvent(input = {}) {
  const timestamp = Number(input.timestamp || Date.now());
  const type = titleCase(input.type || input.vector || "Unknown Threat");
  const action = titleCase(input.action || inferAction(type, input.metadata));
  const severity = String(input.severity || inferSeverity(type, action)).toLowerCase();
  const ip =
    input.ip ||
    input.ipAddress ||
    input.sourceIp ||
    input.metadata?.ip ||
    "Unknown IP";
  const route =
    input.route ||
    input.path ||
    input.endpoint ||
    input.target ||
    input.metadata?.route ||
    "/";
  const country =
    input.country ||
    input.metadata?.country ||
    input.metadata?.locationCountry ||
    "Unknown";

  return {
    id: input.id || `EVT-${timestamp}-${Math.floor(Math.random() * 1000)}`,
    type,
    ip,
    action,
    route,
    severity,
    country,
    metadata: input.metadata || {},
    source: input.source || "live",
    timestamp,
    date:
      input.date ||
      new Date(timestamp).toLocaleString("en-US", {
        dateStyle: "short",
        timeStyle: "medium",
      }),
  };
}

export function addLiveThreatEvent(input) {
  const store = ensureStore();
  const event = normalizeThreatEvent(input);
  store.unshift(event);

  if (store.length > MAX_EVENTS) {
    store.length = MAX_EVENTS;
  }

  return event;
}

export function getLiveThreatEvents() {
  const store = ensureStore();
  return [...store].sort((a, b) => b.timestamp - a.timestamp);
}

function toVectorKey(type = "") {
  const source = String(type).toLowerCase();

  if (source.includes("ddos")) return "ddos";
  if (source.includes("bot")) return "botnet";
  return "firewall";
}

function buildTimeBuckets(events) {
  const now = Date.now();
  const bucketSizeMs = 10 * 60 * 1000;
  const bucketCount = 6;
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const start = now - (bucketCount - index) * bucketSizeMs;
    return {
      start,
      label: new Date(start + bucketSizeMs).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      firewall: 0,
      ddos: 0,
      botnet: 0,
    };
  });

  for (const event of events) {
    const diff = now - event.timestamp;
    if (diff < 0 || diff > bucketCount * bucketSizeMs) continue;

    const bucketIndex = bucketCount - 1 - Math.floor(diff / bucketSizeMs);
    const key = toVectorKey(event.type);
    if (buckets[bucketIndex]) {
      buckets[bucketIndex][key] += 1;
    }
  }

  return buckets.map(({ label, firewall, ddos, botnet }) => ({
    time: label,
    firewall,
    ddos,
    botnet,
  }));
}

function buildTopGeographies(events) {
  const counts = new Map();

  for (const event of events) {
    const key = event.country || "Unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const total = events.length || 1;
  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({
      country,
      percentage: Math.round((count / total) * 100),
      count,
    }));

  return ranked.length > 0 ? ranked : [{ country: "Unknown", percentage: 100, count: 0 }];
}

export function getThreatDashboardData() {
  const events = getLiveThreatEvents();
  const uniqueIps = new Set(events.map((event) => event.ip).filter(Boolean));
  const uniqueRoutes = new Set(events.map((event) => event.route).filter(Boolean));

  return {
    overview: {
      totalThreats: events.length,
      activeConnections: uniqueIps.size,
      serversOnline: Math.max(uniqueRoutes.size, 1),
      incidents: events.length,
    },
    threatsOverTime: buildTimeBuckets(events),
    recentEvents: events,
    topGeographies: buildTopGeographies(events),
  };
}
