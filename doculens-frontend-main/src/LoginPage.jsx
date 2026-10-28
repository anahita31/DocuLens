
import { useState } from "react";
import "./LoginPage.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const LOGIN_ENDPOINT = import.meta.env.VITE_LOGIN_ENDPOINT || "";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!LOGIN_ENDPOINT) {
      setError(
        "Login API is not configured. Set VITE_LOGIN_ENDPOINT to the backend team's login route."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/${LOGIN_ENDPOINT.replace(/^\/+/, "")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        }
      );

      const responseText = await response.text();
      let data = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        const message =
          data && typeof data === "object"
            ? data.detail ||
              data.message ||
              data.error ||
              "Login failed. Please check your credentials."
            : "Login failed. Please check your credentials.";

        throw new Error(message);
      }

      if (!data || typeof data !== "object") {
        throw new Error(
          "The server returned an invalid login response."
        );
      }

      // Accept common response shapes, but never infer a role from email.
      const user = data.user || data;

      const authenticated =
        data.authenticated === true ||
        data.success === true ||
        Boolean(data.access_token || data.token) ||
        response.ok;

      if (!authenticated) {
        throw new Error("The server did not confirm authentication.");
      }

      const role = user.role || user.account_type;

      if (!role) {
        throw new Error(
          "Login response is missing the user's role. Please contact the backend team."
        );
      }

      // Do not store passwords or invent an authenticated user.
      // The backend must implement its agreed cookie/token strategy.
      onLoginSuccess?.({
        id: user.id ?? user.user_id ?? null,
        name: user.full_name || user.name || "",
        email: user.email || normalizedEmail,
        institution:
          user.institution_name || user.institution || "",
        role,
        token: data.access_token || data.token || null,
        rememberMe,
      });
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot reach the login service. Check the API URL and server availability."
          : err.message || "Unable to log in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <button
          className="login-back-button"
          type="button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="login-brand">
          <div className="login-brand-mark" aria-hidden="true">
            D
          </div>
          <span>DocuLens</span>
        </div>

        <h1 className="login-heading">Welcome back</h1>
        <p>Sign in to your DocuLens account.</p>

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
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@institution.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="login-field">
            <div className="login-password-label">
              <label htmlFor="login-password">Password</label>

              {onForgotPassword && (
                <button
                  className="login-text-button"
                  type="button"
                  onClick={onForgotPassword}
                  disabled={isSubmitting}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <div className="login-password-wrapper">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isSubmitting}
              />

              <button
                className="login-show-password"
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <span>Remember me</span>
          </label>

          <button
            className="login-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="login-divider">
          <span>New to DocuLens?</span>
        </div>

        <div className="login-signup-prompt">
          <button
            type="button"
            className="login-text-button"
            onClick={onSignUp}
            disabled={isSubmitting}
          >
            Create an account
          </button>
        </div>

        <p className="login-security-note">
          Your account access is managed by DocuLens authentication.
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
