import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import "./TaskManagerHeader.css";

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
  userRole,
}: {
  userEmail: string;
  avatarUrl: string | null;
  onLogout: () => void;
  userRole: string | null;
}) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Avatar dropdown & modal states
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [showEditAvatarModal, setShowEditAvatarModal] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Giả lập cập nhật avatar, thực tế bạn sẽ cần gọi API
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

  // Xử lý chọn file ảnh mới
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xác nhận đổi avatar
  const handleSaveAvatar = () => {
    setCurrentAvatar(tempAvatar);
    setShowEditAvatarModal(false);
    setShowAvatarDropdown(false);
    setTempAvatar(null);
  };

  // Đóng modal khi click nền tối
  const handleModalBackdropClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      setShowEditAvatarModal(false);
      setTempAvatar(null);
    }
  };

  // Đóng dropdown khi click ngoài
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
        <i className="fas fa-clipboard-list list-icon"></i> TaskManager
      </div>
      <div className="header-right">
        {userRole === "manager" && (
          <button
            onClick={() => navigate("/manager-dashboard")}
            className="btn-manager-dashboard"
          >
            <i className="fas fa-tachometer-alt dashboard-icon"></i>
            Manager Dashboard
          </button>
        )}

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
              <div className="fallback-avatar">👤</div>
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
                Save
              </button>
              <button
                className="app-button"
                onClick={() => {
                  setShowEditAvatarModal(false);
                  setTempAvatar(null);
                }}
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
