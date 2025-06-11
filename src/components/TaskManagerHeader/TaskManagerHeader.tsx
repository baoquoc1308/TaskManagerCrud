import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import "./TaskManagerHeader.css";
import { supabase } from "../../supabase-client";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export default function TaskManagerHeader({
  userEmail,
  avatarUrl,
  onLogout,
  searchComponent,
  userId,
}: {
  userEmail: string;
  avatarUrl: string | null;
  onLogout: () => void;
  userRole: string | null;
  searchComponent?: React.ReactNode;
  userId: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [showEditAvatarModal, setShowEditAvatarModal] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentAvatar, setCurrentAvatar] = useState<string | null>(
    avatarUrl || null
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!userId) {
      console.error("Cannot upload avatar - userId is undefined");
      return null;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatar-users/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatar-users")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatar-users").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar: publicUrl })
        .eq("id", userId);

      if (updateError) {
        console.error("Update error details:", updateError);
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      return publicUrl;
    } catch (error) {
      console.error("Full error details:", error);
      return null;
    }
  };
  const handleSaveAvatar = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadAvatar(file);
      if (publicUrl) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl },
        });

        if (authError) {
          console.error("Auth update error:", authError);
        } else {
          setCurrentAvatar(publicUrl);
          setShowEditAvatarModal(false);
          setTempAvatar(null);
        }
      } else {
        alert("Failed to upload avatar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error uploading avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleModalBackdropClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      setShowEditAvatarModal(false);
      setTempAvatar(null);
    }
  };

  useEffect(() => {
    const handleDocumentClick = (e: any) => {
      if (
        !e.target.closest(".user-avatar-wrapper") &&
        !e.target.closest(".avatar-dropdown")
      ) {
        setShowAvatarDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  return (
    <div className="task-header">
      <div className="app-title">
        <i className="list-icon">
          <img
            width="80"
            height="80"
            src="https://img.icons8.com/clouds/80/reminders.png"
            alt="reminders"
          />
        </i>{" "}
        Task Manager
      </div>
      <div className="header-right">
        <div className="search-tasks-wrapper">{searchComponent}</div>
        {/* Notifications Bell */}
        <div className="notifications-wrapper">
          <button
            className="notification-bell-button"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-read" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <p className="no-notifications">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        !notification.isRead ? "unread" : ""
                      }`}
                    >
                      <p className="notification-message">
                        {notification.message}
                      </p>
                      <span className="notification-time">
                        {notification.timestamp}
                      </span>
                      <button
                        className="delete-notification"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <span>{userEmail}</span>

        {/* Avatar & Dropdown */}
        <div className="user-avatar-wrapper" style={{ position: "relative" }}>
          <div
            className="user-avatar"
            onClick={(e) => {
              e.stopPropagation();
              setShowAvatarDropdown((show) => !show);
            }}
            style={{ cursor: "pointer" }}
          >
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="User Avatar"
                className="user-avatar-img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="fallback-avatar">🧑🏻</div>
            )}
          </div>

          {showAvatarDropdown && (
            <div
              className="avatar-dropdown"
              style={{
                position: "absolute",
                right: 0,
                top: "110%",
                zIndex: 999,
              }}
            >
              <ul>
                <li
                  onClick={() => {
                    setShowEditAvatarModal(true);
                    setShowAvatarDropdown(false);
                    setTempAvatar(null);
                  }}
                >
                  Edit Avatar
                </li>
                <li
                  onClick={() => {
                    setShowAvatarDropdown(false);
                    onLogout();
                  }}
                >
                  Log Out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Avatar */}
      {showEditAvatarModal && (
        <div className="modal-backdrop" onClick={handleModalBackdropClick}>
          <div className="modal-content">
            <div className="modal-title">Edit Avatar</div>
            <div className="modal-body">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ marginBottom: 10 }}
              />
              {tempAvatar && (
                <div className="preview-avatar" style={{ marginBottom: 12 }}>
                  <img
                    src={tempAvatar}
                    alt="Preview Avatar"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #eee",
                      background: "#faf9f9",
                    }}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="app-button"
                style={{ marginRight: 8 }}
                disabled={!tempAvatar}
                onClick={handleSaveAvatar}
              >
                {isUploading ? "Uploading..." : "Save"}
              </button>
              <button
                className="app-button"
                onClick={() => {
                  setShowEditAvatarModal(false);
                  setTempAvatar(null);
                }}
                disabled={isUploading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
