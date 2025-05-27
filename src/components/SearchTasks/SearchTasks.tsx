import { useState, useRef, useEffect } from "react";
import { supabase } from "../../supabase-client";
import type { Task } from "../../types/Task";
import "./SearchTasks.css";
const priorityOptions = [
  { value: "", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface SearchTasksProps {
  onResults: (tasks: Task[]) => void;
}

export function SearchTasks({ onResults }: SearchTasksProps) {
  const [keyword, setKeyword] = useState("");
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState("");

  const [showPriority, setShowPriority] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowPriority(false);
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm gọi API Supabase tìm tasks theo filter
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

    if (date !== "") {
      const startDate = date + "T00:00:00";
      const endDate = date + "T23:59:59";
      query = query.gte("created_at", startDate).lte("created_at", endDate);
    }

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
          onClick={() => {
            setShowPriority(!showPriority);
            setShowDatePicker(false);
          }}
          className={`icon ${showPriority ? "active" : ""}`}
          title="Priority"
        >
          🎯
        </span>

        <span
          onClick={() => {
            setShowDatePicker(!showDatePicker);
            setShowPriority(false);
          }}
          className={`icon ${showDatePicker ? "active" : ""}`}
          title="Date"
        >
          📅
        </span>
      </div>

      {showPriority && (
        <div className="priority-dropdown">
          {priorityOptions.map((opt) => (
            <div
              key={opt.value}
              className={`priority-option ${
                opt.value === priority ? "selected" : ""
              }`}
              onClick={() => {
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
        <input
          type="date"
          className="calendar-picker"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setShowDatePicker(false);
          }}
          autoFocus
        />
      )}
    </div>
  );
}

export default SearchTasks;
