// src/data/easmMock.enterprise.ts
import type {
  Asset,
  Issue,
  ScanTask,
  RiskBreakdown,
  HistoryItem,
  Severity,
  ScanStatus,
} from "../types/easm";

/** ---------------------------
 *  Utilities (seeded random)
 *  --------------------------*/
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20260219);

function pick<T>(arr: T[]) {
  return arr[Math.floor(rnd() * arr.length)];
}

function int(min: number, max: number) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function isoAt(d: Date) {
  return d.toISOString();
}

/** สร้างวันที่ย้อนหลังแบบ “เดือนเต็ม” */
function monthStartMonthsAgo(monthsAgo: number) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1, 9, 12, 0);
  return d;
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function addMinutes(base: Date, mins: number) {
  const d = new Date(base);
  d.setMinutes(d.getMinutes() + mins);
  return d;
}

/** ---------------------------
 *  Assets (enterprise-ish)
 *  --------------------------*/
export const initialAssets: Asset[] = [
  {
    id: "a-001",
    kind: "domain",
    name: "kmitl.ac.th",
    tags: ["primary", "public"],
    tech: ["nginx", "cloudflare", "tls"],
    lastSeenAt: isoAt(addDays(new Date(), -1)),
  },
  {
    id: "a-002",
    kind: "subdomain",
    name: "portal.kmitl.ac.th",
    tags: ["sso", "public"],
    tech: ["react", "node", "oauth"],
    lastSeenAt: isoAt(addDays(new Date(), -2)),
  },
  {
    id: "a-003",
    kind: "subdomain",
    name: "mail.kmitl.ac.th",
    tags: ["mx", "public"],
    tech: ["postfix", "dmarc", "spf"],
    lastSeenAt: isoAt(addDays(new Date(), -3)),
  },
  {
    id: "a-004",
    kind: "subdomain",
    name: "auth.kmitl.ac.th",
    tags: ["iam", "critical"],
    tech: ["keycloak", "oauth", "saml"],
    lastSeenAt: isoAt(addDays(new Date(), -1)),
  },
  {
    id: "a-005",
    kind: "subdomain",
    name: "api.kmitl.ac.th",
    tags: ["api", "public"],
    tech: ["nginx", "rest", "jwt"],
    lastSeenAt: isoAt(addDays(new Date(), -4)),
  },
  {
    id: "a-006",
    kind: "subdomain",
    name: "cdn.kmitl.ac.th",
    tags: ["cdn", "public"],
    tech: ["cloudflare", "cache"],
    lastSeenAt: isoAt(addDays(new Date(), -2)),
  },
  {
    id: "a-007",
    kind: "subdomain",
    name: "student.kmitl.ac.th",
    tags: ["student", "public"],
    tech: ["apache", "php", "mysql"],
    lastSeenAt: isoAt(addDays(new Date(), -5)),
  },
  {
    id: "a-008",
    kind: "subdomain",
    name: "research.kmitl.ac.th",
    tags: ["research", "public"],
    tech: ["wordpress", "php"],
    lastSeenAt: isoAt(addDays(new Date(), -6)),
  },
  {
    id: "a-009",
    kind: "ip",
    name: "203.150.10.20",
    tags: ["edge", "public"],
    tech: ["linux", "ssh"],
    lastSeenAt: isoAt(addDays(new Date(), -2)),
  },
  {
    id: "a-010",
    kind: "ip",
    name: "203.150.10.55",
    tags: ["edge", "public"],
    tech: ["linux", "nginx"],
    lastSeenAt: isoAt(addDays(new Date(), -1)),
  },
  {
    id: "a-011",
    kind: "service",
    name: "kmitl.ac.th:443",
    tags: ["tls", "https"],
    tech: ["tls1.2", "hsts"],
    lastSeenAt: isoAt(addDays(new Date(), -1)),
  },
  {
    id: "a-012",
    kind: "service",
    name: "mail.kmitl.ac.th:25",
    tags: ["smtp"],
    tech: ["smtp", "starttls"],
    lastSeenAt: isoAt(addDays(new Date(), -2)),
  },
];

/** map name -> id (ช่วยตอนสร้าง issues) */
const assetIds = initialAssets.map((a) => a.id);

/** ---------------------------
 *  RiskBreakdown + Cubit Score
 *  --------------------------*/
