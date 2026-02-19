// src/pages/history/HistoryPage.tsx
import { useMemo, useState } from "react";
import { useEasmStore } from "../../contexts/EasmStore";
import { useOrganization } from "../../contexts/OrganizationContext";
import "./HistoryPage.css";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type TLStatus = "done" | "failed" | "running" | "queued" | "info";

type TimelineEvent = {
  id: string;
  ts: number; // unix ms
  target: string;
  status: TLStatus;
  title: string; // ใช้ค้นหา + tooltip
  modules?: string;
};

type MonthlyRow = {
  monthKey: string; // YYYY-MM
  monthLabel: string; // e.g. Feb 2026
  done: number;
  failed: number;
  running: number;
  queued: number;
  info: number;
  total: number;
};

/** ---------------------------
 *  Helpers
 *  --------------------------*/
function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function monthKeyFromTs(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function monthLabelFromKey(k: string) {
  // k = YYYY-MM
  const [yy, mm] = k.split("-").map((x) => Number(x));
  const d = new Date(yy, (mm || 1) - 1, 1);
  return d.toLocaleString(undefined, { month: "short", year: "numeric" });
}

/** ดึงเวลาให้ครอบคลุมหลาย schema (แก้จุดเดียว) */
function pickTimeAny(obj: any): number {
  const raw =
    obj?.ts ??
    obj?.at ??
    obj?.time ??
    obj?.timestamp ??
    obj?.occurredAt ??
    obj?.createdAt ??
    obj?.updatedAt ??
    obj?.finishedAt ??
    obj?.completedAt ??
    obj?.date;

  if (typeof raw === "number") {
    const ms = raw < 1e12 ? raw * 1000 : raw; // sec -> ms
    return Number.isFinite(ms) ? ms : Date.now();
  }

  if (typeof raw === "string") {
    const ms = new Date(raw).getTime();
    return Number.isFinite(ms) ? ms : Date.now();
  }

  return Date.now();
}

function pickTargetAny(obj: any): string {
  return (
    obj?.target ||
    obj?.asset ||
    obj?.assetName ||
    obj?.domain ||
    obj?.ip ||
    obj?.name ||
    "unknown-target"
  );
}

function pickModulesAny(obj: any): string {
  if (Array.isArray(obj?.modules)) return obj.modules.join(",");
  if (typeof obj?.modules === "string") return obj.modules;
  if (typeof obj?.module === "string") return obj.module;
  return "";
}

function statusFromScan(s: any): TLStatus {
  const st = String(s?.status || s?.state || "").toLowerCase();
  if (st.includes("fail")) return "failed";
  if (st.includes("done") || st.includes("success") || st.includes("complete")) return "done";
  if (st.includes("run")) return "running";
  if (st.includes("queue")) return "queued";
  return "info";
}

function statusFromHistory(h: any): TLStatus {
  const st = String(h?.status || h?.state || h?.result || "").toLowerCase();

  if (st.includes("fail")) return "failed";
  if (st.includes("done") || st.includes("success") || st.includes("complete")) return "done";
  if (st.includes("run")) return "running";
  if (st.includes("queue")) return "queued";

  // ถ้าไม่มีสถานะ ให้เดาจาก summary
  const summary = String(h?.summary || h?.title || h?.message || "").toLowerCase();
  if (summary.includes("failed")) return "failed";
  if (summary.includes("completed") || summary.includes("done")) return "done";

  return "info";
}

function lineColor(s: TLStatus) {
  switch (s) {
    case "done":
      return "#16a34a";
    case "failed":
      return "#ef4444";
    case "running":
      return "#f59e0b";
    case "queued":
      return "#6b7280";
    default:
      return "#3b82f6";
  }
}

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  // payload เป็น series หลายเส้น (done/failed/..)
  const row: MonthlyRow = payload[0].payload;

  return (
    <div className="tlTooltip">
      <div className="tlTooltipTitle">{label}</div>
      <div className="tlTooltipRow">
        <span className="k">Total:</span> <span className="v">{row.total}</span>
      </div>
      <div className="tlTooltipRow">
        <span className="k" style={{ color: lineColor("done") }}>Done:</span>{" "}
        <span className="v">{row.done}</span>
      </div>
      <div className="tlTooltipRow">
        <span className="k" style={{ color: lineColor("failed") }}>Failed:</span>{" "}
        <span className="v">{row.failed}</span>
      </div>
      <div className="tlTooltipRow">
        <span className="k" style={{ color: lineColor("running") }}>Running:</span>{" "}
        <span className="v">{row.running}</span>
      </div>
      <div className="tlTooltipRow">
        <span className="k" style={{ color: lineColor("queued") }}>Queued:</span>{" "}
        <span className="v">{row.queued}</span>
      </div>
      <div className="tlTooltipRow">
        <span className="k" style={{ color: lineColor("info") }}>Info:</span>{" "}
        <span className="v">{row.info}</span>
      </div>
    </div>
  );
}

/** ---------------------------
 *  Page
 *  --------------------------*/
