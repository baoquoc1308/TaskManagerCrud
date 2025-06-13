import { useState, useRef, useEffect } from "react";
import "./TaskManagerHeader.css";
import { supabase } from "../../supabase-client";
import { useNotifications } from "../../contexts/NotificationContext";
import { Bell, User, Calendar, Phone, Mail } from "lucide-react";
import { toast } from "react-toastify";

// interface Notification {
//   id: string;
//   message: string;
//   timestamp: string;
//   isRead: boolean;
// }

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
  const { getUserNotifications, markAllAsRead, deleteNotification } =
    useNotifications();
  const notifications = getUserNotifications(userId);
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(
    avatarUrl || null
  );

  useEffect(() => {
    const count = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);
  const handleMarkAllAsRead = () => {
    markAllAsRead(userId);
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
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
          setTempAvatar(null);
          setShowAvatarActions(false);
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

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAvatarActions, setShowAvatarActions] = useState(false);
  const [showExpandedAvatar, setShowExpandedAvatar] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "male",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  // Add state for display name
  const [displayName, setDisplayName] = useState<string>(userEmail);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("full_name, date_of_birth, gender, phone")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          fullName: data.full_name || "",
          dateOfBirth: data.date_of_birth
            ? convertToDisplayDate(data.date_of_birth)
            : "",
          gender: data.gender || "male",
          phone: data.phone || "",
        });
        // Set display name - use full name if available, otherwise use email
        setDisplayName(
          data.full_name && data.full_name.trim() ? data.full_name : userEmail
        );
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to convert date from yyyy-mm-dd to dd/mm/yyyy for display
  const convertToDisplayDate = (dateString: string): string => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Function to convert date from dd/mm/yyyy to yyyy-mm-dd for storage
  const convertToStorageDate = (dateString: string): string => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      setSaveStatus("saving");

      // Validate data before saving
      if (!profile.fullName.trim()) {
        throw new Error("Full name is required");
      }

      // Convert date back to yyyy-mm-dd format for storage
      const storageDate = profile.dateOfBirth
        ? convertToStorageDate(profile.dateOfBirth)
        : "";

      const { error } = await supabase
        .from("users")
        .update({
          full_name: profile.fullName,
          date_of_birth: storageDate,
          gender: profile.gender,
          phone: profile.phone,
        })
        .eq("id", userId);

      if (error) throw error;

      setSaveStatus("success");
      toast.success("Profile saved successfully!");

      // Update display name after successful save
      setDisplayName(
        profile.fullName && profile.fullName.trim()
          ? profile.fullName
          : userEmail
      );

      setShowEditProfile(false);
      setSaveStatus("idle");

      // setTimeout(() => {
      //   setShowEditProfile(false);
      //   setSaveStatus("idle");
      // }, 100);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus("error");
      toast.error("Failed to save profile!");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };
  // useEffect
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        !(e.target as HTMLElement).closest(".user-avatar-wrapper") &&
        !(e.target as HTMLElement).closest(".avatar-actions-dropdown")
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
                  <button
                    className="mark-all-read"
                    onClick={handleMarkAllAsRead}
                  >
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
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
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

        {/* Display full name if available, otherwise email */}
        <span>{displayName}</span>

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
                src={tempAvatar ?? currentAvatar ?? undefined}
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
                    setShowEditProfile(true);
                    setShowAvatarDropdown(false);
                  }}
                >
                  Edit Profile
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

      {/* Modal Edit Profile với Avatar */}
      {showEditProfile && (
        <div className="modal-backdrop">
          <div className="modal-content profile-modal">
            {/* Close button */}
            <button
              className="modal-close-btn"
              onClick={() => {
                setShowEditProfile(false);
                setShowAvatarActions(false);
                setShowExpandedAvatar(false);
                setTempAvatar(null);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <div className="modal-title">
              EDIT PROFILE
              {isLoading && (
                <span className="loading-indicator">Loading...</span>
              )}
            </div>

            <div className="modal-body">
              {isLoading ? (
                <div className="loading-spinner">Loading profile data...</div>
              ) : (
                <>
                  {/* Avatar Section at Top */}
                  <div className="avatar-section">
                    <div
                      className="profile-avatar"
                      onClick={() => setShowAvatarActions(!showAvatarActions)}
                    >
                      {tempAvatar ? (
                        <img
                          src={tempAvatar}
                          alt="Profile Avatar"
                          className="avatar-img"
                        />
                      ) : currentAvatar ? (
                        <img
                          src={currentAvatar}
                          alt="Profile Avatar"
                          className="avatar-img"
                        />
                      ) : (
                        <div className="avatar-placeholder">🧑🏻</div>
                      )}
                    </div>

                    {/* Avatar Actions Dropdown */}
                    {showAvatarActions && (
                      <div className="avatar-actions-dropdown">
                        <div
                          className="avatar-action"
                          onClick={() => {
                            setShowExpandedAvatar(true);
                            setShowAvatarActions(false);
                          }}
                        >
                          View Avatar
                        </div>
                        <div
                          className="avatar-action"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setShowAvatarActions(false);
                          }}
                        >
                          Change Avatar
                        </div>
                      </div>
                    )}

                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="avatar-file-input"
                    />

                    {/* Show preview and save/cancel when file selected */}
                    {tempAvatar && (
                      <div className="avatar-actions-buttons">
                        <button
                          onClick={handleSaveAvatar}
                          disabled={isUploading}
                          className="avatar-save-btn"
                        >
                          {isUploading ? "Uploading..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setTempAvatar(null);
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }}
                          disabled={isUploading}
                          className="avatar-cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* --- Form Fields --- */}
                  <div className="form-group">
                    <label>
                      <User size={16} className="icon" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleProfileChange}
                      placeholder="Nguyen Van A"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <Calendar size={16} className="icon" />
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      name="dateOfBirth"
                      value={profile.dateOfBirth}
                      onChange={handleProfileChange}
                      placeholder="dd/mm/yyyy"
                      pattern="\d{2}/\d{2}/\d{4}"
                      title="Please enter date in DD/MM/YYYY format"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <User size={16} className="icon" />
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleProfileChange}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <Mail size={16} className="icon" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="disabled-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <Phone size={16} className="icon" />
                      Phone Number
                    </label>
                    <input
                      placeholder="Your phone number"
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              {saveStatus === "error" && (
                <span className="error-message">Failed to save changes</span>
              )}
              {saveStatus === "success" && (
                <span className="success-message"></span>
              )}
              <button
                className={`save-button ${
                  saveStatus === "saving" ? "saving" : ""
                }`}
                onClick={handleSaveProfile}
                disabled={isLoading || saveStatus === "saving"}
              >
                {saveStatus === "saving" ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setShowEditProfile(false);
                  setShowAvatarActions(false);
                  setShowExpandedAvatar(false);
                  setTempAvatar(null);
                }}
                disabled={saveStatus === "saving"}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Expanded Avatar Modal */}
      {showExpandedAvatar && (
        <div
          className="modal-backdrop expanded-avatar-backdrop"
          onClick={() => setShowExpandedAvatar(false)}
        >
          <div
            className="expanded-avatar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="expanded-avatar-close"
              onClick={() => setShowExpandedAvatar(false)}
            >
              ×
            </button>
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Expanded Avatar"
                className="expanded-avatar-img"
              />
            ) : (
              <div className="avatar-placeholder">🧑🏻</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
