import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Search,
  Star,
  Archive,
  Trash2,
  MoreHorizontal,
  Filter,
  Clock,
  User,
  Paperclip,
  Home,
} from "lucide-react";
import "./Inbox.css";

interface Message {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  priority: "high" | "medium" | "low";
  avatar: string;
}

const Inbox = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "starred">(
    "all"
  );
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: "1",
        sender: "Alex Johnson",
        subject: "Project Update - Q4 2024",
        preview:
          "Hi team, I wanted to update you on the current status of our Q4 project deliverables...",
        timestamp: "2 mins ago",
        isRead: false,
        isStarred: true,
        hasAttachment: true,
        priority: "high",
        avatar: "AJ",
      },
      {
        id: "2",
        sender: "Sarah Chen",
        subject: "Weekly Team Meeting",
        preview:
          "Reminder: Our weekly team meeting is scheduled for tomorrow at 10 AM...",
        timestamp: "1 hour ago",
        isRead: false,
        isStarred: false,
        hasAttachment: false,
        priority: "medium",
        avatar: "SC",
      },
      {
        id: "3",
        sender: "Marketing Team",
        subject: "New Campaign Launch",
        preview:
          "Exciting news! We are launching our new marketing campaign next week...",
        timestamp: "3 hours ago",
        isRead: true,
        isStarred: false,
        hasAttachment: true,
        priority: "medium",
        avatar: "MT",
      },
      {
        id: "4",
        sender: "David Wilson",
        subject: "Design Feedback Required",
        preview:
          "Could you please review the latest design mockups and provide your feedback...",
        timestamp: "1 day ago",
        isRead: true,
        isStarred: true,
        hasAttachment: false,
        priority: "low",
        avatar: "DW",
      },
      {
        id: "5",
        sender: "System Admin",
        subject: "Security Update Notice",
        preview:
          "Important: Please update your password following our new security protocols...",
        timestamp: "2 days ago",
        isRead: false,
        isStarred: false,
        hasAttachment: false,
        priority: "high",
        avatar: "SA",
      },
    ];
    setMessages(mockMessages);
  }, []);

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase());

    switch (filterType) {
      case "unread":
        return matchesSearch && !message.isRead;
      case "starred":
        return matchesSearch && message.isStarred;
      default:
        return matchesSearch;
    }
  });

  const handleStarToggle = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
      )
    );
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg))
    );
  };

  const unreadCount = messages.filter((msg) => !msg.isRead).length;

  return (
    <div className="inbox-container">
      <motion.div
        className="inbox-header"
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
          <h1 className="inbox-title">
            <Mail className="title-icon" />
            Inbox
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </h1>
        </div>

        <div className="header-actions">
          <button className="action-btn refresh-btn">
            <Archive size={18} />
          </button>
          <button className="action-btn">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </motion.div>

      <motion.div
        className="inbox-toolbar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          {(["all", "unread", "starred"] as const).map((filter) => (
            <button
              key={filter}
              className={`filter-tab ${filterType === filter ? "active" : ""}`}
              onClick={() => setFilterType(filter)}
            >
              {filter === "starred" && <Star size={16} />}
              {filter === "unread" && <Mail size={16} />}
              {filter === "all" && <Filter size={16} />}
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="inbox-content">
        <motion.div
          className="messages-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence>
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`message-item ${!message.isRead ? "unread" : ""}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => {
                  handleMarkAsRead(message.id);
                  setSelectedMessage(message);
                }}
              >
                <div className="message-avatar">
                  <div className={`avatar priority-${message.priority}`}>
                    {message.avatar}
                  </div>
                </div>

                <div className="message-content">
                  <div className="message-header">
                    <span className="sender-name">{message.sender}</span>
                    <div className="message-meta">
                      {message.hasAttachment && (
                        <Paperclip size={14} className="attachment-icon" />
                      )}
                      <span className="timestamp">{message.timestamp}</span>
                    </div>
                  </div>

                  <div className="message-subject">
                    {message.subject}
                    {message.priority === "high" && (
                      <span className="priority-indicator high">!</span>
                    )}
                  </div>

                  <div className="message-preview">{message.preview}</div>
                </div>

                <div className="message-actions">
                  <button
                    className={`star-btn ${message.isStarred ? "starred" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStarToggle(message.id);
                    }}
                  >
                    <Star
                      size={16}
                      fill={message.isStarred ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {selectedMessage && (
            <motion.div
              className="message-detail"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
            >
              <div className="detail-header">
                <button
                  className="close-detail"
                  onClick={() => setSelectedMessage(null)}
                >
                  ×
                </button>
                <h3>{selectedMessage.subject}</h3>
              </div>

              <div className="detail-sender">
                <div className="sender-avatar">
                  <div
                    className={`avatar priority-${selectedMessage.priority}`}
                  >
                    {selectedMessage.avatar}
                  </div>
                </div>
                <div className="sender-info">
                  <div className="sender-name">{selectedMessage.sender}</div>
                  <div className="timestamp">
                    <Clock size={12} />
                    {selectedMessage.timestamp}
                  </div>
                </div>
              </div>

              <div className="detail-content">
                <p>{selectedMessage.preview}</p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>

              <div className="detail-actions">
                <button className="reply-btn">Reply</button>
                <button className="forward-btn">Forward</button>
                <button className="archive-btn">Archive</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Inbox;
