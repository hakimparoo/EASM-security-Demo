export type DashboardSummary = {
  orgName: string;
  orgDomain: string;

  score: number;      // 0-100
  grade: string;      // A/B/C/D/F

  latestScanDate: string; // ISO string
  topIssues: Array<{ label: string; level: "high" | "medium" | "low" }>;

  timeline: Array<{ label: string; score: number }>;

  vulnerability: {
    info: number;
    high: number;
    medium: number;
    low: number;
  };

  contact: {
    phone: string;
    email: string;
  };
};

const API_BASE = ""; 
// ถ้าคุณมี backend เช่น http://localhost:5000 ให้เปลี่ยนเป็น "http://localhost:5000"

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

// ✅ API ที่หน้า Dashboard จะเรียก
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchJson<DashboardSummary>("/api/dashboard/summary");
}
