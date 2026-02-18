export type Severity = "critical" | "high" | "medium" | "low";
export type ScanStatus = "queued" | "running" | "done" | "failed";

export type AssetKind = "domain" | "subdomain" | "ip" | "service";

export type Asset = {
  id: string;
  kind: AssetKind;
  name: string;
  tags: string[];
  tech: string[];
  lastSeenAt: string;
  // createdAt: string; // 👈 เพิ่มบรรทัดนี้
};


export type ScanTask = {
  id: string;
  target: string; // asset id or target string
  modules: string[];
  status: ScanStatus;
  progress: number; // 0-100
  createdAt: string;
  finishedAt?: string;
};

export type Issue = {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  assetId: string;
  evidence: string;
  recommendation: string;
  status: "open" | "resolved";
  createdAt: string;
};

export type RiskBreakdown = {
  applicationSecurity: number;
  networkSecurity: number;
  patchingCadence: number;
  dnsHealth: number;
  endpointSecurity: number;
  ipReputation: number;
  cubitScore: number;   // ✅ ตัวนี้เหมาะสุดให้เป็น score รวม
  hackerChatter: number;
  informationLeak: number;
  socialEngineering: number;
};


export type HistoryItem = {
  id: string;
  at: string;
  summary: string;
  target: string;
};
