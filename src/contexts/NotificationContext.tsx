import React, { createContext, useState, useContext } from "react";

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type?: "task_deleted" | "task_updated" | "task_renamed" | "general"; // Thêm type
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (message: string, userId: string, type?: string) => void;
  markAllAsRead: (userId: string) => void;
  deleteNotification: (id: string) => void;
  getUserNotifications: (userId: string) => AppNotification[];
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

  const addNotification = (
    message: string,
    userId: string,
    type: string = "general"
  ) => {
    const newNotification: AppNotification = {
      id: Date.now().toString(),
      userId,
      message,
      timestamp: new Date().toLocaleString(),
      isRead: false,
      type: type as any,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAllAsRead = (userId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getUserNotifications = (userId: string) => {
    return notifications.filter((n) => n.userId === userId);
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
