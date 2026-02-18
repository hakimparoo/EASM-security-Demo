import { useMemo, useState } from "react";
import { useEasmStore } from "../../contexts/EasmStore";
import { useOrganization } from "../../contexts/OrganizationContext";
import type { Issue } from "../../types/easm";
import "./ScorePage.css";





type ScoreFactorRow = {
  factor: string;
  score: number;
  impact: number;
  issues: number;
  findings: number;
};




function gradeFromScore(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function formatFindings(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/**
 * mock impact ต่อ issue เพื่อให้ตารางดูสมจริง (เปลี่ยนเป็นค่าจริงจาก API ได้ทีหลัง)
 */
function issueImpact(i: Issue): number {
  if (i.severity === "critical") return 2.8;
  if (i.severity === "high") return 2.2;
  if (i.severity === "medium") return 1.1;
  return 0.2;
}

/**
 * mock findings ต่อ issue เพื่อให้ได้ยอดรวมแบบต้นแบบ
 */
function issueFindings(i: Issue): number {
  // ใช้ความยาว title/evidence ทำให้กระจายตัวเลขได้
  const e = (i.evidence || "").length;
  const r = (i.recommendation || "").length;
  const base = (i.title.length + e + r) % 60;
  return Math.max(1, base);
}

export default function ScorePage() {
  const store = useEasmStore();
  const { org } = useOrganization();

  // (optional) filter
  const [search, setSearch] = useState("");

  const overallScore = store.risk?.cubitScore ?? 99;
  const grade = gradeFromScore(overallScore);

  const rows: ScoreFactorRow[] = useMemo(() => {
    // group issues by category/factor
    const map = new Map<string, ScoreFactorRow>();

    const openIssues = store.issues.filter((i) => i.status === "open");

    openIssues.forEach((i) => {
      const factor = i.category || "Application Security";
      if (!map.has(factor)) {
        map.set(factor, {
          factor,
          score: 0, // mock score ราย factor (จะเปลี่ยนเป็นค่าจริงจาก API ได้)
          impact: 0,
          issues: 0,
          findings: 0,
        });
      }

      const row = map.get(factor)!;
      row.issues += 1;
      row.impact += issueImpact(i);
      row.findings += issueFindings(i);
    });

    // ทำให้มี factor ตามภาพ แม้ยังไม่มี issue จริง (เพื่อให้หน้าดูเต็ม)
    const defaults = [
      "Application Security",
      "Patching Cadence",
      "Network Security",
      "DNS Health",
      "Endpoint Security",
      "IP Reputation",
      "Cubit Score",
      "Hacker",
      "Information Leak",
      "Social Engineering",
    ];

    defaults.forEach((f) => {
      if (!map.has(f)) {
        map.set(f, { factor: f, score: 57, impact: 0, issues: 45, findings: 2 });
      }
    });

    // normalize ให้ดูเหมือนต้นแบบ: impact มีทศนิยม / findings มีบางแถวเป็น K
    const list = Array.from(map.values()).map((r, idx) => {
      // ปรับ score บางกลุ่มให้เหมือนภาพ (บางอัน 44/45)
      const score =
        r.factor === "Hacker" || r.factor === "Information Leak"
          ? 44
          : r.factor === "Social Engineering"
          ? 45
          : r.score;

      // ถ้าเป็น 0 ให้คง 0 เหมือนภาพ
      const impact = r.impact === 0 ? 0 : Number(r.impact.toFixed(1));

      // ทำให้ Patching Cadence มี findings สูงแบบ 46.1K (mock)
      const findings =
        r.factor === "Patching Cadence"
          ? 46100
          : r.factor === "Application Security"
          ? Math.max(r.findings, 1500)
          : r.factor === "Network Security"
          ? Math.max(r.findings, 817)
          : r.findings;

      // ทำให้ Issues column ออกมาใกล้ภาพ (45)
      const issues = r.issues > 0 ? r.issues : 45;

      return { ...r, score, impact, issues, findings };
    });

    // search filter
    const q = search.trim().toLowerCase();
    const filtered = q ? list.filter((r) => r.factor.toLowerCase().includes(q)) : list;

    // sort: ตามตัวอย่างให้เรียงตาม defaults
    const order = new Map<string, number>();
    defaults.forEach((name, i) => order.set(name, i));

    filtered.sort((a, b) => (order.get(a.factor) ?? 999) - (order.get(b.factor) ?? 999));

    return filtered;
  }, [store.issues, store.risk?.cubitScore, search]);

  return (
    <div className="scoreFactorsPage">
      <h1 className="scoreFactorsTitle">Score Factors</h1>

      <div className="scoreHeaderDivider" />

      <div className="orgHeader">
        <div className="gradeCircle">{grade}</div>
        <div className="orgScore">{overallScore}</div>

        <div className="orgMeta">
          <div className="orgName">{org?.name ?? "King Mongkut's Institute of Technology Ladkrabang"}</div>
          <div className="orgDomain">{org?.domain ?? "kmitl.ac.thEducation"}</div>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="searchInput"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search factors…"
        />
      </div>

      <div className="tableCard">
        <table className="scoreTable">
          <thead>
            <tr>
              <th className="colArrow" />
              <th className="colFactor">Findings</th>
              <th className="colScore">Score</th>
              <th className="colImpact">Impact</th>
              <th className="colIssues">Issues</th>
              <th className="colFindings">Findings</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="emptyRow">
                  No data
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.factor}>
                  <td className="cellArrow">›</td>
                  <td className="cellFactor">{r.factor}</td>
                  <td>{r.score}</td>
                  <td className={r.impact > 0 ? "mutedImpact" : ""}>{r.impact}</td>
                  <td>{r.issues}</td>
                  <td>{formatFindings(r.findings)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
