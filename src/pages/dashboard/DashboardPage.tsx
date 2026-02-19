import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

import { getDashboardSummary, type DashboardSummary } from "../../api/easmApi";
import { useEasmStore } from "../../contexts/EasmStore";
import { useOrganization } from "../../contexts/OrganizationContext";

type Level = "high" | "medium" | "low";
type TopIssue = { label: string; level: Level };


function gradeFromScore(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function formatDDMMYYYY(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/* ---------- Simple SVG Charts (no library) ---------- */
function LineChart({ points }: { points: Array<{ label: string; score: number }> }) {
  const w = 520;
  const h = 260;
  const pad = 34;

  const ys = points.map((p) => p.score);
  const min = Math.min(...ys, 0);
  const max = Math.max(...ys, 100);

  const xStep = (w - pad * 2) / Math.max(1, points.length - 1);
  const yMap = (v: number) => {
    const t = (v - min) / Math.max(1, max - min);
    return h - pad - t * (h - pad * 2);
  };

  const path = points
    .map((p, i) => {
      const x = pad + i * xStep;
      const y = yMap(p.score);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart">
      {/* grid */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = yMap(v);
        return (
          <g key={v}>
            <line x1={pad} y1={y} x2={w - pad} y2={y} className="grid" />
            <text x={8} y={y + 4} className="axisText">
              {v}
            </text>
          </g>
        );
      })}

      <path d={path} className="line" />
      {points.map((p, i) => {
        const x = pad + i * xStep;
        const y = yMap(p.score);
        return <circle key={p.label} cx={x} cy={y} r={3.5} className="dot" />;
      })}

      {/* x labels */}
      {points.map((p, i) => {
        const x = pad + i * xStep;
        return (
          <text key={p.label} x={x} y={h - 10} textAnchor="middle" className="axisText">
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}

function PieChart({ data }: { data: { info: number; high: number; medium: number; low: number } }) {
  const items = [
    { key: "info", value: data.info, label: "Info" },
    { key: "high", value: data.high, label: "High" },
    { key: "medium", value: data.medium, label: "Medium" },
    { key: "low", value: data.low, label: "Low" },
  ];

  const total = items.reduce((s, it) => s + it.value, 0) || 1;
  const cx = 140,
    cy = 120,
    r = 92;

  let acc = 0;

  const arc = (start: number, end: number) => {
    const a0 = (start * 2 * Math.PI) / 360;
    const a1 = (end * 2 * Math.PI) / 360;

    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);

    const large = end - start > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
  };

  return (
    <div className="pieWrap">
      <svg viewBox="0 0 320 240" className="pie">
        {items.map((it) => {
          const ang = (it.value / total) * 360;
          const start = acc;
          const end = acc + ang;
          acc = end;
          return <path key={it.key} d={arc(start, end)} className={`slice ${it.key}`} />;
        })}
      </svg>

      <div className="legend">
        {items.map((it) => (
          <div key={it.key} className="legRow">
            <span className={`swatch ${it.key}`} />
            <span className="legText">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function DashboardPage() {
  const nav = useNavigate();
  const { org } = useOrganization();
  const store = useEasmStore();

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ fallback mock from store (ถ้า API ยังไม่พร้อม)
const fallback = useMemo((): DashboardSummary => {
  // ✅ RiskBreakdown ของคุณไม่มี overall
  // ใช้ cubitScore เป็น score หลักแทน
  const score = store.risk.cubitScore ?? 80;
  const grade = gradeFromScore(score);

  const latest =
    store.scans
      .map((s) => s.finishedAt || s.createdAt)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ??
    new Date().toISOString();

  const topIssues: TopIssue[] = store.issues
  .filter((i) => i.status === "open")
  .slice(0, 3)
  .map((i): TopIssue => {
    const level: Level =
      i.severity === "high" || i.severity === "critical"
        ? "high"
        : i.severity === "medium"
        ? "medium"
        : "low";

    return {
      label: i.category || "Application",
      level,
    };
  });
  const defaultTopIssues: { label: string; level: "high" | "medium" | "low" }[] = [
  { label: "Network security", level: "high" },

];


  // timeline mock
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September"];
  const timeline = months.map((m, idx) => ({
    label: m,
    score: Math.max(0, Math.min(100, Math.round(score - 25 + idx * 5 + (idx % 2 === 0 ? 2 : -1)))),
  }));

  // pie = นับจำนวน issue ตาม severity
  const open = store.issues.filter((i) => i.status === "open");
  const vulnerability = {
    info: open.filter((i) => i.severity === "low").length, // ในระบบจริง info แยกได้ แต่ที่ type คุณไม่มี "info" จึง map low -> info แบบ mock
    high: open.filter((i) => i.severity === "high" || i.severity === "critical").length,
    medium: open.filter((i) => i.severity === "medium").length,
    low: 1,
  };

  return {
    orgName: org.name,
    orgDomain: org.domain,
    score,
    grade,
    latestScanDate: latest,
    topIssues: (topIssues.length ? topIssues : defaultTopIssues) as { label: string; level: "high" | "medium" | "low" }[],
    timeline,
    vulnerability,
    contact: { phone: "0255464458", email: "brave_scanner@gmail.com" },
  };
}, [store.risk, store.scans, store.issues, org.name, org.domain]);


  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await getDashboardSummary();
        if (!alive) return;
        setData(res);
      } catch {
        // API ยังไม่พร้อม -> ใช้ fallback จาก store
        if (!alive) return;
        setData(fallback);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [fallback]);

  const d = data ?? fallback;

  return (
    <div className="dash">
      {/* row 1 */}
      <div className="grid3">
        <section className="card">
          <div className="cardTitle">Score</div>

          <div className="scoreBlock">
            <div className="orgTxt">
              <div className="orgName">{d.orgName}</div>
              <div className="orgDomain">{d.orgDomain}</div>
            </div>

            <div className="scoreMain">
              <div className="gradeCircle">{d.grade}</div>
              <div className="scoreNum">{d.score}</div>
            </div>
          </div>

          <button className="linkBtn" onClick={() => nav("/score")} type="button">
            Go to score page
          </button>
        </section>

        <section className="card">
          <div className="cardTitle">Top Issues</div>

          <div className="issueBars">
            {d.topIssues.slice(0, 3).map((it, idx) => (
              <div key={idx} className={`barItem ${it.level}`}>
                {it.label}
              </div>
            ))}
          </div>

          <button className="linkBtn" onClick={() => nav("/issues?tab=open")} type="button">
            View all Issues
          </button>
        </section>

        <section className="card">
          <div className="cardTitle">History</div>

          <div className="latestWrap">
            <div className="latestLabel">Latest scan</div>
            <div className="latestDate">{formatDDMMYYYY(d.latestScanDate)}</div>

            <div className="miniScore">
              <span className="miniGrade">{d.grade}</span>
              <span className="miniNum">{d.score}</span>
            </div>
          </div>

          <button className="linkBtn" onClick={() => nav("/history")} type="button">
            View Log
          </button>
        </section>
      {/* </div> */}

      {/* row 2 */}
      {/* <div className="grid3b"> */}
        <section className="card big">
          <div className="cardTitle">Timeline</div>
          <LineChart points={d.timeline} />
        </section>

        <section className="card big">
          <div className="cardTitle">Vulnerability</div>
          <PieChart data={d.vulnerability} />
        </section>

        <section className="card big">
          <div className="cardTitle">Contact us</div>

          <div className="contact">
            <div className="cRow">
              <span className="cIcon">📞</span>
              <span>{d.contact.phone}</span>
              <span className="cIcon">✉️</span>
              <span>{d.contact.email}</span>
            </div>

            {loading && <div className="muted">Loading from API…</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
