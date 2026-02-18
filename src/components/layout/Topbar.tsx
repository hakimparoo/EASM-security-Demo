import "./Topbar.css";
import { useOrganization } from "../../contexts/OrganizationContext";
import { useEasmStore } from "../../contexts/EasmStore";

type Props = { collapsed: boolean; onToggleSidebar: () => void };

export default function Topbar({ onToggleSidebar }: Props) {
  const { org, logout } = useOrganization();
  const { quickCreateScan } = useEasmStore();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-btn" onClick={onToggleSidebar} title="Toggle sidebar">
          ☰
        </button>
        <div className="topbar-title">EASM Console</div>
      </div>

      <div className="topbar-right">
        <button className="topbar-btn primary" onClick={() => quickCreateScan()}>
          + New Scan
        </button>
        <div className="topbar-org">{org.domain}</div>
        <button className="topbar-btn" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
