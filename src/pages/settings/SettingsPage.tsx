import { useMemo, useState } from "react";
import { useOrganization } from "../../contexts/OrganizationContext";
import "./SettingsPage.css";

type Section =
  | "account"
  | "organization"
  | "security"
  | "notifications"
  | "userManagement"
  | "auditLog";

const sectionLabel: Record<Section, { title: string; desc: string; icon: string }> = {
  account: { title: "Account", desc: "Profile and preferences", icon: "👤" },
  organization: { title: "Organization", desc: "Tenant and domain settings", icon: "🏢" },
  security: { title: "Security", desc: "Password, MFA, sessions", icon: "🔐" },
  notifications: { title: "Notifications", desc: "Alerts and delivery channels", icon: "🔔" },
  userManagement: { title: "User Management", desc: "Roles and members", icon: "🧑‍🤝‍🧑" },
  auditLog: { title: "Audit Log", desc: "Activity and changes", icon: "🧾" },
};

const allSections: Section[] = [
  "account",
  "organization",
  "security",
  "notifications",
  "userManagement",
  "auditLog",
];

function toast(msg: string) {
  // simple mock toast (no library)
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 250);
  }, 1800);
}

export default function SettingsPage() {
  const { org } = useOrganization();
  const [section, setSection] = useState<Section>("account");

  // Mock state
  const [profile, setProfile] = useState({
    displayName: "Admin Demo",
    email: "admin@demo.com",
    timezone: "Asia/Bangkok",
  });

  const [orgState, setOrgState] = useState({
    name: org.name,
    domain: org.domain,
    plan: org.plan,
  });

  const [security, setSecurity] = useState({
    mfaEnabled: true,
    sessionTimeoutMin: 60,
    allowIpAllowlist: false,
    ipAllowlist: "203.0.113.10\n203.0.113.11",
  });

  const [notify, setNotify] = useState({
    emailAlerts: true,
    criticalOnly: false,
    digestDaily: true,
    webhookUrl: "",
  });

  const users = useMemo(
    () => [
      { id: "u1", name: "Admin Demo", email: "admin@demo.com", role: "Admin" },
      { id: "u2", name: "Viewer Demo", email: "viewer@demo.com", role: "Viewer" },
      { id: "u3", name: "Analyst Demo", email: "analyst@demo.com", role: "User" },
    ],
    []
  );

  const audit = useMemo(
    () => [
      { at: new Date().toLocaleString(), action: "Login", by: "admin@demo.com" },
      { at: new Date().toLocaleString(), action: "Created Scan Task", by: "admin@demo.com" },
      { at: new Date().toLocaleString(), action: "Resolved Issue", by: "admin@demo.com" },
    ],
    []
  );

  const onSave = () => {
    toast("Saved (mock)");
  };

  return (
    <div className="settings">
      <div className="settings-head">
        <div>
          <div className="settings-title">Settings</div>
          <div className="settings-sub">
            Manage your account, organization, and system preferences (mock)
          </div>
        </div>

        <button className="btn primary" type="button" onClick={onSave}>
          Save Changes
        </button>
      </div>

      <div className="settings-grid">
        {/* left nav */}
        <aside className="sidenav">
          {allSections.map((s) => (
            <button
              key={s}
              type="button"
              className={`sideitem ${section === s ? "active" : ""}`}
              onClick={() => setSection(s)}
            >
              <div className="sideicon">{sectionLabel[s].icon}</div>
              <div className="sidemeta">
                <div className="sidetitle">{sectionLabel[s].title}</div>
                <div className="sidedesc">{sectionLabel[s].desc}</div>
              </div>
            </button>
          ))}
        </aside>

        {/* content */}
        <main className="content">
          {section === "account" && (
            <div className="panel">
              <div className="panel-title">Account</div>
              <div className="panel-sub">Update your profile details</div>

              <div className="form">
                <div className="field">
                  <div className="label">Display name</div>
                  <input
                    className="input"
                    value={profile.displayName}
                    onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <div className="label">Email</div>
                  <input
                    className="input"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <div className="label">Timezone</div>
                  <select
                    className="input"
                    value={profile.timezone}
                    onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                  >
                    <option value="Asia/Bangkok">Asia/Bangkok</option>
                    <option value="Asia/Singapore">Asia/Singapore</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>

              <div className="divider" />

              <div className="row">
                <div>
                  <div className="row-title">Danger zone</div>
                  <div className="row-sub">Reset local mock session and preferences</div>
                </div>
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("easm_authed");
                    toast("Local session cleared (mock)");
                  }}
                >
                  Clear Session
                </button>
              </div>
            </div>
          )}

          {section === "organization" && (
            <div className="panel">
              <div className="panel-title">Organization</div>
              <div className="panel-sub">Tenant identity and domain configuration</div>

              <div className="form">
                <div className="field">
                  <div className="label">Organization name</div>
                  <input
                    className="input"
                    value={orgState.name}
                    onChange={(e) => setOrgState((o) => ({ ...o, name: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <div className="label">Primary domain</div>
                  <input
                    className="input"
                    value={orgState.domain}
                    onChange={(e) => setOrgState((o) => ({ ...o, domain: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <div className="label">Plan</div>
                  <select
                    className="input"
                    value={orgState.plan}
                    onChange={(e) => setOrgState((o) => ({ ...o, plan: e.target.value as any }))}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="hint">
                Tip: ในระบบจริงส่วนนี้จะเชื่อมกับ Tenant DB / Master DB และ role-based access
              </div>
            </div>
          )}

          {section === "security" && (
            <div className="panel">
              <div className="panel-title">Security</div>
              <div className="panel-sub">Authentication and session hardening</div>

              <div className="grid2">
                <div className="card">
                  <div className="card-title">Multi-factor Authentication (MFA)</div>
                  <div className="card-sub">Enhance account protection</div>

                  <div className="toggle-row">
                    <div className="toggle-label">Enable MFA</div>
                    <button
                      type="button"
                      className={`toggle ${security.mfaEnabled ? "on" : ""}`}
                      onClick={() => setSecurity((s) => ({ ...s, mfaEnabled: !s.mfaEnabled }))}
                    >
                      <span className="knob" />
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Session Timeout</div>
                  <div className="card-sub">Auto-logout after inactivity</div>

                  <div className="field">
                    <div className="label">Timeout (minutes)</div>
                    <input
                      className="input"
                      type="number"
                      min={5}
                      max={480}
                      value={security.sessionTimeoutMin}
                      onChange={(e) =>
                        setSecurity((s) => ({ ...s, sessionTimeoutMin: Number(e.target.value) }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="divider" />

              <div className="row">
                <div>
                  <div className="row-title">IP Allowlist (Admin)</div>
                  <div className="row-sub">Restrict access by IP ranges (mock)</div>
                </div>

                <button
                  type="button"
                  className={`chip ${security.allowIpAllowlist ? "active" : ""}`}
                  onClick={() => setSecurity((s) => ({ ...s, allowIpAllowlist: !s.allowIpAllowlist }))}
                >
                  {security.allowIpAllowlist ? "Enabled" : "Disabled"}
                </button>
              </div>

              {security.allowIpAllowlist && (
                <div className="field">
                  <div className="label">Allowed IPs (one per line)</div>
                  <textarea
                    className="textarea"
                    value={security.ipAllowlist}
                    onChange={(e) => setSecurity((s) => ({ ...s, ipAllowlist: e.target.value }))}
                  />
                </div>
              )}
            </div>
          )}

          {section === "notifications" && (
            <div className="panel">
              <div className="panel-title">Notifications</div>
              <div className="panel-sub">Alerts and delivery channels</div>

              <div className="grid2">
                <div className="card">
                  <div className="card-title">Email Alerts</div>
                  <div className="card-sub">Receive scan findings via email</div>

                  <div className="toggle-row">
                    <div className="toggle-label">Enable email alerts</div>
                    <button
                      type="button"
                      className={`toggle ${notify.emailAlerts ? "on" : ""}`}
                      onClick={() => setNotify((n) => ({ ...n, emailAlerts: !n.emailAlerts }))}
                    >
                      <span className="knob" />
                    </button>
                  </div>

                  <div className="toggle-row">
                    <div className="toggle-label">Critical only</div>
                    <button
                      type="button"
                      className={`toggle ${notify.criticalOnly ? "on" : ""}`}
                      onClick={() => setNotify((n) => ({ ...n, criticalOnly: !n.criticalOnly }))}
                    >
                      <span className="knob" />
                    </button>
                  </div>

                  <div className="toggle-row">
                    <div className="toggle-label">Daily digest</div>
                    <button
                      type="button"
                      className={`toggle ${notify.digestDaily ? "on" : ""}`}
                      onClick={() => setNotify((n) => ({ ...n, digestDaily: !n.digestDaily }))}
                    >
                      <span className="knob" />
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Webhook (SOC / SIEM)</div>
                  <div className="card-sub">Send events to your pipeline</div>

                  <div className="field">
                    <div className="label">Webhook URL</div>
                    <input
                      className="input"
                      placeholder="https://hooks.example.com/easm"
                      value={notify.webhookUrl}
                      onChange={(e) => setNotify((n) => ({ ...n, webhookUrl: e.target.value }))}
                    />
                  </div>

                  <div className="hint">
                    Tip: ระบบจริงจะมี signature/secret และ retry policy
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === "userManagement" && (
            <div className="panel">
              <div className="panel-title">User Management</div>
              <div className="panel-sub">Manage members and roles (mock)</div>

              <div className="table">
                <div className="thead">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div className="right">Action</div>
                </div>

                {users.map((u) => (
                  <div key={u.id} className="trow">
                    <div className="cell strong">{u.name}</div>
                    <div className="cell muted">{u.email}</div>
                    <div className="cell">
                      <span className="pill">{u.role}</span>
                    </div>
                    <div className="cell right">
                      <button className="btn small" type="button" onClick={() => toast("Edit user (mock)")}>
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hint">
                Tip: ในระบบจริงจะมี RBAC ตาม Viewer/User/Admin/Super Admin
              </div>
            </div>
          )}

          {section === "auditLog" && (
            <div className="panel">
              <div className="panel-title">Audit Log</div>
              <div className="panel-sub">Track critical actions (mock)</div>

              <div className="table">
                <div className="thead">
                  <div>Time</div>
                  <div>Action</div>
                  <div>Actor</div>
                </div>

                {audit.map((a, idx) => (
                  <div key={idx} className="trow">
                    <div className="cell muted">{a.at}</div>
                    <div className="cell strong">{a.action}</div>
                    <div className="cell muted">{a.by}</div>
                  </div>
                ))}
              </div>

              <div className="hint">
                Tip: ระบบจริงควรเก็บ immutable log + export สำหรับ compliance
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