export default function HistoryPage() {
  const store = useEasmStore();

  // OrganizationContext บางโปรเจคคืน {org} บางโปรเจคคืน org ตรง ๆ → ทำให้ robust
  const orgCtx: any = useOrganization();
  const org = orgCtx?.org ?? orgCtx;

  // UI state (เหมือนเดิม)
  const [q, setQ] = useState("");
  const [target, setTarget] = useState("all");
  const [appliedQ, setAppliedQ] = useState("");
  const [appliedTarget, setAppliedTarget] = useState("all");

  /** 1) รวม events จาก history + scans ให้เป็นชุดเดียว */
  const events: TimelineEvent[] = useMemo(() => {
    const list: TimelineEvent[] = [];

    const history = (store as any)?.history;
    if (Array.isArray(history) && history.length) {
      history.forEach((h: any, idx: number) => {
        const ts = pickTimeAny(h);
        const tgt = String(pickTargetAny(h));
        const status = statusFromHistory(h);
        const title = String(h?.summary || h?.title || h?.message || "Activity");
        list.push({
          id: h?.id || `h-${idx}`,
          ts,
          target: tgt,
          status,
          title,
          modules: pickModulesAny(h),
        });
      });
    }

    const scans = (store as any)?.scans;
    if (Array.isArray(scans) && scans.length) {
      scans.forEach((s: any, idx: number) => {
        const ts = pickTimeAny(s);
        const tgt = String(pickTargetAny(s));
        const status = statusFromScan(s);
        const mods = pickModulesAny(s);

        const title =
          status === "failed"
            ? `Scan failed: ${mods || "scan"}`
            : status === "running"
              ? `Scan running: ${mods || "scan"}`
              : status === "queued"
                ? `Scan queued: ${mods || "scan"}`
                : `Scan completed: ${mods || "scan"}`;

        list.push({
          id: s?.id || `s-${idx}`,
          ts,
          target: tgt,
          status,
          title,
          modules: mods,
        });
      });
    }

    // เรียงเวลา
    return list.sort((a, b) => a.ts - b.ts);
  }, [store]);

  /** 2) Target dropdown */
  const targets = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.target));
    return ["all", ...Array.from(set).sort()];
  }, [events]);

  /** 3) Apply filter (q + target) */
  const filtered = useMemo(() => {
    const qq = appliedQ.trim().toLowerCase();
    return events.filter((e) => {
      const okTarget = appliedTarget === "all" ? true : e.target === appliedTarget;
      const hay = `${e.title} ${e.modules || ""} ${e.target}`.toLowerCase();
      const okQ = !qq ? true : hay.includes(qq);
      return okTarget && okQ;
    });
  }, [events, appliedQ, appliedTarget]);

  /** 4) Aggregate -> Monthly (12 months full) */
  const monthly: MonthlyRow[] = useMemo(() => {
    
    const map = new Map<string, MonthlyRow>();
    
    filtered.forEach((e) => {
      const k = monthKeyFromTs(e.ts);
      if (!map.has(k)) {
        map.set(k, {
          monthKey: k,
          monthLabel: monthLabelFromKey(k),
          done: 0,
          failed: 0,
          running: 0,
          queued: 0,
          info: 0,
          total: 0,
        });
      }
      const row = map.get(k)!;
      row[e.status] += 1;
      row.total += 1;
    });

    

    // ✅ 12 เดือนย้อนหลัง (รวมเดือนล่าสุด) เสมอ
    const out: MonthlyRow[] = [];
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const k = `${y}-${m < 10 ? "0" + m : m}`;

      out.push(
        map.get(k) || {
          monthKey: k,
          monthLabel: monthLabelFromKey(k),
          done: 0,
          failed: 0,
          running: 0,
          queued: 0,
          info: 0,
          total: 0,
        }
      );
    }
    
    return out;
  }, [filtered]);

  /** 5) Count items (แสดงจำนวนเหตุการณ์จริงที่ filter แล้ว) */
  const itemsCount = filtered.length;

  return (
    <div className="historyPage">
      <div className="historyHeaderRow">
        <div>
          <div className="historyTitle">History</div>
          <div className="historySub">
            Activity timeline from scans, changes, and findings (mock)
          </div>
        </div>

        <button className="exportBtn" onClick={() => alert("Export (Mock)")}>
          Export (Mock)
        </button>
      </div>

      <div className="filtersBar">
        <input
          className="searchInput"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search history (e.g., scan, issue, added target)"
        />

        <select className="select" value={target} onChange={(e) => setTarget(e.target.value)}>
          {targets.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All targets" : t}
            </option>
          ))}
        </select>

        <button
          className="applyBtn"
          onClick={() => {
            setAppliedQ(q);
            setAppliedTarget(target);
          }}
        >
          Apply
        </button>

        <button
          className="resetBtn"
          onClick={() => {
            setQ("");
            setTarget("all");
            setAppliedQ("");
            setAppliedTarget("all");
          }}
        >
          Reset
        </button>
      </div>

      <div className="timelineCard">
        <div className="timelineCardHeader">
          <div className="timelineCardTitle">Timeline (Monthly)</div>
          <div className="timelineCount">Showing {itemsCount} items</div>
        </div>

        <div className="orgMini">
          <div className="orgMiniName">{org?.name ?? "Demo Organization"}</div>
          <div className="orgMiniDomain">{org?.domain ?? "demo.example.com"}</div>
        </div>

        <div className="chartWrap">
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={monthly} margin={{ top: 18, right: 22, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<TooltipBox />} />
              <Legend />



              
              {/* <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={1} dot /> */}

              {/* ตัวอย่างการกำหนดสีของแต่ละเส้นในกราฟ */}
              <Line type="monotone" dataKey="done" stroke={lineColor("done")} strokeWidth={2} dot />
              <Line type="monotone" dataKey="failed" stroke={lineColor("failed")} strokeWidth={2} dot />
              <Line type="monotone" dataKey="running" stroke={lineColor("running")} strokeWidth={2} dot />
              <Line type="monotone" dataKey="queued" stroke={lineColor("queued")} strokeWidth={2} dot />
              <Line type="monotone" dataKey="info" stroke={lineColor("info")} strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="hintRow">
          Timeline แบบ “รายเดือน” — ใช้ Search/Target แล้วกด Apply เพื่อดูสรุปจำนวนเหตุการณ์ต่อเดือน
        </div>
      </div>
    </div>
  );
}
