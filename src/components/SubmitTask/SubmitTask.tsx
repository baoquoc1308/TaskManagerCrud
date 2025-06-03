import React, { useState } from "react";
import { supabase } from "../../supabase-client";
import Select from "react-select";
import { uploadImage } from "../../utils/UploadImage";
import "./SubmitTask.css";
import { fetchTasks } from "../FetchTasks";
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
  setCurrentPage,
  setTotalPages,
  setTotalCount,
  setNewTaskAdded,
  fileInputRef,
  pageSize,
  //setFilteredTasks,
  setKeyword,
  setPriority,
  setDate,
  setShowPriority,
  setShowDatePicker,
}: SubmitTaskProps) => {
  const [fileError, setFileError] = useState<string>("");

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png"];
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        setFileError("File format must be .jpg or .png.");
        setTaskImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (file.size > maxSizeInBytes) {
        setFileError("Maximum file size is 2MB.");
        setTaskImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setTaskImage(file);
      setFileError("");
    } else {
      setTaskImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset filters/search
    if (setKeyword) setKeyword("");
    if (setPriority) setPriority("");
    if (setDate) setDate(null);
    if (setShowPriority) setShowPriority(false);
    if (setShowDatePicker) setShowDatePicker(false);

    //  Validation choose file
    if (!taskImage) {
      setFileError("Please select an image before submitting the task.");
      // fileInputRef.current?.focus();
      return;
    }

    setFileError("");

    let imageUrl: string | null = null;
    // if (taskImage) {
    try {
      imageUrl = await uploadImage(taskImage);
    } catch (uploadError) {
      console.error("Error uploading image:", uploadError);
      setFileError("Image upload failed. Please try again.");
      return;
    }

    const taskToInsert = {
      ...newTask,
      email: session.user.email,
      image_url: imageUrl,
      time: newTask.time || null,
      priority: newTask.priority || "low",
      status: newTask.status || "todo",
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(taskToInsert)
      .select()
      .single();

    if (error) {
      console.error("Error adding task: ", error.message);
      setFileError(`Lỗi thêm tác vụ: ${error.message}`);
      return;
    }

    const { count, error: countError } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching count:", countError.message);
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
    setTaskImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input file
    }

    const pages = Math.ceil(newTotalCount / pageSize);
    const targetPage = pages > 0 ? pages : 1;
    setCurrentPage(targetPage);
    fetchTasks(targetPage, pageSize, setTasks, setTotalPages, setTotalCount);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
        <div className="input-group">
          <input
            type="datetime-local"
            value={newTask.time || ""}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, time: e.target.value }))
            }
            required
            className={newTask.time ? "input-filled" : "input-placeholder"}
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
              setNewTask((prev) => ({
                ...prev,
                priority: option?.value || "",
              }))
            }
            className="priority-select"
            classNamePrefix="react-select"
            // required
          />
          <Select
            options={statusOptions}
            placeholder="Status"
            isSearchable={false}
            value={
              statusOptions.find((opt) => opt.value === newTask.status) || null
            }
            onChange={(option) =>
              setNewTask((prev) => ({ ...prev, status: option?.value || "" }))
            }
            className="status-select"
            classNamePrefix="react-select"
            // required
          />
        </div>
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
          {" "}
          <button
            type="button"
            className="file-upload-button"
            onClick={triggerFileInput}
          >
            Choose File
          </button>
          <span className="file-upload-info">
            {taskImage?.name || "Max size 2MB, file format .jpg/.png"}
          </span>
          <input
            id="file-upload"
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleFileSelected}
            ref={fileInputRef}
            className="file-upload-input"
          />
          {fileError && (
            <span className="file-error-message-bubble">{fileError}</span>
          )}
        </div>

        <button type="submit" className="submit-button">
          Add Task
        </button>
      </div>
    </form>
  );
};
