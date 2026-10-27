import { useRef, useState } from "react";
import "./documentIntake.css";

const requiredDocuments = [
  {
    id: "application",
    title: "Application form",
    description: "Completed institutional application",
    required: true,
  },
  {
    id: "approval",
    title: "Previous approval letter",
    description: "Most recent approval or EoA letter",
    required: true,
  },
  {
    id: "faculty",
    title: "Faculty details",
    description: "Faculty list and relevant qualifications",
    required: true,
  },
  {
    id: "infrastructure",
    title: "Infrastructure evidence",
    description: "Applicable facilities and infrastructure records",
    required: true,
  },
  {
    id: "affidavit",
    title: "Affidavit / undertaking",
    description: "Applicable declarations and undertakings",
    required: false,
  },
];

function DocumentIntake({ onBack }) {
  const [institution, setInstitution] = useState("");
  const [applicationType, setApplicationType] = useState("Extension of Approval");
  const [academicYear, setAcademicYear] = useState("2026–27");
  const [reference, setReference] = useState("");
  const [files, setFiles] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const fileInputRefs = useRef({});

  const uploadedCount = Object.keys(files).length;
  const requiredCount = requiredDocuments.filter((doc) => doc.required).length;
  const requiredUploaded = requiredDocuments.filter(
    (doc) => doc.required && files[doc.id]
  ).length;

  function handleFileChange(documentId, file) {
    setMessage("");
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a PDF, JPG or PNG file.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setMessage("Each file must be 20 MB or smaller.");
      return;
    }

    setFiles((current) => ({ ...current, [documentId]: file }));
  }

  function removeFile(documentId) {
    setFiles((current) => {
      const updated = { ...current };
      delete updated[documentId];
      return updated;
    });

    if (fileInputRefs.current[documentId]) {
      fileInputRefs.current[documentId].value = "";
    }

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!institution.trim()) {
      setMessage("Enter the institution name before continuing.");
      return;
    }

    if (requiredUploaded < requiredCount) {
      setMessage("Upload all required documents before continuing.");
      return;
    }

    setLoading(true);
    setUploadResults([]);

    // Generate valid application code from reference or institution name
    const appCode = reference.trim() || `APP-${Date.now().toString().slice(-6)}`;

    try {
      const results = [];
      // Loop through all selected files and upload them to FastAPI backend
      for (const [docId, fileObj] of Object.entries(files)) {
        const formData = new FormData();
        formData.append("application_code", appCode);
        formData.append("institution_name", institution.trim());
        formData.append("file", fileObj);

        const response = await fetch("http://localhost:8000/api/upload-and-verify", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || `Failed to verify ${fileObj.name}`);
        }
        results.push({ docId, filename: fileObj.name, ...data });
      }

      setUploadResults(results);
      setMessage(`Success! All ${results.length} documents verified and saved to database under Application Code: ${appCode}`);
    } catch (err) {
      console.error("Backend error:", err);
      setMessage(`Error connecting to backend: ${err.message}. Make sure FastAPI is running.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="intake-page">
      <div className="intake-breadcrumb">
        <button type="button" onClick={onBack}>Workspace</button>
        <span>/</span>
        <span>Document intake</span>
      </div>

      <div className="intake-heading">
        <div>
          <div className="intake-eyebrow">APPLICATION WORKFLOW</div>
          <h1>New application intake</h1>
          <p>Register an application and organise its supporting documents for live verification.</p>
        </div>
        <span className="draft-badge" style={{ background: '#d8f3dc', color: '#1b4332' }}>Live Backend Connected</span>
      </div>

      <div className="intake-notice">
        <span className="notice-symbol">i</span>
        <p>
          <strong>Automated compliance pipeline active.</strong> Documents are checked for metadata forensics, duplicate hashes, text extraction, and risk scoring.
        </p>
      </div>

      {message && (
        <div className="intake-message" role="status" style={{ background: uploadResults.length > 0 ? '#d8f3dc' : '#f8d7da', color: uploadResults.length > 0 ? '#1b4332' : '#721c24' }}>
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")} aria-label="Dismiss message">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <section className="intake-card">
          <div className="intake-section-heading">
            <div className="section-number">01</div>
            <div>
              <h2>Application details</h2>
              <p>Provide the basic details used to organise this application.</p>
            </div>
          </div>

          <div className="intake-form-grid">
            <label className="intake-field full-width">
              <span>Institution name <b>*</b></span>
              <input
                value={institution}
                onChange={(event) => setInstitution(event.target.value)}
                placeholder="Enter the official institution name"
                required
              />
            </label>

            <label className="intake-field">
              <span>Application type <b>*</b></span>
              <select
                value={applicationType}
                onChange={(event) => setApplicationType(event.target.value)}
              >
                <option>Extension of Approval</option>
                <option>New approval</option>
                <option>Change of institution details</option>
                <option>Other approval application</option>
              </select>
            </label>

            <label className="intake-field">
              <span>Academic year <b>*</b></span>
              <select
                value={academicYear}
                onChange={(event) => setAcademicYear(event.target.value)}
              >
                <option>2026–27</option>
                <option>2027–28</option>
                <option>2025–26</option>
              </select>
            </label>

            <label className="intake-field full-width">
              <span>Institution / application reference <small>Optional (Used as Code)</small></span>
              <input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="e.g. EOA-2026-0248"
              />
            </label>
          </div>
        </section>

        <section className="intake-card">
          <div className="intake-section-heading document-section-heading">
            <div className="section-number">02</div>
            <div>
              <h2>Supporting documents</h2>
              <p>Select the available documents. Requirements must be confirmed against the applicable official checklist.</p>
            </div>
          </div>

          <div className="upload-summary">
            <div>
              <strong>{uploadedCount} of {requiredDocuments.length}</strong>
              <span> document categories added</span>
            </div>
            <span className="required-counter">
              {requiredUploaded}/{requiredCount} required
            </span>
          </div>

          <div className="upload-list">
            {requiredDocuments.map((doc) => {
              const file = files[doc.id];

              return (
                <div className="upload-row" key={doc.id}>
                  <div className={`file-type-icon ${file ? "file-added" : ""}`}>
                    {file ? "✓" : "PDF"}
                  </div>

                  <div className="upload-description">
                    <div className="upload-title">
                      {doc.title}
                      {doc.required ? (
                        <span className="required-tag">Required</span>
                      ) : (
                        <span className="optional-tag">Optional</span>
                      )}
                    </div>
                    <p>{doc.description}</p>
                    {file && (
                      <div className="selected-file">
                        {file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    )}
                  </div>

                  <input
                    ref={(element) => {
                      fileInputRefs.current[doc.id] = element;
                    }}
                    className="hidden-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) => handleFileChange(doc.id, event.target.files?.[0])}
                    aria-label={`Choose ${doc.title}`}
                  />

                  {file ? (
                    <button
                      className="remove-file-button"
                      type="button"
                      onClick={() => removeFile(doc.id)}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      className="choose-file-button"
                      type="button"
                      onClick={() => fileInputRefs.current[doc.id]?.click()}
                    >
                      + Choose file
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="upload-footnote">
            PDF, JPG or PNG · Maximum 20 MB per file. Connected live to FastAPI backend verification engine.
          </p>
        </section>

        {uploadResults.length > 0 && (
          <section className="intake-card" style={{ background: '#f4f9f4' }}>
            <h3>Live Verification Results</h3>
            {uploadResults.map((res, idx) => (
              <div key={idx} style={{ margin: '10px 0', padding: '10px', background: '#fff', borderLeft: '4px solid #1b4332' }}>
                <p><b>File:</b> {res.filename}</p>
                <p><b>Status:</b> {res.application_status}</p>
                <p><b>Risk Level:</b> {res.risk_level} (Score: {res.document_risk_score})</p>
                <p><b>Flags Detected:</b> {res.flags.length}</p>
              </div>
            ))}
          </section>
        )}

        <div className="intake-actions">
          <button className="intake-cancel-button" type="button" onClick={onBack}>
            Cancel
          </button>
          <button className="intake-submit-button" type="submit" disabled={loading}>
            {loading ? "Running Verification Pipeline..." : "Validate & Submit Live"} <span>→</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default DocumentIntake;