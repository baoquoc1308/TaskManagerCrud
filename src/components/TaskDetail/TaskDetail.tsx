import { useEffect, useState } from "react";
import { supabase } from "../../supabase-client";
import type { Task } from "../../types/Task_123";
import "./TaskDetail.css";
import {
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from "../../utils/TaskHelpers_123";

interface TaskDetailProps {
  taskId: string | null;
  onClose: () => void;
}

function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (!error) {
        setTask(data);
      }
    };

    fetchTask();
  }, [taskId]);

  if (!taskId) return null;

  if (!task)
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <p>Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <div className="task-detail-content">
          <div className="task-image-section">
            {task.image_url && (
              <img src={task.image_url} alt="task" className="task-image" />
            )}
            <div className="task-buttons">
              <button className="edit-button">Edit</button>
              <button className="delete-button">Delete</button>
            </div>
          </div>

          <div className="task-info-section">
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            <p>
              <strong>Time:</strong> {task.time}
            </p>

            <div className="meta-row">
              <span className="task-meta">
                <strong>Priority:</strong>
                <span className={getPriorityBadgeClass(task.priority)}>
                  {task.priority}
                </span>
              </span>
              <span className="task-meta">
                <strong>Status:</strong>
                <span className={getStatusBadgeClass(task.status)}>
                  {task.status}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetail;
