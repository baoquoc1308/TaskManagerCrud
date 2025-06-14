import { useState, useEffect, useRef } from "react";
import type { Task } from "../../types/Task";
import type { Session } from "@supabase/supabase-js";
import { fetchTasks } from "../FetchTasks/FetchTasks";
import { SubmitTaskDropdown } from "../SubmitTask/SubmitTask";
import { supabase } from "../../supabase-client";
import ScrollButtons from "../ScrollButton";
import PaginationControl from "../PaginationControl";
import DeleteModal from "../DeleteModal";
import TaskManagerHeader from "../TaskManagerHeader";
import TaskList from "../TaskList";
import "./TaskManager.css";
import { toast } from "react-toastify";
import SearchTasks from "../SearchTasks";
import { useTaskNotifications } from "../../utils/TaskNotifications";

function TaskManager({
  session,
  onLogout,
  userEmail,
  userRole,
  userId,
  taskId,
}: {
  session: Session;
  onLogout: () => void;
  userEmail: string;
  userRole: string;
  userId: string;
  taskId?: string;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksId, setTaskId] = useState<string | null>(null);
  const { notifyTaskUpdated, notifyTaskDeleted } = useTaskNotifications();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [newTaskAdded, setNewTaskAdded] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  // const [taskImage, setTaskImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  // const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const lastTaskRef = useRef<HTMLLIElement | null>(null);
  const scrollBottomRef = useRef<HTMLDivElement | null>(null);

  const [pageSize, setPageSize] = useState(10);

  const [keyword, setKeyword] = useState("");
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [showPriority, setShowPriority] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [filteredTasks, setFilteredTasks] = useState<Task[] | null>(null);
  const [displayedTasks, setDisplayedTasks] = useState<Task[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    priority: "",
    time: "",
  });
  const currentManagerName = "Manager";
  // useEffect(() => {
  //   fetchTasks(currentPage, pageSize, setTasks, setTotalPages, setTotalCount);
  // }, [currentPage]);
  const avatarUrl = session?.user?.user_metadata?.avatar_url ?? "";
  useEffect(() => {
    if (newTaskAdded !== null) {
      const dataSource = filteredTasks ?? tasks;
      const taskOnThisPage = dataSource.find(
        (task) => task.id === newTaskAdded
      );

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
  }, [displayedTasks, tasks, newTaskAdded]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel("tasks-channel");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          const newTask = payload.new as Task;

          setTasks((prevTasks) => {
            if (prevTasks.some((task) => task.id === newTask.id)) {
              return prevTasks;
            }
            return [...prevTasks, newTask];
          });

          setFilteredTasks((prevFilteredTasks) => {
            if (!prevFilteredTasks) return [newTask];

            if (prevFilteredTasks.some((task) => task.id === newTask.id)) {
              return prevFilteredTasks;
            }
            return [...prevFilteredTasks, newTask];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks" },
        (payload) => {
          const updatedTask = payload.new as Task;

          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === updatedTask.id ? updatedTask : task
            )
          );

          setFilteredTasks(
            (prevFilteredTasks) =>
              prevFilteredTasks?.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
              ) ?? []
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "tasks" },
        (payload) => {
          const deletedTaskId = payload.old.id;

          setTasks((prevTasks) =>
            prevTasks.filter((task) => task.id !== deletedTaskId)
          );

          setFilteredTasks(
            (prevFilteredTasks) =>
              prevFilteredTasks?.filter((task) => task.id !== deletedTaskId) ??
              []
          );
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, setTasks, setFilteredTasks]);
  const updateTask = async (
    taskId: number,
    title: string,
    userId: string,
    changes: string
  ) => {
    console.log("🚀 ~ taskId:", taskId);
    console.log("🚀 ~ title:", title);
    if (newDescription === originalDescription) {
      setEditingId(null);
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", taskId);

    if (!error) {
      // Gửi thông báo cho user khi manager cập nhật task
      if (userRole === "manager") {
        notifyTaskUpdated(`${taskId}`, title, currentManagerName, changes);
      }
      console.log("🚀 ~ userId:", userId);
      console.log("🚀 ~ title:", title);
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
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskToDelete.id);

      if (error) throw error;

      // Gửi thông báo cho user khi manager xóa task
      // Sử dụng user_id hoặc userId tùy thuộc vào trường nào được sử dụng
      const taskOwnerId = taskToDelete.user_id || taskToDelete.userId;
      if (taskOwnerId && userRole === "manager") {
        notifyTaskDeleted(taskOwnerId, taskToDelete.title, currentManagerName);
      }

      const updatedTasks = (filteredTasks ?? tasks).filter(
        (task) => task.id !== taskToDelete.id
      );

      // Update master data
      if (filteredTasks) {
        setFilteredTasks(updatedTasks);
      } else {
        setTasks(updatedTasks);
      }

      // Delete 1 task --> auto fill
      const totalAfterDelete = updatedTasks.length;
      const newTotalPages = Math.ceil(totalAfterDelete / pageSize);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, currentPage - 1));
      } else {
        setCurrentPage(currentPage);
      }

      setTotalCount(totalAfterDelete);
      setTotalPages(newTotalPages);
      setShowDeleteModal(false);
      setTaskToDelete(null);
      toast.success("🗑️ Task deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("❌ Failed to delete the task!");
    }
  };

  const handleSearchResults = (results: Task[]) => {
    setFilteredTasks(results);
    setCurrentPage(1);
    setTotalCount(results.length);
    setTotalPages(Math.ceil(results.length / pageSize));
  };

  const handleClearSearch = async () => {
    setFilteredTasks(null);
    setCurrentPage(1);

    await fetchTasks(1, pageSize, setTasks, setTotalPages, setTotalCount);
  };

  const handleUpdateFilters = (filters: {
    keyword: string;
    priority: string;
    time: string;
  }) => {
    setSearchFilters(filters);
  };

  useEffect(() => {
    const dataSource = filteredTasks ?? tasks;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setDisplayedTasks(dataSource.slice(start, end));
  }, [currentPage, pageSize, tasks, filteredTasks]);

  if (false) {
    console.log(
      "Dummy usage for handleUpdateFilters:",
      handleUpdateFilters({ keyword: "", priority: "", time: "" })
    );
    console.log("Dummy usage for setDisplayedTasks:", setDisplayedTasks([]));
    console.log("Dummy usage for searchFilters:", searchFilters);
    console.log("Dummy usage for taskId:", taskId);
  }
  return (
    <div className="task-manager">
      <TaskManagerHeader
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        onLogout={onLogout}
        userRole={userRole}
        userId={userId}
        taskId={tasksId!}
        searchComponent={
          <SearchTasks
            keyword={keyword}
            setKeyword={setKeyword}
            priority={priority}
            setPriority={setPriority}
            date={date}
            setDate={setDate}
            showPriority={showPriority}
            setShowPriority={setShowPriority}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            filteredTasks={filteredTasks}
            setFilteredTasks={setFilteredTasks}
            onResults={handleSearchResults}
            onClear={handleClearSearch}
          />
        }
      />

      <TaskList
        userRole={userRole}
        tasks={displayedTasks}
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
        // newTitle={newTitle}
        // setNewTitle={setNewTitle}
        newDescription={newDescription}
        setNewDescription={setNewDescription}
        confirmDeleteTask={confirmDeleteTask}
        updateTask={updateTask}
        newTaskAdded={newTaskAdded}
        lastTaskRef={lastTaskRef}
        setTaskId={setTaskId}
        setTasks={setTasks}
        submitComponent={
          <SubmitTaskDropdown
            session={session}
            newTask={newTask}
            setNewTask={setNewTask}
            setCurrentPage={setCurrentPage}
            setTotalCount={setTotalCount}
            setNewTaskAdded={setNewTaskAdded}
            pageSize={pageSize}
            currentPage={currentPage}
            setTasks={setTasks}
            setTotalPages={setTotalPages}
            setKeyword={setKeyword}
            setPriority={setPriority}
            setDate={setDate}
            setShowPriority={setShowPriority}
            setShowDatePicker={setShowDatePicker}
          />
        }
      />
      <DeleteModal
        show={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={cancelDelete}
      />
      <ScrollButtons scrollToBottomRef={lastTaskRef} />
      <ScrollButtons scrollToBottomRef={scrollBottomRef} />
      <div ref={scrollBottomRef} style={{ height: "1px" }} />
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
