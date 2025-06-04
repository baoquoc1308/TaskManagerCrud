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
import "./ManagerDashboard.css";
type TaskCountPerUser = {
  name: string;
  taskCount: number;
};

type TopPerformer = {
  email: string;
  count: number;
  percentage: number;
};

type TaskData = {
  user_id: string;
  created_at: string;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const ManagerDashboard = () => {
  const [data, setData] = useState<TaskCountPerUser[]>([]);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [weeklyData, setWeeklyData] = useState<
    { date: string; count: number }[]
  >([]);
  const [monthlyData, setMonthlyData] = useState<
    { date: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [managerEmail, setManagerEmail] = useState<string>("");
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [allTasks, setAllTasks] = useState<TaskData[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  const formatEmail = (email: string) => email.split("@")[0];

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const calculateTopPerformers = useCallback(
    (tasks: TaskData[], period: "day" | "week" | "month") => {
      const today = new Date();
      const filteredTasks = tasks.filter((task) => {
        const taskDate = new Date(task.created_at);
        if (period === "day") {
          return taskDate.toDateString() === today.toDateString();
        } else if (period === "week") {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return taskDate >= weekAgo;
        } else {
          return (
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getFullYear() === today.getFullYear()
          );
        }
      });

      const userCounts: Record<string, number> = {};
      filteredTasks.forEach((task) => {
        userCounts[task.user_id] = (userCounts[task.user_id] || 0) + 1;
      });

      const totalTasks = filteredTasks.length;
      return Object.entries(userCounts)
        .map(([userId, count]) => ({
          userId,
          count,
          percentage: totalTasks ? (count / totalTasks) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    },
    []
  );

  const processData = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process daily data
    const todayTasks = allTasks.filter((task) => {
      const taskDate = new Date(task.created_at);
      return taskDate.toDateString() === today.toDateString();
    });

    const todayUserCounts: Record<string, number> = {};
    todayTasks.forEach((task) => {
      todayUserCounts[task.user_id] = (todayUserCounts[task.user_id] || 0) + 1;
    });

    const todayChartData = Object.entries(todayUserCounts).map(
      ([userId, count]) => ({
        name: userMap[userId] || userId,
        taskCount: count,
      })
    );

    setData(todayChartData);
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

    allTasks.forEach((task) => {
      const taskDate = formatDate(new Date(task.created_at));
      if (weeklyTaskCounts.hasOwnProperty(taskDate)) {
        weeklyTaskCounts[taskDate]++;
      }
    });

    const weeklyChartData = last7Days.map((date) => ({
      date,
      count: weeklyTaskCounts[date],
    }));

    setWeeklyData(weeklyChartData);

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

    allTasks.forEach((task) => {
      const taskDate = formatDate(new Date(task.created_at));
      if (monthlyTaskCounts.hasOwnProperty(taskDate)) {
        monthlyTaskCounts[taskDate]++;
      }
    });

    const monthlyChartData = monthDays.map((date) => ({
      date,
      count: monthlyTaskCounts[date],
    }));

    setMonthlyData(monthlyChartData);

    // Calculate top performers based on current view mode
    const performers = calculateTopPerformers(allTasks, viewMode);
    const topPerformersWithEmails = performers.map((p) => ({
      email: userMap[p.userId] || p.userId,
      count: p.count,
      percentage: p.percentage,
    }));

    setTopPerformers(topPerformersWithEmails);
  }, [allTasks, userMap, viewMode, calculateTopPerformers]);

  const fetchDashboardData = async () => {
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

      // Fetch user role and email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, email")
        .eq("id", user.id)
        .single();

      if (userError || userData?.role !== "manager") {
        alert("You do not have permission to access this page.");
        setLoading(false);
        return;
      }

      setManagerEmail(formatEmail(userData.email));

      // Fetch all tasks
      const { data: tasks, error: taskErr } = await supabase
        .from("tasks")
        .select("user_id, created_at");

      if (taskErr) {
        console.error("Error fetching tasks:", taskErr.message);
        setLoading(false);
        return;
      }

      // Get user emails
      const userIds = [...new Set(tasks?.map((task) => task.user_id))];
      const { data: userList } = await supabase
        .from("users")
        .select("id, email")
        .in("id", userIds);

      const emailMap = Object.fromEntries(
        userList?.map((user) => [user.id, formatEmail(user.email)]) || []
      );

      setAllTasks(tasks || []);
      setUserMap(emailMap);
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
      alert("An error occurred while fetching dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && allTasks.length > 0) {
      processData();
    }
  }, [loading, allTasks, viewMode, processData]);

  const handleViewModeChange = (newMode: "day" | "week" | "month") => {
    setViewMode(newMode);
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-title">
            <h1>
              <img
                width="50"
                height="50"
                src="https://img.icons8.com/bubbles/50/combo-chart.png"
                alt="combo-chart"
              />{" "}
              Manager Dashboard
            </h1>
            <p className="welcome-text">
              Welcome, <span className="manager-name">{managerEmail}</span>
            </p>
          </div>
          <div className="view-mode-selector">
            <select
              value={viewMode}
              onChange={(e) =>
                handleViewModeChange(e.target.value as "day" | "week" | "month")
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
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="taskCount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {viewMode === "week" && (
              <div className="chart-card">
                <h2>📆 Tasks in Last 7 Days</h2>
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
                <h2>🗓️ Tasks in This Month</h2>
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

          <div className="top-performers-card">
            <h2>🏆 Top Performers</h2>
            <div className="pie-chart-container">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={topPerformers}
                    dataKey="count"
                    nameKey="email"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {topPerformers.map((_, index) => (
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
            <div className="performers-list">
              {topPerformers.map((performer, index) => (
                <div key={index} className="performer-item">
                  <div className="performer-info">
                    <div
                      className="color-indicator"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{performer.email}</span>
                  </div>
                  <div className="performer-stats">
                    <span className="task-count">{performer.count} tasks</span>
                    <span className="percentage">
                      ({performer.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
