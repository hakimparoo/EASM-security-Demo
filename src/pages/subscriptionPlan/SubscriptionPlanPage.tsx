import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../subscription/Subscription.css"

type PlanKey = "free" | "pro";

type Plan = {
  key: PlanKey;
  title: string;
  priceBig: string;
  priceUnit: string;
  priceSub?: string;
  buttonText: string;
  isCurrent?: boolean;
  features: string[];
};

function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

export default function SubscriptionPage() {
  const navigate = useNavigate();

  // mock: แผนปัจจุบัน (ปรับจาก state/Context ได้ทีหลัง)
  const [currentPlan, setCurrentPlan] = useState<PlanKey>("free");

  const plans: Plan[] = useMemo(
    () => [
      {
        key: "free",
        title: "free trial",
        priceBig: "0",
        priceUnit: "Bath/",
        priceSub: "14 day (first attempt)",
        buttonText: "your current plan",
        isCurrent: currentPlan === "free",
        features: [
          "cannot doing user management",
          "view information like a full plan",
          "single account.",
          "limit in 14 days",
        ],
      },
      {
        key: "pro",
        title: "pro",
        priceBig: "2k",
        priceUnit: "Bath/",
        priceSub: "month",
        buttonText: "select",
        isCurrent: currentPlan === "pro",
        features: [
          "doing user management",
          "provide admin account",
          "manage organization profile",
          "view user log",
        ],
      },
    ],
    [currentPlan]
  );

  const onClose = () => {
    navigate(-1);
  };

  const onSelectPlan = (key: PlanKey) => {
    if (key === currentPlan) return;

    // mock flow: เลือกแผน → เซฟ state → ไปหน้า subscription
    setCurrentPlan(key);
    window.alert(`Selected plan: ${key.toUpperCase()} (mock)`);
    navigate("/subscription"); // ปรับ route ให้ตรงโปรเจคคุณได้
  };

  const styles = {
    page: {
      minHeight: "calc(100vh - 64px)", // เผื่อ topbar สูง 64
      padding: "18px 24px 40px",
      boxSizing: "border-box" as const,
      background:
        "radial-gradient(1200px 700px at 30% 40%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%), linear-gradient(90deg, #070a4a 0%, #0b0f5c 35%, #0f14a6 100%)",
      position: "relative" as const,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    closeBtn: {
      position: "absolute" as const,
      top: "22px",
      right: "28px",
      width: "44px",
      height: "44px",
      border: "0",
      background: "transparent",
      color: "rgba(255,255,255,0.85)",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
    },
    container: {
      width: "min(980px, 96%)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "28px",
      alignItems: "stretch",
    },
    card: {
      background: "rgba(70, 75, 190, 0.35)",
      border: "1.5px solid rgba(255,255,255,0.55)",
      borderRadius: "18px",
      boxShadow: "0 0 26px rgba(0,0,0,0.35)",
      padding: "26px 28px",
      color: "#fff",
      position: "relative" as const,
      overflow: "hidden" as const,
      minHeight: "540px",
    },
    cardGlow: {
      position: "absolute" as const,
      inset: "-60px",
      background:
        "radial-gradient(520px 280px at 50% 35%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 65%)",
      pointerEvents: "none" as const,
    },
    title: {
      textAlign: "center" as const,
      fontSize: "34px",
      fontWeight: 900,
      textTransform: "lowercase" as const,
      margin: "6px 0 26px",
      letterSpacing: "0.3px",
    },
    priceRow: {
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: "14px",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "18px",
      marginBottom: "26px",
    },
    priceBig: {
      fontSize: "86px",
      fontWeight: 900,
      lineHeight: 1,
      letterSpacing: "-1px",
    },
    priceMeta: {
      display: "grid",
      gap: "2px",
      alignContent: "center" as const,
      fontSize: "18px",
      opacity: 0.95,
    },
    btnWrap: {
      display: "flex",
      justifyContent: "center",
      margin: "20px 0 20px",
    },
    btn: {
      height: "54px",
      minWidth: "260px",
      borderRadius: "999px",
      border: "1.5px solid rgba(255,255,255,0.65)",
      background: "rgba(255,255,255,0.12)",
      color: "#0b0b0b",
      fontWeight: 800,
      fontSize: "22px",
      cursor: "pointer",
      padding: "0 26px",
    },
    btnPrimary: {
      background: "rgba(255,255,255,0.78)",
      border: "1.5px solid rgba(255,255,255,0.78)",
      color: "#111",
    },
    btnDisabled: {
      background: "rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.75)",
      cursor: "default",
    },
    featureList: {
      margin: "22px 0 0",
      paddingLeft: "18px",
      listStyleType: "disc" as const,
      opacity: 0.92,
      fontSize: "16px",
      lineHeight: 1.35,
    },
    featureItem: {
      margin: "6px 0",
    },
    dividerLine: {
      height: "1px",
      background: "rgba(255,255,255,0.25)",
      width: "100%",
      marginTop: "18px",
    },
    responsive: `
      @media (max-width: 900px) {
        .subplan-grid { grid-template-columns: 1fr !important; }
      }
    `,
  };

  return (
    <div style={styles.page}>
      <style>{styles.responsive}</style>

      <button type="button" style={styles.closeBtn} onClick={onClose} aria-label="Close">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="subplan-grid" style={styles.container}>
        {plans.map((p) => {
          const isCurrent = p.isCurrent;

          return (
            <div key={p.key} style={styles.card}>
              <div style={styles.cardGlow} />

              <div style={styles.title}>{p.title}</div>

              <div style={styles.priceRow}>
                <div style={styles.priceBig}>{p.priceBig}</div>
                <div style={styles.priceMeta}>
                  <div>{p.priceUnit}</div>
                  <div>{p.priceSub}</div>
                </div>
              </div>

              <div style={styles.btnWrap}>
                <button
                  type="button"
                  onClick={() => onSelectPlan(p.key)}
                  disabled={isCurrent}
                  style={{
                    ...styles.btn,
                    ...(p.key === "pro" ? styles.btnPrimary : {}),
                    ...(isCurrent ? styles.btnDisabled : {}),
                  }}
                >
                  {isCurrent ? "your current plan" : "select"}
                </button>
              </div>

              <div style={styles.dividerLine} />

              <ul style={styles.featureList}>
                {p.features.map((f, idx) => (
                  <li key={idx} style={styles.featureItem}>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
