'use client';

export default function TaskTable({ items, updatingIds, onStatusChange }) {
  return (
    <div className="panel">
      <div className="panelHeader">
        <h2>Tasks</h2>
        <p>Frontend and backend behavior should stay consistent here.</p>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Assignee</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Change Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.assignee}</td>
              <td>{task.priority}</td>
              <td>{task.status}</td>
              <td>
                <select
                  value={task.status}
                  disabled={updatingIds.includes(task.id)}
                  onChange={(e) => onStatusChange(task.id, e.target.value)}
                >
                  <option value="todo">todo</option>
                  <option value="in_progress">in_progress</option>
                  <option value="done">done</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
