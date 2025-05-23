import { useState, useEffect, useRef } from "react";
import type { Task } from "../types/task";
import type { Session } from "@supabase/supabase-js";
import { fetchTasks } from "./fetchTasks";
import { deleteTask } from "./deleteTask";
import { SubmitTaskForm } from "./submitTask";
import { supabase } from "../supabase-client";
import "../styles/App.css";
import { Pagination } from "antd";
import ThemeToggle from "../components/ThemeToggle";
import ScrollButtons from "./ScrollButton";
import { Link } from "react-router-dom";
import "../styles/index.css";

function TaskManager({
  session,
  onLogout,
  userEmail,
}: {
  session: Session;
  onLogout: () => void;
  userEmail: string;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [newTaskAdded, setNewTaskAdded] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [taskImage, setTaskImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newDescription, setNewDescription] = useState("");

  const lastTaskRef = useRef<HTMLLIElement | null>(null);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchTasks(currentPage, pageSize, setTasks, setTotalPages, setTotalCount);
  }, [currentPage, pageSize, totalCount]);

  useEffect(() => {
    if (newTaskAdded !== null) {
      const taskOnThisPage = tasks.find((task) => task.id === newTaskAdded);

      if (taskOnThisPage && lastTaskRef.current) {
        lastTaskRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      const timer = setTimeout(() => {
        setNewTaskAdded(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [tasks, newTaskAdded]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel("tasks-channel");
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          const newTask = payload.new as Task;
          setTasks((prev) => [...prev, newTask]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);
  const updateTask = async (taskId: number) => {
    const { error } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", taskId);

    if (!error) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, description: newDescription } : task
        )
      );
      setEditingId(null);
    }
  };

  const confirmDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    await deleteTask(
      taskToDelete,
      tasks,
      currentPage,
      setTasks,
      setCurrentPage,
      setTotalCount,
      setTotalPages,
      setShowDeleteModal,
      setTaskToDelete,
      pageSize
    );
  };
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const getStatusBadgeClass = (status: string) => {
    const s = status.trim().toLowerCase().replace(/ /g, "_");
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

  return (
    <div className="task-manager">
      <div className="task-header">
        <ThemeToggle />
        <span>{userEmail}</span>
        <button onClick={onLogout}>Log Out</button>
      </div>
      <h2>Task Manager CRUD</h2>

      <SubmitTaskForm
        session={session}
        newTask={newTask}
        setNewTask={setNewTask}
        taskImage={taskImage}
        setTaskImage={setTaskImage}
        setCurrentPage={setCurrentPage}
        setTotalCount={setTotalCount}
        setNewTaskAdded={setNewTaskAdded}
        fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
        pageSize={pageSize}
      />

      <ul className="task-list">
        {tasks.map((task, index) => (
          <li
            key={task.id}
            className={`task-item ${
              newTaskAdded === task.id ? "new-task" : ""
            }`}
            ref={index === tasks.length - 1 ? lastTaskRef : null}
          >
            <Link to={`/task/${task.id}`} className="task-link">
              <h3>{task.title}</h3>

              <p>{task.description}</p>

              {/* Hiển thị time, priority, status cùng dòng */}
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
            </Link>
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

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you sure you want to delete this task?</h3>
            <div className="modal-buttons">
              <button onClick={handleConfirmDelete}>Yes</button>
              <button onClick={cancelDelete}>No</button>
            </div>
          </div>
        </div>
      )}
      <ScrollButtons scrollToBottomRef={lastTaskRef} />
      <div
        style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
      >
        <Pagination
          className="custom-pagination"
          current={currentPage}
          pageSize={pageSize}
          total={totalCount}
          onChange={(page, size) => {
            setCurrentPage(page);
            if (size !== pageSize) setPageSize(size);
          }}
          showSizeChanger={true}
          pageSizeOptions={["5", "10", "20", "50"]}
        />
      </div>
    </div>
  );
}

export default TaskManager;
