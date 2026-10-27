
import { useState } from "react";
import "./App.css";

import LandingPage from "./LandingPage.jsx";
import LoginPage from "./LoginPage.jsx";
import SignUpPage from "./SignUpPage.jsx";
import InstitutionDashboard from "./InstitutionDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

import DocumentIntake from "./DocumentIntake.jsx";
import Applications from "./Applications.jsx";
import Verification from "./Verification.jsx";
import RecordComparison from "./RecordComparison.jsx";
import ActivityLog from "./ActivityLog.jsx";
import Reports from "./Reports.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [previousPage, setPreviousPage] = useState("landing");
  const [activePage, setActivePage] = useState("Overview");
  const [notice, setNotice] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  function navigate(page) {
    setPreviousPage(currentPage);
    setCurrentPage(page);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateDashboard(page) {
    setActivePage(page);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setCurrentPage(previousPage);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLoginSuccess(userDetails = {}) {
    const role =
      userDetails.role === "admin" ||
      userDetails.role === "reviewer"
        ? "admin"
        : "institution";

    setCurrentUser({
      name: userDetails.name || "Demo User",
      email: userDetails.email || "",
      institution:
        userDetails.institution ||
        "Eastern Institute of Technology",
      role,
    });

    setCurrentPage(
      role === "admin"
        ? "admin-dashboard"
        : "institution-dashboard"
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSignUpSuccess(userDetails = {}) {
    setCurrentUser({
      name: userDetails.name || "New Applicant",
      email: userDetails.email || "",
      institution:
        userDetails.institution ||
        "Eastern Institute of Technology",
      role: "institution",
    });

    setCurrentPage("institution-dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLogout() {
    setCurrentUser(null);
    setSelectedApplication(null);
    setCurrentPage("landing");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openReview(application) {
    setSelectedApplication(application);
    setPreviousPage(currentPage);
    setCurrentPage("verification");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const navigation = [
    {
      section: "WORKSPACE",
      items: [
        { label: "Overview", icon: "▦" },
        { label: "Applications", icon: "▤", count: "12" },
        { label: "Document intake", icon: "⇧" },
        { label: "Verification", icon: "✓" },
        { label: "Record comparison", icon: "⇄" },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        { label: "Activity log", icon: "◷" },
        { label: "Reports", icon: "▥" },
      ],
    },
  ];

  const metrics = [
    {
      label: "Total applications",
      value: "248",
      change: "+12 this month",
      icon: "▤",
    },
    {
      label: "Awaiting review",
      value: "36",
      change: "Needs attention",
      icon: "◷",
    },
    {
      label: "In verification",
      value: "18",
      change: "Currently in progress",
      icon: "⌕",
    },
    {
      label: "Review completed",
      value: "194",
      change: "This reporting period",
      icon: "✓",
    },
  ];

  const recentApplications = [
    {
      id: "EOA-2026-0248",
      institution: "Eastern Institute of Technology",
      type: "Extension of Approval",
      submitted: "24 Oct 2026",
      status: "Under review",
    },
    {
      id: "EOA-2026-0247",
      institution: "Kalinga School of Engineering",
      type: "Extension of Approval",
      submitted: "23 Oct 2026",
      status: "Documents pending",
    },
    {
      id: "EOA-2026-0246",
      institution: "Coastal Institute of Management",
      type: "New approval",
      submitted: "22 Oct 2026",
      status: "Verification",
    },
    {
      id: "EOA-2026-0245",
      institution: "Odisha College of Technology",
      type: "Extension of Approval",
      submitted: "21 Oct 2026",
      status: "Completed",
    },
  ];

  function renderExistingDashboard() {
    const isIntakePage = activePage === "Document intake";
    const isApplicationsPage = activePage === "Applications";
    const isVerificationPage = activePage === "Verification";
    const isComparisonPage = activePage === "Record comparison";
    const isActivityLogPage = activePage === "Activity log";
    const isReportsPage = activePage === "Reports";

    return (
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">
              D<span>.</span>
            </div>

            <div>
              <div className="brand-name">DocuLens</div>
              <div className="brand-caption">
                APPROVAL INTELLIGENCE
              </div>
            </div>
          </div>

          <div className="workspace-label">WORKSPACE</div>

          <div className="workspace-switcher">
            <div className="workspace-avatar">A</div>

            <div className="workspace-copy">
              <strong>Approval Authority</strong>
              <span>Regulatory workspace</span>
            </div>

            <span className="switcher-chevron">⌄</span>
          </div>

          <nav className="sidebar-nav">
            {navigation.map((group) => (
              <div className="nav-group" key={group.section}>
                <div className="nav-heading">
                  {group.section}
                </div>

                {group.items.map((item) => (
                  <button
                    className={`nav-item ${
                      activePage === item.label ? "active" : ""
                    }`}
                    key={item.label}
                    onClick={() => navigateDashboard(item.label)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>

                    {item.count && (
                      <span className="nav-count">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="help-card">
              <div className="help-icon">i</div>
              <strong>Need assistance?</strong>

              <p>
                Find guidance on the application review workflow.
              </p>

              <button
                onClick={() =>
                  setNotice(
                    "Guidance resources will be available here."
                  )
                }
              >
                View help centre ↗
              </button>
            </div>

            <div className="profile">
              <div className="profile-avatar">AR</div>

              <div className="profile-copy">
                <strong>
                  {currentUser?.name || "Authority Reviewer"}
                </strong>
                <span>Reviewer workspace</span>
              </div>

              <button
                className="profile-menu"
                aria-label="Sign out"
                title="Sign out"
                onClick={handleLogout}
              >
                ↪
              </button>
            </div>
          </div>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="breadcrumb-home"
                onClick={() => navigateDashboard("Overview")}
              >
                Workspace
              </button>

              <span className="breadcrumb-separator">/</span>
              <strong>{activePage}</strong>
            </div>

            <div className="topbar-actions">
              <div className="system-status">
                <span className="status-dot" />
                Demo workspace
              </div>

              <button
                className="icon-button"
                aria-label="Notifications"
                onClick={() =>
                  setNotice(
                    "You are all caught up on demo notifications."
                  )
                }
              >
                ♧
                <span className="notification-dot" />
              </button>

              <div className="topbar-divider" />

              <div className="topbar-user">
                <div className="profile-avatar small">AR</div>
                <span>Reviewer</span>
              </div>
            </div>
          </header>

          <div className="page-content">
            {notice && (
              <div className="notice-banner" role="status">
                <span>{notice}</span>

                <button
                  onClick={() => setNotice("")}
                  aria-label="Dismiss notification"
                >
                  ×
                </button>
              </div>
            )}

            {isIntakePage ? (
              <DocumentIntake
                onBack={() => navigateDashboard("Overview")}
              />
            ) : isApplicationsPage ? (
              <Applications
                onBack={() => navigateDashboard("Overview")}
                onNewApplication={() =>
                  navigateDashboard("Document intake")
                }
                onOpenReview={openReview}
              />
            ) : isVerificationPage ? (
              <Verification
                application={selectedApplication}
                onBack={() => navigateDashboard("Applications")}
              />
            ) : isComparisonPage ? (
              <RecordComparison
                onBack={() => navigateDashboard("Overview")}
              />
            ) : isActivityLogPage ? (
              <ActivityLog
                onBack={() => navigateDashboard("Overview")}
              />
            ) : isReportsPage ? (
              <Reports
                onBack={() => navigateDashboard("Overview")}
              />
            ) : (
              <>
                <div className="page-heading">
                  <div>
                    <div className="eyebrow">
                      REGULATORY WORKSPACE
                      <span>·</span>
                      FY 2026–27
                    </div>

                    <h1>
                      {activePage === "Overview"
                        ? "Good morning, Reviewer"
                        : activePage}
                    </h1>

                    <p>
                      {activePage === "Overview"
                        ? "Your application review workspace at a glance."
                        : `Manage and review ${activePage.toLowerCase()} in your regulatory workspace.`}
                    </p>
                  </div>

                  <button
                    className="primary-button"
                    onClick={() =>
                      navigateDashboard("Document intake")
                    }
                  >
                    <span>＋</span> New application
                  </button>
                </div>

                {activePage === "Overview" ? (
                  <>
                    <section className="metric-grid">
                      {metrics.map((metric, index) => (
                        <article
                          className="metric-card"
                          key={metric.label}
                        >
                          <div className="metric-top">
                            <span className="metric-label">
                              {metric.label}
                            </span>

                            <span
                              className={`metric-icon metric-icon-${index}`}
                            >
                              {metric.icon}
                            </span>
                          </div>

                          <div className="metric-value">
                            {metric.value}
                          </div>

                          <div className="metric-foot">
                            <span className="metric-foot-dot" />
                            {metric.change}
                          </div>
                        </article>
                      ))}
                    </section>

                    <section className="review-banner">
                      <div className="review-banner-symbol">
                        ✳
                      </div>

                      <div className="review-banner-copy">
                        <strong>
                          Review with greater clarity
                        </strong>

                        <p>
                          DocuLens assists reviewers with document
                          completeness, expiry checks and cross-record
                          comparisons. Final regulatory decisions
                          remain with authorised officials.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          navigateDashboard("Verification")
                        }
                      >
                        Open verification <span>→</span>
                      </button>
                    </section>

                    <section className="applications-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Recent applications</h2>
                          <p>
                            Track submissions and review progress.
                          </p>
                        </div>

                        <button
                          className="text-button"
                          onClick={() =>
                            navigateDashboard("Applications")
                          }
                        >
                          View all applications <span>→</span>
                        </button>
                      </div>

                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>APPLICATION / INSTITUTION</th>
                              <th>APPLICATION TYPE</th>
                              <th>SUBMITTED</th>
                              <th>STATUS</th>
                              <th />
                            </tr>
                          </thead>

                          <tbody>
                            {recentApplications.map(
                              (application) => (
                                <tr key={application.id}>
                                  <td>
                                    <div className="application-id">
                                      {application.id}
                                    </div>

                                    <div className="institution-name">
                                      {application.institution}
                                    </div>
                                  </td>

                                  <td>{application.type}</td>
                                  <td>{application.submitted}</td>

                                  <td>
                                    <span
                                      className={`status-badge status-${application.status
                                        .toLowerCase()
                                        .replaceAll(" ", "-")}`}
                                    >
                                      {application.status}
                                    </span>
                                  </td>

                                  <td>
                                    <button
                                      className="row-action"
                                      aria-label={`Open ${application.id}`}
                                      onClick={() =>
                                        openReview(application)
                                      }
                                    >
                                      →
                                    </button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="dashboard-table-footer">
                        <span>
                          Showing 4 sample applications
                        </span>

                        <button
                          className="text-button"
                          onClick={() =>
                            navigateDashboard("Applications")
                          }
                        >
                          Open register →
                        </button>
                      </div>
                    </section>

                    <footer className="page-footer">
                      <span>
                        DocuLens
                        <span className="footer-dot">·</span>
                        Preliminary application review assistance
                      </span>

                      <span>AI-assisted, human-led review</span>
                    </footer>
                  </>
                ) : (
                  <section className="placeholder-panel">
                    <div className="placeholder-symbol">
                      {navigation
                        .flatMap((group) => group.items)
                        .find(
                          (item) => item.label === activePage
                        )?.icon || "▦"}
                    </div>

                    <h2>{activePage}</h2>

                    <p>
                      This workspace section is scaffolded.
                      Detailed records, verification results and
                      status updates will be connected to the
                      backend in a later step.
                    </p>

                    <button
                      className="secondary-button"
                      onClick={() =>
                        navigateDashboard("Overview")
                      }
                    >
                      ← Back to overview
                    </button>
                  </section>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  switch (currentPage) {
    case "landing":
      return (
        <LandingPage
          onLogin={() => navigate("login")}
          onSignUp={() => navigate("signup")}
          onGetStarted={() => navigate("signup")}
        />
      );

    case "login":
      return (
        <LoginPage
          onBack={() => navigate("landing")}
          onSignUp={() => navigate("signup")}
          onForgotPassword={() => navigate("forgot-password")}
          onLoginSuccess={handleLoginSuccess}
        />
      );

    case "signup":
      return (
        <SignUpPage
          onBack={() => navigate("landing")}
          onLogin={() => navigate("login")}
          onSignUpSuccess={handleSignUpSuccess}
        />
      );

    case "institution-dashboard":
      return (
        <InstitutionDashboard
          institutionName={
            currentUser?.institution ||
            "Eastern Institute of Technology"
          }
          onNewApplication={() => navigate("document-intake")}
          onViewApplications={() => navigate("applications")}
          onOpenApplication={openReview}
          onLogout={handleLogout}
        />
      );

    case "admin-dashboard":
      return (
        <AdminDashboard
          reviewerName={
            currentUser?.name || "Authority Reviewer"
          }
          onOpenReview={openReview}
          onOpenApplications={() => navigate("applications")}
          onOpenActivityLog={() => navigate("activity-log")}
          onLogout={handleLogout}
        />
      );

    case "document-intake":
      return <DocumentIntake onBack={goBack} />;

    case "applications":
      return (
        <Applications
          onBack={goBack}
          onOpenReview={openReview}
          onNewApplication={() => navigate("document-intake")}
        />
      );

    case "verification":
      return (
        <Verification
          application={selectedApplication}
          onBack={goBack}
        />
      );

    case "record-comparison":
      return <RecordComparison onBack={goBack} />;

    case "activity-log":
      return <ActivityLog onBack={goBack} />;

    case "forgot-password":
      return (
        <main className="app-message-page">
          <section className="app-message-card">
            <div className="app-message-mark">D.</div>
            <p className="app-message-eyebrow">
              ACCOUNT SUPPORT
            </p>
            <h1>Reset your password</h1>
            <p>
              Password recovery requires a connected authentication
              backend. It is not enabled in this frontend prototype
              yet.
            </p>
            <button
              className="app-message-primary"
              onClick={() => navigate("login")}
            >
              Back to login
            </button>
          </section>
        </main>
      );

    default:
      return renderExistingDashboard();
  }
}

export default App;
