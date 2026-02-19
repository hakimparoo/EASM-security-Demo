import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Subscription.css";

type SubscriptionInfo = {
  name: string;
  type: string;
  startDate: string; // dd/mm/yyyy
  expiredDate: string; // dd/mm/yyyy
};

function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

function InfoIcon() {
  return (
    <span className="sub-infoIcon" aria-hidden="true">
      i
    </span>
  );
}

function DiamondIcon() {
  return (
    <svg
      className="sub-diamond"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21 3.5 9.5 7.5 3h9l4 6.5L12 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 3 12 21 16.5 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M3.5 9.5h17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}

export default function SubscriptionPage() {
  const navigate = useNavigate();

  // mock data (ยังไม่ต่อ API)
  const data: SubscriptionInfo = useMemo(
    () => ({
      name: "Premium ASM",
      type: "Standard",
      startDate: "01/01/2025",
      expiredDate: "01/01/2026",
    }),
    []
  );

  const onViewPlan = () => {
    // ให้กดได้จริง: ไปหน้า subscription plan (ปรับ path ให้ตรง route ของคุณได้)
    navigate("/subscription-plan");
  };

  return (
    <div className="sub-wrap">
      <h1 className="sub-title">Subscription</h1>

      <section className="sub-card">
        <div className="sub-cardHead">
          <div className="sub-cardHeadLeft">
            <InfoIcon />
            <div className="sub-cardHeadText">information</div>
          </div>
        </div>

        <div className="sub-divider" />

        <div className="sub-grid">
          <div className="sub-row">
            <div className="sub-label">Subscription Name:</div>
            <div className="sub-value">{data.name}</div>
          </div>

          <div className="sub-row">
            <div className="sub-label">Subscription Type:</div>
            <div className="sub-value">{data.type}</div>
          </div>

          <div className="sub-row sub-row--date">
            <div className="sub-label">Subscription Date:</div>
            <div className="sub-value">
              <div className="sub-dateLine">
                <span className="sub-dateStart">Start:</span>{" "}
                <span className="sub-dateText">{data.startDate}</span>
              </div>
              <div className="sub-dateLine">
                <span className="sub-dateExpired">Expired:</span>{" "}
                <span className="sub-dateText">{data.expiredDate}</span>
              </div>
            </div>
          </div>
        </div>
         <div className="sub-divider" />
        <button type="button" className="sub-viewPlan" onClick={onViewPlan}>
        <DiamondIcon />
        <span>view subscription plan</span>
      </button>
      </section>

      
      
    </div>
  );
}
