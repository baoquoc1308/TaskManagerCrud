// utils/taskHelpers.ts
export const getPriorityBadgeClass = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "low":
      return "badge badge-priority-low";
    case "medium":
      return "badge badge-priority-medium";
    case "high":
      return "badge badge-priority-high";
    default:
      return "badge";
  }
};

export const getStatusBadgeClass = (status?: string) => {
  const s = status?.trim().toLowerCase().replace(/ /g, "_");
  switch (s) {
    case "todo":
      return "badge badge-status-todo";
    case "in-progress":
      return "badge badge-status-in-progress";
    case "done":
      return "badge badge-status-done";
    default:
      return "badge";
  }
};
