import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Moon,
  Sun,
  Monitor,
  Check,
  Home,
} from "lucide-react";
import "./Settings.css";

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  title: string;
  department: string;
  phone: string;
  timezone: string;
  language: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  taskAssigned: boolean;
  taskCompleted: boolean;
  teamUpdates: boolean;
  weeklyDigest: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  passwordRequirements: boolean;
}

interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  colorScheme: string;
  fontSize: "small" | "medium" | "large";
  animations: boolean;
  compactMode: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [profile, setProfile] = useState<UserProfile>({
    name: "John Doe",
    email: "john.doe@company.com",
    avatar: "JD",
    title: "Senior Developer",
    department: "Engineering",
    phone: "+1 (555) 123-4567",
    timezone: "UTC-8",
    language: "en",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    desktop: false,
    taskAssigned: true,
    taskCompleted: true,
    teamUpdates: false,
    weeklyDigest: true,
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordRequirements: true,
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "light",
    colorScheme: "green",
    fontSize: "medium",
    animations: true,
    compactMode: false,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "data", label: "Data & Privacy", icon: Globe },
  ];

  const handleSave = async () => {
    setSaveStatus("saving");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const handleExportData = () => {
    // Simulate data export
    const data = {
      profile,
      notifications,
      security: { ...security, passwordRequirements: undefined },
      appearance,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "settings-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderProfileTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Profile Information</h3>
        <p>Update your personal information and contact details</p>
      </div>

      <div className="profile-avatar">
        <div className="avatar-display">
          <div className="avatar-circle">{profile.avatar}</div>
          <button className="change-avatar-btn">
            <Upload size={16} />
            Change Photo
          </button>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            value={profile.title}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <label>Department</label>
          <input
            type="text"
            value={profile.department}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, department: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <label>Timezone</label>
          <select
            value={profile.timezone}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, timezone: e.target.value }))
            }
          >
            <option value="UTC-12">UTC-12</option>
            <option value="UTC-8">UTC-8 (PST)</option>
            <option value="UTC-5">UTC-5 (EST)</option>
            <option value="UTC+0">UTC+0 (GMT)</option>
            <option value="UTC+7">UTC+7 (ICT)</option>
            <option value="UTC+9">UTC+9 (JST)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Language</label>
          <select
            value={profile.language}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, language: e.target.value }))
            }
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Notification Preferences</h3>
        <p>Control how and when you receive notifications</p>
      </div>

      <div className="notification-groups">
        <div className="notification-group">
          <h4>Delivery Methods</h4>
          <div className="setting-item">
            <div className="setting-info">
              <Mail className="setting-icon" />
              <div>
                <div className="setting-label">Email Notifications</div>
                <div className="setting-description">
                  Receive notifications via email
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    email: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <Smartphone className="setting-icon" />
              <div>
                <div className="setting-label">Push Notifications</div>
                <div className="setting-description">
                  Receive push notifications on mobile
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    push: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <Monitor className="setting-icon" />
              <div>
                <div className="setting-label">Desktop Notifications</div>
                <div className="setting-description">
                  Show desktop notifications in browser
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.desktop}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    desktop: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="notification-group">
          <h4>Activity Notifications</h4>
          <div className="setting-item">
            <div className="setting-info">
              <div>
                <div className="setting-label">Task Assigned</div>
                <div className="setting-description">
                  When a new task is assigned to you
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.taskAssigned}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    taskAssigned: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <div className="setting-label">Task Completed</div>
                <div className="setting-description">
                  When someone completes a task
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.taskCompleted}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    taskCompleted: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <div className="setting-label">Team Updates</div>
                <div className="setting-description">
                  Updates from your team members
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.teamUpdates}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    teamUpdates: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <div className="setting-label">Weekly Digest</div>
                <div className="setting-description">
                  Weekly summary of your activity
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.weeklyDigest}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    weeklyDigest: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Security & Privacy</h3>
        <p>Manage your account security and privacy settings</p>
      </div>

      <div className="security-groups">
        <div className="security-group">
          <h4>Account Security</h4>

          <div className="setting-item">
            <div className="setting-info">
              <Shield className="setting-icon" />
              <div>
                <div className="setting-label">Two-Factor Authentication</div>
                <div className="setting-description">
                  Add an extra layer of security to your account
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={security.twoFactorAuth}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    twoFactorAuth: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <Bell className="setting-icon" />
              <div>
                <div className="setting-label">Login Alerts</div>
                <div className="setting-description">
                  Get notified of new login attempts
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={security.loginAlerts}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    loginAlerts: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <div className="setting-label">Session Timeout</div>
                <div className="setting-description">
                  Automatically sign out after inactivity
                </div>
              </div>
            </div>
            <select
              value={security.sessionTimeout}
              onChange={(e) =>
                setSecurity((prev) => ({
                  ...prev,
                  sessionTimeout: Number(e.target.value),
                }))
              }
              className="timeout-select"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={240}>4 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>
        </div>

        <div className="security-group">
          <h4>Password & Authentication</h4>

          <div className="password-section">
            <div className="form-group">
              <label>Current Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password" />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" />
            </div>

            <button className="change-password-btn">
              <Lock size={16} />
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Appearance & Display</h3>
        <p>Customize how the application looks and feels</p>
      </div>

      <div className="appearance-groups">
        <div className="appearance-group">
          <h4>Theme</h4>
          <div className="theme-options">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={`theme-option ${
                  appearance.theme === value ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={appearance.theme === value}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      theme: e.target.value as any,
                    }))
                  }
                />
                <div className="theme-preview">
                  <Icon size={20} />
                  <span>{label}</span>
                  {appearance.theme === value && (
                    <Check size={16} className="check-icon" />
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="appearance-group">
          <h4>Color Scheme</h4>
          <div className="color-options">
            {[
              { value: "green", color: "#4ade80" },
              { value: "blue", color: "#3b82f6" },
              { value: "purple", color: "#8b5cf6" },
              { value: "pink", color: "#ec4899" },
              { value: "orange", color: "#f97316" },
            ].map(({ value, color }) => (
              <label
                key={value}
                className={`color-option ${
                  appearance.colorScheme === value ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="colorScheme"
                  value={value}
                  checked={appearance.colorScheme === value}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      colorScheme: e.target.value,
                    }))
                  }
                />
                <div
                  className="color-preview"
                  style={{ backgroundColor: color }}
                >
                  {appearance.colorScheme === value && <Check size={16} />}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="appearance-group">
          <h4>Display Options</h4>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <div className="setting-label">Font Size</div>
                <div className="setting-description">
                  Adjust the text size throughout the app
                </div>
              </div>
            </div>
            <select
              value={appearance.fontSize}
              onChange={(e) =>
                setAppearance((prev) => ({
                  ...prev,
                  fontSize: e.target.value as any,
                }))
              }
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <div className="setting-label">Animations</div>
                <div className="setting-description">
                  Enable smooth animations and transitions
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={appearance.animations}
                onChange={(e) =>
                  setAppearance((prev) => ({
                    ...prev,
                    animations: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div>
                <div className="setting-label">Compact Mode</div>
                <div className="setting-description">
                  Use smaller spacing and condensed layout
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={appearance.compactMode}
                onChange={(e) =>
                  setAppearance((prev) => ({
                    ...prev,
                    compactMode: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Data & Privacy</h3>
        <p>Manage your data and privacy preferences</p>
      </div>

      <div className="data-groups">
        <div className="data-group">
          <h4>Data Management</h4>

          <div className="data-action">
            <div className="action-info">
              <Download className="action-icon" />
              <div>
                <div className="action-label">Export Data</div>
                <div className="action-description">
                  Download a copy of your data
                </div>
              </div>
            </div>
            <button className="action-btn" onClick={handleExportData}>
              Export
            </button>
          </div>

          <div className="data-action">
            <div className="action-info">
              <RefreshCw className="action-icon" />
              <div>
                <div className="action-label">Clear Cache</div>
                <div className="action-description">
                  Clear stored data and refresh the app
                </div>
              </div>
            </div>
            <button className="action-btn">Clear</button>
          </div>

          <div className="data-action danger">
            <div className="action-info">
              <Trash2 className="action-icon" />
              <div>
                <div className="action-label">Delete Account</div>
                <div className="action-description">
                  Permanently delete your account and all data
                </div>
              </div>
            </div>
            <button className="action-btn danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-container">
      {/* Header */}
      <motion.div
        className="settings-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-left">
          <button
            className="back-to-home-btn"
            onClick={() => navigate("/")}
            title="Back to Home"
          >
            <Home size={18} />
            Back to Home
          </button>
          <h1 className="settings-title">
            <SettingsIcon className="title-icon" />
            Settings
          </h1>
          <p className="settings-subtitle">
            Manage your account and application preferences
          </p>
        </div>

        <div className="header-actions">
          <button
            className={`save-btn ${saveStatus}`}
            onClick={handleSave}
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving" ? (
              <>
                <RefreshCw size={16} className="spinning" />
                Saving...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check size={16} />
                Saved
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>

      <div className="settings-content">
        {/* Sidebar */}
        <motion.div
          className="settings-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <nav className="settings-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="settings-main"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "profile" && renderProfileTab()}
              {activeTab === "notifications" && renderNotificationsTab()}
              {activeTab === "security" && renderSecurityTab()}
              {activeTab === "appearance" && renderAppearanceTab()}
              {activeTab === "data" && renderDataTab()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
