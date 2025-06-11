// components/TaskSection/TaskSection.jsx
import type { Task } from "../../types/Task";
import TaskItem from "../TaskItem/TaskItem";

interface TaskSectionProps {
  title: string;
  status: string;
  statusClass: string;
  tasks: Task[];
  avatars: Record<string, string>;
  openDropdownId: number | null;
  onTaskClick: (taskId: string) => void;
  onToggleDropdown: (taskId: number) => void;
  onRename: (task: Task) => void;
  onDelete: (task: Task) => void;
  getInitialsFromEmail: (email: string) => string;
}

export default function TaskSection({
  title,
  status,
  statusClass,
  tasks,
  avatars,
  openDropdownId,
  onTaskClick,
  onToggleDropdown,
  onRename,
  onDelete,
  getInitialsFromEmail,
}: TaskSectionProps) {
  const filteredTasks = tasks.filter((task) => task.status === status);

  return (
    <div className="task-section">
      <div className={`section-header ${statusClass}`}>
        <span className="status-indicator"></span>
        {title}
      </div>
      <div className="task-table-header">
        <div>Name</div>
        <div>Assignee</div>
        <div>Date</div>
        <div>Priority</div>
        <div>Status</div>
        <div></div>
      </div>
      <ul className="task-list">
        {filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            avatarUrl={avatars[task.email]}
            onTaskClick={onTaskClick}
            onToggleDropdown={onToggleDropdown}
            onRename={onRename}
            onDelete={onDelete}
            isDropdownOpen={openDropdownId === task.id}
            getInitialsFromEmail={getInitialsFromEmail}
          />
        ))}
      </ul>
    </div>
  );
}
