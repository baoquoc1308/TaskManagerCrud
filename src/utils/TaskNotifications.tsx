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
    taskId: string,
    title: string,
    updatedBy?: string,
    changes?: string
  ) => {
    console.log("🚀 ~ useTaskNotifications ~ taskId:", taskId);
    console.log("🚀 ~ useTaskNotifications ~ title:", title);
    const updaterName = updatedBy || "Manager";
    console.log("🚀 ~ useTaskNotifications ~ updaterName:", updaterName);
    const changeDetails = changes ? ` (${changes})` : "";
    console.log("🚀 ~ useTaskNotifications ~ changeDetails:", changeDetails);
    addNotification(
      `${updaterName} updated your task "${title}"${changeDetails}`,
      taskId,
      "task_updated"
    );
    console.log("🚀 ~ useTaskNotifications ~ title:", title);
  };

  const notifyTaskRenamed = (
    taskId: string,
    title: string,
    renamedBy?: string,
    changes?: string
  ) => {
    console.log("🚀 ~ useTaskNotifications ~ title:", title);
    console.log("🚀 ~ useTaskNotifications ~ taskId:", taskId);
    const renamerName = renamedBy || "Manager";
    const changeDetails = changes ? ` (${changes})` : "";
    addNotification(
      `${renamerName} renamed your task from "${title}" to "${changeDetails}"`,
      taskId,
      "task_renamed"
    );
    console.log("🚀 ~ useTaskNotifications ~ title:", title);
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