function computeCubit(r: Omit<RiskBreakdown, "cubitScore">): number {
  // weight แบบ “ดูสมจริง” (คุณปรับได้)
  const w = {
    applicationSecurity: 0.18,
    networkSecurity: 0.16,
    patchingCadence: 0.12,
    dnsHealth: 0.1,
    endpointSecurity: 0.1,
    ipReputation: 0.08,
    hackerChatter: 0.08,
    informationLeak: 0.1,
    socialEngineering: 0.08,
  };

  const score =
    r.applicationSecurity * w.applicationSecurity +
    r.networkSecurity * w.networkSecurity +
    r.patchingCadence * w.patchingCadence +
    r.dnsHealth * w.dnsHealth +
    r.endpointSecurity * w.endpointSecurity +
    r.ipReputation * w.ipReputation +
    r.hackerChatter * w.hackerChatter +
    r.informationLeak * w.informationLeak +
    r.socialEngineering * w.socialEngineering;

  return Math.round(clamp(score, 0, 100));
}

const riskBaseNoCubit = {
  applicationSecurity: int(45, 78),
  networkSecurity: int(50, 85),
  patchingCadence: int(40, 80),
  dnsHealth: int(55, 92),
  endpointSecurity: int(45, 88),
  ipReputation: int(50, 90),
  hackerChatter: int(35, 85),
  informationLeak: int(40, 86),
  socialEngineering: int(35, 82),
};

export const initialRisk: RiskBreakdown = {
  ...riskBaseNoCubit,
  cubitScore: computeCubit(riskBaseNoCubit),
};

/** ---------------------------
 *  Issues (80 enterprise-style)
 *  --------------------------*/
const categories = [
  "Application Security",
  "Patching Cadence",
  "Network Security",
  "DNS Health",
  "Endpoint Security",
  "IP Reputation",
  "Hacker Chatter",
  "Information Leak",
  "Social Engineering",
] as const;

const issueTitles = [
  "Content Security Policy (CSP) Missing",
  "Session Cookie Missing 'HttpOnly' Attribute",
  "Session Cookie Missing 'Secure' Attribute",
  "HSTS Not Enforced",
  "TLS Weak Cipher Suite Detected",
  "TLS Certificate Near Expiration",
  "Open Redirect Pattern Detected",
  "X-Frame-Options Missing",
  "X-Content-Type-Options Missing",
  "Referrer-Policy Not Set",
  "Server Version Disclosure in Header",
  "Directory Listing Enabled",
  "Public S3 Bucket / Object Storage Exposed",
  "Git Repository Exposed (.git)",
  "Swagger / OpenAPI Docs Publicly Accessible",
  "Admin Panel Exposed",
  "WAF Not Detected / Not Enabled",
  "Outdated CMS Core Version",
  "Outdated Plugin With Known CVE",
  "Default Credentials Suspected",
  "RDP / SSH Exposed to Internet",
  "SMB Service Exposed",
  "Unrestricted CORS Policy",
  "Missing DMARC Policy",
  "SPF Softfail / Misconfiguration",
  "DKIM Missing / Misconfigured",
  "MX Points to Third-party Without Alignment",
  "Subdomain Takeover Risk (Dangling DNS)",
  "DNS Zone Transfer Misconfiguration",
  "New Credential Leak Mention (Paste/Forum)",
  "New Phishing Kit Targeting Organization",
  "Brand Impersonation Domain Detected",
  "PII Exposure via Public Endpoint",
  "Sensitive File Exposed (backup.zip)",
];

const recos = [
  "Enforce secure headers and validate using automated security checks in CI/CD.",
  "Enable HSTS with a long max-age and includeSubDomains; preload if applicable.",
  "Rotate credentials and enforce MFA. Remove default accounts and audit access logs.",
  "Restrict admin and documentation endpoints with authentication and IP allowlisting.",
  "Patch affected software to a supported version and remove vulnerable plugins/components.",
  "Harden DNS: remove dangling records, enable DNSSEC where possible, restrict AXFR.",
  "Restrict CORS to explicit trusted origins and disable wildcard in sensitive endpoints.",
  "Email hygiene: configure SPF, DKIM, DMARC with alignment and monitoring.",
  "Reduce exposure: close unused ports, enforce VPN / zero-trust access for management services.",
  "Implement DLP and secret scanning; rotate leaked keys and add monitoring/alerting.",
];

const evidences = [
  "Observed response headers do not include recommended security directives.",
  "Cookie attributes indicate potential session theft risk under MITM conditions.",
  "TLS scan identified legacy cipher suites and non-optimal protocol configuration.",
  "Endpoint discovered via public crawling; access not restricted by authentication.",
  "Service detected from external scan; exposed to the public internet.",
  "DNS record appears to reference deprovisioned resource; takeover possible.",
  "Third-party references found; alignment and policy enforcement not detected.",
  "Mention detected from public sources suggesting possible credential reuse/leak.",
  "Publicly accessible file indicates potential backup or sensitive artifact exposure.",
];

