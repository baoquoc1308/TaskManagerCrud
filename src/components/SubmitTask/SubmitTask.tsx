import { supabase } from "../../supabase-client";
import Select from "react-select";
import { uploadImage } from "../../utils/UploadImage";
import { commonSelectStyles } from "../../utils/SelectStyles";
import "./SubmitTask.css";
import { fetchTasks } from "../FetchTasks";
import {} from "antd/es/input";
import type { Dispatch, SetStateAction } from "react";

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
  currentPage: number;
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  setTaskImage: React.Dispatch<React.SetStateAction<File | null>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setTotalCount: React.Dispatch<React.SetStateAction<number>>;
  setNewTaskAdded: React.Dispatch<React.SetStateAction<number | null>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  pageSize: number;
  setFilteredTasks?: React.Dispatch<React.SetStateAction<any[] | null>>;
  setKeyword?: Dispatch<SetStateAction<string>>;
  setPriority?: Dispatch<SetStateAction<string>>;
  setDate?: Dispatch<SetStateAction<Date | null>>;
  setShowPriority?: Dispatch<SetStateAction<boolean>>;
  setShowDatePicker?: Dispatch<SetStateAction<boolean>>;
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
export const SubmitTaskForm = ({
  session,
  setTasks,
  newTask,
  setNewTask,
  taskImage,
  setTaskImage,
  currentPage,
  setCurrentPage,
  setTotalPages,
  setTotalCount,
  setNewTaskAdded,
  fileInputRef,
  pageSize,
  setFilteredTasks,
  setKeyword,
}: SubmitTaskProps) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskImage) {
      alert("Please choose an image before submitting the task.");
      return;
    }
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

    console.log("🚀 ~ handleSubmit ~ setKeyword:", setKeyword);
    console.log("tesststs");

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
    fetchTasks(pages, pageSize, setTasks, setTotalPages, setTotalCount);
  };
  console.log("🚀 ~ handleSubmit ~ currentPage:", currentPage);
  setFilteredTasks?.(null);

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="input-row">
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
        />
        <Select
          options={priorityOptions}
          placeholder="Priority"
          isSearchable={false}
          value={
            priorityOptions.find((opt) => opt.value === newTask.priority) ||
            null
          }
          onChange={(option) =>
            setNewTask((prev) => ({ ...prev, priority: option?.value }))
          }
          styles={commonSelectStyles}
        />
        <Select
          options={statusOptions}
          placeholder="Status"
          isSearchable={false}
          value={
            statusOptions.find((opt) => opt.value === newTask.status) || null
          }
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

      <div className="form-bottom-row">
        <div className="file-upload-container">
          <label htmlFor="file-upload" className="file-upload-button">
            Choose File
          </label>
          <span className="file-upload-info">
            {taskImage?.name || "Max size 2MB, file format .jpg/.png"}
          </span>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setTaskImage(e.target.files[0])}
            ref={fileInputRef}
            className="file-upload-input"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Add Task
        </button>
      </div>
    </form>
  );
};
