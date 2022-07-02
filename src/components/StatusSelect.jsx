const POSSIBLE_STATUS = [
  { id: "backlog", name: "Backlog" },
  { id: "todo", name: "To Do" },
  { id: "inProgress", name: "In Progress" },
  { id: "done", name: "Done" },
  { id: "cancelled", name: "Cancelled" },
];

export function StatusSelect({ value, onChange }) {
  return (
    <select value={value} onChange={onChange} className="status-select">
      <option value="">Select a status</option>
      {POSSIBLE_STATUS.map((status) => (
        <option key={status.id} value={status.id}>
          {status.name}
        </option>
      ))}
    </select>
  );
}
