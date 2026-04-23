'use client';

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "./Pagination";
import StatsGrid from "./StatsGrid";
import TaskTable from "./TaskTable";
import Toolbar from "./Toolbar";
import {
  setAssigneeFilter,
  clearUpdateError,
  loadDashboard,
  optimisticStatusUpdate,
  patchTaskStatus,
  rollbackItems,
  setPage,
  setPriorityFilter,
  setSearchFilter,
  setSorting,
  setStatusFilter
} from "../store/tasksSlice";

export default function App() {
  const dispatch = useDispatch();
  const {
    items,
    meta,
    stats,
    filters,
    loading,
    error,
    updateError,
    updatingIds
  } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(loadDashboard());
  }, [
    dispatch,
    // Issue fixed: reload dependency list now includes all query dimensions
    // so backend and UI stay in sync when user changes filters/sorting.
    filters.status,
    filters.priority,
    filters.assignee,
    filters.sortBy,
    filters.sortOrder,
    filters.search,
    filters.page,
    filters.limit
  ]);

  async function handleStatusChange(id, status) {
    const previousItems = items.map((item) => ({ ...item }));

    dispatch(clearUpdateError());
    dispatch(optimisticStatusUpdate({ id, status }));

    const result = await dispatch(patchTaskStatus({ id, status }));

    if (patchTaskStatus.rejected.match(result)) {
      // Issue fixed: rollback optimistic UI state when server validation/update fails.
      dispatch(rollbackItems(previousItems));
    } else {
      dispatch(loadDashboard());
    }
  }

  return (
    <div className="page">
      <div className="header">
        <div>
          <h1>Ops Dashboard</h1>
          <p>Advanced full stack interview project focused on frontend/backend integration.</p>
        </div>
      </div>

      <Toolbar
        search={filters.search}
        status={filters.status}
        priority={filters.priority}
        assignee={filters.assignee}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSearchChange={(value) => dispatch(setSearchFilter(value))}
        onStatusChange={(value) => dispatch(setStatusFilter(value))}
        onPriorityChange={(value) => dispatch(setPriorityFilter(value))}
        onAssigneeChange={(value) => dispatch(setAssigneeFilter(value))}
        onSortByChange={(value) => dispatch(setSorting({ sortBy: value, sortOrder: filters.sortOrder }))}
        onSortOrderChange={(value) => dispatch(setSorting({ sortBy: filters.sortBy, sortOrder: value }))}
      />

      <StatsGrid stats={stats} />

      {loading && <div className="notice">Loading dashboard...</div>}
      {error && <div className="errorBox">{error}</div>}
      {updateError && <div className="errorBox">{updateError}</div>}

      {!loading && items.length === 0 ? (
        <div className="emptyState">No tasks match the current filters.</div>
      ) : (
        <>
          <TaskTable
            items={items}
            updatingIds={updatingIds}
            onStatusChange={handleStatusChange}
          />

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(value) => dispatch(setPage(value))}
          />
        </>
      )}
    </div>
  );
}
