
import { useMemo, useState } from "react";
import "./Reports.css";

const reportApplications = [
  {
    id: "EOA-2026-0248",
    institution: "Eastern Institute of Technology",
    type: "Extension of Approval",
    status: "Under review",
    submitted: "2026-10-24",
    outcome: "Pending",
  },
  {
    id: "EOA-2026-0247",
    institution: "Kalinga School of Engineering",
    type: "Extension of Approval",
    status: "Documents pending",
    submitted: "2026-10-23",
    outcome: "Pending",
  },
  {
    id: "EOA-2026-0246",
    institution: "Coastal Institute of Management",
    type: "New approval",
    status: "Verification",
    submitted: "2026-10-22",
    outcome: "Pending",
  },
  {
    id: "EOA-2026-0245",
    institution: "Odisha College of Technology",
    type: "Extension of Approval",
    status: "Completed",
    submitted: "2026-10-21",
    outcome: "No issue identified",
  },
  {
    id: "EOA-2026-0244",
    institution: "Riverdale Institute of Engineering",
    type: "Extension of Approval",
    status: "Needs attention",
    submitted: "2026-10-20",
    outcome: "Needs human review",
  },
  {
    id: "EOA-2026-0243",
    institution: "Eastern School of Applied Sciences",
    type: "New approval",
    status: "Completed",
    submitted: "2026-10-19",
    outcome: "No issue identified",
  },
  {
    id: "EOA-2026-0242",
    institution: "Central Institute of Technology",
    type: "Extension of Approval",
    status: "Under review",
    submitted: "2026-10-18",
    outcome: "Pending",
  },
  {
    id: "EOA-2026-0241",
    institution: "Greenfield College of Engineering",
    type: "New approval",
    status: "Completed",
    submitted: "2026-10-17",
    outcome: "Needs human review",
  },
];

const statusOptions = [
  "All statuses",
  "Under review",
  "Documents pending",
  "Verification",
  "Needs attention",
  "Completed",
];

