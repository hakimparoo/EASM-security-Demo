import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { useOrganization } from "../../contexts/OrganizationContext";

type Props = { collapsed: boolean; onToggle: () => void };

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  // { to: "/assets", label: "Assets", icon: "🧭" },
  // { to: "/scans", label: "Scans", icon: "🛰️" },
  { to: "/issues", label: "Issues", icon: "🚨" },
  { to: "/score", label: "Score Factors", icon: "🧮" },
  { to: "/history", label: "History", icon: "🗂️" },
  { to: "/subscription", label: "Subscription", icon: "💳" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ collapsed, onToggle }: Props) {
  const { org } = useOrganization();
  const loc = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="sidebar-top">
        <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
          {collapsed ? "➡️" : "⬅️"}
        </button>

        <div className="brand">
          <div className="brand-logo">E</div>
          {!collapsed && (
            <div className="brand-meta">
              <div className="brand-title">EASM</div>
              <div className="brand-sub">{org.name}</div>
            </div>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `nav-item ${isActive || loc.pathname === it.to ? "active" : ""}`
            }
          >
            <span className="nav-icon">{it.icon}</span>
            {!collapsed && <span className="nav-label">{it.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {!collapsed && <div className="hint">External Attack Surface Management</div>}
      </div>
    </aside>
  );
}
