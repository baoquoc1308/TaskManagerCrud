import { useNotifications } from "../contexts/NotificationContext";

export const useTaskNotifications = () => {
  const { addNotification } = useNotifications();

  const notifyTaskCreated = (
    userId: string,
    title: string,
    createdBy?: string
  ) => {
    const creatorName = createdBy || "Manager";
    addNotification(
      `${creatorName} created a new task "${title}" for you`,
      userId,
      "task_created"
    );
  };

  const notifyTaskDeleted = (
    userId: string,
    title: string,
    deletedBy?: string
  ) => {
    const deleterName = deletedBy || "Manager";
    addNotification(
      `${deleterName} deleted your task "${title}"`,
      userId,
      "task_deleted"
    );
  };

  const notifyTaskUpdated = (
    userId: string,
    title: string,
    updatedBy?: string,
    changes?: string
  ) => {
    console.log("🚀 ~ useTaskNotifications ~ title:", title);
    const updaterName = updatedBy || "Manager";
    const changeDetails = changes ? ` (${changes})` : "";
    addNotification(
      `${updaterName} updated your task "${title}"${changeDetails}`,
      userId,
      "task_updated"
    );
    console.log(
      "🚀 ~ useTaskNotifications ~ addNotification:",
      addNotification
    );
    console.log("🚀 ~ useTaskNotifications ~ title:", title);
  };

  const notifyTaskRenamed = (
    oldName: string,
    newName: string,
    userId: string,
    renamedBy?: string
  ) => {
    const renamerName = renamedBy || "Manager";
    addNotification(
      `${renamerName} renamed your task from "${oldName}" to "${newName}"`,
      userId,
      "task_renamed"
    );
  };

  const notifyTaskStatusChanged = (
    title: string,
    oldStatus: string,
    newStatus: string,
    userId: string,
    changedBy?: string
  ) => {
    const changerName = changedBy || "Manager";
    addNotification(
      `${changerName} changed the status of task "${title}" from "${oldStatus}" to "${newStatus}"`,
      userId,
      "task_status_changed"
    );
  };

  const notifyTaskAssigned = (
    title: string,
    userId: string,
    assignedBy?: string
  ) => {
    const assignerName = assignedBy || "Manager";
    addNotification(
      `${assignerName} assigned the task "${title}" to you`,
      userId,
      "task_assigned"
    );
  };

  const notifyTaskUnassigned = (
    title: string,
    userId: string,
    unassignedBy?: string
  ) => {
    const unassignerName = unassignedBy || "Manager";
    addNotification(
      `${unassignerName} unassigned your task "${title}"`,
      userId,
      "task_unassigned"
    );
  };

  const notifyTaskDeadlineChanged = (
    title: string,
    newDeadline: string,
    userId: string,
    changedBy?: string
  ) => {
    const changerName = changedBy || "Manager";
    addNotification(
      `${changerName} changed the deadline of task "${title}" to ${newDeadline}`,
      userId,
      "task_deadline_changed"
    );
  };

  const notifyTaskPriorityChanged = (
    title: string,
    oldPriority: string,
    newPriority: string,
    userId: string,
    changedBy?: string
  ) => {
    const changerName = changedBy || "Manager";
    addNotification(
      `${changerName} changed the priority of task "${title}" from "${oldPriority}" to "${newPriority}"`,
      userId,
      "task_priority_changed"
    );
  };

  // Bulk notifications for multiple users
  const notifyMultipleUsers = (
    message: string,
    userIds: string[],
    type: string = "general",
    actionBy?: string
  ) => {
    const actor = actionBy || "Manager";
    const finalMessage = message.includes("{actor}")
      ? message.replace("{actor}", actor)
      : `${actor} ${message}`;

    userIds.forEach((userId) => {
      addNotification(finalMessage, userId, type);
    });
  };

  return {
    notifyTaskCreated,
    notifyTaskDeleted,
    notifyTaskUpdated,
    notifyTaskRenamed,
    notifyTaskStatusChanged,
    notifyTaskAssigned,
    notifyTaskUnassigned,
    notifyTaskDeadlineChanged,
    notifyTaskPriorityChanged,
    notifyMultipleUsers,
  };
};
