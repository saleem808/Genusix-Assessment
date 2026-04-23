'use client';

export default function Toolbar({
  search,
  status,
  priority,
  assignee,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onSortByChange,
  onSortOrderChange
}) {
  return (
    <div className="toolbar">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search tasks by title..."
      />

      <select value={status} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="all">All statuses</option>
        <option value="todo">todo</option>
        <option value="in_progress">in_progress</option>
        <option value="done">done</option>
      </select>

      <select value={priority} onChange={(e) => onPriorityChange(e.target.value)}>
        <option value="all">All priorities</option>
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
      </select>

      <select value={assignee} onChange={(e) => onAssigneeChange(e.target.value)}>
        <option value="all">All assignees</option>
        <option value="Maya">Maya</option>
        <option value="Leo">Leo</option>
        <option value="Sarah">Sarah</option>
        <option value="Chris">Chris</option>
        <option value="Ava">Ava</option>
      </select>

      <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
        <option value="updatedAt">Sort by updatedAt</option>
        <option value="createdAt">Sort by createdAt</option>
        <option value="title">Sort by title</option>
        <option value="priority">Sort by priority</option>
        <option value="status">Sort by status</option>
      </select>

      <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)}>
        <option value="desc">desc</option>
        <option value="asc">asc</option>
      </select>
    </div>
  );
}
