import type { ChangeEvent } from "react";
import { supabase } from "../supabase-client";
import type { Session } from "@supabase/supabase-js";
import { useState, useEffect, useRef } from "react";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  image_url: string;
}

function TaskManager({ session }: { session: Session }) {
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [taskImage, setTaskImage] = useState<File | null>(null);
  const lastTaskRef = useRef<HTMLLIElement | null>(null);
  const [newTaskAdded, setNewTaskAdded] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(1);

  const pageSize = 5;

  const fetchTasks = async (page: number) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 1. Fetch dữ liệu theo trang
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) {
      console.error("Error fetching tasks:", error.message);
      return;
    }

    setTasks(data || []);

    // 2. Fetch count toàn bộ
    const { count, error: countError } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching count:", countError.message);
      return;
    }

    const pages = Math.ceil((count ?? 0) / pageSize);
    setTotalPages(pages);
    setTotalCount(count ?? 0);
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task: ", error.message);
      return;
    }

    // Cập nhật totalCount mới sau khi xóa
    const { count, error: countError } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching count:", countError.message);
      return;
    }

    const updatedCount = count ?? 0;
    const newTotalPages = Math.ceil(updatedCount / pageSize);

    setTotalCount(updatedCount);
    setTotalPages(newTotalPages);

    const from = currentPage * pageSize - 1; // phần tử tiếp theo ngay sau trang hiện tại
    const to = from; // chỉ lấy đúng 1 task

    const { data: nextTask } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (nextTask && nextTask.length > 0) {
      // Nếu còn task tiếp theo → giữ nguyên trang hiện tại
      const updatedTasks = tasks
        .filter((task) => task.id !== id)
        .concat(nextTask); // thêm task từ page sau vào

      setTasks(updatedTasks);
    } else {
      // Không còn task tiếp theo để thế → kiểm tra xem có cần quay lại trang trước
      if (tasks.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1); // quay lại trang trước
      } else {
        // Không cần quay lại, chỉ cần xóa khỏi danh sách hiện tại
        setTasks((prev) => prev.filter((task) => task.id !== id));
      }
    }
  };

  const updateTask = async (id: number) => {
    const { error } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", id);

    if (!error) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, description: newDescription } : task
        )
      );
      setNewDescription("");
      setEditingId(null);
    } else {
      console.error("Error updating task:", error.message);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const filePath = `${file.name}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("tasks-images")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading image:", error.message);
      return null;
    }

    const { data } = await supabase.storage
      .from("tasks-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let imageUrl: string | null = null;
    if (taskImage) {
      imageUrl = await uploadImage(taskImage);
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...newTask, email: session.user.email, image_url: imageUrl })
      .select()
      .single();

    if (error) {
      console.error("Error adding task: ", error.message);
      return;
    }

    const { count, error: countError } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching count:", countError.message);
      return;
    }

    const pages = Math.ceil((count ?? 0) / pageSize);
    setTotalCount(count ?? 0);

    setNewTaskAdded(data.id);
    setNewTask({ title: "", description: "" });
    setTaskImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset input file
    }
    setCurrentPage(pages);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  };

  useEffect(() => {
    fetchTasks(currentPage);
  }, [currentPage, totalCount]);

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
        setNewTaskAdded(null); // Remove highlight after 2 seconds
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [tasks, newTaskAdded]);

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
      .subscribe((status) => {
        console.log("Subscription: ", status);
      });
  }, []);

  return (
    <div className="task-manager">
      <h2>Task Manager CRUD</h2>

      <form onSubmit={handleSubmit} className="task-form">
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        <textarea
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <button type="submit">Add Task</button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item ${
              newTaskAdded === task.id ? "new-task" : ""
            }`}
            ref={newTaskAdded === task.id ? lastTaskRef : null} // Add ref to the new task
          >
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            {task.image_url && <img src={task.image_url} alt="task" />}
            {editingId === task.id && (
              <textarea
                placeholder="Updated description..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            )}

            <div className="task-actions">
              {editingId === task.id ? (
                <button
                  className="save-btn"
                  onClick={() => updateTask(task.id)}
                >
                  Save
                </button>
              ) : (
                <button
                  className="edit-btn"
                  onClick={() => {
                    setEditingId(task.id);
                    setNewDescription(task.description);
                  }}
                >
                  Edit
                </button>
              )}

              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Prev
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default TaskManager;
