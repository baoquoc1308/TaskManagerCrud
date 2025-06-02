import React, { useState } from "react"; // Thêm useState nếu chưa có
import { supabase } from "../../supabase-client";
import Select from "react-select";
import { uploadImage } from "../../utils/UploadImage";
import "./SubmitTask.css";
import { fetchTasks } from "../FetchTasks";
// import {} from "antd/es/input"; // Dòng này có vẻ không được sử dụng, có thể xóa
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
  currentPage: number; // Prop này dường như không được sử dụng trong component, có thể xem xét xóa nếu không cần
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  setTaskImage: React.Dispatch<React.SetStateAction<File | null>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setTotalCount: React.Dispatch<React.SetStateAction<number>>;
  setNewTaskAdded: React.Dispatch<React.SetStateAction<number | null>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  pageSize: number;
  setFilteredTasks?: React.Dispatch<React.SetStateAction<any[] | null>>; // Prop này không được sử dụng, có thể xem xét xóa
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
  // setFilteredTasks, // Không sử dụng
  setKeyword, // Prop này được log nhưng không được sử dụng để reset, có thể thêm logic reset nếu cần
  setPriority,
  setDate,
  setShowPriority,
  setShowDatePicker,
}: SubmitTaskProps) => {
  // State để lưu trữ và hiển thị thông báo lỗi tùy chỉnh cho trường file
  const [fileError, setFileError] = useState<string>("");

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png"]; // Khớp với thông báo
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        setFileError("File format must be .jpg or .png.");
        setTaskImage(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input để người dùng có thể chọn lại
        return;
      }

      if (file.size > maxSizeInBytes) {
        setFileError("Maximum file size is 2MB.");
        setTaskImage(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
        return;
      }

      // Nếu file hợp lệ
      setTaskImage(file);
      setFileError(""); // Xóa thông báo lỗi nếu có
    } else {
      // Người dùng đã bỏ chọn file (ví dụ, hủy hộp thoại chọn file)
      setTaskImage(null);
      // Không cần set lỗi ở đây vì handleSubmit sẽ kiểm tra
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn chặn hành vi submit mặc định

    // Reset filters/search
    if (setKeyword) setKeyword(""); // Reset keyword nếu prop tồn tại
    if (setPriority) setPriority("");
    if (setDate) setDate(null);
    if (setShowPriority) setShowPriority(false);
    if (setShowDatePicker) setShowDatePicker(false);

    // --- Validation cho trường chọn tệp ---
    if (!taskImage) {
      setFileError("Please select an image before submitting the task.");
      // fileInputRef.current?.focus(); // Có thể không hữu ích vì input bị ẩn
      return; // Dừng hàm, không cho phép submit
    }
    // --- Kết thúc validation ---

    setFileError(""); // Xóa lỗi file nếu đã qua validation

    let imageUrl: string | null = null;
    // Không cần kiểm tra taskImage lần nữa vì đã làm ở trên
    // if (taskImage) { // Khối này giờ là chắc chắn taskImage tồn tại
    try {
      imageUrl = await uploadImage(taskImage); // taskImage chắc chắn không null ở đây
    } catch (uploadError) {
      console.error("Error uploading image:", uploadError);
      setFileError("Image upload failed. Please try again."); // Hiển thị lỗi cho người dùng
      return;
    }
    // }

    const taskToInsert = {
      ...newTask,
      email: session.user.email,
      image_url: imageUrl,
      // Đảm bảo các trường này có giá trị mặc định nếu không bắt buộc
      // Hoặc đảm bảo newTask.priority và newTask.status được khởi tạo/bắt buộc
      time: newTask.time || null, // Gửi null nếu rỗng để tránh lỗi DB nếu cột không chấp nhận chuỗi rỗng
      priority: newTask.priority || "low", // Ví dụ: mặc định là 'low' nếu không chọn
      status: newTask.status || "todo", // Ví dụ: mặc định là 'todo' nếu không chọn
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(taskToInsert)
      .select()
      .single();

    if (error) {
      console.error("Error adding task: ", error.message);
      // Có thể hiển thị lỗi này cho người dùng một cách thân thiện hơn
      setFileError(`Lỗi thêm tác vụ: ${error.message}`); // Tái sử dụng fileError hoặc tạo state lỗi chung
      return;
    }

    // Lấy tổng số lượng task để tính toán phân trang chính xác
    const { count, error: countError } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching count:", countError.message);
      // Không nhất thiết phải dừng hoàn toàn, nhưng phân trang có thể không chính xác
    }

    const newTotalCount = count ?? 0;
    setTotalCount(newTotalCount);
    setNewTaskAdded(data?.id ?? null); // data chắc chắn có ở đây nếu không có error ở trên

    // Reset form
    setNewTask({
      title: "",
      description: "",
      time: "",
      priority: "", // Hoặc giá trị mặc định như 'low'
      status: "", // Hoặc giá trị mặc định như 'todo'
    });
    setTaskImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input file
    }

    // Tính toán lại số trang và điều hướng đến trang có task mới
    // Thông thường, task mới sẽ ở trang cuối nếu sắp xếp theo ID tăng dần
    // Hoặc trang đầu nếu sắp xếp theo thời gian tạo giảm dần
    const pages = Math.ceil(newTotalCount / pageSize);
    const targetPage = pages > 0 ? pages : 1; // Đảm bảo targetPage ít nhất là 1
    setCurrentPage(targetPage);
    // Fetch lại tasks cho trang hiện tại (đã được cập nhật)
    fetchTasks(targetPage, pageSize, setTasks, setTotalPages, setTotalCount);
  };

  // Hàm để kích hoạt input file ẩn
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
            required // Xem xét có thực sự bắt buộc hay không
          />
          <Select
            options={priorityOptions}
            placeholder="Priority"
            isSearchable={false}
            value={
              priorityOptions.find((opt) => opt.value === newTask.priority) ||
              null
            }
            onChange={
              (option) =>
                setNewTask((prev) => ({
                  ...prev,
                  priority: option?.value || "",
                })) // Đảm bảo có giá trị
            }
            className="priority-select"
            classNamePrefix="react-select"
            required // react-select không có prop required, validation cần làm thủ công nếu muốn
          />
          <Select
            options={statusOptions}
            placeholder="Status"
            isSearchable={false}
            value={
              statusOptions.find((opt) => opt.value === newTask.status) || null
            }
            onChange={
              (option) =>
                setNewTask((prev) => ({ ...prev, status: option?.value || "" })) // Đảm bảo có giá trị
            }
            className="status-select"
            classNamePrefix="react-select"
            required
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
          {/* Container này sẽ cần position: relative */}
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
          {/* Thông báo lỗi sẽ được định vị dựa trên file-upload-container */}
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
