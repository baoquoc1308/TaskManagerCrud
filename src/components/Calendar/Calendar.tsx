import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  MoreHorizontal,
  Filter,
  Search,
  List,
  Grid3X3,
  Home,
} from "lucide-react";
import "./Calendar.css";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string;
  location?: string;
  attendees?: string[];
  color: string;
  type: "meeting" | "task" | "reminder" | "deadline";
}

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "meeting" | "task" | "reminder" | "deadline"
  >("all");
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "meeting" as const,
  });

  useEffect(() => {
    // Mock events data
    const mockEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "Team Standup",
        description: "Daily team sync meeting",
        startTime: "09:00",
        endTime: "09:30",
        date: "2024-01-15",
        location: "Conference Room A",
        attendees: ["John", "Sarah", "Mike"],
        color: "#4ade80",
        type: "meeting",
      },
      {
        id: "2",
        title: "Project Deadline",
        description: "Frontend development completion",
        startTime: "18:00",
        endTime: "18:00",
        date: "2024-01-18",
        color: "#ef4444",
        type: "deadline",
      },
      {
        id: "3",
        title: "Client Presentation",
        description: "Q4 project review with client",
        startTime: "14:00",
        endTime: "16:00",
        date: "2024-01-16",
        location: "Zoom Meeting",
        attendees: ["Alex", "Emma", "Client Team"],
        color: "#22c55e",
        type: "meeting",
      },
      {
        id: "4",
        title: "Code Review",
        description: "Review pull requests",
        startTime: "10:30",
        endTime: "11:30",
        date: "2024-01-17",
        color: "#16a34a",
        type: "task",
      },
      {
        id: "5",
        title: "Doctor Appointment",
        description: "Annual checkup",
        startTime: "15:00",
        endTime: "16:00",
        date: "2024-01-19",
        location: "Medical Center",
        color: "#f59e0b",
        type: "reminder",
      },
    ];
    setEvents(mockEvents);
  }, []);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(
        year,
        month - 1,
        new Date(year, month, 0).getDate() - i
      );
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return events.filter((event) => event.date === dateString);
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || event.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      date:
        selectedDate?.toISOString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
      location: newEvent.location,
      color: getEventColor(newEvent.type),
      type: newEvent.type,
    };

    setEvents((prev) => [...prev, event]);
    setNewEvent({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      location: "",
      type: "meeting",
    });
    setShowEventModal(false);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "#4ade80";
      case "task":
        return "#16a34a";
      case "reminder":
        return "#f59e0b";
      case "deadline":
        return "#ef4444";
      default:
        return "#4ade80";
    }
  };

  const today = new Date();
  const days = getDaysInMonth(currentDate);

  return (
    <div className="calendar-container">
      {/* Header */}
      <motion.div
        className="calendar-header"
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
          <h1 className="calendar-title">
            <CalendarIcon className="title-icon" />
            Calendar
          </h1>
          <p className="calendar-subtitle">Manage your schedule and events</p>
        </div>

        <div className="header-actions">
          <button
            className="create-event-btn"
            onClick={() => setShowEventModal(true)}
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        className="calendar-toolbar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="toolbar-left">
          <div className="date-navigation">
            <button className="nav-btn" onClick={() => navigateMonth("prev")}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="current-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button className="nav-btn" onClick={() => navigateMonth("next")}>
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            className="today-btn"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
        </div>

        <div className="toolbar-right">
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-container">
            <Filter className="filter-icon" size={16} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Events</option>
              <option value="meeting">Meetings</option>
              <option value="task">Tasks</option>
              <option value="reminder">Reminders</option>
              <option value="deadline">Deadlines</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === "month" ? "active" : ""}`}
              onClick={() => setViewMode("month")}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === "week" ? "active" : ""}`}
              onClick={() => setViewMode("week")}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="calendar-content">
        {/* Calendar Grid */}
        <motion.div
          className="calendar-main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="calendar-grid">
            {/* Week headers */}
            <div className="week-header">
              {daysOfWeek.map((day) => (
                <div key={day} className="day-header">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="days-grid">
              {days.map((day, index) => {
                const dayEvents = getEventsForDate(day.date);
                const isToday =
                  day.date.toDateString() === today.toDateString();
                const isSelected =
                  selectedDate?.toDateString() === day.date.toDateString();

                return (
                  <motion.div
                    key={index}
                    className={`calendar-day ${
                      !day.isCurrentMonth ? "other-month" : ""
                    } ${isToday ? "today" : ""} ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => setSelectedDate(day.date)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                  >
                    <div className="day-number">{day.date.getDate()}</div>

                    <div className="day-events">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="event-dot"
                          style={{ backgroundColor: event.color }}
                          title={event.title}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="more-events">
                          +{dayEvents.length - 3}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Events Panel */}
        <motion.div
          className="events-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="panel-header">
            <h3>
              {selectedDate
                ? `Events for ${selectedDate.toLocaleDateString()}`
                : "Upcoming Events"}
            </h3>
          </div>

          <div className="events-list">
            {(selectedDate
              ? getEventsForDate(selectedDate)
              : filteredEvents.slice(0, 10)
            ).map((event) => (
              <div
                key={event.id}
                className="event-item"
                onClick={() => setSelectedEvent(event)}
              >
                <div
                  className="event-color"
                  style={{ backgroundColor: event.color }}
                />
                <div className="event-details">
                  <div className="event-title">{event.title}</div>
                  <div className="event-time">
                    <Clock size={12} />
                    {event.startTime} - {event.endTime}
                  </div>
                  {event.location && (
                    <div className="event-location">
                      <MapPin size={12} />
                      {event.location}
                    </div>
                  )}
                  {event.attendees && (
                    <div className="event-attendees">
                      <Users size={12} />
                      {event.attendees.length} attendees
                    </div>
                  )}
                </div>
                <button className="event-actions">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              className="event-detail-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{selectedEvent.title}</h3>
                <button
                  className="close-modal"
                  onClick={() => setSelectedEvent(null)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="event-info">
                  <div className="info-item">
                    <Clock className="info-icon" />
                    <span>
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </span>
                  </div>

                  {selectedEvent.location && (
                    <div className="info-item">
                      <MapPin className="info-icon" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}

                  {selectedEvent.attendees && (
                    <div className="info-item">
                      <Users className="info-icon" />
                      <span>{selectedEvent.attendees.join(", ")}</span>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div className="event-description">
                    <h4>Description</h4>
                    <p>{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Create New Event</h3>

              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter event title..."
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Event description..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) =>
                      setNewEvent((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) =>
                      setNewEvent((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Event location..."
                />
              </div>

              <div className="form-group">
                <label>Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      type: e.target.value as any,
                    }))
                  }
                >
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowEventModal(false)}
                >
                  Cancel
                </button>
                <button className="create-btn" onClick={handleCreateEvent}>
                  Create Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
