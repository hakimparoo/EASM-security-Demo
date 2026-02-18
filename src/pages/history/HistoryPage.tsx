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

type Status = "done" | "running" | "queued" | "failed" | "info";

type TimelinePoint = {
  id: string;
  ts: number; // unix ms
  target: string;
  status: Status;
  title: string;
  modules?: string;
};

type MonthlyRow = {
  monthKey: string;   // YYYY-MM
  monthLabel: string; // Jan 2026
  done: number;
  failed: number;
  running: number;
  queued: number;
  info: number;
  total: number;
};

function monthKeyFromTs(ts: number) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${m < 10 ? "0" + m : m}`;
}

function monthLabelFromKey(key: string) {
  const [y, mm] = key.split("-");
  const m = Number(mm) - 1;
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[m]} ${y}`;
}

function pickTargetFromScan(s: any) {
  return String(s.asset || s.target || s.targetName || s.domain || s.ip || s.name || "unknown-target");
}

function pickStatusFromScan(s: any): Status {
  const st = (s.status || s.state || "").toString().toLowerCase();
  if (st.includes("fail")) return "failed";
  if (st.includes("done") || st.includes("success") || st.includes("complete")) return "done";
  if (st.includes("run")) return "running";
  if (st.includes("queue")) return "queued";
  return "info";
}

function pickTimeFromScan(s: any): number {
  const raw = s.finishedAt || s.completedAt || s.updatedAt || s.createdAt || s.startedAt;
  const t = raw ? new Date(raw).getTime() : Date.now();
  return Number.isFinite(t) ? t : Date.now();
}

function pickModulesFromScan(s: any): string {
  if (Array.isArray(s.modules)) return s.modules.join(",");
  if (typeof s.modules === "string") return s.modules;
  if (typeof s.module === "string") return s.module;
  return "";
}

