// taskNotifications.ts
import { useNotifications } from "../contexts/NotificationContext";

export const useTaskNotifications = () => {
  const { addNotification } = useNotifications();

  const notifyTaskDeleted = (taskName: string, userId: string) => {
    addNotification(`Task "${taskName}" đã bị xóa`, userId, "task_deleted");
  };

  const notifyTaskUpdated = (taskName: string, userId: string) => {
    addNotification(
      `Task "${taskName}" đã được cập nhật`,
      userId,
      "task_updated"
    );
  };

  const notifyTaskRenamed = (
    oldName: string,
    newName: string,
    userId: string
  ) => {
    addNotification(
      `Task "${oldName}" đã được đổi tên thành "${newName}"`,
      userId,
      "task_renamed"
    );
  };

  return {
    notifyTaskDeleted,
    notifyTaskUpdated,
    notifyTaskRenamed,
  };
};
