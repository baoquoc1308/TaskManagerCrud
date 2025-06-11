// components/TaskItem/TaskItem.jsx
import type { Task } from "../../types/Task";
import FormattedTime from "../../utils/FormattedTime";
import AvatarWithTooltip from "../AvatarWithTooltip/AvatarWithTooltip";

interface TaskItemProps {
  task: Task;
  avatarUrl?: string;
  onTaskClick: (taskId: string) => void;
  onToggleDropdown: (taskId: number) => void;
  onRename: (task: Task) => void;
  onDelete: (task: Task) => void;
  isDropdownOpen: boolean;
  getInitialsFromEmail: (email: string) => string;
}

export default function TaskItem({
  task,
  avatarUrl,
  onTaskClick,
  onToggleDropdown,
  onRename,
  onDelete,
  isDropdownOpen,
  getInitialsFromEmail,
}: TaskItemProps) {
  return (
    <li className="task-item">
      <h3
        className="task-title clickable"
        onClick={() => onTaskClick(task.id.toString())}
      >
        {task.title}
      </h3>
      <div className="task-assignee">
        <AvatarWithTooltip
          avatarUrl={avatarUrl}
          email={task.email}
          initials={getInitialsFromEmail(task.email || "")}
        />
      </div>
      <div className="task-due-date">
        <FormattedTime isoString={task.time} />
      </div>
      <span
        className={`priority-badge priority-${task.priority?.toLowerCase()}`}
      >
        {task.priority}
      </span>
      <span className={`status-badge status-${task.status?.toLowerCase()}`}>
        {task.status}
      </span>
      <div className="dots-menu">
        <div
          className="dots-wrapper"
          onMouseEnter={() => {
            setTimeout(() => {
              const tooltip = document.getElementById(`tooltip-${task.id}`);
              if (tooltip) tooltip.classList.add("tooltip-visible");
            }, 1000);
          }}
          onMouseLeave={() => {
            const tooltip = document.getElementById(`tooltip-${task.id}`);
            if (tooltip) tooltip.classList.remove("tooltip-visible");
          }}
        >
          <button
            className="dots-button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDropdown(task.id);
            }}
          >
            ⋮
          </button>
          <div id={`tooltip-${task.id}`} className="tooltip">
            Other operations
          </div>
        </div>
        {isDropdownOpen && (
          <div className="dots-dropdown">
            <button onClick={() => onRename(task)}>Rename</button>
            <button onClick={() => onDelete(task)}>Delete</button>
          </div>
        )}
      </div>
    </li>
  );
}
