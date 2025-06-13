import React, { createContext, useState, useContext } from "react";

export interface AppNotification {
  id: string;
  taskId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type?:
    | "task_created"
    | "task_deleted"
    | "task_updated"
    | "task_renamed"
    | "task_status_changed"
    | "task_assigned"
    | "task_unassigned"
    | "task_deadline_changed"
    | "task_priority_changed"
    | "general";
}
interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (message: string, taskId: string, type?: string) => void;
  markAllAsRead: (taskId: string) => void;
  deleteNotification: (id: string) => void;
  getUserNotifications: () => AppNotification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  console.log("🚀 ~ notifications:", notifications);

  const addNotification = (
    message: string,
    taskId: string,
    type: string = "general"
  ) => {
    console.log("?????????");

    const newNotification: AppNotification = {
      id: Date.now().toString(),
      taskId,
      message,
      timestamp: new Date().toLocaleString(),
      isRead: true,
      type: type as any,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAllAsRead = (taskId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.taskId === taskId ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getUserNotifications = () => {
    return notifications;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAllAsRead,
        deleteNotification,
        getUserNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
