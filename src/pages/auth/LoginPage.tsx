import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrganization } from "../../contexts/OrganizationContext";
import logo from "../../assets/logo.png";
import "./Auth.css";



export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useOrganization();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!email.trim() || !password.trim()) {
      setErr("Please enter email and password.");
      return;
    }

    // mock login
    login(email, password);
    nav("/", { replace: true });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo">
              <img src={logo} alt="EASM" style={{ width: 56, height: 56 }} />
            </div>
          </div>
          <div className="auth-title">Log in</div>
        </div>

        <div className="auth-social">
          <button className="auth-btn" type="button" onClick={() => alert("Google login (mock)")}>
            <span style={{ fontWeight: 900 }}>G</span> Log in with google
          </button>

          <button className="auth-btn" type="button" onClick={() => alert("Passkey login (mock)")}>
            <span style={{ fontWeight: 900 }}>👤</span> Log in with passkey
          </button>
        </div>

        <div className="auth-divider">or</div>

        <form className="auth-form" onSubmit={onSubmit}>
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

          <div className="auth-field">
            <div className="auth-label">password</div>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div className="auth-linkrow">
            <Link className="auth-link" to="/forgot-password">
              forgot your password ?
            </Link>
          </div>

          {err && <div className="auth-error">{err}</div>}

          <button className="auth-btn primary" type="submit">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
