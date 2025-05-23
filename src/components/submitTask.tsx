import { supabase } from "../supabase-client";
import { uploadImage } from "../utils/uploadImage";
import "../styles/App.css";
import Select from "react-select";

interface SubmitTaskProps {
  session: any;
  newTask: {
    title: string;
    description: string;
    time?: string;
    priority?: string;
    status?: string;
  };
  setNewTask: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      time?: string;
      priority?: string;
      status?: string;
    }>
  >;
  taskImage: File | null;
  setTaskImage: React.Dispatch<React.SetStateAction<File | null>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setTotalCount: React.Dispatch<React.SetStateAction<number>>;
  setNewTaskAdded: React.Dispatch<React.SetStateAction<number | null>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  pageSize: number;
}
const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];
const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];
const selectWidth = "200px";
export const SubmitTaskForm = ({
  session,
  newTask,
  setNewTask,
  taskImage,
  setTaskImage,
  setCurrentPage,
  setTotalCount,
  setNewTaskAdded,
  fileInputRef,
  pageSize,
}: SubmitTaskProps) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl: string | null = null;
    if (taskImage) {
      imageUrl = await uploadImage(taskImage);
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        ...newTask,
        email: session.user.email,
        image_url: imageUrl,
        time: newTask.time,
        priority: newTask.priority,
        status: newTask.status,
      })
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

    setTotalCount(count ?? 0);
    setNewTaskAdded(data?.id ?? null);
    setNewTask({
      title: "",
      description: "",
      time: "",
      priority: "",
      status: "",
    });
    setTaskImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const pages = Math.ceil((count ?? 0) / pageSize);
    setCurrentPage(pages);
  };
  const commonSelectStyles = {
    container: (base: any) => ({
      ...base,
      width: selectWidth,
      marginBottom: "1rem",
    }),
    control: (base: any) => ({
      ...base,
      padding: "0.6rem",
      borderRadius: "12px",
      border: "1px solid #ddd",
      backgroundColor: "#fff",
      transition: "all 0.3s ease",
      boxShadow: "none",
      width: "100%",
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: "12px",
      padding: "0.2rem",
      backgroundColor: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      width: selectWidth,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f5f5f5" : "#fff",
      color: "#000",
      padding: "0.6rem",
      borderRadius: "8px",
      cursor: "pointer",
      transform: state.isFocused ? "scale(1.02)" : "scale(1)",
      transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
    }),
  };
  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, title: e.target.value }))
          }
          required
          style={{ flex: 2 }}
        />
        <input
          type="datetime-local"
          value={newTask.time || ""}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, time: e.target.value }))
          }
          required
          style={{
            padding: "0.8rem",
            borderRadius: "12px",
            border: "1px solid #ddd",
            backgroundColor: "#fff",
            transition: "border 0.3s, box-shadow 0.3s",
            width: selectWidth,
          }}
        />
        <Select
          options={priorityOptions}
          placeholder="Priority"
          isSearchable={false}
          value={priorityOptions.find((opt) => opt.value === newTask.priority)}
          onChange={(option) =>
            setNewTask((prev) => ({ ...prev, priority: option?.value }))
          }
          styles={commonSelectStyles}
        />
        <Select
          options={statusOptions}
          placeholder="Status"
          isSearchable={false}
          value={statusOptions.find((opt) => opt.value === newTask.status)}
          onChange={(option) =>
            setNewTask((prev) => ({ ...prev, status: option?.value }))
          }
          styles={commonSelectStyles}
        />
      </div>

      <textarea
        placeholder="Task Description"
        value={newTask.description}
        onChange={(e) =>
          setNewTask((prev) => ({ ...prev, description: e.target.value }))
        }
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && setTaskImage(e.target.files[0])}
        ref={fileInputRef}
        required
      />

      <button type="submit">Add Task</button>
    </form>
  );
};
