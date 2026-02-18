import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Auth.css";


export default function ResetPassword() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const rules = useMemo(() => {
    const lenOk = pw.length >= 8;
    const specialOk = /[^A-Za-z0-9]/.test(pw);
    const matchOk = pw.length > 0 && pw === pw2;
    return { lenOk, specialOk, matchOk };
  }, [pw, pw2]);

  const canSubmit = rules.lenOk && rules.specialOk && rules.matchOk;

  const onReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // mock reset ok -> back to login
    nav("/login", { replace: true });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
              <img src={logo} alt="EASM" style={{ width: 56, height: 56 }} />
            </div>
          <div className="auth-title">Set A New Password</div>
          <div className="auth-desc">
            Create a new password. Ensure it differs from previous one for security.
          </div>
        </div>

        <form className="auth-form" onSubmit={onReset}>
          <div className="auth-field">
            <div className="auth-label">New password</div>
            <input
              className="auth-input"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="auth-field">
            <div className="auth-label">Confirm password</div>
            <input
              className="auth-input"
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="rules">
            <div className={`rule ${rules.lenOk ? "ok" : ""}`}>
              <span className="dot">{rules.lenOk ? "✓" : ""}</span>
              Must be at least 8 characters
            </div>
            <div className={`rule ${rules.specialOk ? "ok" : ""}`}>
              <span className="dot">{rules.specialOk ? "✓" : ""}</span>
              Must contain one special character
            </div>
          </div>

          <div className="auth-minirow">
            <button className="auth-cancel" type="button" onClick={() => nav("/login")}>
              Cancel
            </button>
          </div>

          <button className="auth-btn primary" type="submit" disabled={!canSubmit}>
            Reset New Password
          </button>
        </form>
      </div>
    </div>
  );
}
