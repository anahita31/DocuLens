
import { useState } from "react";
import "./LoginPage.css";

function LoginPage({
  onBack,
  onSignUp,
  onLoginSuccess,
  onForgotPassword,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!demoMode) {
      setError(
        "Authentication is not connected yet. Enable demo mode to preview the dashboard."
      );
      return;
    }

    const reviewerAccount =
      normalizedEmail.startsWith("reviewer@") ||
      normalizedEmail.startsWith("admin@");

    const userDetails = {
      name: reviewerAccount
        ? "Demo Reviewer"
        : normalizedEmail
            .split("@")[0]
            .split(/[._-]/)
            .map(
              (part) =>
                part.charAt(0).toUpperCase() + part.slice(1)
            )
            .join(" "),
      email: normalizedEmail,
      role: reviewerAccount ? "reviewer" : "institution",
      rememberMe,
      demo: true,
    };

    if (typeof onLoginSuccess === "function") {
      onLoginSuccess(userDetails);
    } else {
      setError(
        "The login page is not connected to the app navigation yet."
      );
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <button
          type="button"
          className="login-back-button"
          onClick={onBack}
        >
          <span aria-hidden="true">←</span> Back
        </button>

        <div className="login-brand">
          <div className="login-brand-mark" aria-hidden="true">
            <span>D</span>
          </div>

          <div>
            <h1>DocuLens</h1>
            <p>Approval Intelligence</p>
          </div>
        </div>

        <div className="login-heading">
          <p className="login-eyebrow">WELCOME BACK</p>
          <h2>Sign in to your workspace</h2>
          <p>
            Access your applications, documents, and preliminary
            validation updates.
          </p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@institution.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <div className="login-password-label">
              <label htmlFor="login-password">Password</label>

              <button
                type="button"
                className="login-text-button"
                onClick={onForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <div className="login-password-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

              <button
                type="button"
                className="login-show-password"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <label className="login-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) =>
                setRememberMe(event.target.checked)
              }
            />
            <span>Remember me on this device</span>
          </label>

          <div className="login-demo-notice">
            <label className="login-demo-toggle">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(event) => {
                  setDemoMode(event.target.checked);
                  setError("");
                }}
              />
              <span>
                <strong>Enable demo mode</strong>
                <small>
                  Preview the interface without real authentication.
                </small>
              </span>
            </label>

            {demoMode && (
              <p className="login-demo-warning">
                Demo only. Emails beginning with reviewer@ or admin@
                open the reviewer preview. Other emails open the
                institution preview. These prefixes do not grant real
                permissions.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="login-submit-button"
          >
            Sign in <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="login-divider">
          <span>NEW TO DOCULENS?</span>
        </div>

        <p className="login-signup-prompt">
          Need an account?{" "}
          <button
            type="button"
            className="login-text-button"
            onClick={onSignUp}
          >
            Request access
          </button>
        </p>

        <p className="login-security-note">
          <span aria-hidden="true">◆</span> Preliminary validation
          assistance only. Final regulatory decisions remain with
          authorized officials.
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
