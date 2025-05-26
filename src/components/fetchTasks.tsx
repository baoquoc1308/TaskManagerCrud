import { supabase } from "../supabase-client";
import type { Task } from "../types/Task";
import "../styles/App.css";

export const fetchTasks = async (
  page: number,
  pageSize: number,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setTotalPages: React.Dispatch<React.SetStateAction<number>>,
  setTotalCount: React.Dispatch<React.SetStateAction<number>>
) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

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
