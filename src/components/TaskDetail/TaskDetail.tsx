import { useEffect, useState } from "react";
import { supabase } from "../../supabase-client";
import type { Task } from "../../types/Task";
import "./TaskDetail.css";
import {
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from "../../utils/TaskHelpers";
import DeleteModal from "../DeleteModal";
import { toast } from "react-toastify";
import ExpandableText from "../ExpandableText/ExpandableText";
import FormattedTime from "../../utils/FormattedTime";

interface TaskDetailProps {
  taskId: string | null;
  onClose: () => void;
  setTaskId: (id: string) => void;
  editingId: number | null;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  // newTitle: string;
  // setNewTitle: React.Dispatch<React.SetStateAction<string>>;
  newDescription: string;
  setNewDescription: React.Dispatch<React.SetStateAction<string>>;
  updateTask: (taskId: number) => Promise<void>;
  onDeleteSuccess: (deletedId: number) => void;
}

function TaskDetail({
  taskId,
  onClose,
  setTaskId,
  editingId,
  setEditingId,
  // newTitle,
  // setNewTitle,
  newDescription,
  setNewDescription,
  updateTask,
  onDeleteSuccess,
}: TaskDetailProps) {
  if (!taskId) return null;
  const [task, setTask] = useState<Task | null>(null);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // const titleRef = useRef<HTMLHeadingElement>(null);

  // const descRef = useRef<HTMLParagraphElement>(null);
  // const [showFullDesc, setShowFullDesc] = useState(false);
  // const [showFullTitle, setShowFullTitle] = useState(false);

  const isEditingThisTask = editingId === Number(taskId);

  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      setLoading(true);
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
  }, [taskId, editingId]);

  useEffect(() => {
    if (isEditingThisTask && task) {
      // setNewTitle(task.title);
      setNewDescription(task.description);
    }
  }, [isEditingThisTask, task, setNewDescription]);

  // useEffect(() => {
  //   if (!task) return;

  //   setTitleFontSize(24);
  //   setDescFontSize(18);

  //   const adjustFontSize = (
  //     element: HTMLElement | null,
  //     maxHeight: number,
  //     minFontSize: number,
  //     currentFontSize: number
  //   ): number => {
  //     if (!element) return currentFontSize;

  //     let fontSize = currentFontSize;
  //     element.style.fontSize = `${fontSize}px`;

  //     while (element.scrollHeight > maxHeight && fontSize > minFontSize) {
  //       fontSize -= 1;
  //       element.style.fontSize = `${fontSize}px`;
  //     }

  //     return fontSize;
  //   };

  //   setTimeout(() => {
  //     const newTitleFontSize = adjustFontSize(titleRef.current, 60, 14, 24);
  //     setTitleFontSize(newTitleFontSize);

  //     const newDescFontSize = adjustFontSize(descRef.current, 120, 12, 18);
  //     setDescFontSize(newDescFontSize);
  //   }, 50);
  // }, [task]);

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

  const handleEditClick = () => {
    if (task) {
      setEditingId(task.id);
      // setNewDescription(task.description);
    }
  };

  const handleSaveClick = async () => {
    if (task) {
      await updateTask(task.id);

      setEditingId(null);

      // Re-fetch task to show updated description
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", Number(taskId))
        .single();

      if (!error && data) {
        setTask(data);
        console.log("Task updated:", data);
      } else {
        console.error("Fetch updated task failed:", error);
      }
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    if (task) {
      // setNewTitle(task.title);
      setNewDescription(task.description);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;

    const { error } = await supabase.from("tasks").delete().eq("id", task.id);

    if (error) {
      console.error("Delete failed:", error.message);
      toast.error("❌ Failed to delete task");
    } else {
      toast.success("🗑️ Task deleted successfully!");
      setShowDeleteModal(false);
      onDeleteSuccess(task.id);
      onClose();
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
              {isEditingThisTask ? (
                <>
                  <button className="save-button" onClick={handleSaveClick}>
                    Save
                  </button>
                  <button className="cancel-button" onClick={handleCancelClick}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="edit-button" onClick={handleEditClick}>
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="task-info-section">
            <div className="text-wrapper">
              <h2>
                <ExpandableText text={task.title} maxLines={2} />
              </h2>

              {/* <h2
                ref={titleRef}
                style={{ fontSize: `${titleFontSize}px` }}
                className={`text-content ${
                  showFullTitle ? "expanded-title" : "clamped-title"
                }`}
              >
                {task.title}
              </h2> */}
              {/* {task.title.length > 100 && (
                <span
                  className="read-toggle"
                  onClick={() => setShowFullTitle(!showFullTitle)}
                >
                  {showFullTitle ? "Thu gọn" : "Xem thêm"}
                </span>
              )} */}
            </div>

            <div className="text-wrapper description-wrapper">
              {isEditingThisTask ? (
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Updated description..."
                  className="edit-description-textarea"
                  rows={5}
                />
              ) : (
                <ExpandableText text={task.description} maxLines={3} />
                // <p
                //   ref={descRef}
                //   style={{ fontSize: `${descFontSize}px` }}
                //   className={`text-content ${
                //     showFullDesc ? "expanded-desc" : "clamped-desc"
                //   }`}
                // >
                //   {task.description}
                // </p>
              )}
              {/* {!isEditingThisTask && task.description.length > 200 && (
                <span
                  className="read-toggle"
                  onClick={() => setShowFullDesc(!showFullDesc)}
                >
                  {showFullDesc ? "Thu gọn" : "Xem thêm"}
                </span>
              )} */}
            </div>

            <p>
              <strong>Time:</strong> <FormattedTime isoString={task.time} />
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
                    setTask(null);
                    setRelatedTasks([]);
                    setTaskId(String(t.id));
                    setEditingId(null);
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
      <DeleteModal
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}

export default TaskDetail;
