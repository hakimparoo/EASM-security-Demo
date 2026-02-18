import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Auth.css";



export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");

  const onConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    // mock: ส่งอีเมลรีเซ็ต แล้วไปหน้า reset
    nav("/reset-password", { replace: true });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
              <img src={logo} alt="EASM" style={{ width: 56, height: 56 }} />
            </div>
          <div className="auth-title">Log in</div>
          <div className="auth-desc">
            Please enter your email address to ensure the password reset and correction
            process is accurate and secure.
          </div>
        </div>

        <form className="auth-form" onSubmit={onConfirm}>
          <div className="auth-field">
            <div className="auth-label">Email</div>
            <input
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-minirow">
            <button className="auth-cancel" type="button" onClick={() => nav("/login")}>
              Cancel
            </button>
          </div>

          <button className="auth-btn primary" type="submit" disabled={!email.trim()}>
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}
