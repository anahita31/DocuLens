
import "./LandingPage.css";

function LandingPage({ onLogin, onSignUp }) {
  const features = [
    {
      number: "01",
      icon: "▤",
      title: "Document intelligence",
      description:
        "Organise application documents and identify missing or incomplete submissions before review.",
    },
    {
      number: "02",
      icon: "✓",
      title: "Preliminary verification",
      description:
        "Assist reviewers with document validity, expiry checks and consistency across submitted records.",
    },
    {
      number: "03",
      icon: "⇄",
      title: "Record comparison",
      description:
        "Compare institution details across application documents and available reference records.",
    },
    {
      number: "04",
      icon: "◷",
      title: "Transparent review",
      description:
        "Keep review observations, application progress and recorded workflow activity organised.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Submit",
      description:
        "Institutions provide their application details and supporting documents.",
    },
    {
      number: "02",
      title: "Review",
      description:
        "DocuLens assists with completeness checks and preliminary document analysis.",
    },
    {
      number: "03",
      title: "Resolve",
      description:
        "Reviewers examine flagged items and institutions can respond to requests.",
    },
    {
      number: "04",
      title: "Decide",
      description:
        "Authorised officials make regulatory decisions through the applicable process.",
    },
  ];

  return (
    <div className="landing-page">
      <header className="landing-header">
        <a
          className="landing-brand"
          href="#home"
          aria-label="DocuLens home"
        >
          <span className="landing-brand-mark">
            D<span>.</span>
          </span>

          <span className="landing-brand-copy">
            <strong>DocuLens</strong>
            <small>APPROVAL INTELLIGENCE</small>
          </span>
        </a>

        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#workflow">How it works</a>
          <a href="#about">About</a>
        </nav>

        <div className="landing-header-actions">
          <button
            type="button"
            className="landing-login-button"
            onClick={onLogin}
          >
            Sign in
          </button>

          <button
            type="button"
            className="landing-primary-button landing-header-cta"
            onClick={onSignUp}
          >
            Get started <span>→</span>
          </button>
        </div>
      </header>

      <main>
        <section className="landing-hero" id="home">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">
              <span className="landing-eyebrow-dot" />
              SMARTER APPLICATION REVIEW
            </div>

            <h1>
              Clarity in every
              <br />
              document.
              <br />
              <span>Confidence in every review.</span>
            </h1>

            <p className="landing-hero-description">
              A unified workspace for institutional approval
              applications. Organise documents, identify discrepancies
              and support transparent, human-led regulatory review.
            </p>

            <div className="landing-hero-actions">
              <button
                type="button"
                className="landing-primary-button"
                onClick={onSignUp}
              >
                Access your workspace <span>→</span>
              </button>

              <a
                href="#workflow"
                className="landing-secondary-link"
              >
                Explore the workflow <span>↓</span>
              </a>
            </div>

            <div className="landing-trust-note">
              <span className="landing-trust-icon">✓</span>
              AI-assisted checks. Human-led decisions.
            </div>
          </div>

          <div className="landing-hero-visual">
            <div className="landing-visual-decoration decoration-one" />
            <div className="landing-visual-decoration decoration-two" />

            <div className="landing-document-card">
              <div className="landing-document-top">
                <div className="landing-document-icon">D.</div>

                <div>
                  <strong>Application overview</strong>
                  <span>Illustrative workspace preview</span>
                </div>

                <span className="landing-document-menu">···</span>
              </div>

              <div className="landing-document-reference">
                <span>APPLICATION REFERENCE</span>
                <strong>EOA-2026-0248</strong>
              </div>

              <div className="landing-document-divider" />

              <div className="landing-document-section-heading">
                <strong>Document checklist</strong>
                <span>3 of 4 shown</span>
              </div>

              <div className="landing-document-row">
                <span className="landing-file-symbol">PDF</span>
                <span className="landing-file-copy">
                  <strong>Application form</strong>
                  <small>Document received</small>
                </span>
                <span className="landing-file-check">✓</span>
              </div>

              <div className="landing-document-row">
                <span className="landing-file-symbol">PDF</span>
                <span className="landing-file-copy">
                  <strong>Previous approval letter</strong>
                  <small>Document received</small>
                </span>
                <span className="landing-file-check">✓</span>
              </div>

              <div className="landing-document-row">
                <span className="landing-file-symbol">PDF</span>
                <span className="landing-file-copy">
                  <strong>Faculty details</strong>
                  <small>Illustrative review status</small>
                </span>
                <span className="landing-file-review">Review</span>
              </div>

              <div className="landing-document-footer">
                <span className="landing-footer-indicator" />
                Sample interface · Not a live verification
              </div>
            </div>

            <div className="landing-floating-note">
              <span className="landing-floating-icon">⇄</span>
              <div>
                <strong>Cross-record comparison</strong>
                <span>Designed to support reviewer checks</span>
              </div>
            </div>

            <div className="landing-visual-caption">
              DOCUMENTS <span>·</span> RECORDS <span>·</span> REVIEW
            </div>
          </div>
        </section>

        <section className="landing-principles">
          <div>
            <span className="landing-principle-mark">01</span>
            <span>Structured document intake</span>
          </div>

          <div>
            <span className="landing-principle-mark">02</span>
            <span>Evidence-led preliminary checks</span>
          </div>

          <div>
            <span className="landing-principle-mark">03</span>
            <span>Human oversight throughout</span>
          </div>
        </section>

        <section
          className="landing-features landing-section"
          id="features"
        >
          <div className="landing-section-heading">
            <div>
              <div className="landing-eyebrow">
                BUILT FOR THE REVIEW WORKFLOW
              </div>

              <h2>
                Less document chaos.
                <br />
                <span>More review clarity.</span>
              </h2>
            </div>

            <p>
              Bring essential application-review activities into one
              structured workspace, with clear evidence and reviewer
              oversight.
            </p>
          </div>

          <div className="landing-feature-grid">
            {features.map((feature) => (
              <article
                className="landing-feature-card"
                key={feature.number}
              >
                <div className="landing-feature-top">
                  <span className="landing-feature-icon">
                    {feature.icon}
                  </span>
                  <span className="landing-feature-number">
                    {feature.number}
                  </span>
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="landing-feature-line" />
              </article>
            ))}
          </div>
        </section>

        <section
          className="landing-workflow landing-section"
          id="workflow"
        >
          <div className="landing-workflow-heading">
            <div className="landing-eyebrow">
              A CLEARER PROCESS
            </div>

            <h2>From submission to review.</h2>

            <p>
              A structured workflow that supports applicants and
              reviewers without replacing regulatory judgement.
            </p>
          </div>

          <div className="landing-steps">
            {steps.map((step) => (
              <article className="landing-step" key={step.number}>
                <span className="landing-step-number">
                  {step.number}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-about" id="about">
          <div className="landing-about-symbol">D.</div>

          <div className="landing-about-copy">
            <div className="landing-eyebrow">
              RESPONSIBLE BY DESIGN
            </div>

            <h2>Technology can assist. People remain accountable.</h2>

            <p>
              DocuLens is designed to help organise evidence and surface
              items for review. A mismatch or unavailable reference is
              not, by itself, proof of fraud or non-compliance. Final
              regulatory decisions remain with authorised officials.
            </p>
          </div>

          <button
            type="button"
            className="landing-primary-button"
            onClick={onLogin}
          >
            Enter DocuLens <span>→</span>
          </button>
        </section>
      </main>

      <footer className="landing-footer">
        <a className="landing-footer-brand" href="#home">
          DocuLens<span>.</span>
        </a>

        <span>
          Preliminary application review assistance
        </span>

        <span>AI-assisted, human-led review</span>
      </footer>
    </div>
  );
}

export default LandingPage;
