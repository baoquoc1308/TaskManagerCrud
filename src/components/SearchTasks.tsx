// src/components/SearchTasks.tsx
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import Select from "react-select";
import { commonSelectStyles } from "../utils/SelectStyles";

interface Task {
  id: number;
  email: string;
  time: string;
  priority: string;
  title: string;
  description: string;
}

interface SearchTasksProps {
  onResults: (tasks: Task[]) => void;
}

const priorityOptions = [
  { value: "", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const SearchTasks = ({ onResults }: SearchTasksProps) => {
  const [keyword, setKeyword] = useState("");
  const [priority, setPriority] = useState("");
  const [time, setTime] = useState("");

  // Trong SearchTasks.tsx
  const handleSearch = async () => {
    let query = supabase.from("tasks").select("*");

    if (keyword) {
      query = query
        .ilike("title", `%${keyword}%`)
        .or(`description.ilike.%${keyword}%`);
    }

    if (priority) {
      query = query.eq("priority", priority);
    }

    if (time) {
      query = query.eq("time", time);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error searching tasks:", error.message);
    } else {
      onResults(data as Task[]);
    }
  };

  useEffect(() => {
    handleSearch(); // Auto-run when filters change
  }, [keyword, priority, time]);

  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Search title or description..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ padding: "8px", marginRight: "10px", width: "200px" }}
      />

      <Select
        options={priorityOptions}
        placeholder="Select Priority"
        value={priorityOptions.find((opt) => opt.value === priority)}
        onChange={(opt) => setPriority(opt?.value || "")}
        styles={commonSelectStyles}
      />

      <input
        type="date"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        style={{ marginLeft: "10px", padding: "8px" }}
      />

      <button
        onClick={handleSearch}
        style={{ marginLeft: "10px", padding: "8px 16px" }}
      >
        Search
      </button>
    </div>
  );
};
