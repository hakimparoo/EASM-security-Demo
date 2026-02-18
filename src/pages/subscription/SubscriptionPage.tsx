import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "../../contexts/OrganizationContext";
import "./Subscription.css";

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export default function SubscriptionPage() {
  const nav = useNavigate();
  const { org } = useOrganization();

  const meta = useMemo(() => {
    // mock subscription info
    const status = org.plan === "free" ? "Active (Free)" : "Active";
    const renewAt = org.plan === "free" ? null : addDays(18);
    const seats = org.plan === "enterprise" ? 50 : org.plan === "pro" ? 10 : 3;
    const scanLimit = org.plan === "enterprise" ? "Unlimited" : org.plan === "pro" ? "2,000 / month" : "200 / month";
    const targets = org.plan === "enterprise" ? "Unlimited" : org.plan === "pro" ? "200" : "20";
    return { status, renewAt, seats, scanLimit, targets };
  }, [org.plan]);

  return (
    <div className="sub">
      <div className="sub-head">
        <div>
          <div className="sub-title">Subscription</div>
          <div className="sub-sub">Plan and usage overview (mock)</div>
        </div>

        <button className="btn primary" onClick={() => nav("/subscription-plan")} type="button">
          Change Plan
        </button>
      </div>

      <div className="grid">
        <section className="panel">
          <div className="row">
            <div>
              <div className="muted">Current plan</div>
              <div style={{ marginTop: 6, display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{org.plan.toUpperCase()}</div>
                <span className={`badge ${org.plan}`}>{meta.status}</span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div className="muted">Renewal</div>
              <div style={{ marginTop: 6, fontWeight: 900 }}>
                {meta.renewAt ? meta.renewAt.toLocaleDateString() : "—"}
              </div>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-card">
              <div className="kpi-title">Seats</div>
              <div className="kpi-val">{meta.seats}</div>
              <div className="kpi-sub">members allowed</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Targets</div>
              <div className="kpi-val">{meta.targets}</div>
              <div className="kpi-sub">monitored assets</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Scan Limit</div>
              <div className="kpi-val">{meta.scanLimit}</div>
              <div className="kpi-sub">tasks per month</div>
            </div>
          </div>

          <div className="sep" />

          <div className="note">
            Tip: หน้า Subscription ใช้ในการเดโม “ระบบ SaaS” ให้ดูสมจริง (Plan/Usage/Upgrade flow)
          </div>
        </section>

        <section className="panel">
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Billing (Mock)</div>

          <div className="row" style={{ marginBottom: 10 }}>
            <div className="muted">Billing cycle</div>
            <div style={{ fontWeight: 900 }}>{org.plan === "free" ? "—" : "Monthly"}</div>
          </div>

          <div className="row" style={{ marginBottom: 10 }}>
            <div className="muted">Payment method</div>
            <div style={{ fontWeight: 900 }}>{org.plan === "free" ? "—" : "Visa **** 4242"}</div>
          </div>

          <div className="row" style={{ marginBottom: 10 }}>
            <div className="muted">Invoice</div>
            <button className="btn small" type="button" onClick={() => alert("Download invoice (mock)")}>
              Download
            </button>
          </div>

          <div className="sep" />

          <div className="row">
            <div>
              <div style={{ fontWeight: 900 }}>Need enterprise?</div>
              <div className="muted" style={{ marginTop: 4 }}>
                Contact sales for SSO, audit, and custom SLA.
              </div>
            </div>
            <button className="btn" type="button" onClick={() => alert("Contact sales (mock)")}>
              Contact
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
