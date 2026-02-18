import { useNavigate } from "react-router-dom";
import { useOrganization } from "../../contexts/OrganizationContext";
import "../subscription/Subscription.css";

type Plan = "free" | "pro" | "enterprise";

const plans: Array<{
  id: Plan;
  name: string;
  price: string;
  unit: string;
  featured?: boolean;
  features: string[];
}> = [
  {
    id: "free",
    name: "Free",
    price: "฿0",
    unit: "forever",
    features: [
      "Up to 20 targets",
      "200 scans / month",
      "Basic issues list",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "฿2,490",
    unit: "per month",
    featured: true,
    features: [
      "Up to 200 targets",
      "2,000 scans / month",
      "Risk score breakdown",
      "Email alerts",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    unit: "contact sales",
    features: [
      "Unlimited targets & scans",
      "SSO / SAML (mock)",
      "Advanced audit log",
      "Dedicated SLA",
      "Security review support",
    ],
  },
];

function toast(msg: string) {
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

export default function SubscriptionPlanPage() {
  const nav = useNavigate();
  const { org, setPlan } = useOrganization();

  const pick = (p: Plan) => {
    setPlan(p);
    toast(`Plan updated to ${p.toUpperCase()} (mock)`);
    nav("/subscription");
  };

  return (
    <div className="sub">
      <div className="sub-head">
        <div>
          <div className="sub-title">Choose a Plan</div>
          <div className="sub-sub">Upgrade/downgrade plans (mock)</div>
        </div>

        <button className="btn" type="button" onClick={() => nav("/subscription")}>
          Back
        </button>
      </div>

      <section className="panel">
        <div className="row">
          <div>
            <div className="muted">Current plan</div>
            <div style={{ marginTop: 6, display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>{org.plan.toUpperCase()}</div>
              <span className={`badge ${org.plan}`}>Active</span>
            </div>
          </div>
          <div className="note" style={{ maxWidth: 520 }}>
            Tip: เดโม flow SaaS ให้ครบ — เลือก plan → กลับไป subscription เห็นค่า usage เปลี่ยนจริง
          </div>
        </div>

        <div className="cards">
          {plans.map((p) => (
            <div key={p.id} className={`plan ${p.id} ${p.featured ? "featured" : ""}`}>
              <div className="row">
                <div className="plan-name">{p.name}</div>
                {p.featured && <span className="badge pro">Recommended</span>}
              </div>

              <div>
                <div className="plan-price">{p.price}</div>
                <div className="plan-unit">{p.unit}</div>
              </div>

              <ul className="ul">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              <div className="sep" />

              {org.plan === p.id ? (
                <button className="btn" type="button" disabled style={{ opacity: 0.65 }}>
                  Current Plan
                </button>
              ) : (
                <button className="btn primary" type="button" onClick={() => pick(p.id)}>
                  Select {p.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
