import { useState } from "react";
import type { Task } from "../../types/Task";
import {
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from "../../utils/TaskHelpers";
import "./TaskList.css";
import TaskDetail from "../TaskDetail";
import { Empty, Modal } from "antd";
import FormattedTime from "../../utils/FormattedTime";

interface TaskListProps {
  tasks: Task[];
  editingId: number | null;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  // newTitle: string;
  // setNewTitle: React.Dispatch<React.SetStateAction<string>>;
  newDescription: string;
  setNewDescription: React.Dispatch<React.SetStateAction<string>>;
  confirmDeleteTask: (task: Task) => void;
  updateTask: (taskId: number) => Promise<void>;
  newTaskAdded: number | null;
  lastTaskRef: React.RefObject<HTMLLIElement | null>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setTaskId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function TaskList({
  tasks,
  editingId,
  setEditingId,
  // newTitle,
  // setNewTitle,
  newDescription,
  setNewDescription,
  confirmDeleteTask,
  updateTask,
  newTaskAdded,
  lastTaskRef,
  setTasks,
  setTaskId,
}: TaskListProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] =
    useState(false);
  const [taskToDeleteFromDetail, setTaskToDeleteFromDetail] =
    useState<Task | null>(null);

  const handleClickTask = (taskId: string) => {
    if (editingId === null) setSelectedTaskId(taskId);
  };

  const handleCloseModal = () => {
    setSelectedTaskId(null);
    setEditingId(null);
  };

  const handleOpenDeleteConfirmModal = (task: Task) => {
    setTaskToDeleteFromDetail(task);
    setIsDeleteConfirmModalVisible(true);
  };

  const handleCloseDeleteConfirmModal = () => {
    setIsDeleteConfirmModalVisible(false);
    setTaskToDeleteFromDetail(null);
  };

  const handleConfirmDeleteFromDetail = () => {
    if (taskToDeleteFromDetail) {
      confirmDeleteTask(taskToDeleteFromDetail);
      handleCloseModal();
      handleCloseDeleteConfirmModal();
    }
  };
  if (false) {
    handleOpenDeleteConfirmModal({} as Task);
  }
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
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item ${
              newTaskAdded === task.id ? "new-task" : ""
            }`}
            ref={task.id === newTaskAdded ? lastTaskRef : null}
          >
            <div
              className="task-link"
              onClick={() => handleClickTask(String(task.id))}
              style={{ cursor: editingId === null ? "pointer" : "default" }}
            >
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <span className="time-meta">
                <strong>Time:</strong> <FormattedTime isoString={task.time} />
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

      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={handleCloseModal}
          setTaskId={setSelectedTaskId}
          editingId={editingId}
          setEditingId={setEditingId}
          // newTitle={newTitle}
          // setNewTitle={setNewTitle}
          newDescription={newDescription}
          setNewDescription={setNewDescription}
          updateTask={updateTask}
          onDeleteSuccess={(deletedId) => {
            setTaskId(null);
            setTasks((prevTasks) =>
              prevTasks.filter((t) => t.id !== deletedId)
            );
          }}
        />
      )}

      <Modal
        title="Confirm Delete"
        open={isDeleteConfirmModalVisible}
        onOk={handleConfirmDeleteFromDetail}
        onCancel={handleCloseDeleteConfirmModal}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the task: "
          <strong>{taskToDeleteFromDetail?.title}</strong>"?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
}