const typeOptions = [
  "All application types",
  "Extension of Approval",
  "New approval",
];

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(rows) {
  const headers = [
    "Application ID",
    "Institution",
    "Application Type",
    "Status",
    "Submission Date",
    "Preliminary Review Outcome",
  ];

  const csvRows = [
    headers,
    ...rows.map((application) => [
      application.id,
      application.institution,
      application.type,
      application.status,
      application.submitted,
      application.outcome,
    ]),
  ];

  const csvContent = csvRows
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "doculens-demonstration-report.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function Reports({ onBack }) {
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [typeFilter, setTypeFilter] = useState("All application types");
  const [search, setSearch] = useState("");

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reportApplications.filter((application) => {
      const matchesStatus =
        statusFilter === "All statuses" ||
        application.status === statusFilter;

      const matchesType =
        typeFilter === "All application types" ||
        application.type === typeFilter;

      const matchesSearch =
        !query ||
        [
          application.id,
          application.institution,
          application.type,
          application.status,
          application.outcome,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [statusFilter, typeFilter, search]);

  const completedCount = filteredApplications.filter(
    (application) => application.status === "Completed"
  ).length;

  const attentionCount = filteredApplications.filter(
    (application) =>
      application.status === "Needs attention" ||
      application.outcome === "Needs human review"
  ).length;

  const pendingCount = filteredApplications.filter(
    (application) =>
      application.status === "Under review" ||
      application.status === "Documents pending" ||
      application.status === "Verification"
  ).length;

  const statusBreakdown = [
    {
      label: "Completed",
      count: filteredApplications.filter(
        (application) => application.status === "Completed"
      ).length,
      color: "reports-bar-completed",
    },
    {
      label: "Under review",
      count: filteredApplications.filter(
        (application) => application.status === "Under review"
      ).length,
      color: "reports-bar-review",
    },
    {
      label: "Documents pending",
      count: filteredApplications.filter(
        (application) => application.status === "Documents pending"
      ).length,
      color: "reports-bar-pending",
    },
    {
      label: "Verification",
      count: filteredApplications.filter(
        (application) => application.status === "Verification"
      ).length,
      color: "reports-bar-verification",
    },
    {
      label: "Needs attention",
      count: filteredApplications.filter(
        (application) => application.status === "Needs attention"
      ).length,
      color: "reports-bar-attention",
    },
  ];

  const total = filteredApplications.length;

  function resetFilters() {
    setStatusFilter("All statuses");
    setTypeFilter("All application types");
    setSearch("");
  }

  return (
    <div className="reports-page">
      <div className="reports-breadcrumb">
        <button type="button" onClick={onBack}>
          Workspace
        </button>
        <span>/</span>
        <strong>Reports</strong>
      </div>

      <div className="reports-heading">
        <div>
          <div className="reports-eyebrow">
            REPORTING AND OVERSIGHT
          </div>
          <h1>Reports</h1>
          <p>
            Review application workload, processing status and preliminary
            review outcomes across the demonstration register.
          </p>
        </div>

        <button
          type="button"
          className="reports-export-button"
          onClick={() => downloadCsv(filteredApplications)}
        >
          <span aria-hidden="true">↓</span>
          Export CSV
        </button>
      </div>

      <div className="reports-demo-notice">
        <span className="reports-notice-icon">i</span>
        <p>
          <strong>Demonstration report.</strong> All figures and
          application records on this page are illustrative. They are
          not live authority statistics or official compliance findings.
        </p>
      </div>

      <section className="reports-metrics">
        <article className="reports-metric-card">
          <div className="reports-metric-top">
            <span className="reports-metric-label">
              Applications in view
            </span>
            <span className="reports-metric-icon">▤</span>
          </div>
          <strong className="reports-metric-value">{total}</strong>
          <span className="reports-metric-caption">
            Matching the current filters
          </span>
        </article>

        <article className="reports-metric-card">
          <div className="reports-metric-top">
            <span className="reports-metric-label">
              Completed applications
            </span>
            <span className="reports-metric-icon">✓</span>
          </div>
          <strong className="reports-metric-value">
            {completedCount}
          </strong>
          <span className="reports-metric-caption">
            Marked completed in sample data
          </span>
        </article>

        <article className="reports-metric-card">
          <div className="reports-metric-top">
            <span className="reports-metric-label">
              In progress
            </span>
            <span className="reports-metric-icon">◷</span>
          </div>
          <strong className="reports-metric-value">
            {pendingCount}
          </strong>
          <span className="reports-metric-caption">
            Awaiting review or verification
          </span>
        </article>

        <article className="reports-metric-card">
          <div className="reports-metric-top">
            <span className="reports-metric-label">
              Human attention
            </span>
            <span className="reports-metric-icon attention">!</span>
          </div>
          <strong className="reports-metric-value">
            {attentionCount}
          </strong>
          <span className="reports-metric-caption">
            Includes outcomes needing review
          </span>
        </article>
      </section>

      <section className="reports-overview-grid">
        <article className="reports-panel reports-status-panel">
          <div className="reports-panel-heading">
            <div>
              <h2>Application status</h2>
              <p>Distribution for the currently filtered records.</p>
            </div>
            <span className="reports-panel-icon">▥</span>
          </div>

          {total > 0 ? (
            <div className="reports-status-list">
              {statusBreakdown.map((item) => {
                const percentage =
                  total === 0 ? 0 : (item.count / total) * 100;

                return (
                  <div className="reports-status-row" key={item.label}>
                    <div className="reports-status-label">
                      <span>{item.label}</span>
                      <strong>{item.count}</strong>
                    </div>

                    <div
                      className="reports-progress-track"
                      role="progressbar"
                      aria-label={`${item.label} applications`}
                      aria-valuemin={0}
                      aria-valuemax={total}
                      aria-valuenow={item.count}
                    >
                      <div
                        className={`reports-progress-fill ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="reports-chart-empty">
              No records match the selected filters.
            </div>
          )}

          <div className="reports-panel-footnote">
            <span className="reports-footnote-dot" />
            Counts update when you change the filters.
          </div>
        </article>

        <article className="reports-panel reports-outcome-panel">
          <div className="reports-panel-heading">
            <div>
              <h2>Preliminary review outcomes</h2>
              <p>Summary of the sample outcome labels.</p>
            </div>
            <span className="reports-panel-icon">◎</span>
          </div>

          <div className="reports-outcome-list">
            <div className="reports-outcome-item">
              <span className="reports-outcome-marker outcome-clear" />
              <div>
                <strong>No issue identified</strong>
                <p>
                  No issue was recorded in the illustrative preliminary
                  review.
                </p>
              </div>
              <span className="reports-outcome-number">
                {
                  filteredApplications.filter(
                    (application) =>
                      application.outcome === "No issue identified"
                  ).length
                }
              </span>
            </div>

            <div className="reports-outcome-item">
              <span className="reports-outcome-marker outcome-review" />
              <div>
                <strong>Needs human review</strong>
                <p>
                  A reviewer should assess the recorded observations.
                </p>
              </div>
              <span className="reports-outcome-number">
                {
                  filteredApplications.filter(
                    (application) =>
                      application.outcome === "Needs human review"
                  ).length
                }
              </span>
            </div>

            <div className="reports-outcome-item">
              <span className="reports-outcome-marker outcome-pending" />
              <div>
                <strong>Pending</strong>
                <p>
                  A preliminary outcome has not been recorded.
                </p>
              </div>
              <span className="reports-outcome-number">
                {
                  filteredApplications.filter(
                    (application) => application.outcome === "Pending"
                  ).length
                }
              </span>
            </div>
          </div>

          <div className="reports-human-review-note">
            <span>i</span>
            <p>
              These labels do not constitute approval, rejection or a
              finding of non-compliance.
            </p>
          </div>
        </article>
      </section>

      <section className="reports-panel reports-register-panel">
        <div className="reports-panel-heading">
          <div>
            <h2>Application report register</h2>
            <p>
              Search, filter and export the matching demonstration records.
            </p>
          </div>

          <span className="reports-register-count">
            {filteredApplications.length} records
          </span>
        </div>

        <div className="reports-filters">
          <label className="reports-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search application or institution..."
              aria-label="Search report records"
            />
          </label>

          <label className="reports-select-label">
            <span className="visually-hidden">Filter by status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="reports-select-label">
            <span className="visually-hidden">
              Filter by application type
            </span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="reports-reset-button"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>

        {filteredApplications.length > 0 ? (
          <div className="reports-table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>APPLICATION</th>
                  <th>INSTITUTION</th>
                  <th>TYPE</th>
                  <th>SUBMITTED</th>
                  <th>STATUS</th>
                  <th>PRELIMINARY OUTCOME</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <span className="reports-application-id">
                        {application.id}
                      </span>
                    </td>

                    <td>{application.institution}</td>
                    <td>{application.type}</td>
                    <td>{application.submitted}</td>

                    <td>
                      <span
                        className={`reports-status-pill reports-status-${application.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {application.status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`reports-outcome-text ${
                          application.outcome === "Needs human review"
                            ? "needs-human-review"
                            : ""
                        }`}
                      >
                        {application.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="reports-empty-state">
            <span>⌕</span>
            <h3>No matching applications</h3>
            <p>Adjust your search or filters to see other records.</p>
            <button
              type="button"
              className="reports-reset-button"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="reports-table-footer">
          <span>
            Showing {filteredApplications.length} of{" "}
            {reportApplications.length} demonstration records
          </span>
          <span>Sample data · Not an official report</span>
        </div>
      </section>

      <footer className="reports-footer">
        <span>DocuLens · Reporting and oversight</span>
        <span>AI-assisted, human-led review</span>
      </footer>
    </div>
  );
}

export default Reports;
Reports.css