import dayjs from "dayjs";
import { orderBy, groupBy } from "lodash-es";
import { z } from "zod";
import { allowedPriorities, allowedSortFields, allowedSortOrders, allowedStatuses } from "../constants/tasks.js";
import { taskAuditTrail, tasks } from "../data/tasks.js";
import { badRequest, notFound } from "../utils/apiError.js";

const listQuerySchema = z.object({
  status: z.enum(["all", ...allowedStatuses]).default("all"),
  priority: z.enum(["all", ...allowedPriorities]).default("all"),
  assignee: z.string().trim().max(50).default("all"),
  search: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(5),
  sortBy: z.enum(allowedSortFields).default("updatedAt"),
  sortOrder: z.enum(allowedSortOrders).default("desc"),
  includeAudit: z
    .union([z.boolean(), z.string().transform((value) => value === "true")])
    .optional()
    .default(false)
});

const updateTaskSchema = z.object({
  status: z.enum(allowedStatuses).optional(),
  priority: z.enum(allowedPriorities).optional(),
  assignee: z.string().trim().min(2).max(50).optional(),
  estimateHours: z.coerce.number().int().min(1).max(40).optional(),
  note: z.string().trim().min(5).max(250).optional()
}).refine((value) => Object.keys(value).some(Boolean), {
  message: "At least one updatable field is required"
});

function normalizeSearch(search) {
  return search.trim().toLowerCase();
}

function matchesSearch(task, searchTerm) {
  if (!searchTerm) return true;

  const haystack = [task.title, task.assignee, task.priority, task.status, ...(task.tags || [])]
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm);
}

function comparePriority(priority) {
  return { high: 3, medium: 2, low: 1 }[priority] || 0;
}

function orderTasks(result, sortBy, sortOrder) {
  if (sortBy === "priority") {
    return orderBy(result, [(task) => comparePriority(task.priority), "updatedAt"], [sortOrder, "desc"]);
  }

  return orderBy(result, [sortBy], [sortOrder]);
}

export function listTasks(rawQuery) {
  const parsed = listQuerySchema.safeParse(rawQuery);

  if (!parsed.success) {
    throw badRequest("Invalid task query", parsed.error.issues);
  }

  const query = parsed.data;
  const normalizedSearch = normalizeSearch(query.search);

  let result = [...tasks];

  if (query.status !== "all") {
    result = result.filter((task) => task.status === query.status);
  }

  if (query.priority !== "all") {
    result = result.filter((task) => task.priority === query.priority);
  }

  if (query.assignee !== "all") {
    result = result.filter((task) => task.assignee.toLowerCase() === query.assignee.toLowerCase());
  }

  result = result.filter((task) => matchesSearch(task, normalizedSearch));
  result = orderTasks(result, query.sortBy, query.sortOrder);

  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.limit;
  const items = result.slice(start, start + query.limit);

  return {
    items,
    meta: {
      total,
      page,
      requestedPage: query.page,
      limit: query.limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      appliedFilters: {
        status: query.status,
        priority: query.priority,
        assignee: query.assignee,
        search: normalizedSearch,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder
      }
    },
    auditPreview: query.includeAudit ? taskAuditTrail.slice(-10).reverse() : undefined
  };
}

export function updateTask(taskId, payload, actor = "system") {
  const parsed = updateTaskSchema.safeParse(payload);

  if (!parsed.success) {
    throw badRequest("Invalid task update", parsed.error.issues);
  }

  const task = tasks.find((item) => item.id === Number(taskId));

  if (!task) {
    throw notFound("Task not found");
  }

  const before = { ...task };
  const updates = parsed.data;

  Object.assign(task, updates, {
    updatedAt: new Date().toISOString()
  });

  const auditEntry = {
    id: taskAuditTrail.length + 1,
    taskId: task.id,
    actor,
    action: "task.updated",
    note: updates.note || "Task updated from dashboard",
    changes: Object.entries(updates)
      .filter(([key]) => key !== "note")
      .map(([field, value]) => ({
        field,
        before: before[field],
        after: value
      })),
    createdAt: new Date().toISOString()
  };

  taskAuditTrail.push(auditEntry);

  return {
    item: task,
    audit: auditEntry
  };
}

export function buildSummary() {
  const byStatus = groupBy(tasks, "status");
  const byPriority = groupBy(tasks, "priority");
  const highPriorityOpen = tasks.filter((task) => task.priority === "high" && task.status !== "done").length;
  const overdueEstimateHours = tasks.filter((task) => task.estimateHours >= 8 && task.status !== "done").length;
  const recentlyUpdated = tasks.filter((task) => dayjs().diff(dayjs(task.updatedAt), "day") <= 7).length;

  return {
    totals: {
      total: tasks.length,
      todo: byStatus.todo?.length || 0,
      inProgress: byStatus.in_progress?.length || 0,
      done: byStatus.done?.length || 0
    },
    priorities: {
      low: byPriority.low?.length || 0,
      medium: byPriority.medium?.length || 0,
      high: byPriority.high?.length || 0
    },
    workload: {
      totalEstimateHours: tasks.reduce((sum, task) => sum + task.estimateHours, 0),
      highPriorityOpen,
      overdueEstimateHours,
      recentlyUpdated
    }
  };
}

export function listAuditTrail(limit = 20) {
  return taskAuditTrail.slice(-limit).reverse();
}
