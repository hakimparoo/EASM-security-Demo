import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEasmStore } from "../../contexts/EasmStore";
import type { ScanStatus } from "../../types/easm";
import "./ScansPage.css";

const statusLabel: Record<ScanStatus, string> = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  failed: "Failed",
};

const moduleOptions = [
  { id: "discovery", label: "Asset Discovery" },
  { id: "dns", label: "DNS Health" },
  { id: "ssl", label: "TLS/SSL" },
  { id: "ports", label: "Port Scan" },
  { id: "vuln", label: "Vulnerability (mock)" },
];

export default function ScansPage() {
  const nav = useNavigate();
  const { assets, scans, createScan } = useEasmStore();
  const [sp, setSp] = useSearchParams();

  const statusQ = (sp.get("status") as ScanStatus | null) ?? null;
  const assetIdQ = sp.get("assetId") ?? null;
  const taskIdQ = sp.get("taskId") ?? null;

  const [openNew, setOpenNew] = useState(false);
  const [targetId, setTargetId] = useState<string>(() => assetIdQ ?? (assets[0]?.id ?? ""));
  const [mods, setMods] = useState<string[]>(["discovery", "dns", "ssl", "ports"]);

  const applyQuery = (next: { status?: string | null; assetId?: string | null; taskId?: string | null }) => {
    const params: Record<string, string> = {};
    if (next.status) params.status = next.status;
    if (next.assetId) params.assetId = next.assetId;
    if (next.taskId) params.taskId = next.taskId;
    setSp(params);
  };

  const filtered = useMemo(() => {
    return scans.filter((s) => {
      const okStatus = statusQ ? s.status === statusQ : true;
      const okAsset = assetIdQ ? s.target === assetIdQ : true;
      const okTask = taskIdQ ? s.id === taskIdQ : true;
      return okStatus && okAsset && okTask;
    });
  }, [scans, statusQ, assetIdQ, taskIdQ]);

  const counts = useMemo(() => {
    const c = { queued: 0, running: 0, done: 0, failed: 0 };
    for (const s of scans) c[s.status] += 1;
    return c;
  }, [scans]);

  const selectedTask = useMemo(() => {
    if (!taskIdQ) return null;
    return scans.find((s) => s.id === taskIdQ) ?? null;
  }, [scans, taskIdQ]);

  const targetName = (id: string) => assets.find((a) => a.id === id)?.name ?? id;

  const onCreate = () => {
    if (!targetId) return;
    if (!mods.length) return;

    createScan(targetId, mods);
    setOpenNew(false);

    // show running scans for that asset
    applyQuery({ status: "running", assetId: targetId, taskId: null });
  };

  const toggleMod = (m: string) => {
    setMods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  return (
    <div className="scans">
      <div className="scans-head">
        <div>
          <div className="scans-title">Scans</div>
          <div className="scans-sub">Create and track scanning tasks (mock progress, interactive)</div>
        </div>

        <div className="scans-actions">
          <button className="btn" type="button" onClick={() => setOpenNew(true)}>
            + New Scan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <button
          className={`chip ${!statusQ ? "active" : ""}`}
          type="button"
          onClick={() => applyQuery({ status: null, assetId: assetIdQ, taskId: taskIdQ })}
        >
          All <span className="chip-count">{scans.length}</span>
        </button>

        {(["running", "queued", "done", "failed"] as ScanStatus[]).map((st) => (
          <button
            key={st}
            className={`chip ${statusQ === st ? "active" : ""}`}
            type="button"
            onClick={() => applyQuery({ status: st, assetId: assetIdQ, taskId: null })}
          >
            {statusLabel[st]} <span className="chip-count">{counts[st]}</span>
          </button>
        ))}

        <div className="filters-spacer" />

        <select
          className="select"
          value={assetIdQ ?? ""}
          onChange={(e) => applyQuery({ status: statusQ, assetId: e.target.value || null, taskId: null })}
        >
          <option value="">All targets</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.kind})
            </option>
          ))}
        </select>

        <button className="chip ghost" type="button" onClick={() => applyQuery({ status: null, assetId: null, taskId: null })}>
          Reset
        </button>
      </div>

      {/* Detail panel if taskId selected */}
      {selectedTask && (
        <div className="detail">
          <div className="detail-top">
            <div className="detail-title">Task: {selectedTask.id}</div>
            <span className={`pill ${selectedTask.status}`}>{selectedTask.status}</span>
          </div>
          <div className="detail-meta">
            <span className="muted">Target:</span> {targetName(selectedTask.target)}
            <span className="dot">•</span>
            <span className="muted">Modules:</span> {selectedTask.modules.join(", ")}
          </div>

          <div className="progress">
            <div className="bar" style={{ width: `${selectedTask.progress}%` }} />
          </div>

          <div className="detail-actions">
            <button className="btn small" type="button" onClick={() => nav(`/issues?assetId=${encodeURIComponent(selectedTask.target)}&status=open`)}>
              View Issues
            </button>
            <button className="btn small" type="button" onClick={() => applyQuery({ status: statusQ, assetId: assetIdQ, taskId: null })}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table">
        <div className="thead">
          <div>Task</div>
          <div>Target</div>
          <div>Modules</div>
          <div>Status</div>
          <div>Progress</div>
          <div className="right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            No scans match your filters.
            <div className="empty-sub">Try changing status or target.</div>
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="trow">
              <button
                className="cell link"
                type="button"
                onClick={() => applyQuery({ status: statusQ, assetId: assetIdQ, taskId: s.id })}
                title="Open task detail"
              >
                <div className="mono">{s.id}</div>
                <div className="tiny muted">{new Date(s.createdAt).toLocaleString()}</div>
              </button>

              <div className="cell">
                <div className="strong">{targetName(s.target)}</div>
                <div className="tiny muted">assetId: {s.target}</div>
              </div>

              <div className="cell tiny">
                {s.modules.join(", ")}
              </div>

              <div className="cell">
                <span className={`pill ${s.status}`}>{s.status}</span>
              </div>

              <div className="cell">
                <div className="progress small">
                  <div className="bar" style={{ width: `${s.progress}%` }} />
                </div>
                <div className="tiny muted">{s.progress}%</div>
              </div>

              <div className="cell right">
                <div className="actions">
                  <button
                    className="btn small"
                    type="button"
                    onClick={() => nav(`/issues?assetId=${encodeURIComponent(s.target)}&status=open`)}
                  >
                    Issues
                  </button>
                  <button
                    className="btn small"
                    type="button"
                    onClick={() => applyQuery({ status: statusQ, assetId: assetIdQ, taskId: s.id })}
                  >
                    Detail
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Scan Modal */}
      {openNew && (
        <div className="modal-backdrop" onClick={() => setOpenNew(false)} role="presentation">
          <div className="modal" onClick={(e) => e.stopPropagation()} role="presentation">
            <div className="modal-title">New Scan</div>
            <div className="modal-sub">Select target and modules to run</div>

            <div className="form">
              <div className="field">
                <div className="label">Target</div>
                <select className="input" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.kind})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <div className="label">Modules</div>
                <div className="mods">
                  {moduleOptions.map((m) => {
                    const checked = mods.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        className={`mod ${checked ? "on" : ""}`}
                        type="button"
                        onClick={() => toggleMod(m.id)}
                      >
                        <span className="check">{checked ? "✓" : "+"}</span>
                        {m.label}
                      </button>
                    );
                  })}
                </div>
                <div className="hint">Tip: เลือก discovery + dns + ssl + ports สำหรับเดโม</div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn" type="button" onClick={() => setOpenNew(false)}>
                Cancel
              </button>
              <button className="btn primary" type="button" onClick={onCreate} disabled={!targetId || mods.length === 0}>
                Run Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
