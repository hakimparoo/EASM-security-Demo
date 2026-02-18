import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { initialAssets, initialHistory, initialIssues, initialRisk, initialScans } from "../data/easmMock";
// import  { Asset, HistoryItem, Issue, RiskBreakdown, ScanTask, Severity } from "../types/easm";
import type { Asset, HistoryItem, Issue, RiskBreakdown, ScanTask, Severity } from "../types/easm";


type EasmCtx = {
  assets: Asset[];
  scans: ScanTask[];
  issues: Issue[];
  history: HistoryItem[];
  risk: RiskBreakdown;

  addTarget: (name: string, kind: Asset["kind"]) => void;
  createScan: (targetId: string, modules: string[]) => void;
  quickCreateScan: () => void;
  resolveIssue: (issueId: string) => void;
};

const EasmStore = createContext<EasmCtx | null>(null);

const uid = (prefix: string) => `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
const nowIso = () => new Date().toISOString();

export function EasmStoreProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [scans, setScans] = useState<ScanTask[]>(initialScans);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [risk] = useState<RiskBreakdown>(initialRisk);

  const timersRef = useRef<Record<string, number>>({});

  const addTarget = (name: string, kind: Asset["kind"]) => {
    const newAsset: Asset = {
      id: uid("a"),
      kind,
      name: name.trim(),
      tags: ["manual"],
      tech: [],
      lastSeenAt: nowIso(),
    };
    setAssets((prev) => [newAsset, ...prev]);
    setHistory((prev) => [
      { id: uid("h"), at: nowIso(), target: name.trim(), summary: `Added target (${kind})` },
      ...prev,
    ]);
  };

  const createScan = (targetId: string, modules: string[]) => {
    const taskId = uid("s");
    const newTask: ScanTask = {
      id: taskId,
      target: targetId,
      modules,
      status: "running",
      progress: 0,
      createdAt: nowIso(),
    };
    setScans((prev) => [newTask, ...prev]);

    // fake progress + generate findings when done
    let progress = 0;
    const interval = window.setInterval(() => {
      progress += 10;
      setScans((prev) =>
        prev.map((s) => (s.id === taskId ? { ...s, progress: Math.min(progress, 100) } : s))
      );

      if (progress >= 100) {
        window.clearInterval(interval);
        setScans((prev) =>
          prev.map((s) =>
            s.id === taskId ? { ...s, status: "done", progress: 100, finishedAt: nowIso() } : s
          )
        );

        // create a mock issue sometimes
        const createIssue = Math.random() > 0.35;
        if (createIssue) {
          const severities: Severity[] = ["critical", "high", "medium", "low"];
          const sev = severities[Math.floor(Math.random() * severities.length)];
          const asset = assets.find((a) => a.id === targetId);

          const newIssue: Issue = {
            id: uid("i"),
            title: sev === "critical" ? "Publicly exposed service detected" : "Configuration improvement recommended",
            severity: sev,
            category: sev === "critical" ? "Network Security" : "Hardening",
            assetId: targetId,
            evidence: sev === "critical" ? "Service reachable from internet without restriction." : "Minor misconfiguration found.",
            recommendation: sev === "critical" ? "Restrict access, apply firewall/WAF rules, and validate exposure." : "Apply recommended baseline configuration.",
            status: "open",
            createdAt: nowIso(),
          };
          setIssues((prev) => [newIssue, ...prev]);
          setHistory((prev) => [
            { id: uid("h"), at: nowIso(), target: asset?.name ?? targetId, summary: `Scan completed: issue +1 (${sev})` },
            ...prev,
          ]);
        } else {
          const asset = assets.find((a) => a.id === targetId);
          setHistory((prev) => [
            { id: uid("h"), at: nowIso(), target: asset?.name ?? targetId, summary: "Scan completed: no new issues" },
            ...prev,
          ]);
        }
      }
    }, 350);

    timersRef.current[taskId] = interval as unknown as number;
  };

  const quickCreateScan = () => {
    const first = assets[0];
    if (!first) return;
    createScan(first.id, ["discovery", "dns", "ssl", "ports"]);
  };

  const resolveIssue = (issueId: string) => {
    setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: "resolved" } : i)));
  };

  const value = useMemo<EasmCtx>(
    () => ({ assets, scans, issues, history, risk, addTarget, createScan, quickCreateScan, resolveIssue }),
    [assets, scans, issues, history, risk]
  );

  return <EasmStore.Provider value={value}>{children}</EasmStore.Provider>;
}

export function useEasmStore() {
  const ctx = useContext(EasmStore);
  if (!ctx) throw new Error("useEasmStore must be used within EasmStoreProvider");
  return ctx;
}
