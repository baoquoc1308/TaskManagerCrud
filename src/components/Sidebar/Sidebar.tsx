// components/Sidebar/Sidebar.jsx
import React from "react";
import { NavLink, Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";

interface SidebarProps {
  submitComponent?: React.ReactNode;
  userRole?: string;
}

export default function Sidebar({ submitComponent, userRole }: SidebarProps) {
  return (
    <div className="dashboard">
      <ul className="dashboard-menu">
        <li>{submitComponent}</li>
        {userRole === "manager" && (
          <li>
            <Link to="/manager-dashboard">
              <span className="icon">🏢</span> Manager
            </Link>
          </li>
        )}
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="icon">📋</span>Dashboard
          </NavLink>
        </li>
        {userRole === "user" && (
          <li>
            <Link to="/user-dashboard">
              <span className="icon">🏢</span> My Chart
            </Link>
          </li>
        )}
        <li>
          <NavLink
            to="/contact"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="icon">📞</span> Contact
            <span className="badge">5</span>
          </NavLink>
        </li>
        <li>
          <a href="#">
            <span className="icon">🌙</span>
            <span style={{ marginRight: "17px" }}>DarkMode</span>
            <ThemeToggle />
          </a>
        </li>
        <li>
          <NavLink
            to="/inbox"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="icon">📥</span>Inbox
            <span className="badge">3</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/teams"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="icon">👥</span>Teams
            <span className="badge">2</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/timesheet"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="icon">🕒</span> Timesheet
            <span className="badge">2</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/calendar"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="icon">📅</span> Calendar
            <span className="badge">1</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="icon">⚙️</span> Settings
            <span className="badge">1</span>
          </NavLink>
        </li>
      </ul>

      <div className="projects-section">
        <h3>Projects</h3>
        <div className="project-item">
          <div
            className="project-icon"
            style={{ backgroundColor: "#667eea" }}
          ></div>
          Main Project
        </div>
        <div className="project-item">
          <div
            className="project-icon"
            style={{ backgroundColor: "#28a745" }}
          ></div>
          Design Project
        </div>
        <div className="project-item">
          <div
            className="project-icon"
            style={{ backgroundColor: "#ffc107" }}
          ></div>
          Landing Page
        </div>
      </div>
    </div>
  );
}
