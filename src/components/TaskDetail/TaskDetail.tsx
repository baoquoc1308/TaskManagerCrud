import { useEffect, useState, useRef } from "react";
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
import { AnimatePresence, motion } from "framer-motion";

interface TaskDetailProps {
  taskId: string | null;
  onClose: () => void;
  setTaskId: (id: string) => void;
  editingId: number | null;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  newDescription: string;
  setNewDescription: React.Dispatch<React.SetStateAction<string>>;
  updateTask: (
    taskId: number,
    title: string,
    userId: string,
    changes: string
  ) => Promise<void>;
  onDeleteSuccess: (deletedId: number) => void;
}

function TaskDetail({
  taskId,
  onClose,
  setTaskId,
  editingId,
  setEditingId,
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
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
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
      setNewDescription(task.description);
    }
  }, [isEditingThisTask, task, setNewDescription]);

  const fetchRelatedTasks = async (priority: string, excludeId: string) => {
    // --- CHANGED ---
    // Removed the .limit(6) to fetch all related tasks
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("priority", priority)
      .neq("id", excludeId);

    if (!error) {
      setRelatedTasks(data);
    } else {
      console.error("Error fetching related tasks:", error);
    }
  };

  const handleEditClick = () => {
    if (task) {
      setEditingId(task.id);
    }
  };

  const handleSaveClick = async () => {
    if (task) {
      await updateTask(task.id, task.title, task.userId, task.changes);
      setEditingId(null);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", Number(taskId))
        .single();

      if (!error && data) {
        setTask(data);
      } else {
        console.error("Fetch updated task failed:", error);
      }
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    if (task) {
      setNewDescription(task.description);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;

    const { error } = await supabase.from("tasks").delete().eq("id", task.id);

    if (error) {
      toast.error("❌ Failed to delete task");
    } else {
      toast.success("🗑️ Task deleted successfully!");
      setShowDeleteModal(false);
      onDeleteSuccess(task.id);
      onClose();
    }
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);
  if (!taskId) return null;

  if (loading || !task)
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content"
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
        >
          <p>Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <div className="task-detail-content">
          <h3>TASK DETAIL</h3>
          <div className="task-info-section">
            <div className="text-wrapper">
              <h5 style={{ textAlign: "left", gap: "8px" }}>
                <span>Title:</span>
                <ExpandableText text={task.title} maxLines={1} />
              </h5>
            </div>
            <div className="text-wrapper description-wrapper">
              {isEditingThisTask ? (
                <>
                  <p style={{ textAlign: "left" }}>
                    <strong>Description:</strong>{" "}
                  </p>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Updated description..."
                    className="edit-description-textarea"
                    rows={5}
                  />
                </>
              ) : (
                <p style={{ textAlign: "left" }}>
                  <strong>Description:</strong>{" "}
                  <ExpandableText text={task.description} maxLines={3} />
                </p>
              )}
            </div>
            <p>
              <strong>Author:</strong> {task.email}
            </p>
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

        {relatedTasks.length > 0 && (
          <div className="related-tasks-section">
            <h4 onClick={() => setIsCollapseOpen((prev) => !prev)}>
              Related Tasks ({relatedTasks.length})
              <span>{isCollapseOpen ? "▲" : "▼"}</span>
            </h4>

            <AnimatePresence initial={false}>
              {isCollapseOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden", marginTop: "8px" }}
                >
                  <div className="related-tasks-container">
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
                </motion.div>
              )}
            </AnimatePresence>
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
