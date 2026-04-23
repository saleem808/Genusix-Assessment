'use client';

function StatCard({ label, value }) {
  return (
    <div className="card">
      <div className="cardLabel">{label}</div>
      <div className="cardValue">{value}</div>
    </div>
  );
}

export default function StatsGrid({ stats }) {
  // Issue fixed: backend sends summary as stats.totals.*, not flat top-level fields.
  const totals = stats?.totals;

  return (
    <div className="statsGrid">
      <StatCard label="Total" value={totals?.total ?? "-"} />
      <StatCard label="Todo" value={totals?.todo ?? "-"} />
      <StatCard label="In Progress" value={totals?.inProgress ?? "-"} />
      <StatCard label="Done" value={totals?.done ?? "-"} />
    </div>
  );
}
