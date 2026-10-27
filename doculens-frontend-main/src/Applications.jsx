
import { useMemo, useState } from "react";
import "./Applications.css";

const demoApplications = [
  {
    id: "EOA-2026-0248",
    institution: "Eastern Institute of Technology",
    type: "Extension of Approval",
    year: "2026–27",
    submitted: "24 Oct 2026",
    status: "Under review",
  },
  {
    id: "EOA-2026-0247",
    institution: "Kalinga School of Engineering",
    type: "Extension of Approval",
    year: "2026–27",
    submitted: "23 Oct 2026",
    status: "Documents pending",
  },
  {
    id: "EOA-2026-0246",
    institution: "Coastal Institute of Management",
    type: "New approval",
    year: "2026–27",
    submitted: "22 Oct 2026",
    status: "Verification",
  },
  {
    id: "EOA-2026-0245",
    institution: "Odisha College of Technology",
    type: "Extension of Approval",
    year: "2026–27",
    submitted: "21 Oct 2026",
    status: "Completed",
  },
  {
    id: "EOA-2026-0244",
    institution: "Eastern School of Architecture",
    type: "Extension of Approval",
    year: "2026–27",
    submitted: "20 Oct 2026",
    status: "Under review",
  },
  {
    id: "EOA-2026-0243",
    institution: "Riverdale Institute of Technology",
    type: "New approval",
    year: "2026–27",
    submitted: "18 Oct 2026",
    status: "Documents pending",
  },
  {
    id: "EOA-2026-0242",
    institution: "Greenfield College of Engineering",
    type: "Other approval application",
    year: "2026–27",
    submitted: "17 Oct 2026",
    status: "Verification",
  },
  {
    id: "EOA-2026-0241",
    institution: "Eastern Institute of Design",
    type: "Change of institution details",
    year: "2026–27",
    submitted: "15 Oct 2026",
    status: "Completed",
  },
];

const statuses = [
  "All statuses",
  "Under review",
  "Documents pending",
  "Verification",
  "Completed",
];

const applicationTypes = [
  "All types",
  "Extension of Approval",
  "New approval",
  "Change of institution details",
  "Other approval application",
];

function Applications({ onBack, onOpenReview, onNewApplication }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [sortOrder, setSortOrder] = useState("Newest first");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    const results = demoApplications.filter((application) => {
      const matchesSearch = [
        application.id,
        application.institution,
        application.type,
        application.year,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        statusFilter === "All statuses" ||
        application.status === statusFilter;

      const matchesType =
        typeFilter === "All types" ||
        application.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    return [...results].sort((a, b) => {
      const comparison = a.id.localeCompare(b.id);
      return sortOrder === "Newest first" ? -comparison : comparison;
    });
  }, [search, statusFilter, typeFilter, sortOrder]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setTypeFilter("All types");
    setSortOrder("Newest first");
  }

  function openReview(application) {
    setSelectedApplication(null);
    onOpenReview(application);
  }

  return (
    <div className="applications-page">
      <div className="applications-breadcrumb">
        <button type="button" onClick={onBack}>Workspace</button>
        <span>/</span>
        <strong>Applications</strong>
      </div>

      <div className="applications-heading">
        <div>
          <div className="applications-eyebrow">
            REGULATORY WORKSPACE · FY 2026–27
          </div>
          <h1>Application register</h1>
          <p>
            Search, filter and review institutional approval applications.
          </p>
        </div>

        <button
          className="applications-primary-button"
          onClick={onNewApplication}
        >
          <span>＋</span> New application
        </button>
      </div>

      <div className="applications-demo-notice">
        <span className="applications-notice-icon">i</span>
        <p>
          <strong>Demonstration records.</strong> These sample entries are not
          live institutional submissions or official AICTE records.
        </p>
      </div>

      <section className="applications-stats">
        <div className="applications-stat-card">
          <span>Displayed records</span>
          <strong>{filteredApplications.length}</strong>
          <small>Matching current filters</small>
        </div>

        <div className="applications-stat-card">
          <span>Under review</span>
          <strong>
            {demoApplications.filter((app) => app.status === "Under review").length}
          </strong>
          <small>Sample records</small>
        </div>

        <div className="applications-stat-card">
          <span>Documents pending</span>
          <strong>
            {demoApplications.filter((app) => app.status === "Documents pending").length}
          </strong>
          <small>Sample records</small>
        </div>

        <div className="applications-stat-card">
          <span>Completed</span>
          <strong>
            {demoApplications.filter((app) => app.status === "Completed").length}
          </strong>
          <small>Sample records</small>
        </div>
      </section>

      <section className="applications-register">
        <div className="applications-register-heading">
          <div>
            <h2>All applications</h2>
            <p>Use the filters to narrow down the register.</p>
          </div>

          <span className="applications-demo-label">DEMO DATA</span>
        </div>

        <div className="applications-filters">
          <label className="applications-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID, institution or type..."
              aria-label="Search applications"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter applications by status"
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filter applications by type"
          >
            {applicationTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            aria-label="Sort applications"
          >
            <option>Newest first</option>
            <option>Oldest first</option>
          </select>

          <button
            type="button"
            className="applications-clear-button"
            onClick={clearFilters}
          >
            Reset
          </button>
        </div>

        <div className="applications-table-wrap">
          <table className="applications-table">
            <thead>
              <tr>
                <th>APPLICATION / INSTITUTION</th>
                <th>APPLICATION TYPE</th>
                <th>ACADEMIC YEAR</th>
                <th>SUBMITTED</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <strong className="applications-id">{application.id}</strong>
                    <span className="applications-institution">
                      {application.institution}
                    </span>
                  </td>

                  <td>{application.type}</td>
                  <td>{application.year}</td>
                  <td>{application.submitted}</td>

                  <td>
                    <span
                      className={`applications-status applications-status-${application.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {application.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="applications-view-button"
                      onClick={() => setSelectedApplication(application)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan="6" className="applications-empty">
                    <strong>No matching applications</strong>
                    <span>Try changing your search or filters.</span>
                    <button type="button" onClick={clearFilters}>
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="applications-table-footer">
          <span>
            Showing {filteredApplications.length} of {demoApplications.length} demo records
          </span>
          <span>Live data requires backend integration</span>
        </div>
      </section>

      {selectedApplication && (
        <div
          className="application-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedApplication(null);
            }
          }}
        >
          <section
            className="application-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-modal-title"
          >
            <div className="application-modal-heading">
              <div>
                <span>APPLICATION DETAILS</span>
                <h2 id="application-modal-title">
                  {selectedApplication.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                aria-label="Close application details"
              >
                ×
              </button>
            </div>

            <p className="application-modal-institution">
              {selectedApplication.institution}
            </p>

            <dl className="application-detail-list">
              <div>
                <dt>Application type</dt>
                <dd>{selectedApplication.type}</dd>
              </div>
              <div>
                <dt>Academic year</dt>
                <dd>{selectedApplication.year}</dd>
              </div>
              <div>
                <dt>Submitted</dt>
                <dd>{selectedApplication.submitted}</dd>
              </div>
              <div>
                <dt>Current demo status</dt>
                <dd>{selectedApplication.status}</dd>
              </div>
            </dl>

            <div className="application-modal-notice">
              This is a sample record. Its documents and verification results
              are not available yet.
            </div>

            <div className="application-modal-actions">
              <button
                type="button"
                className="applications-modal-secondary"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="applications-modal-primary"
                onClick={() => openReview(selectedApplication)}
              >
                Open review workspace →
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Applications;
