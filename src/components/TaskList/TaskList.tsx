import { useState, useEffect } from "react";
import type { Task } from "../../types/Task";
// import {
//   getPriorityBadgeClass,
//   getStatusBadgeClass,
// } from "../../utils/TaskHelpers";
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
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Đóng bất kỳ dropdown nào đang mở nếu click không nằm trong một dropdown
      if (openDropdownId !== null) {
        let isClickInsideDropdown = false;
        // Kiểm tra xem click có nằm trong bất kỳ .dots-menu nào không
        const dotsMenus = document.querySelectorAll(".dots-menu");
        dotsMenus.forEach((menu) => {
          if (menu.contains(event.target as Node)) {
            isClickInsideDropdown = true;
          }
        });

        if (!isClickInsideDropdown) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]); // Dependency a
  const handleClickTask = (taskId: string) => {
    if (editingId === null) setSelectedTaskId(taskId);
  };
  const toggleDropdown = (taskId: number) => {
    // Hoặc string nếu task.id là string
    setOpenDropdownId((prevId) => (prevId === taskId ? null : taskId));
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
      <div className="main-container">
        {/* Dashboard */}
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>
              <span className="logo">T</span>
              TaskBoard
            </h2>
          </div>

          <button className="add-new-btn">+ Add New</button>

          <ul className="dashboard-menu">
            <li>
              <a href="#" className="active">
                <span className="icon">📋</span>Dashboard
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">📥</span>Inbox
                <span className="badge">3</span>
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">👥</span>Teams
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">📊</span>Analytics
              </a>
            </li>
            <li>
              <a href="#">
                <span className="icon">⚙️</span>Settings
              </a>
            </li>
          </ul>

          <div className="projects-section">
            <h3>Projects</h3>
            <div className="project-item">
              <div
                className="project-icon"
                style={{ backgroundColor: "#667eea" }}
              ></div>
              Main Project
            </div>
            <div className="project-item">
              <div
                className="project-icon"
                style={{ backgroundColor: "#28a745" }}
              ></div>
              Design Project
            </div>
            <div className="project-item">
              <div
                className="project-icon"
                style={{ backgroundColor: "#ffc107" }}
              ></div>
              Landing Page
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          <div className="content-header">
            <h1>Design Project</h1>
          </div>

          <div className="task-sections">
            {/* Pending Tasks */}
            <div className="task-section">
              <div className="section-header pending">
                <span className="status-indicator"></span>
                Pending
              </div>
              <div className="task-table-header">
                <div>Name</div>
                <div>Assignee</div>
                <div>Due Date</div>
                <div>Priority</div>
                <div>Status</div>
                <div></div>
              </div>
              <ul className="task-list">
                {tasks
                  .filter((task) => (task.status as string) === "todo")
                  .map((task) => (
                    <li key={task.id} className="task-item">
                      {/* <div className="task-link"> */}
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-assignee">
                        <div className="assignee-avatar">JD</div>
                      </div>
                      <div className="task-due-date">
                        <FormattedTime isoString={task.time} />
                      </div>
                      <span
                        className={`priority-badge priority-${task.priority?.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`status-badge status-${task.status?.toLowerCase()}`}
                      >
                        {task.status}
                      </span>
                      <div className="dots-menu">
                        <button
                          className="dots-button"
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn chặn sự kiện click lan ra li.task-item (nếu li.task-item có click handler riêng)
                            toggleDropdown(task.id);
                          }}
                          aria-expanded={
                            openDropdownId === task.id ? "true" : "false"
                          }
                        >
                          ⋮
                        </button>
                        {/* Thêm class 'active' dựa trên openDropdownId */}
                        <div
                          className={`dots-dropdown ${
                            openDropdownId === task.id ? "active" : ""
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(task.id);
                              handleCloseModal();
                              setOpenDropdownId(null);
                            }}
                          >
                            {" "}
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteTask(task);
                              handleCloseModal();
                              setOpenDropdownId(null);
                            }}
                          >
                            {" "}
                            Delete
                          </button>
                        </div>
                      </div>
                      {/* </div> */}
                    </li>
                  ))}
              </ul>
              <button className="add-task-btn">+ Add Task</button>
            </div>

            {/* In Progress Tasks */}
            <div className="task-section">
              <div className="section-header in-progress">
                <span className="status-indicator"></span>
                In Progress
              </div>
              <div className="task-table-header">
                <div>Name</div>
                <div>Assignee</div>
                <div>Due Date</div>
                <div>Priority</div>
                <div>Status</div>
                <div></div>
              </div>
              <ul className="task-list">
                {tasks
                  .filter((task) => (task.status as string) === "in-progress")
                  .map((task) => (
                    <li key={task.id} className="task-item">
                      {/* <div className="task-link"> */}
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-assignee">
                        <div className="assignee-avatar">JD</div>
                      </div>
                      <div className="task-due-date">
                        <FormattedTime isoString={task.time} />
                      </div>
                      <span
                        className={`priority-badge priority-${task.priority?.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`status-badge status-${task.status?.toLowerCase()}`}
                      >
                        {task.status}
                      </span>
                      <div className="dots-menu">
                        <button className="dots-button">⋮</button>
                        <div className="dots-dropdown">
                          <button onClick={() => setEditingId(task.id)}>
                            Edit
                          </button>
                          <button onClick={() => confirmDeleteTask(task)}>
                            Delete
                          </button>
                        </div>
                      </div>
                      {/* </div> */}
                    </li>
                  ))}
              </ul>
              <button className="add-task-btn">+ Add Task</button>
            </div>

            {/* Completed Tasks */}
            <div className="task-section">
              <div className="section-header completed">
                <span className="status-indicator"></span>
                Completed
              </div>
              <div className="task-table-header">
                <div>Name</div>
                <div>Assignee</div>
                <div>Due Date</div>
                <div>Priority</div>
                <div>Status</div>
                <div></div>
              </div>
              <ul className="task-list">
                {tasks
                  .filter((task) => (task.status as string) === "done")
                  .map((task) => (
                    <li key={task.id} className="task-item">
                      {/* <div className="task-link"> */}
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-assignee">
                        <div className="assignee-avatar">JD</div>
                      </div>
                      <div className="task-due-date">
                        <FormattedTime isoString={task.time} />
                      </div>
                      <span
                        className={`priority-badge priority-${task.priority?.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`status-badge status-${task.status?.toLowerCase()}`}
                      >
                        {task.status}
                      </span>
                      <div className="dots-menu">
                        <button className="dots-button">⋮</button>
                        <div className="dots-dropdown">
                          <button onClick={() => setEditingId(task.id)}>
                            Edit
                          </button>
                          <button onClick={() => confirmDeleteTask(task)}>
                            Delete
                          </button>
                        </div>
                      </div>
                      {/* </div> */}
                    </li>
                  ))}
              </ul>
              <button className="add-task-btn">+ Add Task</button>
            </div>
          </div>
        </div>
      </div>

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
