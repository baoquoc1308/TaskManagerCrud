import { useState } from "react";
import type { Task } from "../../types/Task";
import {
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from "../../utils/TaskHelpers";
import "./TaskList.css";
import TaskDetail from "../TaskDetail";
import { Empty } from "antd"; // Import Empty component của antd

interface TaskListProps {
  tasks: Task[];
  editingId: number | null;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  newDescription: string;
  setNewDescription: React.Dispatch<React.SetStateAction<string>>;
  confirmDeleteTask: (task: Task) => void;
  updateTask: (taskId: number) => Promise<void>;
  newTaskAdded: number | null;
  lastTaskRef: React.RefObject<HTMLLIElement | null>;
}

export default function TaskList({
  tasks,
  editingId,
  setEditingId,
  newDescription,
  setNewDescription,
  confirmDeleteTask,
  updateTask,
  newTaskAdded,
  lastTaskRef,
}: TaskListProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Mở modal detail khi click vào item (ngoại trừ khi đang edit)
  const handleClickTask = (taskId: string) => {
    if (editingId !== null) return; // tránh mở modal khi đang edit task khác
    setSelectedTaskId(taskId);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setSelectedTaskId(null);
  };

  if (tasks.length === 0) {
    return (
      <div style={{ marginTop: 50, textAlign: "center" }}>
        <Empty description="No tasks found" />
      </div>
    );
  }

  return (
    <>
      <ul className="task-list">
        {tasks.map((task, index) => (
          <li
            key={task.id}
            className={`task-item ${
              newTaskAdded === task.id ? "new-task" : ""
            }`}
            ref={task.id === newTaskAdded ? lastTaskRef : null}
          >
            {/* Thay Link bằng div clickable */}
            <div
              className="task-link"
              onClick={() => handleClickTask(String(task.id))}
              style={{ cursor: editingId === null ? "pointer" : "default" }}
            >
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <span>
                <strong>Time:</strong> {task.time}
              </span>
              <div className="meta-row">
                <span className="task-meta">
                  <strong>Priority:</strong>
                  <span className={getPriorityBadgeClass(task.priority!)}>
                    {task.priority}
                  </span>
                </span>
                <span className="task-meta">
                  <strong>Status:</strong>
                  <span className={getStatusBadgeClass(task.status!)}>
                    {task.status}
                  </span>
                </span>
              </div>
              {task.image_url && <img src={task.image_url} alt="task" />}
            </div>

            {editingId === task.id ? (
              <>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Updated description..."
                />
                <div className="task-actions">
                  <button
                    className="save-btn"
                    onClick={() => updateTask(task.id)}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="task-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    setEditingId(task.id);
                    setNewDescription(task.description);
                  }}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => confirmDeleteTask(task)}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Modal hiển thị task detail */}
      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={handleCloseModal}
          setTaskId={setSelectedTaskId}
        />
      )}
    </>
  );
}
