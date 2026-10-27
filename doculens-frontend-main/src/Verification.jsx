
import { useState } from "react";
import "./Verification.css";

const initialChecks = [
  {
    id: "document",
    title: "Document completeness",
    description: "Confirm that required document categories are present.",
  },
  {
    id: "expiry",
    title: "Validity and expiry",
    description: "Review dates and validity periods shown on documents.",
  },
  {
    id: "institution",
    title: "Institution details",
    description: "Compare institution identifiers and names across records.",
  },
  {
    id: "consistency",
    title: "Cross-document consistency",
    description: "Identify fields that may require reconciliation.",
  },
  {
    id: "source",
    title: "Issuing-source verification",
    description: "Record whether an authorised issuing source was checked.",
  },
];

const outcomes = [
  "Not reviewed",
  "No issue identified",
  "Needs attention",
  "Unable to verify",
];

function Verification({ application, onBack }) {
  const [checks, setChecks] = useState({});
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const reviewedCount = initialChecks.filter(
    (check) => checks[check.id] && checks[check.id] !== "Not reviewed"
  ).length;

  function updateCheck(id, value) {
    setChecks((current) => ({ ...current, [id]: value }));
    setSavedMessage("");
  }

  function handleSave(event) {
    event.preventDefault();

    setSavedMessage(
      "Review draft prepared in this browser session. It has not been saved to the backend."
    );
  }

  return (
    <div className="verification-page">
      <div className="verification-breadcrumb">
        <button type="button" onClick={onBack}>Workspace</button>
        <span>/</span>
        <button type="button" onClick={onBack}>Applications</button>
        <span>/</span>
        <strong>Verification</strong>
      </div>

      <div className="verification-heading">
        <div>
          <div className="verification-eyebrow">REVIEW WORKSPACE</div>
          <h1>Preliminary verification</h1>
          <p>
            Review supporting information and record observations for an
            authorised reviewer.
          </p>
        </div>

        <span className="verification-demo-badge">Demo workspace</span>
      </div>

      <div className="verification-notice">
        <span className="verification-notice-icon">i</span>
        <p>
          <strong>Human review required.</strong> These checks assist preliminary
          assessment. They do not establish fraud, authenticity or regulatory
          compliance, and must not be used as an automated approval decision.
        </p>
      </div>

      <section className="verification-application-card">
        <div className="verification-application-top">
          <div className="verification-application-icon">▤</div>
          <div className="verification-application-identity">
            <span>APPLICATION REFERENCE</span>
            <h2>{application?.id || "No application selected"}</h2>
            <p>
              {application?.institution ||
                "Open a record from the application register to begin."}
            </p>
          </div>
          <span className="verification-status">
            {application?.status || "Not selected"}
          </span>
        </div>

        {application && (
          <div className="verification-application-meta">
            <div>
              <span>Application type</span>
              <strong>{application.type}</strong>
            </div>
            <div>
              <span>Submitted</span>
              <strong>{application.submitted || "Not provided"}</strong>
            </div>
            <div>
              <span>Review progress</span>
              <strong>{reviewedCount} of {initialChecks.length} checks reviewed</strong>
            </div>
          </div>
        )}
      </section>

      <form onSubmit={handleSave}>
        <section className="verification-panel">
          <div className="verification-panel-heading">
            <div>
              <h2>Verification checklist</h2>
              <p>Record the current review outcome for each check.</p>
            </div>
            <span className="verification-count">
              {reviewedCount}/{initialChecks.length}
            </span>
          </div>

          <div className="verification-progress-track">
            <div
              className="verification-progress-fill"
              style={{
                width: `${(reviewedCount / initialChecks.length) * 100}%`,
              }}
            />
          </div>

          <div className="verification-check-list">
            {initialChecks.map((check, index) => (
              <div className="verification-check-row" key={check.id}>
                <div className="verification-check-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="verification-check-copy">
                  <strong>{check.title}</strong>
                  <p>{check.description}</p>
                </div>

                <label className="verification-outcome-field">
                  <span className="visually-hidden">
                    Outcome for {check.title}
                  </span>
                  <select
                    value={checks[check.id] || "Not reviewed"}
                    onChange={(event) =>
                      updateCheck(check.id, event.target.value)
                    }
                  >
                    {outcomes.map((outcome) => (
                      <option key={outcome}>{outcome}</option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="verification-panel">
          <div className="verification-panel-heading">
            <div>
              <h2>Reviewer notes</h2>
              <p>Document observations, discrepancies and follow-up actions.</p>
            </div>
          </div>

          <label className="verification-notes-field">
            <span>Review observations</span>
            <textarea
              value={reviewNotes}
              onChange={(event) => {
                setReviewNotes(event.target.value);
                setSavedMessage("");
              }}
              rows={5}
              maxLength={3000}
              placeholder="Record factual observations, supporting evidence and any follow-up needed..."
            />
            <small>{reviewNotes.length}/3000 characters</small>
          </label>

          <label className="verification-reviewer-field">
            <span>Reviewer name or staff reference</span>
            <input
              value={reviewerName}
              onChange={(event) => {
                setReviewerName(event.target.value);
                setSavedMessage("");
              }}
              maxLength={120}
              placeholder="Enter reviewer reference"
            />
          </label>

          {savedMessage && (
            <div className="verification-save-message" role="status">
              {savedMessage}
            </div>
          )}

          <div className="verification-actions">
            <button
              type="button"
              className="verification-secondary-button"
              onClick={onBack}
            >
              Back
            </button>

            <button
              type="submit"
              className="verification-primary-button"
              disabled={!application}
            >
              Prepare review draft →
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}

export default Verification;
