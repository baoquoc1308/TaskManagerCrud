import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabase-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

type TaskStats = {
  status: string;
  count: number;
  percentage: number;
};

type Task = {
  created_at: string;
  status: string;
  priority: string;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const PRIORITY_COLORS = ["#00C49F", "#FF8042", "#FFBB28", "#A28EFF"];

const UserDashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [weeklyData, setWeeklyData] = useState<
    { date: string; count: number }[]
  >([]);
  const [monthlyData, setMonthlyData] = useState<
    { date: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [userEmail, setUserEmail] = useState("");
  const [statusStats, setStatusStats] = useState<TaskStats[]>([]);
  const [priorityStats, setPriorityStats] = useState<TaskStats[]>([]);

  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const calculateStats = useCallback(
    (tasks: Task[], field: "status" | "priority") => {
      const counts: Record<string, number> = {};
      const total = tasks.length;

      tasks.forEach((task) => {
        const value = task[field];
        counts[value] = (counts[value] || 0) + 1;
      });

      return Object.entries(counts).map(([name, count]) => ({
        status: name,
        count,
        percentage: (count / total) * 100,
      }));
    },
    []
  );

  const processData = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process daily tasks
    const todayTasks = tasks.filter((task) => {
      const taskDate = new Date(task.created_at);
      return taskDate.toDateString() === today.toDateString();
    });
    setTodayCount(todayTasks.length);

    // Process weekly data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return formatDate(date);
    });

    const weeklyTaskCounts = last7Days.reduce((acc, date) => {
      acc[date] = 0;
      return acc;
    }, {} as Record<string, number>);

    tasks.forEach((task) => {
      const taskDate = formatDate(new Date(task.created_at));
      if (weeklyTaskCounts.hasOwnProperty(taskDate)) {
        weeklyTaskCounts[taskDate]++;
      }
    });

    setWeeklyData(
      last7Days.map((date) => ({
        date,
        count: weeklyTaskCounts[date],
      }))
    );

    // Process monthly data
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(currentYear, currentMonth, i + 1);
      return formatDate(date);
    });

    const monthlyTaskCounts = monthDays.reduce((acc, date) => {
      acc[date] = 0;
      return acc;
    }, {} as Record<string, number>);

    tasks.forEach((task) => {
      const taskDate = formatDate(new Date(task.created_at));
      if (monthlyTaskCounts.hasOwnProperty(taskDate)) {
        monthlyTaskCounts[taskDate]++;
      }
    });

    setMonthlyData(
      monthDays.map((date) => ({
        date,
        count: monthlyTaskCounts[date],
      }))
    );

    // Calculate status and priority stats
    setStatusStats(calculateStats(tasks, "status"));
    setPriorityStats(calculateStats(tasks, "priority"));
  }, [tasks, calculateStats]);

  const fetchUserTasks = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Not authenticated");
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, email")
        .eq("id", user.id)
        .single();

      if (userError || userData?.role !== "user") {
        alert("You do not have permission to access this page.");
        setLoading(false);
        return;
      }

      setUserEmail(userData.email.split("@")[0]);

      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id);

      if (taskError) {
        console.error("Error fetching tasks:", taskError.message);
        return;
      }

      setTasks(taskData || []);
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchUserTasks:", error);
      alert("An error occurred while fetching your tasks");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTasks();
  }, []);

  useEffect(() => {
    if (!loading && tasks.length > 0) {
      processData();
    }
  }, [loading, tasks, processData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <button className="back-button" onClick={() => navigate("/")}>
            <img
              width="20"
              height="20"
              src="https://img.icons8.com/ios/20/reply-arrow--v1.png"
              alt="reply-arrow--v1"
              className="back-icon"
            />
            Back to Home
          </button>
          <div className="header-title">
            <h1>
              <img
                width="50"
                height="50"
                src="https://img.icons8.com/bubbles/50/combo-chart.png"
                alt="dashboard"
              />
              User Dashboard
            </h1>
            <p className="welcome-text">
              Welcome, <span className="user-name">{userEmail}</span>
            </p>
          </div>
          <div className="view-mode-selector">
            <select
              value={viewMode}
              onChange={(e) =>
                setViewMode(e.target.value as "day" | "week" | "month")
              }
            >
              <option value="day">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="main-chart">
            {viewMode === "day" && (
              <div className="chart-card">
                <h2>📅 Tasks Created Today</h2>
                <p className="total-count">
                  Total: <span>{todayCount}</span>
                </p>
                <div className="chart-container">
                  <ResponsiveContainer>
                    <BarChart data={[{ name: "Today", count: todayCount }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {viewMode === "week" && (
              <div className="chart-card">
                <h2>📆 Your Tasks in Last 7 Days</h2>
                <div className="chart-container">
                  <ResponsiveContainer>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#28a745" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {viewMode === "month" && (
              <div className="chart-card">
                <h2>🗓️ Your Tasks This Month</h2>
                <div className="chart-container">
                  <ResponsiveContainer>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ff9800" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="stats-section">
            <div className="stats-card">
              <h2>📋 Task Status Distribution</h2>
              <div className="pie-chart-container">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusStats}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {statusStats.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="stats-list">
                {statusStats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-info">
                      <div
                        className="color-indicator"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span>{stat.status}</span>
                    </div>
                    <div className="stat-numbers">
                      <span className="count">{stat.count} tasks</span>
                      <span className="percentage">
                        ({stat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="stats-card">
              <h2>📌 Task Priority Distribution</h2>
              <div className="pie-chart-container">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={priorityStats}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {priorityStats.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="stats-list">
                {priorityStats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-info">
                      <div
                        className="color-indicator"
                        style={{
                          backgroundColor:
                            PRIORITY_COLORS[index % PRIORITY_COLORS.length],
                        }}
                      />
                      <span>{stat.status}</span>
                    </div>
                    <div className="stat-numbers">
                      <span className="count">{stat.count} tasks</span>
                      <span className="percentage">
                        ({stat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
