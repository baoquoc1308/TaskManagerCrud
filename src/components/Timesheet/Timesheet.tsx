import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Play,
  Pause,
  Square,
  Calendar,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Timer,
  BarChart3,
  Target,
  Home,
} from "lucide-react";
import "./Timesheet.css";

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  startTime: string;
  endTime?: string;
  duration: number;
  date: string;
  status: "running" | "paused" | "completed";
  billable: boolean;
}

interface ProjectStats {
  name: string;
  totalHours: number;
  billableHours: number;
  color: string;
}

const Timesheet = () => {
  const navigate = useNavigate();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filterProject, setFilterProject] = useState("all");
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    project: "",
    task: "",
    billable: true,
  });

  useEffect(() => {
    // Mock data
    const mockEntries: TimeEntry[] = [
      {
        id: "1",
        project: "Website Redesign",
        task: "Frontend Development",
        startTime: "09:00",
        endTime: "12:30",
        duration: 210, // minutes
        date: "2024-01-15",
        status: "completed",
        billable: true,
      },
      {
        id: "2",
        project: "Mobile App",
        task: "API Integration",
        startTime: "14:00",
        endTime: "17:15",
        duration: 195,
        date: "2024-01-15",
        status: "completed",
        billable: true,
      },
      {
        id: "3",
        project: "Internal Tool",
        task: "Bug Fixes",
        startTime: "10:30",
        endTime: "11:45",
        duration: 75,
        date: "2024-01-14",
        status: "completed",
        billable: false,
      },
    ];
    setTimeEntries(mockEntries);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && currentEntry) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentEntry]);

  const projects = [
    "Website Redesign",
    "Mobile App",
    "Internal Tool",
    "Client Project",
  ];

  const projectStats: ProjectStats[] = [
    {
      name: "Website Redesign",
      totalHours: 42.5,
      billableHours: 40.0,
      color: "#4ade80",
    },
    {
      name: "Mobile App",
      totalHours: 38.2,
      billableHours: 38.2,
      color: "#22c55e",
    },
    {
      name: "Internal Tool",
      totalHours: 15.8,
      billableHours: 12.5,
      color: "#16a34a",
    },
    {
      name: "Client Project",
      totalHours: 28.0,
      billableHours: 28.0,
      color: "#15803d",
    },
  ];

  const startTimer = () => {
    if (!newEntry.project || !newEntry.task) return;

    const entry: TimeEntry = {
      id: Date.now().toString(),
      project: newEntry.project,
      task: newEntry.task,
      startTime: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: 0,
      date: selectedDate,
      status: "running",
      billable: newEntry.billable,
    };

    setCurrentEntry(entry);
    setIsRunning(true);
    setCurrentTime(0);
    setShowNewEntry(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (currentEntry) {
      setCurrentEntry({ ...currentEntry, status: "paused" });
    }
  };

  const stopTimer = () => {
    if (currentEntry) {
      const completedEntry = {
        ...currentEntry,
        endTime: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: Math.floor(currentTime / 60),
        status: "completed" as const,
      };

      setTimeEntries((prev) => [completedEntry, ...prev]);
      setCurrentEntry(null);
      setIsRunning(false);
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredEntries = timeEntries.filter((entry) => {
    const matchesDate = entry.date === selectedDate;
    const matchesProject =
      filterProject === "all" || entry.project === filterProject;
    return matchesDate && matchesProject;
  });

  const todayTotal = filteredEntries.reduce(
    (total, entry) => total + entry.duration,
    0
  );
  const todayBillable = filteredEntries
    .filter((entry) => entry.billable)
    .reduce((total, entry) => total + entry.duration, 0);

  return (
    <div className="timesheet-container">
      {/* Header */}
      <motion.div
        className="timesheet-header"
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
          <h1 className="timesheet-title">
            <Clock className="title-icon" />
            Timesheet
          </h1>
          <p className="timesheet-subtitle">
            Track your time and manage your productivity
          </p>
        </div>

        <div className="header-stats">
          <div className="stat-card">
            <Timer className="stat-icon" />
            <div>
              <div className="stat-value">{formatDuration(todayTotal)}</div>
              <div className="stat-label">Today Total</div>
            </div>
          </div>
          <div className="stat-card">
            <Target className="stat-icon" />
            <div>
              <div className="stat-value">{formatDuration(todayBillable)}</div>
              <div className="stat-label">Billable</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Timer Control */}
      <motion.div
        className="timer-control"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="timer-display">
          <div className="current-time">{formatTime(currentTime)}</div>
          {currentEntry && (
            <div className="current-task">
              <span className="project-name">{currentEntry.project}</span>
              <span className="task-name">{currentEntry.task}</span>
            </div>
          )}
        </div>

        <div className="timer-controls">
          {!currentEntry ? (
            <button className="start-btn" onClick={() => setShowNewEntry(true)}>
              <Play size={20} />
              Start Timer
            </button>
          ) : (
            <div className="active-controls">
              {isRunning ? (
                <button className="pause-btn" onClick={pauseTimer}>
                  <Pause size={20} />
                  Pause
                </button>
              ) : (
                <button
                  className="resume-btn"
                  onClick={() => setIsRunning(true)}
                >
                  <Play size={20} />
                  Resume
                </button>
              )}
              <button className="stop-btn" onClick={stopTimer}>
                <Square size={20} />
                Stop
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="timesheet-filters"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="filter-group">
          <Calendar className="filter-icon" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>

        <div className="filter-group">
          <Filter className="filter-icon" />
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="project-filter"
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>

        <button className="export-btn">
          <Download size={16} />
          Export
        </button>
      </motion.div>

      <div className="timesheet-content">
        {/* Time Entries */}
        <motion.div
          className="entries-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="section-header">
            <h2>Time Entries</h2>
            <button
              className="add-entry-btn"
              onClick={() => setShowNewEntry(true)}
            >
              <Plus size={16} />
              Add Entry
            </button>
          </div>

          <div className="entries-list">
            <AnimatePresence>
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  className={`entry-item ${entry.status}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="entry-info">
                    <div className="entry-header">
                      <span className="project-name">{entry.project}</span>
                      <span className="time-range">
                        {entry.startTime} - {entry.endTime || "Running"}
                      </span>
                    </div>
                    <div className="entry-task">{entry.task}</div>
                    <div className="entry-meta">
                      <span
                        className={`billable-badge ${
                          entry.billable ? "billable" : "non-billable"
                        }`}
                      >
                        {entry.billable ? "Billable" : "Non-billable"}
                      </span>
                      <span className="duration">
                        {formatDuration(entry.duration)}
                      </span>
                    </div>
                  </div>

                  <div className="entry-actions">
                    <button className="entry-action">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Project Stats */}
        <motion.div
          className="stats-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="section-header">
            <h2>Project Overview</h2>
            <BarChart3 className="section-icon" />
          </div>

          <div className="project-stats">
            {projectStats.map((project) => (
              <div key={project.name} className="project-stat">
                <div className="project-info">
                  <div
                    className="project-color"
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <span className="project-name">{project.name}</span>
                </div>
                <div className="project-hours">
                  <div className="total-hours">{project.totalHours}h</div>
                  <div className="billable-hours">
                    {project.billableHours}h billable
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* New Entry Modal */}
      <AnimatePresence>
        {showNewEntry && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewEntry(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Start New Timer</h3>
              <div className="form-group">
                <label>Project</label>
                <select
                  value={newEntry.project}
                  onChange={(e) =>
                    setNewEntry((prev) => ({
                      ...prev,
                      project: e.target.value,
                    }))
                  }
                >
                  <option value="">Select project...</option>
                  {projects.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Task Description</label>
                <input
                  type="text"
                  value={newEntry.task}
                  onChange={(e) =>
                    setNewEntry((prev) => ({ ...prev, task: e.target.value }))
                  }
                  placeholder="What are you working on?"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newEntry.billable}
                    onChange={(e) =>
                      setNewEntry((prev) => ({
                        ...prev,
                        billable: e.target.checked,
                      }))
                    }
                  />
                  Billable time
                </label>
              </div>
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowNewEntry(false)}
                >
                  Cancel
                </button>
                <button
                  className="start-timer-btn"
                  onClick={startTimer}
                  disabled={!newEntry.project || !newEntry.task}
                >
                  <Play size={16} />
                  Start Timer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timesheet;
