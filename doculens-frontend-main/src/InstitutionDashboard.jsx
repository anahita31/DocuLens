import { useEffect, useState } from "react";
import "./InstitutionDashboard.css";

const requirements = [
  {
    title: "Application form",
    description: "Completed application details",
    required: true,
  },
  {
    title: "Previous approval letter",
    description: "Latest available approval document",
    required: true,
  },
  {
    title: "Faculty details",
    description: "Faculty and qualification information",
    required: true,
  },
  {
    title: "Infrastructure evidence",
    description: "Relevant facilities and infrastructure records",
    required: true,
  },
  {
    title: "Affidavit / undertaking",
    description: "Additional supporting declaration, if applicable",
    required: false,
  },
];

function getStatusClass(status) {
  return (status || "under_review").toLowerCase().replaceAll(" ", "-");
}

function InstitutionDashboard({
  onNewApplication,
  onViewApplications,
  onOpenApplication,
  onLogout,
  institutionName = "Eastern Institute of Technology",
}) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [showProfile, setShowProfile] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch applications live from FastAPI backend
  useEffect(() => {
    fetch("http://localhost:8000/api/applications")
      .then((res) => res.json())
      .then((data) => {
        // Handle FastAPI response whether it's an array or object containing array
        const list = Array.isArray(data) ? data : (data.applications || []);
        // Map backend fields to frontend expected format if necessary
        const formatted = list.map((app) => ({
          id: app.application_code || app.id || "APP-UNKNOWN",
          type: app.application_type || "Extension of Approval",
          academicYear: app.academic_year || "2026–27",
          submitted: app.submitted || "Just now",
          status: app.application_status || app.status || "Under review",
          progress: app.progress || 75,
        }));
        setApplications(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching applications from backend:", err);
        setLoading(false);
      });
  }, []);

  const displayName = institutionName || "Your Institution";
  const institutionInitials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const submittedApplications = applications.filter(
    (application) => application.status !== "Draft"
  );

  const drafts = applications.filter(
    (application) => application.status === "Draft"
  );

  function handleViewApplications() {
    if (onViewApplications) {
      onViewApplications();
    } else {
      setActiveTab("Submitted");
    }
  }

  function handleOpenApplication(application) {
    if (onOpenApplication) {
      onOpenApplication(application);
    } else {
      setActiveTab(application.status === "Draft" ? "Drafts" : "Submitted");
    }
  }

  return (
    <div className="institution-dashboard">
      <aside className="institution-sidebar">
        <button
          className="institution-brand"
          onClick={() => setActiveTab("Overview")}
          aria-label="Go to dashboard overview"
        >
          <span className="institution-brand-mark">
            D<span>.</span>
          </span>

          <span className="institution-brand-copy">
            <strong>DocuLens</strong>
            <small>APPROVAL INTELLIGENCE</small>
          </span>
        </button>

        <div className="institution-workspace-label">YOUR WORKSPACE</div>

        <div className="institution-workspace-card">
          <div className="institution-workspace-avatar">
            {institutionInitials}
          </div>

          <div className="institution-workspace-copy">
            <strong>Institution Portal</strong>
            <span>Applicant workspace</span>
          </div>
        </div>

        <nav className="institution-nav" aria-label="Applicant navigation">
          <div className="institution-nav-heading">APPLICATIONS</div>

          <button
            className={`institution-nav-item ${
              activeTab === "Overview" ? "active" : ""
            }`}
            onClick={() => setActiveTab("Overview")}
          >
            <span className="institution-nav-icon">▦</span>
            <span>Overview</span>
          </button>

          <button
            className={`institution-nav-item ${
              activeTab === "Submitted" ? "active" : ""
            }`}
            onClick={() => setActiveTab("Submitted")}
          >
            <span className="institution-nav-icon">▤</span>
            <span>Submitted applications</span>
            <span className="institution-nav-count">
              {submittedApplications.length}
            </span>
          </button>

          <button
            className={`institution-nav-item ${
              activeTab === "Drafts" ? "active" : ""
            }`}
            onClick={() => setActiveTab("Drafts")}
          >
            <span className="institution-nav-icon">▧</span>
            <span>Drafts</span>
            <span className="institution-nav-count">{drafts.length}</span>
          </button>

          <div className="institution-nav-heading institution-nav-heading-spaced">
            RESOURCES
          </div>

          <button
            className={`institution-nav-item ${
              activeTab === "Checklist" ? "active" : ""
            }`}
            onClick={() => setActiveTab("Checklist")}
          >
            <span className="institution-nav-icon">☑</span>
            <span>Document checklist</span>
          </button>

          <button
            className={`institution-nav-item ${
              activeTab === "Guidance" ? "active" : ""
            }`}
            onClick={() => setActiveTab("Guidance")}
          >
            <span className="institution-nav-icon">ⓘ</span>
            <span>Submission guidance</span>
          </button>
        </nav>

        <div className="institution-sidebar-bottom">
          <div className="institution-help-card">
            <div className="institution-help-icon">i</div>
            <strong>Need assistance?</strong>
            <p>
              Review the document checklist and prepare your application
              before submission.
            </p>
            <button onClick={() => setActiveTab("Guidance")}>
              View guidance <span>→</span>
            </button>
          </div>

          <div className="institution-profile">
            <div className="institution-profile-avatar">
              {institutionInitials}
            </div>

            <div className="institution-profile-copy">
              <strong>Institution applicant</strong>
              <span>Applicant account</span>
            </div>

            <button
              className="institution-profile-menu"
              aria-label="Open profile menu"
              aria-expanded={showProfile}
              onClick={() => setShowProfile((current) => !current)}
            >
              ···
            </button>

            {showProfile && (
              <div className="institution-profile-popover">
                <strong>{displayName}</strong>
                <span>Institution applicant</span>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    if (onLogout) onLogout();
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="institution-main">
        <header className="institution-topbar">
          <div className="institution-breadcrumb">
            <span>Institution portal</span>
            <span className="institution-breadcrumb-separator">/</span>
            <strong>{activeTab}</strong>
          </div>

          <div className="institution-topbar-right">
            <span className="institution-portal-badge" style={{ background: '#d8f3dc', color: '#1b4332' }}>
              <span style={{ background: '#2d6a4f' }} />
              Live Backend Connected
            </span>

            <div className="institution-topbar-divider" />

            <div className="institution-topbar-avatar">
              {institutionInitials}
            </div>
          </div>
        </header>

        <div className="institution-content">
          {activeTab === "Overview" && (
            <>
              <section className="institution-page-heading">
                <div>
                  <div className="institution-eyebrow">
                    INSTITUTIONAL WORKSPACE <span>·</span> FY 2026–27
                  </div>

                  <h1>Welcome to your workspace</h1>

                  <p>
                    Track your applications, prepare documents, and review
                    submission progress in one place.
                  </p>
                </div>

                <button
                  className="institution-primary-button"
                  onClick={onNewApplication}
                >
                  <span>＋</span> Start application
                </button>
              </section>

              <section className="institution-welcome-banner">
                <div className="institution-welcome-symbol">D.</div>

                <div className="institution-welcome-copy">
                  <span>INSTITUTION PROFILE</span>
                  <h2>{displayName}</h2>
                  <p>
                    Keep your supporting records complete and consistent
                    before submitting an application.
                  </p>
                </div>

                <div className="institution-profile-status">
                  <span className="institution-status-indicator" />
                  Live Database Synced
                </div>
              </section>

              <section
                className="institution-metric-grid"
                aria-label="Application summary"
              >
                <article className="institution-metric-card">
                  <div className="institution-metric-top">
                    <span>Total applications</span>
                    <span className="institution-metric-icon">▤</span>
                  </div>
                  <strong>{applications.length}</strong>
                  <p>Live records in database</p>
                </article>

                <article className="institution-metric-card">
                  <div className="institution-metric-top">
                    <span>Under review</span>
                    <span className="institution-metric-icon">◷</span>
                  </div>
                  <strong>
                    {
                      applications.filter(
                        (app) => app.status.toLowerCase().includes("review") || app.status === "UNDER_REVIEW"
                      ).length
                    }
                  </strong>
                  <p>Processed by AI pipeline</p>
                </article>

                <article className="institution-metric-card">
                  <div className="institution-metric-top">
                    <span>Completed</span>
                    <span className="institution-metric-icon">✓</span>
                  </div>
                  <strong>
                    {
                      applications.filter(
                        (app) => app.status === "Completed"
                      ).length
                    }
                  </strong>
                  <p>Approved records</p>
                </article>

                <article className="institution-metric-card">
                  <div className="institution-metric-top">
                    <span>Drafts</span>
                    <span className="institution-metric-icon">▧</span>
                  </div>
                  <strong>{drafts.length}</strong>
                  <p>Not yet submitted</p>
                </article>
              </section>

              <section className="institution-main-panel">
                <div className="institution-panel-heading">
                  <div>
                    <h2>Recent applications</h2>
                    <p>Review the current status of your application records from the database.</p>
                  </div>

                  <button
                    className="institution-text-button"
                    onClick={handleViewApplications}
                  >
                    View all <span>→</span>
                  </button>
                </div>

                <div className="institution-table-wrap">
                  {loading ? (
                    <p style={{ padding: '20px', textAlign: 'center' }}>Loading live applications...</p>
                  ) : applications.length === 0 ? (
                    <p style={{ padding: '20px', textAlign: 'center' }}>No applications found. Click "Start application" above to submit one!</p>
                  ) : (
                    <table className="institution-table">
                      <thead>
                        <tr>
                          <th>APPLICATION</th>
                          <th>ACADEMIC YEAR</th>
                          <th>SUBMITTED</th>
                          <th>STATUS</th>
                          <th />
                        </tr>
                      </thead>

                      <tbody>
                        {applications.slice(0, 5).map((application) => (
                          <tr key={application.id}>
                            <td>
                              <strong className="institution-application-id">
                                {application.id}
                              </strong>
                              <span className="institution-application-type">
                                {application.type}
                              </span>
                            </td>

                            <td>{application.academicYear}</td>
                            <td>{application.submitted}</td>

                            <td>
                              <span
                                className={`institution-status-badge institution-status-${getStatusClass(
                                  application.status
                                )}`}
                              >
                                {application.status}
                              </span>
                            </td>

                            <td>
                              <button
                                className="institution-row-action"
                                aria-label={`View ${application.id}`}
                                onClick={() =>
                                  handleOpenApplication(application)
                                }
                              >
                                →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="institution-panel-footer">
                  <span style={{ color: '#2d6a4f', fontWeight: '500' }}>● Live backend database connected</span>
                  <button
                    className="institution-text-button"
                    onClick={handleViewApplications}
                  >
                    Open applications <span>→</span>
                  </button>
                </div>
              </section>

              <section className="institution-bottom-grid">
                <article className="institution-checklist-card">
                  <div className="institution-small-card-heading">
                    <div>
                      <span className="institution-card-eyebrow">
                        PREPARATION
                      </span>
                      <h2>Document checklist</h2>
                    </div>
                    <span className="institution-checklist-symbol">☑</span>
                  </div>

                  <p>
                    Review the common document categories before beginning
                    your submission.
                  </p>

                  <ul className="institution-requirement-list">
                    {requirements.slice(0, 4).map((requirement) => (
                      <li key={requirement.title}>
                        <span className="institution-requirement-dot" />
                        <span>{requirement.title}</span>
                        <span className="institution-required-label">
                          Required
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className="institution-secondary-button"
                    onClick={() => setActiveTab("Checklist")}
                  >
                    View full checklist <span>→</span>
                  </button>
                </article>

                <article className="institution-guidance-card">
                  <div className="institution-guidance-icon">i</div>
                  <span className="institution-card-eyebrow">
                    BEFORE YOU SUBMIT
                  </span>
                  <h2>Prepare with confidence</h2>
                  <p>
                    Check document dates, confirm institution details, and
                    make sure information is consistent across your records.
                  </p>
                  <button
                    className="institution-secondary-button"
                    onClick={() => setActiveTab("Guidance")}
                  >
                    Read submission guidance <span>→</span>
                  </button>
                </article>
              </section>

              <footer className="institution-page-footer">
                <span>
                  DocuLens <span>·</span> Preliminary review assistance
                </span>
                <span>AI-assisted, live backend connected</span>
              </footer>
            </>
          )}

          {activeTab === "Submitted" && (
            <section className="institution-subpage">
              <div className="institution-page-heading">
                <div>
                  <div className="institution-eyebrow">APPLICATION REGISTER</div>
                  <h1>Submitted applications</h1>
                  <p>
                    View all applications submitted to the live database.
                  </p>
                </div>

                <button
                  className="institution-primary-button"
                  onClick={onNewApplication}
                >
                  <span>＋</span> Start application
                </button>
              </div>

              <div className="institution-main-panel">
                <div className="institution-panel-heading">
                  <div>
                    <h2>Your submissions</h2>
                    <p>Live records retrieved from FastAPI database.</p>
                  </div>
                </div>

                <div className="institution-application-list">
                  {submittedApplications.map((application) => (
                    <article
                      className="institution-application-list-item"
                      key={application.id}
                    >
                      <div className="institution-list-item-main">
                        <strong>{application.id}</strong>
                        <span>{application.type}</span>
                        <small>
                          Academic year {application.academicYear} ·{" "}
                          {application.submitted}
                        </small>
                      </div>

                      <span
                        className={`institution-status-badge institution-status-${getStatusClass(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>

                      <button
                        className="institution-row-action"
                        aria-label={`View ${application.id}`}
                        onClick={() => handleOpenApplication(application)}
                      >
                        →
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === "Drafts" && (
            <section className="institution-subpage">
              <div className="institution-page-heading">
                <div>
                  <div className="institution-eyebrow">IN PROGRESS</div>
                  <h1>Your drafts</h1>
                  <p>
                    Applications that have not yet been submitted for review.
                  </p>
                </div>

                <button
                  className="institution-primary-button"
                  onClick={onNewApplication}
                >
                  <span>＋</span> New application
                </button>
              </div>

              <div className="institution-main-panel">
                {drafts.length > 0 ? (
                  <div className="institution-application-list">
                    {drafts.map((application) => (
                      <article
                        className="institution-application-list-item"
                        key={application.id}
                      >
                        <div className="institution-list-item-main">
                          <strong>{application.id}</strong>
                          <span>{application.type}</span>
                          <small>
                            Academic year {application.academicYear}
                          </small>
                        </div>

                        <span className="institution-status-badge institution-status-draft">
                          Draft
                        </span>

                        <button
                          className="institution-row-action"
                          aria-label={`Continue ${application.id}`}
                          onClick={() => handleOpenApplication(application)}
                        >
                          →
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="institution-empty-state">
                    <span>▧</span>
                    <h2>No drafts available</h2>
                    <p>Start a new application to begin preparing a submission.</p>
                    <button
                      className="institution-primary-button"
                      onClick={onNewApplication}
                    >
                      Start application
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "Checklist" && (
            <section className="institution-subpage">
              <div className="institution-page-heading">
                <div>
                  <div className="institution-eyebrow">DOCUMENT PREPARATION</div>
                  <h1>Document checklist</h1>
                  <p>
                    Use this general checklist to prepare your supporting
                    records. Requirements can vary by application type.
                  </p>
                </div>

                <button
                  className="institution-primary-button"
                  onClick={onNewApplication}
                >
                  Start application <span>→</span>
                </button>
              </div>

              <div className="institution-main-panel">
                <div className="institution-panel-heading">
                  <div>
                    <h2>Common document categories</h2>
                    <p>
                      This guide is informational, not an official
                      application-specific requirements list.
                    </p>
                  </div>
                </div>

                <div className="institution-checklist-page-list">
                  {requirements.map((requirement, index) => (
                    <article
                      className="institution-checklist-page-item"
                      key={requirement.title}
                    >
                      <span className="institution-checklist-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <strong>{requirement.title}</strong>
                        <p>{requirement.description}</p>
                      </div>

                      <span
                        className={`institution-required-pill ${
                          requirement.required ? "required" : "optional"
                        }`}
                      >
                        {requirement.required ? "Commonly required" : "Optional"}
                      </span>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === "Guidance" && (
            <section className="institution-subpage">
              <div className="institution-page-heading">
                <div>
                  <div className="institution-eyebrow">HELP & RESOURCES</div>
                  <h1>Submission guidance</h1>
                  <p>
                    Practical preparation tips for a clearer application
                    submission.
                  </p>
                </div>
              </div>

              <div className="institution-guidance-grid">
                <article className="institution-guidance-step">
                  <span>01</span>
                  <h2>Confirm your details</h2>
                  <p>
                    Check that your institution name, identifier, address,
                    and academic year are consistent across documents.
                  </p>
                </article>

                <article className="institution-guidance-step">
                  <span>02</span>
                  <h2>Check document validity</h2>
                  <p>
                    Review document dates and expiry information where
                    applicable. Do not assume that an unreadable date is
                    evidence of an invalid document.
                  </p>
                </article>

                <article className="institution-guidance-step">
                  <span>03</span>
                  <h2>Prepare readable files</h2>
                  <p>
                    Ensure scans are legible, pages are complete, and
                    supporting files match the categories requested in
                    the applicable instructions.
                  </p>
                </article>

                <article className="institution-guidance-step">
                  <span>04</span>
                  <h2>Review before submission</h2>
                  <p>
                    Check the information you entered and keep a copy of
                    your submission records for future reference.
                  </p>
                </article>
              </div>

              <div className="institution-guidance-notice">
                <span>i</span>
                <p>
                  <strong>Important:</strong> This prototype provides
                  preliminary preparation assistance. Always follow the
                  current official instructions issued by the relevant
                  approval authority. DocuLens does not make final
                  regulatory decisions.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default InstitutionDashboard;