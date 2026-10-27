import { useState } from "react";
import "./SignUpPage.css";

function SignUpPage({ onBack, onLogin, onSignUpSuccess }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [accountType, setAccountType] = useState("institution");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !institution.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid institutional email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setError("Please acknowledge the account access and data notice.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institution_name: institution,
          account_type: accountType,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (onSignUpSuccess) {
          onSignUpSuccess(data);
        } else {
          alert("Account registered successfully!");
          if (onLogin) onLogin();
        }
      } else {
        setError(data.detail || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Could not connect to the backend server. Make sure FastAPI is running.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="signup-page">
      <header className="signup-header">
        <button
          type="button"
          className="signup-brand"
          onClick={onBack}
          aria-label="Return to DocuLens home"
        >
          <span className="signup-brand-mark">
            D<span>.</span>
          </span>

          <span className="signup-brand-copy">
            <strong>DocuLens</strong>
            <small>APPROVAL INTELLIGENCE</small>
          </span>
        </button>

        <div className="signup-header-right">
          <span>Already registered?</span>
          <button type="button" onClick={onLogin}>
            Sign in
          </button>
        </div>
      </header>

      <div className="signup-layout">
        <aside className="signup-intro">
          <div className="signup-intro-decoration signup-decoration-one" />
          <div className="signup-intro-decoration signup-decoration-two" />

          <div className="signup-intro-content">
            <div className="signup-eyebrow">
              GET STARTED WITH DOCULENS
            </div>

            <h1>
              A clearer way
              <br />
              to manage <span>approvals.</span>
            </h1>

            <p>
              Create an account to organise institutional application
              documents and follow preliminary review progress in one
              workspace.
            </p>

            <div className="signup-benefit-list">
              <div className="signup-benefit">
                <span>01</span>
                <div>
                  <strong>Organised submissions</strong>
                  <p>Keep application information and document records together.</p>
                </div>
              </div>

              <div className="signup-benefit">
                <span>02</span>
                <div>
                  <strong>Transparent checks</strong>
                  <p>Identify missing information and items that need attention.</p>
                </div>
              </div>

              <div className="signup-benefit">
                <span>03</span>
                <div>
                  <strong>Human-led review</strong>
                  <p>Support preliminary checks without automating final decisions.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="signup-intro-footer">
            <span>DOCULENS</span>
            <span>·</span>
            <span>PRELIMINARY REVIEW ASSISTANCE</span>
          </div>
        </aside>

        <section className="signup-form-section">
          <div className="signup-form-card">
            <div className="signup-form-heading">
              <div className="signup-form-symbol">D.</div>
              <div className="signup-form-eyebrow">
                ACCOUNT REGISTRATION
              </div>
              <h2>Create your account</h2>
              <p>
                Enter your details to request access to DocuLens.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="signup-field">
                <label htmlFor="signup-name">Full name *</label>
                <input
                  id="signup-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="signup-email">Institutional email *</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@institution.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="signup-institution">Institution name *</label>
                <input
                  id="signup-institution"
                  name="institution"
                  type="text"
                  autoComplete="organization"
                  placeholder="Enter your institution's name"
                  value={institution}
                  onChange={(event) => setInstitution(event.target.value)}
                  required
                />
              </div>

              <fieldset className="signup-role-fieldset">
                <legend>Requested account type *</legend>

                <label
                  className={`signup-role-option ${
                    accountType === "institution" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value="institution"
                    checked={accountType === "institution"}
                    onChange={() => setAccountType("institution")}
                  />

                  <span className="signup-role-radio" />

                  <span className="signup-role-copy">
                    <strong>Institutional applicant</strong>
                    <small>Manage your institution's application submissions.</small>
                  </span>
                </label>

                <label
                  className={`signup-role-option ${
                    accountType === "reviewer" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value="reviewer"
                    checked={accountType === "reviewer"}
                    onChange={() => setAccountType("reviewer")}
                  />

                  <span className="signup-role-radio" />

                  <span className="signup-role-copy">
                    <strong>Reviewer access request</strong>
                    <small>Request review access; approval is required.</small>
                  </span>

                  <span className="signup-role-badge">Approval required</span>
                </label>
              </fieldset>

              <div className="signup-password-grid">
                <div className="signup-field">
                  <label htmlFor="signup-password">Password *</label>

                  <div className="signup-password-wrap">
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="signup-field">
                  <label htmlFor="signup-confirm-password">
                    Confirm password *
                  </label>

                  <div className="signup-password-wrap">
                    <input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <label className="signup-consent">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(event) => setAgreeToTerms(event.target.checked)}
                />
                <span className="signup-consent-box" />
                <span>
                  I understand that account access is subject to
                  verification and role approval, and that institutional
                  information must be handled responsibly.
                </span>
              </label>

              {error && (
                <div className="signup-error" role="alert">
                  <span>i</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                className="signup-submit-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Please wait..." : "Request account"}
                <span>→</span>
              </button>

              <p className="signup-form-disclaimer">
                Connected to local FastAPI server (`/api/register`).
              </p>
            </form>

            <div className="signup-existing-account">
              Already have an account?{" "}
              <button type="button" onClick={onLogin}>
                Sign in
              </button>
            </div>
          </div>
        </section>
      </div>

      <footer className="signup-bottom-footer">
        <span>© DocuLens · Connected Interface</span>
        <button type="button" onClick={onBack}>
          Back to home
        </button>
      </footer>
    </main>
  );
}

export default SignUpPage;