
import { useMemo, useState } from "react";
import "./RecordComparison.css";

const initialFields = [
  {
    id: "institutionName",
    label: "Institution name",
    submitted: "",
    reference: "",
  },
  {
    id: "institutionId",
    label: "Institution ID",
    submitted: "",
    reference: "",
  },
  {
    id: "address",
    label: "Institution address",
    submitted: "",
    reference: "",
  },
  {
    id: "applicationType",
    label: "Application type",
    submitted: "",
    reference: "",
  },
  {
    id: "academicYear",
    label: "Academic year",
    submitted: "",
    reference: "",
  },
];

function normalize(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function RecordComparison({ onBack }) {
  const [applicationReference, setApplicationReference] = useState("");
  const [referenceSource, setReferenceSource] = useState("");
  const [fields, setFields] = useState(initialFields);
  const [comparisonRun, setComparisonRun] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const results = useMemo(() => {
    return fields.map((field) => {
      const submitted = field.submitted.trim();
      const reference = field.reference.trim();

      let status = "incomplete";

      if (submitted && reference) {
        status =
          normalize(submitted) === normalize(reference)
            ? "match"
            : "difference";
      }

      return {
        ...field,
        status,
      };
    });
  }, [fields]);

  const completedFields = results.filter(
    (field) => field.submitted.trim() && field.reference.trim()
  ).length;

  const matchCount = results.filter(
    (field) => field.status === "match"
  ).length;

  const differenceCount = results.filter(
    (field) => field.status === "difference"
  ).length;

  function updateField(id, key, value) {
    setFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );

    setComparisonRun(false);
  }

  function handleCompare(event) {
    event.preventDefault();
    setComparisonRun(true);
  }

  function handleReset() {
    setApplicationReference("");
    setReferenceSource("");
    setFields(initialFields.map((field) => ({ ...field })));
    setComparisonRun(false);
    setReviewNote("");
  }

  return (
    <div className="comparison-page">
      <div className="comparison-breadcrumb">
        <button type="button" onClick={onBack}>
          Workspace
        </button>
        <span>/</span>
        <strong>Record comparison</strong>
      </div>

      <div className="comparison-heading">
        <div>
          <div className="comparison-eyebrow">
            RECORD REVIEW WORKSPACE
          </div>
          <h1>Record comparison</h1>
          <p>
            Compare submitted information against a reference record
            and identify differences that may need review.
          </p>
        </div>

        <span className="comparison-demo-badge">
          Manual comparison
        </span>
      </div>

      <div className="comparison-notice">
        <span className="comparison-notice-icon">i</span>
        <div>
          <strong>Differences are review indicators, not conclusions.</strong>
          <p>
            This tool compares text entered by the reviewer. It does not
            connect to an official database or verify the authenticity
            of either record. Confirm findings with authorised sources.
          </p>
        </div>
      </div>

      <form onSubmit={handleCompare}>
        <section className="comparison-panel">
          <div className="comparison-panel-heading">
            <div>
              <h2>Comparison details</h2>
              <p>
                Identify the application and the source of the reference
                information.
              </p>
            </div>
          </div>

          <div className="comparison-form-grid">
            <label className="comparison-field">
              <span>Application reference</span>
              <input
                value={applicationReference}
                onChange={(event) => {
                  setApplicationReference(event.target.value);
                  setComparisonRun(false);
                }}
                placeholder="e.g. EOA-2026-0248"
                maxLength={100}
              />
            </label>

            <label className="comparison-field">
              <span>Reference record source</span>
              <input
                value={referenceSource}
                onChange={(event) => {
                  setReferenceSource(event.target.value);
                  setComparisonRun(false);
                }}
                placeholder="e.g. Authorised registry record"
                maxLength={200}
              />
            </label>
          </div>
        </section>

        <section className="comparison-panel">
          <div className="comparison-panel-heading">
            <div>
              <h2>Compare information</h2>
              <p>
                Enter the values from the application and the reference
                record. All fields are optional.
              </p>
            </div>

            <span className="comparison-field-count">
              {fields.length} fields
            </span>
          </div>

          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>FIELD</th>
                  <th>SUBMITTED INFORMATION</th>
                  <th>REFERENCE INFORMATION</th>
                  {comparisonRun && <th>RESULT</th>}
                </tr>
              </thead>

              <tbody>
                {results.map((field) => (
                  <tr key={field.id}>
                    <td>
                      <span className="comparison-field-label">
                        {field.label}
                      </span>
                    </td>

                    <td>
                      <input
                        aria-label={`${field.label}: submitted information`}
                        value={field.submitted}
                        onChange={(event) =>
                          updateField(
                            field.id,
                            "submitted",
                            event.target.value
                          )
                        }
                        placeholder="Enter submitted value"
                      />
                    </td>

                    <td>
                      <input
                        aria-label={`${field.label}: reference information`}
                        value={field.reference}
                        onChange={(event) =>
                          updateField(
                            field.id,
                            "reference",
                            event.target.value
                          )
                        }
                        placeholder="Enter reference value"
                      />
                    </td>

                    {comparisonRun && (
                      <td>
                        <span
                          className={`comparison-result comparison-result-${field.status}`}
                        >
                          {field.status === "match"
                            ? "Match"
                            : field.status === "difference"
                              ? "Difference"
                              : "Incomplete"}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="comparison-actions">
            <button
              type="button"
              className="comparison-secondary-button"
              onClick={handleReset}
            >
              Clear fields
            </button>

            <button
              type="submit"
              className="comparison-primary-button"
            >
              Compare records →
            </button>
          </div>
        </section>
      </form>

      {comparisonRun && (
        <section className="comparison-panel comparison-results-panel">
          <div className="comparison-panel-heading">
            <div>
              <h2>Comparison summary</h2>
              <p>
                Text-based comparison results for the entered values.
              </p>
            </div>
            <span className="comparison-demo-badge">
              Not an official verification
            </span>
          </div>

          <div className="comparison-summary-grid">
            <article className="comparison-summary-card">
              <span>Fields compared</span>
              <strong>{completedFields}</strong>
              <small>of {fields.length} available fields</small>
            </article>

            <article className="comparison-summary-card">
              <span>Matching values</span>
              <strong>{matchCount}</strong>
              <small>Text values match after normalisation</small>
            </article>

            <article className="comparison-summary-card">
              <span>Differences</span>
              <strong>{differenceCount}</strong>
              <small>Require contextual review</small>
            </article>
          </div>

          {completedFields < fields.length && (
            <p className="comparison-incomplete-note">
              {fields.length - completedFields} field(s) still need both
              values before they can be compared.
            </p>
          )}

          <label className="comparison-field comparison-review-note">
            <span>Reviewer observations</span>
            <textarea
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Record the source checked, differences observed, and follow-up required..."
            />
            <small>{reviewNote.length}/2000 characters</small>
          </label>

          <p className="comparison-disclaimer">
            This summary is calculated in the browser and is not saved
            to the backend. A text difference may result from formatting,
            abbreviations, outdated information or data-entry errors.
            It does not establish fraud or non-compliance.
          </p>
        </section>
      )}
    </div>
  );
}

export default RecordComparison;
