const API_BASE = "http://localhost:4000";

// Issue fixed: backend returns { error: { message, details } } but UI only read { message }.
// This normalizer preserves validation details so update failures are actionable in the UI.
function normalizeApiError(body, fallbackMessage) {
  if (body?.error?.message) {
    const details = body.error.details?.length ? ` (${body.error.details.map((detail) => detail.message || detail.code || "invalid").join(", ")})` : "";
    return `${body.error.message}${details}`;
  }

  return body?.message || fallbackMessage;
}

export async function fetchTasks({
  status = "all",
  priority = "all",
  assignee = "all",
  sortBy = "updatedAt",
  sortOrder = "desc",
  includeAudit = false,
  search = "",
  page = 1,
  limit = 5
}) {
  const params = new URLSearchParams();

  // Issue fixed: frontend query state was out of sync with backend contract.
  // Added priority/assignee/sort/includeAudit so filters and pagination compose correctly.
  if (status !== "all") params.set("status", status);
  if (priority !== "all") params.set("priority", priority);
  if (assignee !== "all") params.set("assignee", assignee);
  if (search.trim()) params.set("search", search.trim());
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);
  if (includeAudit) params.set("includeAudit", "true");
  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await fetch(`${API_BASE}/tasks?${params.toString()}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(normalizeApiError(body, "Failed to load tasks"));
  }

  return response.json();
}

export async function fetchStats() {
  const response = await fetch(`${API_BASE}/tasks/stats/summary`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(normalizeApiError(body, "Failed to load stats"));
  }

  return response.json();
}

export async function updateTaskStatus(id, status) {
  // Issue fixed: endpoint path was `/task/:id` and did not match backend `/tasks/:id`.
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(normalizeApiError(body, "Failed to update task"));
  }

  return response.json();
}
