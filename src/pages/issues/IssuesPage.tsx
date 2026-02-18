import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEasmStore } from "../../contexts/EasmStore";
import { useOrganization } from "../../contexts/OrganizationContext";
import type { Issue } from "../../types/easm";
import "./IssuesPage.css";

type SeverityLabel = "Info" | "Low" | "Medium" | "High" | "Critical" | "Positive";
type BreachRiskLabel = "Info" | "Low" | "Medium" | "High";

type IssueRow = {
  id: string;
  issue: string;
  factor: string;
  severity: SeverityLabel;
  breachRisk: BreachRiskLabel;
  impact: number;
  findings: number;
};

function gradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function severityToLabel(s: Issue["severity"]): SeverityLabel {
  // type ของคุณ: low | medium | high | critical
  if (s === "critical") return "High"; // ถ้าอยากแยก Critical ให้เปลี่ยนเป็น "Critical"
  if (s === "high") return "High";
  if (s === "medium") return "Medium";
  return "Low";
}

function severityToBreachRisk(s: Issue["severity"]): BreachRiskLabel {
  if (s === "critical" || s === "high") return "High";
  if (s === "medium") return "Low";
  return "Low";
}

function severityToImpact(s: Issue["severity"]): number {
  // mock ให้ดูสมจริง (ค่อย replace ด้วยค่าจริงจาก API ได้)
  if (s === "critical") return 7.8;
  if (s === "high") return 5.6;
  if (s === "medium") return 3.1;
  return 0.5;
}

function issueToFindings(i: Issue): number {
  // mock findings จาก evidence/recommendation
  const e = (i.evidence || "").trim();
  const r = (i.recommendation || "").trim();
  const base = Math.max(1, Math.round((e.length + r.length) / 18));
  return Math.max(1, Math.min(400, base));
}

export default function IssuesPage() {
  const navigate = useNavigate();
  const store = useEasmStore();
  const {org} = useOrganization();

  // Filters แบบต้นแบบ (เบื้องต้น)
  const [factor, setFactor] = useState<string>("all");
  const [severity, setSeverity] = useState<string>("all");

  const score = store.risk.cubitScore ?? 99;
  const grade = gradeFromScore(score);

  const factors = useMemo(() => {
    const set = new Set<string>();
    store.issues.forEach((i) => set.add(i.category || "Application Security"));
    return ["all", ...Array.from(set).sort()];
  }, [store.issues]);
  
  const rows: IssueRow[] = useMemo(() => {
    const filtered = store.issues.filter((i) => i.status === "open");
    
    const filtered2 = filtered.filter((i) => {
      const fOk = factor === "all" ? true : (i.category || "Application Security") === factor;
      const sOk = severity === "all" ? true : i.severity === severity;
      return fOk && sOk;
    });

    return filtered2.map((i) => ({
      id: i.id,
      issue: i.title,
      factor: i.category || "Application Security",
      severity: severityToLabel(i.severity),
      breachRisk: severityToBreachRisk(i.severity),
      impact: severityToImpact(i.severity),
      findings: issueToFindings(i),
    }));
  }, [store.issues, factor, severity]);

  const onClickFindings = (id: string) => {
    // ถ้าคุณยังไม่มีหน้า detail ก็ยังไม่ต้องใช้ได้
    // navigate(`/issues/${id}`);
    alert(`Open findings for Issue ID: ${id}`);
  };

  return (
    <div className="issuesPage">
      <h1 className="issuesTitle">Issues</h1>

      <div className="orgHeader">
        <div className="gradeCircle">{grade}</div>
        <div className="orgScore">{score}</div>

        <div className="orgMeta">
          <div className="orgName">{org.name || "King Mongkut's Institute of Technology Ladkrabang"}</div>
          <div className="orgDomain">{org.domain || "kmitl.ac.thEducation"}</div>
        </div>
      </div>

      <div className="filtersRow">
        <div className="filterGroup">
          <label className="filterLabel">Factor</label>
          <select className="select" value={factor} onChange={(e) => setFactor(e.target.value)}>
            {factors.map((f) => (
              <option key={f} value={f}>
                {f === "all" ? "All" : f}
              </option>
            ))}
          </select>
        </div>

        <div className="filterGroup">
          <label className="filterLabel">Severity</label>
          <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button
          className="clearBtn"
          onClick={() => {
            setFactor("all");
            setSeverity("all");
          }}
        >
          Clear
        </button>
      </div>

      <div className="tableWrap">
        <table className="issuesTable">
          <thead>
            <tr>
              <th className="thIssue">Issue</th>
              <th className="thFactor">Factor</th>
              <th className="thSeverity">Severity</th>
              <th className="thBreach">Breach risk</th>
              <th className="thImpact">Impact</th>
              <th className="thFindings">Findings</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">
                  No issues found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="colIssue">{r.issue}</td>
                  <td className="colFactor">{r.factor}</td>
                  <td className="colSeverity">{r.severity}</td>
                  <td className="colBreach">{r.breachRisk}</td>
                  <td className="colImpact">{r.impact < 1 ? `<${r.impact}` : r.impact.toFixed(1)}</td>
                  <td className="colFindings">
                    <button className="findingsBtn" onClick={() => onClickFindings(r.id)}>
                      {r.findings}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="footerActions">
        <button className="backBtn" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