function sevFromIndex(i: number): Severity {
  // กระจาย severity แบบ enterprise-ish
  const r = i % 20;
  if (r === 0) return "critical";
  if (r <= 3) return "high";
  if (r <= 9) return "medium";
  return "low";
}

function statusFromIndex(i: number): "open" | "resolved" {
  // ให้มีทั้ง open และ resolved
  return i % 6 === 0 ? "resolved" : "open";
}

export const initialIssues: Issue[] = Array.from({ length: 80 }).map((_, idx) => {
  const sev = sevFromIndex(idx + 1);
  const cat = pick([...categories]);
  const assetId = pick(assetIds);

  // เวลา: ย้อนหลัง 12 เดือน กระจายวันในเดือน
  const mAgo = int(0, 11);
  const base = monthStartMonthsAgo(mAgo);
  const at = addMinutes(addDays(base, int(0, 25)), int(0, 600));

  const title = pick(issueTitles);
  const evidence = pick(evidences);
  const recommendation = pick(recos);

  return {
    id: `iss-${String(idx + 1).padStart(3, "0")}`,
    title,
    severity: sev,
    category: cat,
    assetId,
    evidence,
    recommendation,
    status: statusFromIndex(idx + 1),
    createdAt: isoAt(at),
  };
});

/** ---------------------------
 *  Scans (24 = 2 per month)
 *  --------------------------*/
const modulePool = [
  ["discovery", "dns", "ssl"],
  ["ssl", "web", "headers"],
  ["dns", "mx", "reputation"],
  ["port-scan", "service-detect", "vuln-check"],
  ["cms-check", "plugins", "exposure"],
  ["auth", "oauth", "headers"],
] as const;

function scanStatusFromIndex(i: number): ScanStatus {
  const r = i % 10;
  if (r === 0) return "failed";
  if (r <= 1) return "running";
  if (r <= 2) return "queued";
  return "done";
}

export const initialScans: ScanTask[] = Array.from({ length: 24 }).map((_, idx) => {
  const monthIndex = Math.floor(idx / 2); // 0..11
  const base = monthStartMonthsAgo(11 - monthIndex); // เก่าก่อน -> ใหม่ล่าสุด
  const started = addMinutes(addDays(base, idx % 2 === 0 ? 6 : 18), int(0, 500));
  const status = scanStatusFromIndex(idx + 1);

  const createdAt = isoAt(started);
  const finishedAt =
    status === "done" || status === "failed"
      ? isoAt(addMinutes(started, int(8, 120)))
      : undefined;

  const progress =
    status === "done" || status === "failed" ? 100 : status === "running" ? int(20, 85) : 0;

  // target เป็น asset id หรือ string ก็ได้ ตาม type (string)
  const targetAsset = pick(initialAssets);
  const target = targetAsset.kind === "service" ? targetAsset.name : targetAsset.name;

  return {
    id: `scan-${String(idx + 1).padStart(3, "0")}`,
    target,
    modules: pick([...modulePool]) as unknown as string[],
    status,
    progress,
    createdAt,
    finishedAt,
  };
});

/** ---------------------------
 *  History (48 = 4 per month)
 *  --------------------------*/
function summaryForHistory(kind: "scan_done" | "scan_failed" | "issue" | "change", mods: string, target: string) {
  switch (kind) {
    case "scan_failed":
      return `Scan failed: ${mods} • ${target}`;
    case "scan_done":
      return `Scan completed: ${mods} • ${target}`;
    case "issue":
      return `New issue detected: ${mods} • ${target}`;
    default:
      return `Change observed: ${mods} • ${target}`;
  }
}

export const initialHistory: HistoryItem[] = Array.from({ length: 48 }).map((_, idx) => {
  const monthIndex = Math.floor(idx / 4); // 0..11
  const base = monthStartMonthsAgo(11 - monthIndex);

  const day = [3, 9, 16, 23][idx % 4] ?? 10;
  const at = addMinutes(addDays(base, day), int(0, 600));

  const target = pick(initialAssets).name;
  const mods = (pick([...modulePool]) as unknown as string[]).join(",");

  const kind = pick(["scan_done", "scan_failed", "issue", "change"] as const);

  return {
    id: `his-${String(idx + 1).padStart(3, "0")}`,
    at: isoAt(at),
    summary: summaryForHistory(kind, mods, target),
    target,
  };
});
