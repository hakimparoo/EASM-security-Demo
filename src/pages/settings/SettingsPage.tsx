import React, { useMemo, useState } from "react";
import { useOrganization } from "../../contexts/OrganizationContext";
import "./SettingsPage.css";

type MenuKey =
  | "account"
  | "notification"
  | "security"
  | "organization"
  | "userManagement"
  | "userAuditLog";

type Role = "Admin" | "User";
type ToggleState = boolean;

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  accessEnabled: boolean;
  apiEnabled: boolean;
  permissions: "All" | "User";
  lastActive: string;
  lastActiveTime: string;
};

type AuditRow = {
  id: string;
  action: string;
  actor: string;
  at: string;
  ip: string;
};

function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

function Icon({
  name,
  className,
}: {
  name:
    | "settings"
    | "user"
    | "bell"
    | "shield"
    | "org"
    | "users"
    | "log"
    | "upload"
    | "more"
    | "plus";
  className?: string;
}) {
  // small inline icons (no libs)
  const common = { className: cx("sp-ic", className) };
  switch (name) {
    case "settings":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M19.4 13a7.9 7.9 0 0 0 .1-2l2-1.4-2-3.4-2.3.8a7.6 7.6 0 0 0-1.7-1l-.3-2.5H11l-.3 2.5a7.6 7.6 0 0 0-1.7 1l-2.3-.8-2 3.4L6.6 11a7.9 7.9 0 0 0 .1 2L4.7 14.4l2 3.4 2.3-.8c.5.4 1.1.7 1.7 1l.3 2.5h4.1l.3-2.5c.6-.3 1.2-.6 1.7-1l2.3.8 2-3.4L19.4 13Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "user":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M4.5 20a7.5 7.5 0 0 1 15 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "bell":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 22a2.2 2.2 0 0 0 2.2-2.2H9.8A2.2 2.2 0 0 0 12 22Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2 20 6v7c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M9 12.2 11 14l4-4.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "org":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M16 9h2a2 2 0 0 1 2 2v10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M8 7h4M8 11h4M8 15h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M4 21h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M16 11a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 16 11Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M2.5 20a6.5 6.5 0 0 1 13 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 11a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 8 11Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M14.8 20c.1-2.7 1.8-5 4.2-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "log":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M9 8h8M9 12h8M9 16h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "upload":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 16V4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M7 9l5-5 5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 20h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "more":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function Switch({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: ToggleState;
  onChange: (v: boolean) => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      className={cx("sp-switch", checked && "is-on")}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      aria-label={ariaLabel}
    >
      <span className="sp-switch__knob" />
    </button>
  );
}

function PillButton({
  active,
  text,
  onClick,
}: {
  active: boolean;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cx("sp-pill", active && "is-active")}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default function SettingsPage() {
  const { org } = useOrganization();

  const [active, setActive] = useState<MenuKey>("account");

  // ----------------- Mock State -----------------
  // Account
  const [accountName, setAccountName] = useState("Kantapat Hoonkaew");
  const [accountOrg, setAccountOrg] = useState("Company Name");
  const [accountEmail, setAccountEmail] = useState("you@company.com");

  // Notification
  const [notifyMaster, setNotifyMaster] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyAlert, setNotifyAlert] = useState(true);
  const [notifyTiming, setNotifyTiming] = useState<"daily" | "weekly" | "realtime">("daily");

  // Security
  const [otpEnabled, setOtpEnabled] = useState(false);

  // Organization
  const [orgName, setOrgName] = useState(org?.name || "Company name");
  const [orgDomain, setOrgDomain] = useState(org?.domain || "company.com");
  const [orgType, setOrgType] = useState<"education" | "enterprise" | "startup" | "government">(
    "education"
  );
  const [orgEmployee, setOrgEmployee] = useState<"1-20" | "21-50" | "51-200" | "201-1000" | "1000+">(
    "1-20"
  );
  const [orgHQ, setOrgHQ] = useState("Thailand");

  // User Management
  const [users, setUsers] = useState<UserRow[]>(() => [
    {
      id: "u0",
      name: "Name Surname",
      email: "you@company.com",
      role: "Admin",
      accessEnabled: true,
      apiEnabled: true,
      permissions: "All",
      lastActive: "Jan 1, 2025",
      lastActiveTime: "07:59 am",
    },
    {
      id: "u1",
      name: "User1",
      email: "user1@company.com",
      role: "User",
      accessEnabled: true,
      apiEnabled: true,
      permissions: "User",
      lastActive: "Jan 1, 2025",
      lastActiveTime: "07:59 am",
    },
    {
      id: "u2",
      name: "User2",
      email: "user2@company.com",
      role: "User",
      accessEnabled: true,
      apiEnabled: true,
      permissions: "User",
      lastActive: "Jan 1, 2025",
      lastActiveTime: "07:59 am",
    },
    {
      id: "u3",
      name: "User3",
      email: "user3@company.com",
      role: "User",
      accessEnabled: true,
      apiEnabled: true,
      permissions: "User",
      lastActive: "Jan 1, 2025",
      lastActiveTime: "07:59 am",
    },
  ]);

  // Audit Log
  const auditRows: AuditRow[] = useMemo(
    () => [
      {
        id: "a1",
        action: "Login",
        actor: "you@company.com",
        at: "Jan 1, 2025 07:59",
        ip: "203.0.113.10",
      },
      {
        id: "a2",
        action: "Updated Organization Profile",
        actor: "you@company.com",
        at: "Jan 1, 2025 08:10",
        ip: "203.0.113.10",
      },
      {
        id: "a3",
        action: "Changed Notification Rules",
        actor: "you@company.com",
        at: "Jan 1, 2025 08:15",
        ip: "203.0.113.10",
      },
    ],
    []
  );

  // ----------------- Derived -----------------
  const adminCount = users.filter((u) => u.role === "Admin").length;
  const userCount = users.filter((u) => u.role === "User").length;

  // ----------------- Actions (mock) -----------------
  const onEdit = (label: string) => {
    // mock behavior for "Edit"
    window.alert(`Edit: ${label} (mock)`);
  };

  const onChangePassword = () => {
    window.alert("Change Password (mock)");
  };

  const onSetRules = () => {
    window.alert("Set Rules Notification (mock)");
  };

  const onImportLogo = () => {
    window.alert("Import file picture (mock)");
  };

  const onAddUser = () => {
    const nextId = `u${Math.floor(Math.random() * 10000)}`;
    setUsers((prev) => [
      ...prev,
      {
        id: nextId,
        name: "New User",
        email: `new${prev.length}@company.com`,
        role: "User",
        accessEnabled: true,
        apiEnabled: true,
        permissions: "User",
        lastActive: "—",
        lastActiveTime: "—",
      },
    ]);
  };

  const updateUser = (id: string, patch: Partial<UserRow>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  // ----------------- UI -----------------
  return (
    <div className="sp-wrap">
      <div className="sp-header">
        <div className="sp-header__title">
          <Icon name="settings" />
          <h1>Settings</h1>
        </div>
      </div>

      <div className="sp-layout">
        {/* LEFT MENU */}
        <aside className="sp-left">
          <div className="sp-group">
            <div className="sp-group__title">My Account</div>

            <button
              type="button"
              className={cx("sp-nav", active === "account" && "is-active")}
              onClick={() => setActive("account")}
            >
              Account
            </button>
            <button
              type="button"
              className={cx("sp-nav", active === "notification" && "is-active")}
              onClick={() => setActive("notification")}
            >
              Notification
            </button>
            <button
              type="button"
              className={cx("sp-nav", active === "security" && "is-active")}
              onClick={() => setActive("security")}
            >
              Security
            </button>
          </div>

          <div className="sp-group sp-group--spaced">
            <div className="sp-group__title">Admin Setting</div>

            <button
              type="button"
              className={cx("sp-nav", active === "organization" && "is-active")}
              onClick={() => setActive("organization")}
            >
              My Organization
            </button>
            <button
              type="button"
              className={cx("sp-nav", active === "userManagement" && "is-active")}
              onClick={() => setActive("userManagement")}
            >
              User Management
            </button>
            <button
              type="button"
              className={cx("sp-nav", active === "userAuditLog" && "is-active")}
              onClick={() => setActive("userAuditLog")}
            >
              User Audit Log
            </button>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="sp-right">
          {/* ACCOUNT */}
          {active === "account" && (
            <section className="sp-card">
              <div className="sp-card__head">
                <div className="sp-card__headTitle">
                  <Icon name="user" />
                  <h2>Account</h2>
                </div>
                <div className="sp-card__line" />
              </div>

              <div className="sp-section">
                <h3>Personal Information</h3>

                <div className="sp-kv">
                  <div className="sp-kv__row">
                    <div className="sp-kv__key">Name</div>
                    <div className="sp-kv__val">{accountName}</div>
                    <button className="sp-link" type="button" onClick={() => onEdit("Name")}>
                      Edit
                    </button>
                  </div>

                  <div className="sp-kv__row">
                    <div className="sp-kv__key">Organization</div>
                    <div className="sp-kv__val">{accountOrg}</div>
                  </div>
                </div>
              </div>

              <div className="sp-divider" />

              <div className="sp-section">
                <h3>Log Information</h3>

                <div className="sp-kv">
                  <div className="sp-kv__row">
                    <div className="sp-kv__key">Email</div>
                    <div className="sp-kv__val">{accountEmail}</div>
                    <button className="sp-link" type="button" onClick={() => onEdit("Email")}>
                      Edit
                    </button>
                  </div>

                  <div className="sp-kv__row">
                    <div className="sp-kv__key">Password</div>
                    <div className="sp-kv__val">
                      <button className="sp-link" type="button" onClick={onChangePassword}>
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* hidden inputs (optional) — keep mock realistic */}
                <div className="sp-hiddenForm">
                  <div className="sp-field">
                    <label>Name</label>
                    <input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                  </div>
                  <div className="sp-field">
                    <label>Organization</label>
                    <input value={accountOrg} onChange={(e) => setAccountOrg(e.target.value)} />
                  </div>
                  <div className="sp-field">
                    <label>Email</label>
                    <input value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* NOTIFICATION */}
          {active === "notification" && (
            <section className="sp-card">
              <div className="sp-card__head">
                <div className="sp-card__headTitle">
                  <Icon name="bell" />
                  <h2>Notification</h2>
                </div>
                <div className="sp-card__line" />
              </div>

              <div className="sp-section">
                <div className="sp-row">
                  <div className="sp-row__left">
                    <h3>Turn On/Off Notification</h3>
                  </div>
                  <div className="sp-row__right">
                    <Switch
                      checked={notifyMaster}
                      onChange={setNotifyMaster}
                      aria-label="Turn On/Off Notification"
                    />
                  </div>
                </div>

                <div className={cx("sp-notiGrid", !notifyMaster && "is-disabled")}>
                  <div className="sp-notiRow">
                    <div className="sp-notiLabel">Email Notification</div>
                    <PillButton
                      active={notifyEmail}
                      text={notifyEmail ? "Enable" : "Disable"}
                      onClick={() => setNotifyEmail((v) => !v)}
                    />
                  </div>

                  <div className="sp-notiRow">
                    <div className="sp-notiLabel">Alert Notification</div>
                    <PillButton
                      active={notifyAlert}
                      text={notifyAlert ? "Enable" : "Disable"}
                      onClick={() => setNotifyAlert((v) => !v)}
                    />
                  </div>

                  <div className="sp-notiRow">
                    <div className="sp-notiLabel">Notification Timing</div>
                    <div className="sp-selectWrap">
                      <select
                        value={notifyTiming}
                        onChange={(e) => setNotifyTiming(e.target.value as any)}
                      >
                        <option value="daily">daily</option>
                        <option value="weekly">weekly</option>
                        <option value="realtime">realtime</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="sp-linkRow">
                  <button className="sp-link" type="button" onClick={onSetRules}>
                    Set Rules Notification
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* SECURITY */}
          {active === "security" && (
            <section className="sp-card">
              <div className="sp-card__head">
                <div className="sp-card__headTitle">
                  <Icon name="shield" />
                  <h2>Two-Factor Authentication</h2>
                </div>
                <div className="sp-card__line" />
              </div>

              <div className="sp-section">
                <div className="sp-row">
                  <div className="sp-row__left">
                    <h3>Turn On/Off authenticate with OTP</h3>
                  </div>
                  <div className="sp-row__right">
                    <Switch
                      checked={otpEnabled}
                      onChange={setOtpEnabled}
                      aria-label="OTP"
                    />
                  </div>
                </div>

                <div className="sp-hint">
                  {otpEnabled
                    ? "OTP enabled (mock). In real system you would enroll via authenticator / email / SMS."
                    : "OTP is off (mock)."}
                </div>
              </div>
            </section>
          )}

          {/* ORGANIZATION */}
          {active === "organization" && (
            <section className="sp-card">
              <div className="sp-card__head">
                <div className="sp-card__headTitle">
                  <Icon name="org" />
                  <h2>{orgName || "Organization"}</h2>
                </div>
                <div className="sp-card__line" />
              </div>

              <div className="sp-section">
                <div className="sp-orgGrid">
                  <div className="sp-orgRow">
                    <div className="sp-orgKey">Company Logo</div>
                    <button className="sp-link" type="button" onClick={onImportLogo}>
                      <span className="sp-inline">
                        <Icon name="upload" className="sp-ic--sm" />
                        Import file picture
                      </span>
                    </button>
                  </div>

                  <div className="sp-orgRow">
                    <div className="sp-orgKey">Organization Name</div>
                    <div className="sp-orgVal">{orgName}</div>
                    <button className="sp-link" type="button" onClick={() => onEdit("Organization Name")}>
                      Edit
                    </button>
                  </div>

                  <div className="sp-orgRow">
                    <div className="sp-orgKey">Domain name</div>
                    <div className="sp-orgVal">{orgDomain}</div>
                  </div>

                  <div className="sp-orgRow">
                    <div className="sp-orgKey">Organization type</div>
                    <div className="sp-selectWrap">
                      <select value={orgType} onChange={(e) => setOrgType(e.target.value as any)}>
                        <option value="education">education</option>
                        <option value="enterprise">enterprise</option>
                        <option value="startup">startup</option>
                        <option value="government">government</option>
                      </select>
                    </div>
                  </div>

                  <div className="sp-orgRow">
                    <div className="sp-orgKey">Employee</div>
                    <div className="sp-selectWrap">
                      <select
                        value={orgEmployee}
                        onChange={(e) => setOrgEmployee(e.target.value as any)}
                      >
                        <option value="1-20">1-20</option>
                        <option value="21-50">21-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-1000">201-1000</option>
                        <option value="1000+">1000+</option>
                      </select>
                    </div>
                  </div>

                  <div className="sp-orgRow">
                    <div className="sp-orgKey">Headquarters</div>
                    <div className="sp-orgVal">{orgHQ}</div>
                  </div>
                </div>

                {/* editable inputs hidden — still real state */}
                <div className="sp-hiddenForm sp-hiddenForm--org">
                  <div className="sp-field">
                    <label>Organization Name</label>
                    <input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                  </div>
                  <div className="sp-field">
                    <label>Domain name</label>
                    <input value={orgDomain} onChange={(e) => setOrgDomain(e.target.value)} />
                  </div>
                  <div className="sp-field">
                    <label>Headquarters</label>
                    <input value={orgHQ} onChange={(e) => setOrgHQ(e.target.value)} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* USER MANAGEMENT */}
          {active === "userManagement" && (
            <section className="sp-card">
              <div className="sp-card__head">
                <div className="sp-card__headTitle">
                  <Icon name="users" />
                  <h2>User Management</h2>
                </div>
                <div className="sp-card__line" />
              </div>

              <div className="sp-section">
                <div className="sp-statRow">
                  <div className="sp-statCard">
                    <div className="sp-statTitle">Admin</div>
                    <div className="sp-statSub">Account manager</div>
                    <div className="sp-statRight">
                      <span className="sp-dot" />
                      <span className="sp-statNum">{adminCount}</span>
                    </div>
                    <div className="sp-statFoot">Full access</div>
                  </div>

                  <div className="sp-statCard">
                    <div className="sp-statTitle">User</div>
                    <div className="sp-statSub">Standard member</div>
                    <div className="sp-statRight">
                      <span className="sp-dot" />
                      <span className="sp-statNum">{userCount}</span>
                    </div>
                    <div className="sp-statFoot">Full access</div>
                  </div>

                  <div className="sp-statAction">
                    <button className="sp-btn sp-btn--primary" type="button" onClick={onAddUser}>
                      <span className="sp-inline">
                        <Icon name="plus" className="sp-ic--sm" /> Add New
                      </span>
                    </button>
                  </div>
                </div>

                <div className="sp-table">
                  <div className="sp-tr sp-th">
                    <div>User</div>
                    <div>Role</div>
                    <div>Access</div>
                    <div>API</div>
                    <div>Permissions</div>
                    <div>Last Active</div>
                    <div />
                  </div>

                  {users.map((u) => (
                    <div className="sp-tr" key={u.id}>
                      <div className="sp-td sp-td--user">
                        <div className="sp-userName">{u.name}</div>
                        <button className="sp-link sp-link--mini" type="button" onClick={() => onEdit(`User: ${u.email}`)}>
                          {u.email}
                        </button>
                      </div>

                      <div className="sp-td">
                        <div className="sp-selectWrap sp-selectWrap--mini">
                          <select
                            value={u.role}
                            onChange={(e) => updateUser(u.id, { role: e.target.value as Role })}
                          >
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                          </select>
                        </div>
                      </div>

                      <div className="sp-td">
                        <div className="sp-selectWrap sp-selectWrap--mini">
                          <select
                            value={u.accessEnabled ? "Enable" : "Disable"}
                            onChange={(e) => updateUser(u.id, { accessEnabled: e.target.value === "Enable" })}
                          >
                            <option value="Enable">Enable</option>
                            <option value="Disable">Disable</option>
                          </select>
                        </div>
                      </div>

                      <div className="sp-td">
                        <div className="sp-selectWrap sp-selectWrap--mini">
                          <select
                            value={u.apiEnabled ? "Enable" : "Disable"}
                            onChange={(e) => updateUser(u.id, { apiEnabled: e.target.value === "Enable" })}
                          >
                            <option value="Enable">Enable</option>
                            <option value="Disable">Disable</option>
                          </select>
                        </div>
                      </div>

                      <div className="sp-td">
                        <span className={cx("sp-badge", u.permissions === "All" ? "is-strong" : "is-soft")}>
                          {u.permissions}
                        </span>
                      </div>

                      <div className="sp-td">
                        <div className="sp-lastActive">
                          <div className="sp-lastActive__date">{u.lastActive}</div>
                          <div className="sp-lastActive__time">{u.lastActiveTime}</div>
                        </div>
                      </div>

                      <div className="sp-td sp-td--more">
                        <button
                          type="button"
                          className="sp-more"
                          onClick={() => window.alert(`More action for ${u.email} (mock)`)}
                          aria-label="More actions"
                        >
                          <Icon name="more" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* USER AUDIT LOG */}
          {active === "userAuditLog" && (
            <section className="sp-card">
              <div className="sp-card__head">
                <div className="sp-card__headTitle">
                  <Icon name="log" />
                  <h2>User Audit Log</h2>
                </div>
                <div className="sp-card__line" />
              </div>

              <div className="sp-section">
                <div className="sp-table sp-table--audit">
                  <div className="sp-tr sp-th">
                    <div>Time</div>
                    <div>Action</div>
                    <div>Actor</div>
                    <div>IP</div>
                  </div>

                  {auditRows.map((r) => (
                    <div className="sp-tr" key={r.id}>
                      <div className="sp-td">{r.at}</div>
                      <div className="sp-td sp-td--strong">{r.action}</div>
                      <div className="sp-td">{r.actor}</div>
                      <div className="sp-td">{r.ip}</div>
                    </div>
                  ))}
                </div>

                <div className="sp-hint">
                  *Mock data. ระบบจริงควรเก็บ immutable log และรองรับ export สำหรับ compliance.
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
