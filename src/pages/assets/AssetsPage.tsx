import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEasmStore } from "../../contexts/EasmStore";

import "./AssetsPage.css";

type Kind = "domain" | "subdomain" | "ip" | "service";

const kindLabel: Record<Kind, string> = {
  domain: "Domain",
  subdomain: "Subdomain",
  ip: "IP",
  service: "Service",
};

export default function AssetsPage() {
  const nav = useNavigate();
  const { assets, addTarget, createScan } = useEasmStore();
  const [sp, setSp] = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [kind, setKind] = useState<Kind | "all">((sp.get("kind") as any) ?? "all");

  // Add Target modal (inline)
  const [openAdd, setOpenAdd] = useState(false);
  const [newKind, setNewKind] = useState<Kind>("domain");
  const [newName, setNewName] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return assets.filter((a) => {
      const matchQ =
        !qq ||
        a.name.toLowerCase().includes(qq) ||
        a.tags.some((t) => t.toLowerCase().includes(qq)) ||
        a.tech.some((t) => t.toLowerCase().includes(qq));

      const matchKind = kind === "all" ? true : a.kind === kind;
      return matchQ && matchKind;
    });
  }, [assets, q, kind]);

  const counts = useMemo(() => {
    const by = { domain: 0, subdomain: 0, ip: 0, service: 0 };
    for (const a of assets) by[a.kind] += 1;
    return by;
  }, [assets]);

  const applyQuery = (nextQ: string, nextKind: string) => {
    const params: Record<string, string> = {};
    if (nextQ.trim()) params.q = nextQ.trim();
    if (nextKind !== "all") params.kind = nextKind;
    setSp(params);
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyQuery(q, kind);
  };

  const onAddTarget = () => {
    const name = newName.trim();
    if (!name) return;

    addTarget(name, newKind);
    setNewName("");
    setNewKind("domain");
    setOpenAdd(false);

    // refresh view
    setQ("");
    setKind("all");
    applyQuery("", "all");
  };

  const onQuickScan = (assetId: string) => {
    createScan(assetId, ["discovery", "dns", "ssl", "ports"]);
    nav(`/scans?status=running&assetId=${encodeURIComponent(assetId)}`);
  };

  return (
    <div className="assets">
      <div className="assets-head">
        <div>
          <div className="assets-title">Assets</div>
          <div className="assets-sub">Discover, tag, and manage external-facing assets (mock)</div>
        </div>

        <div className="assets-actions">
          <button className="assets-btn" onClick={() => setOpenAdd(true)} type="button">
            + Add Target
          </button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="chips">
        <button className={`chip ${kind === "all" ? "active" : ""}`} onClick={() => setKind("all")} type="button">
          All <span className="chip-count">{assets.length}</span>
        </button>
        <button className={`chip ${kind === "domain" ? "active" : ""}`} onClick={() => setKind("domain")} type="button">
          Domain <span className="chip-count">{counts.domain}</span>
        </button>
        <button className={`chip ${kind === "subdomain" ? "active" : ""}`} onClick={() => setKind("subdomain")} type="button">
          Subdomain <span className="chip-count">{counts.subdomain}</span>
        </button>
        <button className={`chip ${kind === "ip" ? "active" : ""}`} onClick={() => setKind("ip")} type="button">
          IP <span className="chip-count">{counts.ip}</span>
        </button>
        <button className={`chip ${kind === "service" ? "active" : ""}`} onClick={() => setKind("service")} type="button">
          Service <span className="chip-count">{counts.service}</span>
        </button>

        <div className="chips-spacer" />

        <button
          className="chip ghost"
          onClick={() => {
            setQ("");
            setKind("all");
            applyQuery("", "all");
          }}
          type="button"
        >
          Reset
        </button>
      </div>

      {/* Search bar */}
      <form className="searchbar" onSubmit={onSubmitSearch}>
        <input
          className="search-input"
          placeholder="Search by name, tag, or tech (e.g., cloudflare, api, prod)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="search-select"
          value={kind}
          onChange={(e) => setKind(e.target.value as any)}
        >
          <option value="all">All kinds</option>
          <option value="domain">Domain</option>
          <option value="subdomain">Subdomain</option>
          <option value="ip">IP</option>
          <option value="service">Service</option>
        </select>

        <button className="search-btn" type="submit">Search</button>
      </form>

      {/* Table */}
      <div className="table">
        <div className="thead">
          <div>Name</div>
          <div>Kind</div>
          <div>Tags</div>
          <div>Tech</div>
          <div>Last seen</div>
          <div className="right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            No assets match your filters.
            <div className="empty-sub">Try changing search keywords or kind filter.</div>
          </div>
        ) : (
          filtered.map((a) => (
            <div key={a.id} className="trow">
              <button
                className="cell name"
                type="button"
                onClick={() => nav(`/issues?assetId=${encodeURIComponent(a.id)}&status=open`)}
                title="View related issues"
              >
                <div className="name-main">{a.name}</div>
                <div className="name-sub">assetId: {a.id}</div>
              </button>

              <div className="cell">
                <span className={`kind ${a.kind}`}>{kindLabel[a.kind as Kind]}</span>
              </div>

              <div className="cell">
                <div className="pill-row">
                  {a.tags.length ? a.tags.map((t) => (
                    <span className="pill" key={t}>{t}</span>
                  )) : <span className="muted">—</span>}
                </div>
              </div>

              <div className="cell">
                <div className="pill-row">
                  {a.tech.length ? a.tech.map((t) => (
                    <span className="pill soft" key={t}>{t}</span>
                  )) : <span className="muted">—</span>}
                </div>
              </div>

              <div className="cell muted">
                {new Date(a.lastSeenAt).toLocaleString()}
              </div>

              <div className="cell right">
                <div className="actions">
                  <button
                    className="btn small"
                    type="button"
                    onClick={() => nav(`/issues?assetId=${encodeURIComponent(a.id)}&status=open`)}
                  >
                    Issues
                  </button>
                  <button
                    className="btn small"
                    type="button"
                    onClick={() => nav(`/scans?assetId=${encodeURIComponent(a.id)}`)}
                  >
                    Scans
                  </button>
                  <button
                    className="btn small primary"
                    type="button"
                    onClick={() => onQuickScan(a.id)}
                  >
                    Scan
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Target Modal */}
      {openAdd && (
        <div className="modal-backdrop" onClick={() => setOpenAdd(false)} role="presentation">
          <div className="modal" onClick={(e) => e.stopPropagation()} role="presentation">
            <div className="modal-title">Add Target</div>
            <div className="modal-sub">Add a new external-facing asset for monitoring</div>

            <div className="form">
              <div className="field">
                <div className="label">Type</div>
                <select className="input" value={newKind} onChange={(e) => setNewKind(e.target.value as Kind)}>
                  <option value="domain">Domain</option>
                  <option value="subdomain">Subdomain</option>
                  <option value="ip">IP</option>
                  <option value="service">Service</option>
                </select>
              </div>

              <div className="field">
                <div className="label">Value</div>
                <input
                  className="input"
                  placeholder={
                    newKind === "ip"
                      ? "203.0.113.10"
                      : newKind === "subdomain"
                        ? "api.example.com"
                        : newKind === "service"
                          ? "https://example.com:443"
                          : "example.com"
                  }
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn" type="button" onClick={() => setOpenAdd(false)}>
                Cancel
              </button>
              <button className="btn primary" type="button" onClick={onAddTarget}>
                Add
              </button>
            </div>

            <div className="hint">
              Tip: คลิกชื่อ asset เพื่อไปดู Issues ที่เกี่ยวข้องได้ทันที
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
