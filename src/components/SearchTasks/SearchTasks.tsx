import { useRef, useEffect, useCallback } from "react";
import { supabase } from "../../supabase-client";
import type { Task } from "../../types/Task";
import "./SearchTasks.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { toast } from "react-toastify";

const priorityOptions = [
  { value: "", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface SearchTasksProps {
  onResults: (tasks: Task[]) => void;
  onClear: () => void;
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;

  priority: string;
  setPriority: React.Dispatch<React.SetStateAction<string>>;

  date: Date | null;
  setDate: React.Dispatch<React.SetStateAction<Date | null>>;

  showPriority: boolean;
  setShowPriority: React.Dispatch<React.SetStateAction<boolean>>;

  showDatePicker: boolean;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;

  filteredTasks?: Task[] | null;
  setFilteredTasks: React.Dispatch<React.SetStateAction<Task[] | null>>;
}

export function SearchTasks({
  keyword,
  setKeyword,
  priority,
  setPriority,
  date,
  setDate,
  showPriority,
  setShowPriority,
  showDatePicker,
  setShowDatePicker,
  onResults,
  onClear,
}: SearchTasksProps) {
  const datePickerWrapperRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  const priorityIconRef = useRef<HTMLSpanElement>(null);
  const dateIconRef = useRef<HTMLSpanElement>(null);

  // Sử dụng useCallback để memoize hàm handleClickOutside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    // Logic cho Priority Dropdown
    if (
      priorityDropdownRef.current &&
      !priorityDropdownRef.current.contains(event.target as Node) &&
      priorityIconRef.current &&
      !priorityIconRef.current.contains(event.target as Node)
    ) {
      setShowPriority(false);
    }

    if (
      datePickerWrapperRef.current &&
      !datePickerWrapperRef.current.contains(event.target as Node) &&
      dateIconRef.current &&
      !dateIconRef.current.contains(event.target as Node)
    ) {
      setShowDatePicker(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]); // Thêm handleClickOutside vào dependency array

  const fetchFilteredTasks = async () => {
    let query = supabase.from("tasks").select("*");

    if (keyword.trim() !== "") {
      query = query.or(
        `title.ilike.%${keyword.trim()}%,description.ilike.%${keyword.trim()}%`
      );
    }

    if (priority !== "") {
      query = query.eq("priority", priority);
    }

    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const startDate = formattedDate + "T00:00:00";
      const endDate = formattedDate + "T23:59:59";
      query = query.gte("created_at", startDate).lte("created_at", endDate);
    }
    query = query.order("created_at", { ascending: true });
    const { data, error } = await query;

    if (error) {
      console.error("Error searching tasks:", error.message);
      onResults([]);
    } else {
      onResults(data as Task[]);
    }
  };

  useEffect(() => {
    fetchFilteredTasks();
  }, [keyword, priority, date]);

  const handleDateChange = (selectedDate: Date | null) => {
    setDate(selectedDate);
    // Vẫn đóng lịch sau khi chọn
    setShowDatePicker(false);
  };
  const handleClearSearch = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    setKeyword("");
    setPriority("");
    setDate(null);
    onClear();
    setShowPriority(false);
    setShowDatePicker(false);

    // Hiển thị toast notification
    toast.info("Search filters cleared!", {
      position: "top-right",
      autoClose: 2000, // Tự động đóng sau 2 giây
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  return (
    <div className="search-tasks-wrapper">
      <input
        type="text"
        placeholder="Search title or description..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="search-input"
        style={{ width: "300px" }}
      />

      <div className="icon-wrapper">
        <span
          ref={priorityIconRef}
          onClick={(e) => {
            // Thêm e vào đây
            e.stopPropagation(); // Ngăn sự kiện click lan truyền lên document
            setShowPriority(!showPriority);
            setShowDatePicker(false);
          }}
          className={`icon ${showPriority ? "active" : ""}`}
          title="Priority"
        >
          <img
            width="28"
            height="28"
            src="https://img.icons8.com/scribby/50/high-priority.png"
            alt="high-priority"
          />
        </span>

        <span
          ref={dateIconRef}
          onClick={(e) => {
            // Thêm e vào đây
            e.stopPropagation(); // Ngăn sự kiện click lan truyền lên document
            setShowDatePicker(!showDatePicker);
            setShowPriority(false);
          }}
          className={`icon ${showDatePicker ? "active" : ""}`}
          title="Date"
        >
          <img
            width="28"
            height="28"
            src="https://img.icons8.com/color/48/calendar--v1.png"
            alt="calendar--v1"
          />
        </span>

        <span
          onClick={handleClearSearch}
          className="icon clear-icon"
          title="Clear Search"
        >
          <img
            width="28"
            height="28"
            src="https://img.icons8.com/pulsar-gradient/50/clear-search.png"
            alt="clear-search"
          />
        </span>
      </div>

      {showPriority && (
        <div
          ref={priorityDropdownRef}
          className="priority-dropdown"
          onClick={(e) => e.stopPropagation()}
        >
          {priorityOptions.map((opt) => (
            <div
              key={opt.value}
              className={`priority-option ${
                opt.value === priority ? "selected" : ""
              }`}
              onClick={(e) => {
                // Thêm e vào đây
                e.stopPropagation(); // Ngăn sự kiện click lan truyền từ option
                setPriority(opt.value);
                setShowPriority(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}

      {showDatePicker && (
        <div
          ref={datePickerWrapperRef}
          className="date-picker-container"
          onClick={(e) => e.stopPropagation()}
        >
          <DatePicker
            selected={date}
            onChange={handleDateChange}
            inline
            dateFormat="dd/MM/yyyy"
            dropdownMode="select"
          />
        </div>
      )}
    </div>
  );
}

export default SearchTasks;
