import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import "./SubmitTask.css";
import { toast } from "react-toastify";
import { supabase } from "../../supabase-client";
import { fetchTasks } from "../FetchTasks/FetchTasks";
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
  currentPage: number;
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setTotalCount: React.Dispatch<React.SetStateAction<number>>;
  setNewTaskAdded: React.Dispatch<React.SetStateAction<number | null>>;
  pageSize: number;
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

export const SubmitTaskDropdown = ({
  session,
  setTasks,
  newTask,
  setNewTask,
  setCurrentPage,
  setTotalPages,
  setTotalCount,
  setNewTaskAdded,
  pageSize,
  setKeyword,
  setPriority,
  setDate,
  setShowPriority,
  setShowDatePicker,
}: SubmitTaskProps) => {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset filters/search
    if (setKeyword) setKeyword("");
    if (setPriority) setPriority("");
    if (setDate) setDate(null);
    if (setShowPriority) setShowPriority(false);
    if (setShowDatePicker) setShowDatePicker(false);

    // Validation
    if (!newTask.title || !newTask.description || !newTask.time) {
      toast.error("Please fill all fields.");
      return;
    }

    const user = session?.user;
    if (!user) {
      toast.error("User information not found.");
      return;
    }

    const taskToInsert = {
      ...newTask,
      email: user.email,
      time: newTask.time || null,
      priority: newTask.priority || "low",
      status: newTask.status || "todo",
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(taskToInsert)
      .select()
      .single();

    if (error) {
      toast.error(`Error while adding task: ${error.message}`);
      return;
    }

    const { count, error: countError } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true });

    if (countError) {
      toast.error("Error fetching count");
    }

    const newTotalCount = count ?? 0;
    setTotalCount(newTotalCount);
    setNewTaskAdded(data?.id ?? null);

    // Reset form
    setNewTask({
      title: "",
      description: "",
      time: "",
      priority: "",
      status: "",
    });

    const pages = Math.ceil(newTotalCount / pageSize);
    const targetPage = pages > 0 ? pages : 1;
    setCurrentPage(targetPage);
    fetchTasks(targetPage, pageSize, setTasks, setTotalPages, setTotalCount);

    setOpen(false);
    toast.success("Task added successfully!");
  };

  return (
    <div className="dropdown-task-form-container" ref={formRef}>
      <button
        type="button"
        className="create-task-btn"
        onClick={() => setOpen((prev) => !prev)}
      >
        Create Task
      </button>
      {open && (
        <div className="modal-overlay">
          <div className="modal-content">
            {" "}
            <h3>CREATE TASK</h3>
            <form onSubmit={handleSubmit} className="task-form">
              <div className="row row-1">
                <input
                  type="text"
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
                <textarea
                  placeholder="Task Description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="row row-2">
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
                  menuPlacement="top"
                  value={
                    priorityOptions.find(
                      (opt) => opt.value === newTask.priority
                    ) || null
                  }
                  onChange={(option) =>
                    setNewTask((prev) => ({
                      ...prev,
                      priority: option?.value || "",
                    }))
                  }
                  className="priority-select"
                  classNamePrefix="react-select"
                />
                <Select
                  options={statusOptions}
                  placeholder="Status"
                  isSearchable={false}
                  menuPlacement="top"
                  value={
                    statusOptions.find((opt) => opt.value === newTask.status) ||
                    null
                  }
                  onChange={(option) =>
                    setNewTask((prev) => ({
                      ...prev,
                      status: option?.value || "",
                    }))
                  }
                  className="status-select"
                  classNamePrefix="react-select"
                />
              </div>
              <div className="dropdown-actions">
                <button type="submit" className="submit-button">
                  Add Task
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setOpen(false)}
                >
                  <i className="fas fa-rotate-left cancel-icon"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