function statusColor(status: Status) {
  switch (status) {
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

function TooltipMonthly({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  // payload มีหลายเส้น เลย map เอาเฉพาะที่มีค่า
  const rows = payload
    .filter((p: any) => typeof p.value === "number" && p.value > 0)
    .map((p: any) => ({ name: p.name, value: p.value, color: p.color }));

  return (
    <div className="tlTooltip">
      <div className="tlTooltipTitle">{label}</div>
      {rows.length === 0 ? (
        <div className="tlTooltipRow">
          <span className="k">Events:</span> <span className="v">0</span>
        </div>
      ) : (
        rows.map((r: any) => (
          <div className="tlTooltipRow" key={r.name}>
            <span className="k">{r.name}:</span>{" "}
            <span className="v" style={{ color: r.color, fontWeight: 900 }}>
              {r.value}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default function HistoryPage() {
  const store = useEasmStore();

  // useOrganization บางโปรเจคคืน {org} บางโปรเจคคืน org ตรง ๆ
  const orgCtx: any = useOrganization();
  const org = orgCtx?.org ?? orgCtx;

  const [q, setQ] = useState("");
  const [target, setTarget] = useState("all");
  const [appliedQ, setAppliedQ] = useState("");
  const [appliedTarget, setAppliedTarget] = useState("all");

  // 1) สร้าง events (points) จาก store.history ถ้ามี ไม่งั้นใช้ store.scans
  const points: TimelinePoint[] = useMemo(() => {
    const fromHistory = Array.isArray((store as any).history) ? (store as any).history : null;

    if (fromHistory?.length) {
      return fromHistory
        .map((h: any, idx: number): TimelinePoint => {
          const ts = h.ts ? Number(h.ts) : h.createdAt ? new Date(h.createdAt).getTime() : Date.now();
          const t = Number.isFinite(ts) ? ts : Date.now();
          const tgt = String(h.target || h.asset || h.domain || h.ip || "unknown-target");
          const st: Status = (h.status as Status) || (h.state as Status) || "info";

          return {
            id: h.id || `h-${idx}`,
            ts: t,
            target: tgt,
            status: st,
            title: h.title || h.message || "Activity",
            modules: h.modules ? String(h.modules) : "",
          };
        })
        .sort((a: TimelinePoint, b: TimelinePoint) => a.ts - b.ts);
    }

    const scans = Array.isArray((store as any).scans) ? (store as any).scans : [];
    return scans
      .map((s: any, idx: number): TimelinePoint => {
        const ts = pickTimeFromScan(s);
        const tgt = pickTargetFromScan(s);
        const st = pickStatusFromScan(s);
        const mods = pickModulesFromScan(s);
        const title = st === "failed" ? `Scan failed: ${mods || "scan"}` : `Scan completed: ${mods || "scan"}`;

        return {
          id: s.id || `s-${idx}`,
          ts,
          target: tgt,
          status: st,
          title,
          modules: mods,
        };
      })
      .sort((a: TimelinePoint, b: TimelinePoint) => a.ts - b.ts);
  }, [(store as any).history, (store as any).scans]);

  const targets = useMemo(() => {
    const set = new Set<string>();
    points.forEach((p) => set.add(p.target));
    return ["all", ...Array.from(set).sort()];
  }, [points]);

  // 2) filter ก่อน แล้วค่อย aggregate เป็นรายเดือน
  const filtered = useMemo(() => {
    const qq = appliedQ.trim().toLowerCase();
    return points.filter((p) => {
      const okTarget = appliedTarget === "all" ? true : p.target === appliedTarget;
      const okQ = !qq ? true : `${p.title} ${p.modules || ""} ${p.target}`.toLowerCase().includes(qq);
      return okTarget && okQ;
    });
  }, [points, appliedQ, appliedTarget]);

  // 3) aggregate เป็นรายเดือน + เติมเดือนที่หายให้กราฟต่อเนื่อง
  const monthly: MonthlyRow[] = useMemo(() => {
    if (!filtered.length) return [];

    const map = new Map<string, MonthlyRow>();

    for (const p of filtered) {
      const key = monthKeyFromTs(p.ts);
      if (!map.has(key)) {
        map.set(key, {
          monthKey: key,
          monthLabel: monthLabelFromKey(key),
          done: 0,
          failed: 0,
          running: 0,
          queued: 0,
          info: 0,
          total: 0,
        });
      }
      const row = map.get(key)!;
      row[p.status] += 1;
      row.total += 1;
    }

    // sort key
    const keys = Array.from(map.keys()).sort();

    // เติมเดือนที่ขาด (ให้ line ต่อเนื่อง)
    const first = keys[0];
    const last = keys[keys.length - 1];

    const [fy, fm] = first.split("-").map(Number);
    const [ly, lm] = last.split("-").map(Number);

    const out: MonthlyRow[] = [];
    let y = fy;
    let m = fm;

    while (y < ly || (y === ly && m <= lm)) {
      const k = `${y}-${m < 10 ? "0" + m : m}`;
      const row = map.get(k) || {
        monthKey: k,
        monthLabel: monthLabelFromKey(k),
        done: 0,
        failed: 0,
        running: 0,
        queued: 0,
        info: 0,
        total: 0,
      };
      out.push(row);

      m += 1;
      if (m === 13) {
        m = 1;
        y += 1;
      }
    }

    return out;
  }, [filtered]);

  return (
    <div className="historyPage">
      <div className="historyHeaderRow">
        <div>
          <div className="historyTitle">History</div>
          <div className="historySub">Activity timeline from scans, changes, and findings (mock)</div>
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
          <div className="timelineCount">Showing {filtered.length} items</div>
        </div>

        <div className="orgMini">
          <div className="orgMiniName">{org?.name ?? "Demo Organization"}</div>
          <div className="orgMiniDomain">{org?.domain ?? "demo.example.com"}</div>
        </div>

        <div className="chartWrap">
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={monthly} margin={{ top: 18, right: 24, bottom: 18, left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={TooltipMonthly as any} />
              <Legend />

              <Line type="monotone" dataKey="done" name="done" stroke={statusColor("done")} strokeWidth={2} dot />
              <Line type="monotone" dataKey="failed" name="failed" stroke={statusColor("failed")} strokeWidth={2} dot />
              <Line type="monotone" dataKey="running" name="running" stroke={statusColor("running")} strokeWidth={2} dot />
              <Line type="monotone" dataKey="queued" name="queued" stroke={statusColor("queued")} strokeWidth={2} dot />
              <Line type="monotone" dataKey="info" name="info" stroke={statusColor("info")} strokeWidth={2} dot />

              {/* ถ้าต้องการเส้นรวมทั้งหมด เปิดได้ */}
              {/* <Line type="monotone" dataKey="total" name="total" stroke="#111827" strokeWidth={2} dot={false} /> */}
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
