import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import "./AppLayout.css";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="app-main">
        <Topbar collapsed={collapsed} onToggleSidebar={() => setCollapsed((v) => !v)} />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
