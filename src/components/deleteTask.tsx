import { supabase } from "../supabase-client";
import type { Task } from "../types/task";
import "../styles/App.css";

const pageSize = 5;

interface DeleteTaskProps {
  taskToDelete: Task | null;
  setTaskToDelete: React.Dispatch<React.SetStateAction<Task | null>>;
  showDeleteModal: boolean;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setTotalCount: React.Dispatch<React.SetStateAction<number>>;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
}

export const deleteTask = async (
  task: Task,
  tasks: Task[],
  currentPage: number,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  setTotalCount: React.Dispatch<React.SetStateAction<number>>,
  setTotalPages: React.Dispatch<React.SetStateAction<number>>,
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>,
  setTaskToDelete: React.Dispatch<React.SetStateAction<Task | null>>
) => {
  const { error } = await supabase.from("tasks").delete().eq("id", task.id);

  if (error) {
    console.error("Error deleting task: ", error.message);
    return;
  }

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

  // Nếu chỉ còn 1 task trên trang hiện tại và currentPage > 1 thì giảm trang
  if (tasks.length === 1 && currentPage > 1) {
    setCurrentPage(currentPage - 1);
  } else {
    setTasks(tasks.filter((t) => t.id !== task.id));
  }

  setShowDeleteModal(false);
  setTaskToDelete(null);
};
