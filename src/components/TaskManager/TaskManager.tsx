import { useState, useEffect, useRef } from "react";
import type { Task } from "../../types/Task";
import type { Session } from "@supabase/supabase-js";
import { fetchTasks } from "../FetchTasks";
import { SubmitTaskForm } from "../SubmitTask/SubmitTask";
import { supabase } from "../../supabase-client";
import ScrollButtons from "../ScrollButton";
import { deleteTask } from "../DeleteTask";
import PaginationControl from "../PaginationControl";
import DeleteModal from "../DeleteModal";
import TaskManagerHeader from "../TaskManagerHeader";
import TaskList from "../TaskList";
import "./TaskManager.css";
import { toast } from "react-toastify";
import SearchTasks from "../SearchTasks";

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
  const [originalDescription, setOriginalDescription] = useState("");
  const lastTaskRef = useRef<HTMLLIElement | null>(null);
  const [pageSize, setPageSize] = useState(5);
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    priority: "",
    time: "",
  });
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
    if (newDescription === originalDescription) {
      setEditingId(null);
      return;
    }
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
      toast.success("✏️ Task updated successfully!");
    } else {
      toast.error("❌ Error updating task!");
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

    try {
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

      toast.success("🗑️ Task deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("❌ Failed to delete the task!");
    }
  };
  const handleSearchResults = (filteredTasks: Task[]) => {
    setTasks(filteredTasks);
    setCurrentPage(1);
    setTotalCount(filteredTasks.length);
    setTotalPages(Math.ceil(filteredTasks.length / pageSize));
  };
  const handleUpdateFilters = (filters: {
    keyword: string;
    priority: string;
    time: string;
  }) => {
    setSearchFilters(filters);
  };
  return (
    <div className="task-manager">
      <TaskManagerHeader userEmail={userEmail} onLogout={onLogout} />
      <h2>TASK MANAGER</h2>

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
      <SearchTasks
        onResults={(filteredTasks: Task[]) => setTasks(filteredTasks)}
      />
      <TaskList
        tasks={tasks}
        editingId={editingId}
        setEditingId={(id) => {
          setEditingId(id);
          if (id !== null) {
            const task = tasks.find((t) => t.id === id);
            if (task) {
              setNewDescription(task.description);
              setOriginalDescription(task.description);
            }
          }
        }}
        newDescription={newDescription}
        setNewDescription={setNewDescription}
        confirmDeleteTask={confirmDeleteTask}
        updateTask={updateTask}
        newTaskAdded={newTaskAdded}
        lastTaskRef={lastTaskRef}
      />

      <DeleteModal
        show={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={cancelDelete}
      />
      <ScrollButtons scrollToBottomRef={lastTaskRef} />
      <PaginationControl
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          if (size !== pageSize) setPageSize(size);
        }}
      />
    </div>
  );
}

export default TaskManager;
