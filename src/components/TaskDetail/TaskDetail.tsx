import { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabase-client";
import type { Task } from "../../types/Task";
import "./TaskDetail.css";
import {
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from "../../utils/TaskHelpers";

interface TaskDetailProps {
  taskId: string | null;
  onClose: () => void;
  setTaskId: (id: string) => void;
}

function TaskDetail({ taskId, onClose, setTaskId }: TaskDetailProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // State + ref cho title
  const [titleFontSize, setTitleFontSize] = useState(24); // font mặc định lớn hơn cho title
  const titleRef = useRef<HTMLHeadingElement>(null);

  // State + ref cho description
  const [descFontSize, setDescFontSize] = useState(18);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showFullTitle, setShowFullTitle] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      setLoading(true);
      setTask(null); // clear current task
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (!error && data) {
        setTask(data);
        fetchRelatedTasks(data.priority, data.id);
      }
      setLoading(false);
    };

    fetchTask();
  }, [taskId]);

  useEffect(() => {
    if (!task) return;

    // Reset font size mỗi lần task mới load
    setTitleFontSize(24);
    setDescFontSize(18);

    const adjustFontSize = (
      element: HTMLElement | null,
      maxHeight: number,
      minFontSize: number,
      currentFontSize: number
    ): number => {
      if (!element) return currentFontSize;

      let fontSize = currentFontSize;
      element.style.fontSize = `${fontSize}px`;

      while (element.scrollHeight > maxHeight && fontSize > minFontSize) {
        fontSize -= 1;
        element.style.fontSize = `${fontSize}px`;
      }

      return fontSize;
    };

    // Đợi DOM cập nhật rồi đo
    setTimeout(() => {
      const newTitleFontSize = adjustFontSize(titleRef.current, 60, 14, 24); // vd maxHeight 60px cho title
      setTitleFontSize(newTitleFontSize);

      const newDescFontSize = adjustFontSize(descRef.current, 120, 12, 18); // maxHeight 120px cho description
      setDescFontSize(newDescFontSize);
    }, 50);
  }, [task]);

  const fetchRelatedTasks = async (priority: string, excludeId: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("priority", priority)
      .neq("id", excludeId)
      .limit(6);

    if (!error) {
      setRelatedTasks(data);
    }
  };

  if (!taskId) return null;

  if (loading || !task)
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
            {/* Title */}
            <div className="text-wrapper">
              <h2
                className={`text-content ${
                  showFullTitle ? "expanded-title" : "clamped-title"
                }`}
              >
                {task.title}
              </h2>
              {task.title.length > 100 && (
                <span
                  className="read-toggle"
                  onClick={() => setShowFullTitle(!showFullTitle)}
                >
                  {showFullTitle ? "Thu gọn" : "Xem thêm"}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="text-wrapper">
              <p
                className={`text-content ${
                  showFullDesc ? "expanded-desc" : "clamped-desc"
                }`}
              >
                {task.description}
              </p>
              {task.description.length > 200 && (
                <span
                  className="read-toggle"
                  onClick={() => setShowFullDesc(!showFullDesc)}
                >
                  {showFullDesc ? "Thu gọn" : "Xem thêm"}
                </span>
              )}
            </div>

            <p>
              <strong style={{ display: "block" }}>Time:</strong> {task.time}
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

        {relatedTasks.length > 0 && (
          <div className="related-tasks-section">
            <h3>Related Tasks</h3>
            <div className="related-task-list">
              {relatedTasks.map((t) => (
                <div
                  key={t.id}
                  className="related-task-card"
                  onClick={() => {
                    setTask(null); // clear current to show loading
                    setRelatedTasks([]);
                    setTaskId(String(t.id));
                  }}
                >
                  {t.image_url && (
                    <img
                      src={t.image_url}
                      alt={t.title}
                      className="related-task-img"
                    />
                  )}
                  <p className="related-task-title">{t.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDetail;
