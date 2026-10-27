
import { useMemo, useState } from "react";
import "./ActivityLog.css";

const demoActivities = [
  {
    id: 1,
    action: "Application opened",
    description: "Opened an application for preliminary review.",
    reference: "EOA-2026-0248",
    actor: "Authority Reviewer",
    category: "Application",
    time: "24 Oct 2026, 10:42 AM",
    icon: "↗",
  },
  {
    id: 2,
    action: "Document checklist reviewed",
    description: "Recorded preliminary document review outcomes.",
    reference: "EOA-2026-0247",
    actor: "Authority Reviewer",
    category: "Verification",
    time: "24 Oct 2026, 10:15 AM",
    icon: "✓",
  },
  {
    id: 3,
    action: "Record comparison performed",
    description: "Compared manually entered values against a reference record.",
    reference: "EOA-2026-0246",
    actor: "Authority Reviewer",
    category: "Comparison",
    time: "23 Oct 2026, 04:30 PM",
    icon: "⇄",
  },
  {
    id: 4,
    action: "Application intake started",
    description: "Opened the document intake workflow.",
    reference: "EOA-2026-0245",
    actor: "Authority Reviewer",
    category: "Application",
    time: "23 Oct 2026, 11:20 AM",
    icon: "＋",
  },
  {
    id: 5,
    action: "Reviewer notes prepared",
    description: "Prepared preliminary observations for human review.",
    reference: "EOA-2026-0244",
    actor: "Authority Reviewer",
    category: "Verification",
    time: "22 Oct 2026, 02:05 PM",
    icon: "≡",
  },
  {
    id: 6,
    action: "Application register viewed",
    description: "Viewed the application register.",
    reference: "All applications",
    actor: "Authority Reviewer",
    category: "Application",
    time: "22 Oct 2026, 09:40 AM",
    icon: "▤",
  },
];

const categories = [
  "All activities",
  "Application",
  "Verification",
  "Comparison",
];

function ActivityLog({ onBack }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All activities");

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return demoActivities.filter((activity) => {
      const matchesCategory =
        category === "All activities" ||
        activity.category === category;

      const matchesSearch =
        !query ||
        [
          activity.action,
          activity.description,
          activity.reference,
          activity.actor,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  function resetFilters() {
    setSearch("");
    setCategory("All activities");
  }

  return (
    <div className="activity-page">
      <div className="activity-breadcrumb">
        <button type="button" onClick={onBack}>
          Workspace
        </button>
        <span>/</span>
        <strong>Activity log</strong>
      </div>

      <div className="activity-heading">
        <div>
          <div className="activity-eyebrow">
            WORKSPACE HISTORY
          </div>
          <h1>Activity log</h1>
          <p>
            Review recorded workflow activity and trace actions associated
            with application reviews.
          </p>
        </div>

        <span className="activity-demo-badge">
          Demonstration data
        </span>
      </div>

      <div className="activity-notice">
        <span className="activity-notice-icon">i</span>
        <p>
          <strong>Illustrative activity only.</strong> These entries are
          sample records, not a live or authoritative audit trail. A
          production audit log must be generated and retained by the
          backend with appropriate access controls.
        </p>
      </div>

      <section className="activity-summary-grid">
        <article className="activity-summary-card">
          <span className="activity-summary-icon">◷</span>
          <div>
            <p>Displayed activities</p>
            <strong>{filteredActivities.length}</strong>
          </div>
        </article>

        <article className="activity-summary-card">
          <span className="activity-summary-icon">▤</span>
          <div>
            <p>Application activities</p>
            <strong>
              {
                filteredActivities.filter(
                  (activity) => activity.category === "Application"
                ).length
              }
            </strong>
          </div>
        </article>

        <article className="activity-summary-card">
          <span className="activity-summary-icon">✓</span>
          <div>
            <p>Review activities</p>
            <strong>
              {
                filteredActivities.filter(
                  (activity) => activity.category === "Verification"
                ).length
              }
            </strong>
          </div>
        </article>
      </section>

      <section className="activity-panel">
        <div className="activity-panel-heading">
          <div>
            <h2>Workspace history</h2>
            <p>Search and filter the demonstration activity records.</p>
          </div>

          <span className="activity-record-count">
            {filteredActivities.length} records
          </span>
        </div>

        <div className="activity-toolbar">
          <label className="activity-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search actions, references or reviewers..."
              aria-label="Search activity log"
            />
          </label>

          <label className="activity-category-filter">
            <span className="visually-hidden">Filter by category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="activity-reset-button"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>

        {filteredActivities.length > 0 ? (
          <div className="activity-timeline">
            {filteredActivities.map((activity) => (
              <article
                className="activity-entry"
                key={activity.id}
              >
                <div className="activity-entry-icon">
                  {activity.icon}
                </div>

                <div className="activity-entry-content">
                  <div className="activity-entry-top">
                    <h3>{activity.action}</h3>
                    <span className="activity-entry-category">
                      {activity.category}
                    </span>
                  </div>

                  <p>{activity.description}</p>

                  <div className="activity-entry-meta">
                    <span>
                      <strong>Reference:</strong> {activity.reference}
                    </span>
                    <span>
                      <strong>Actor:</strong> {activity.actor}
                    </span>
                  </div>
                </div>

                <time className="activity-entry-time">
                  {activity.time}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <div className="activity-empty">
            <div className="activity-empty-icon">⌕</div>
            <h3>No matching activities</h3>
            <p>
              Try another search term or choose a different category.
            </p>
            <button
              type="button"
              className="activity-reset-button"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="activity-panel-footer">
          <span>
            Showing {filteredActivities.length} of {demoActivities.length}{" "}
            demonstration entries
          </span>
          <span>Sample history · Not a live audit trail</span>
        </div>
      </section>
    </div>
  );
}

export default ActivityLog;
