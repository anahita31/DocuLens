
import { useMemo, useState } from "react";
import "./AdminDashboard.css";

const demoApplications = [
  {
    id: "EOA-2026-0248",
    institution: "Eastern Institute of Technology",
    type: "Extension of Approval",
    submitted: "24 Oct 2026",
    status: "Under review",
    priority: "High",
    completeness: 92,
    flags: 1,
  },
  {
    id: "EOA-2026-0245",
    institution: "North Valley College of Engineering",
    type: "Extension of Approval",
    submitted: "23 Oct 2026",
    status: "Needs attention",
    priority: "High",
    completeness: 68,
    flags: 3,
  },
  {
    id: "EOA-2026-0242",
    institution: "Riverbend Institute of Technology",
    type: "New approval",
    submitted: "22 Oct 2026",
    status: "Under review",
    priority: "Normal",
    completeness: 100,
    flags: 0,
  },
  {
    id: "EOA-2026-0239",
    institution: "Central School of Applied Sciences",
    type: "Extension of Approval",
    submitted: "21 Oct 2026",
    status: "Pending assignment",
    priority: "Normal",
    completeness: 84,
    flags: 2,
  },
  {
    id: "EOA-2026-0235",
    institution: "Westbridge Technical Institute",
    type: "New approval",
    submitted: "20 Oct 2026",
    status: "Completed",
    priority: "Normal",
    completeness: 100,
    flags: 0,
  },
];

const reviewChecks = [
  "Document completeness",
  "Document validity and expiry",
  "Institution details consistency",
  "Cross-document consistency",
  "Issuing-source verification",
];

function statusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function AdminDashboard({
  onOpenReview,
  onOpenApplications,
  onOpenActivityLog,
  onLogout,
  reviewerName = "Authority Reviewer",
}) {
  const [activeSection, setActiveSection] = useState("Overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const filteredApplications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return demoApplications.filter((application) => {
      const matchesSearch =
        !normalizedSearch ||
        application.id.toLowerCase().includes(normalizedSearch) ||
        application.institution.toLowerCase().includes(normalizedSearch) ||
        application.type.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All statuses" ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const pendingCount = demoApplications.filter(
    (application) =>
      application.status === "Under review" ||
      application.status === "Pending assignment"
  ).length;

  const attentionCount = demoApplications.filter(
    (application) => application.status === "Needs attention"
  ).length;

  const completedCount = demoApplications.filter(
    (application) => application.status === "Completed"
  ).length;

  const highPriorityCount = demoApplications.filter(
    (application) => application.priority === "High"
  ).length;

  function openReview(application) {
    if (onOpenReview) {
      onOpenReview(application);
    } else {
      setSelectedApplication(application);
    }
  }

  function openApplicationRegister() {
    if (onOpenApplications) {
      onOpenApplications();
    } else {
      setActiveSection("Applications");
    }
  }

  function openActivityLog() {
    if (onOpenActivityLog) {
      onOpenActivityLog();
    } else {
      setActiveSection("Activity log");
    }
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All statuses");
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <button
          className="admin-brand"
          onClick={() => setActiveSection("Overview")}
          aria-label="Go to DocuLens overview"
        >
          <span className="admin-brand-mark">
            D<span>.</span>
          </span>
          <span className="admin-brand-copy">
            <strong>DocuLens</strong>
            <small>APPROVAL INTELLIGENCE</small>
          </span>
        </button>

        <div className="admin-workspace-label">AUTHORITY WORKSPACE</div>

        <div className="admin-workspace-card">
          <div className="admin-workspace-icon">✓</div>
          <div>
            <strong>Review operations</strong>
            <span>Reviewer workspace</span>
          </div>
        </div>

        <nav className="admin-navigation" aria-label="Admin navigation">
          <div className="admin-nav-heading">WORKSPACE</div>

          <button
            className={`admin-nav-item ${
              activeSection === "Overview" ? "active" : ""
            }`}
            onClick={() => setActiveSection("Overview")}
          >
            <span className="admin-nav-icon">▦</span>
            <span>Overview</span>
          </button>

          <button
            className={`admin-nav-item ${
              activeSection === "Applications" ? "active" : ""
            }`}
            onClick={openApplicationRegister}
          >
            <span className="admin-nav-icon">▤</span>
            <span>Application register</span>
            <span className="admin-nav-count">{demoApplications.length}</span>
          </button>

          <button
            className={`admin-nav-item ${
              activeSection === "Review queue" ? "active" : ""
            }`}
            onClick={() => setActiveSection("Review queue")}
          >
            <span className="admin-nav-icon">◷</span>
            <span>Review queue</span>
            <span className="admin-nav-count">{pendingCount}</span>
          </button>

          <button
            className={`admin-nav-item ${
              activeSection === "Needs attention" ? "active" : ""
            }`}
            onClick={() => setActiveSection("Needs attention")}
          >
            <span className="admin-nav-icon">⚑</span>
            <span>Needs attention</span>
            <span className="admin-nav-count">{attentionCount}</span>
          </button>

          <div className="admin-nav-heading admin-nav-heading-spaced">
            OVERSIGHT
          </div>

          <button
            className={`admin-nav-item ${
              activeSection === "Validation checks" ? "active" : ""
            }`}
            onClick={() => setActiveSection("Validation checks")}
          >
            <span className="admin-nav-icon">☑</span>
            <span>Validation checks</span>
          </button>

          <button
            className={`admin-nav-item ${
              activeSection === "Activity log" ? "active" : ""
            }`}
            onClick={openActivityLog}
          >
            <span className="admin-nav-icon">≡</span>
            <span>Activity log</span>
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-notice">
            <span>i</span>
            <strong>Human-led review</strong>
            <p>
              Automated checks support reviewers. Regulatory decisions remain
              with authorized personnel.
            </p>
          </div>

          <div className="admin-user-profile">
            <div className="admin-user-avatar">AR</div>
            <div className="admin-user-copy">
              <strong>{reviewerName}</strong>
              <span>Reviewer account</span>
            </div>
            <button
              className="admin-account-menu-button"
              aria-label="Open account menu"
              aria-expanded={showAccountMenu}
              onClick={() => setShowAccountMenu((current) => !current)}
            >
              ···
            </button>

            {showAccountMenu && (
              <div className="admin-account-popover">
                <strong>{reviewerName}</strong>
                <span>Reviewer workspace</span>
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
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

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <span>Authority workspace</span>
            <span>/</span>
            <strong>{activeSection}</strong>
          </div>

          <div className="admin-topbar-right">
            <span className="admin-role-badge">
              <span />
              Reviewer access
            </span>
            <div className="admin-topbar-divider" />
            <div className="admin-topbar-avatar">AR</div>
          </div>
        </header>

        <div className="admin-content">
          {activeSection === "Overview" && (
            <>
              <section className="admin-page-heading">
                <div>
                  <div className="admin-eyebrow">
                    REVIEW OPERATIONS <span>·</span> 2026–27
                  </div>
                  <h1>Review overview</h1>
                  <p>
                    Monitor application queues, inspect preliminary validation
                    indicators, and coordinate human review.
                  </p>
                </div>

                <button
                  className="admin-primary-button"
                  onClick={openApplicationRegister}
                >
                  Open application register <span>→</span>
                </button>
              </section>

              <section className="admin-notice-banner">
                <div className="admin-notice-icon">i</div>
                <div>
                  <strong>Preliminary validation workspace</strong>
                  <p>
                    All records and indicators on this screen are illustrative
                    demo data. Automated checks do not establish authenticity,
                    compliance, or a final regulatory outcome.
                  </p>
                </div>
              </section>

              <section className="admin-metrics-grid">
                <article className="admin-metric-card">
                  <div className="admin-metric-top">
                    <span>Total applications</span>
                    <span className="admin-metric-icon">▤</span>
                  </div>
                  <strong>{demoApplications.length}</strong>
                  <p>Illustrative register records</p>
                </article>

                <article className="admin-metric-card">
                  <div className="admin-metric-top">
                    <span>In progress</span>
                    <span className="admin-metric-icon">◷</span>
                  </div>
                  <strong>{pendingCount}</strong>
                  <p>Under review or awaiting assignment</p>
                </article>

                <article className="admin-metric-card">
                  <div className="admin-metric-top">
                    <span>Needs attention</span>
                    <span className="admin-metric-icon attention">!</span>
                  </div>
                  <strong>{attentionCount}</strong>
                  <p>Records with review follow-up indicators</p>
                </article>

                <article className="admin-metric-card">
                  <div className="admin-metric-top">
                    <span>Completed</span>
                    <span className="admin-metric-icon">✓</span>
                  </div>
                  <strong>{completedCount}</strong>
                  <p>Marked complete in sample data</p>
                </article>
              </section>

              <section className="admin-main-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Priority review queue</h2>
                    <p>
                      Applications with outstanding review work or follow-up
                      indicators.
                    </p>
                  </div>
                  <button
                    className="admin-text-button"
                    onClick={() => setActiveSection("Review queue")}
                  >
                    View queue <span>→</span>
                  </button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>APPLICATION / INSTITUTION</th>
                        <th>SUBMITTED</th>
                        <th>COMPLETENESS</th>
                        <th>INDICATORS</th>
                        <th>STATUS</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {demoApplications
                        .filter(
                          (application) =>
                            application.status !== "Completed"
                        )
                        .slice(0, 4)
                        .map((application) => (
                          <tr key={application.id}>
                            <td>
                              <strong className="admin-application-id">
                                {application.id}
                              </strong>
                              <span className="admin-institution-name">
                                {application.institution}
                              </span>
                            </td>
                            <td>{application.submitted}</td>
                            <td>
                              <div className="admin-completeness-cell">
                                <div className="admin-progress-track">
                                  <span
                                    style={{
                                      width: `${application.completeness}%`,
                                    }}
                                  />
                                </div>
                                <span>{application.completeness}%</span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`admin-indicator-count ${
                                  application.flags > 0 ? "has-flags" : ""
                                }`}
                              >
                                {application.flags}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`admin-status-badge admin-status-${statusClass(
                                  application.status
                                )}`}
                              >
                                {application.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="admin-row-action"
                                aria-label={`Open review for ${application.id}`}
                                onClick={() => openReview(application)}
                              >
                                →
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-panel-footer">
                  <span>Demo records only — not a live regulatory register</span>
                  <button
                    className="admin-text-button"
                    onClick={openApplicationRegister}
                  >
                    Open register <span>→</span>
                  </button>
                </div>
              </section>

              <section className="admin-bottom-grid">
                <article className="admin-review-card">
                  <div className="admin-small-card-heading">
                    <div>
                      <span className="admin-card-eyebrow">
                        REVIEW WORKFLOW
                      </span>
                      <h2>Preliminary validation</h2>
                    </div>
                    <span className="admin-check-symbol">☑</span>
                  </div>

                  <p>
                    Review the available evidence systematically. Each check
                    should have an explicit outcome and supporting notes.
                  </p>

                  <ul className="admin-check-list">
                    {reviewChecks.map((check, index) => (
                      <li key={check}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {check}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="admin-secondary-button"
                    onClick={() => setActiveSection("Validation checks")}
                  >
                    View validation checks <span>→</span>
                  </button>
                </article>

                <article className="admin-oversight-card">
                  <div className="admin-oversight-icon">↗</div>
                  <span className="admin-card-eyebrow">REVIEW OVERSIGHT</span>
                  <h2>Keep every review traceable</h2>
                  <p>
                    A production system should record reviewer actions,
                    evidence references, timestamps, and authorized changes
                    in a protected server-side audit trail.
                  </p>
                  <button
                    className="admin-secondary-button"
                    onClick={openActivityLog}
                  >
                    View activity log <span>→</span>
                  </button>
                </article>
              </section>
            </>
          )}

          {activeSection === "Applications" && (
            <section className="admin-subpage">
              <div className="admin-page-heading">
                <div>
                  <div className="admin-eyebrow">APPLICATION REGISTER</div>
                  <h1>Application register</h1>
                  <p>
                    Search and inspect illustrative application records.
                  </p>
                </div>
              </div>

              <div className="admin-main-panel">
                <div className="admin-filter-bar">
                  <label className="admin-search-field">
                    <span>⌕</span>
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search ID or institution..."
                      aria-label="Search applications"
                    />
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter applications by status"
                  >
                    <option>All statuses</option>
                    <option>Under review</option>
                    <option>Needs attention</option>
                    <option>Pending assignment</option>
                    <option>Completed</option>
                  </select>

                  <button
                    className="admin-reset-button"
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>APPLICATION / INSTITUTION</th>
                        <th>TYPE</th>
                        <th>SUBMITTED</th>
                        <th>STATUS</th>
                        <th>PRIORITY</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((application) => (
                        <tr key={application.id}>
                          <td>
                            <strong className="admin-application-id">
                              {application.id}
                            </strong>
                            <span className="admin-institution-name">
                              {application.institution}
                            </span>
                          </td>
                          <td>{application.type}</td>
                          <td>{application.submitted}</td>
                          <td>
                            <span
                              className={`admin-status-badge admin-status-${statusClass(
                                application.status
                              )}`}
                            >
                              {application.status}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`admin-priority-badge admin-priority-${application.priority.toLowerCase()}`}
                            >
                              {application.priority}
                            </span>
                          </td>
                          <td>
                            <button
                              className="admin-row-action"
                              aria-label={`Open review for ${application.id}`}
                              onClick={() => openReview(application)}
                            >
                              →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredApplications.length === 0 && (
                    <div className="admin-empty-state">
                      <span>⌕</span>
                      <h2>No matching applications</h2>
                      <p>Try changing your search or status filter.</p>
                      <button
                        className="admin-secondary-button"
                        onClick={resetFilters}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>

                <div className="admin-panel-footer">
                  <span>
                    Showing {filteredApplications.length} of{" "}
                    {demoApplications.length} sample records
                  </span>
                  <span>Illustrative data</span>
                </div>
              </div>
            </section>
          )}

          {activeSection === "Review queue" && (
            <section className="admin-subpage">
              <div className="admin-page-heading">
                <div>
                  <div className="admin-eyebrow">WORK IN PROGRESS</div>
                  <h1>Review queue</h1>
                  <p>
                    Review applications that are under review or awaiting
                    assignment in the demo dataset.
                  </p>
                </div>
              </div>

              <div className="admin-main-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Open review items</h2>
                    <p>
                      Review priority is a workflow aid, not a compliance
                      finding.
                    </p>
                  </div>
                </div>

                <div className="admin-queue-list">
                  {demoApplications
                    .filter(
                      (application) =>
                        application.status === "Under review" ||
                        application.status === "Pending assignment"
                    )
                    .map((application) => (
                      <article
                        className="admin-queue-item"
                        key={application.id}
                      >
                        <div className="admin-queue-item-main">
                          <strong>{application.id}</strong>
                          <span>{application.institution}</span>
                          <small>
                            {application.type} · {application.submitted}
                          </small>
                        </div>
                        <span
                          className={`admin-priority-badge admin-priority-${application.priority.toLowerCase()}`}
                        >
                          {application.priority} priority
                        </span>
                        <button
                          className="admin-secondary-button"
                          onClick={() => openReview(application)}
                        >
                          Open review <span>→</span>
                        </button>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          )}

          {activeSection === "Needs attention" && (
            <section className="admin-subpage">
              <div className="admin-page-heading">
                <div>
                  <div className="admin-eyebrow">FOLLOW-UP INDICATORS</div>
                  <h1>Needs attention</h1>
                  <p>
                    Inspect records where the sample workflow has raised
                    follow-up indicators.
                  </p>
                </div>
              </div>

              <div className="admin-review-caution">
                <strong>Interpret indicators carefully</strong>
                <p>
                  An indicator may reflect missing, unreadable, inconsistent,
                  or unavailable information. It does not by itself prove
                  fraud, document forgery, or regulatory non-compliance.
                </p>
              </div>

              <div className="admin-main-panel">
                <div className="admin-queue-list">
                  {demoApplications
                    .filter((application) => application.flags > 0)
                    .map((application) => (
                      <article
                        className="admin-queue-item"
                        key={application.id}
                      >
                        <div className="admin-queue-item-main">
                          <strong>{application.id}</strong>
                          <span>{application.institution}</span>
                          <small>
                            {application.flags} sample follow-up indicator
                            {application.flags === 1 ? "" : "s"}
                          </small>
                        </div>

                        <span className="admin-indicator-count has-flags">
                          {application.flags}
                        </span>

                        <button
                          className="admin-secondary-button"
                          onClick={() => openReview(application)}
                        >
                          Inspect record <span>→</span>
                        </button>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          )}

          {activeSection === "Validation checks" && (
            <section className="admin-subpage">
              <div className="admin-page-heading">
                <div>
                  <div className="admin-eyebrow">REVIEW FRAMEWORK</div>
                  <h1>Validation checks</h1>
                  <p>
                    A structured set of checks to support preliminary
                    application review.
                  </p>
                </div>
              </div>

              <div className="admin-validation-list">
                {reviewChecks.map((check, index) => (
                  <article className="admin-validation-item" key={check}>
                    <span className="admin-validation-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2>{check}</h2>
                      <p>
                        {[
                          "Check required document categories against the applicable checklist.",
                          "Inspect legibility and dates, and confirm validity using authorized evidence where available.",
                          "Compare institution identifiers and profile details across the submitted records.",
                          "Identify differences between documents and record the exact evidence for human assessment.",
                          "Use an authorized issuing-source channel when available; otherwise record the check as unverified.",
                        ][index]}
                      </p>
                    </div>
                    <span className="admin-validation-label">
                      Reviewer check
                    </span>
                  </article>
                ))}
              </div>

              <div className="admin-review-caution">
                <strong>Human review is required</strong>
                <p>
                  Automated outputs are preliminary indicators. Reviewers
                  should inspect source evidence, document uncertainty, and
                  follow the applicable official process before making
                  decisions.
                </p>
              </div>
            </section>
          )}

          {activeSection === "Activity log" && (
            <section className="admin-subpage">
              <div className="admin-page-heading">
                <div>
                  <div className="admin-eyebrow">TRACEABILITY</div>
                  <h1>Activity log</h1>
                  <p>
                    Open the activity log view to inspect the prototype's
                    sample workflow entries.
                  </p>
                </div>
              </div>

              <div className="admin-main-panel admin-activity-intro">
                <div className="admin-activity-icon">≡</div>
                <h2>Reviewer activity records</h2>
                <p>
                  The prototype may display illustrative events. A production
                  audit trail must be generated and protected by the backend,
                  with access controls, timestamps, and reliable event history.
                </p>
                <button
                  className="admin-primary-button"
                  onClick={openActivityLog}
                >
                  Open activity log <span>→</span>
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {selectedApplication && !onOpenReview && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedApplication(null)}
        >
          <section
            className="admin-application-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-heading">
              <div>
                <span className="admin-eyebrow">SAMPLE APPLICATION</span>
                <h2 id="admin-modal-title">Application details</h2>
              </div>
              <button
                className="admin-modal-close"
                aria-label="Close application details"
                onClick={() => setSelectedApplication(null)}
              >
                ×
              </button>
            </div>

            <div className="admin-modal-notice">
              This is illustrative data. No official institution record has
              been retrieved or verified.
            </div>

            <dl className="admin-modal-details">
              <div>
                <dt>Application ID</dt>
                <dd>{selectedApplication.id}</dd>
              </div>
              <div>
                <dt>Institution</dt>
                <dd>{selectedApplication.institution}</dd>
              </div>
              <div>
                <dt>Application type</dt>
                <dd>{selectedApplication.type}</dd>
              </div>
              <div>
                <dt>Submission date</dt>
                <dd>{selectedApplication.submitted}</dd>
              </div>
              <div>
                <dt>Displayed status</dt>
                <dd>{selectedApplication.status}</dd>
              </div>
              <div>
                <dt>Document completeness</dt>
                <dd>{selectedApplication.completeness}%</dd>
              </div>
              <div>
                <dt>Follow-up indicators</dt>
                <dd>{selectedApplication.flags}</dd>
              </div>
            </dl>

            <div className="admin-modal-footer">
              <button
                className="admin-secondary-button"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
