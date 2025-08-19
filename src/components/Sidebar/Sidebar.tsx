import React from "react";
import { NavLink, Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";

interface SidebarProps {
  submitComponent?: React.ReactNode;
  userRole?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ 
  submitComponent, 
  userRole, 
  isCollapsed = false,
  onToggle 
}: SidebarProps) {
  return (
    <>
      <button 
        className="mobile-menu-toggle"
        onClick={onToggle}
        aria-label="Toggle sidebar menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {!isCollapsed && (
        <div 
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}

      <div className={`dashboard ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <button 
          className="sidebar-close-btn"
          onClick={onToggle}
          aria-label="Close sidebar"
        >
        </button>

        <ul className="dashboard-menu">
          <li>{submitComponent}</li>
          {userRole === "manager" && (
            <li>
              <Link to="/manager-dashboard">
                <span className="icon">🏢</span> 
                <span className="menu-text">Manager</span>
              </Link>
            </li>
          )}
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="icon">📋</span>
              <span className="menu-text">Dashboard</span>
            </NavLink>
          </li>
          {userRole === "user" && (
            <li>
              <Link to="/user-dashboard">
                <span className="icon">🏢</span> 
                <span className="menu-text">My Chart</span>
              </Link>
            </li>
          )}
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="icon">📞</span> 
              <span className="menu-text">Contact</span>
              <span className="badge">5</span>
            </NavLink>
          </li>
          <li>
            <a href="#">
              <span className="icon">🌙</span>
              <span className="menu-text" style={{ marginRight: "17px" }}>DarkMode</span>
              <ThemeToggle />
            </a>
          </li>
        </ul>

        <div className="projects-section">
          <h3>Projects</h3>
          <div className="project-item">
            <div
              className="project-icon"
              style={{ backgroundColor: "#667eea" }}
            ></div>
            <span className="project-text">Main Project</span>
          </div>
          <div className="project-item">
            <div
              className="project-icon"
              style={{ backgroundColor: "#28a745" }}
            ></div>
            <span className="project-text">Design Project</span>
          </div>
          <div className="project-item">
            <div
              className="project-icon"
              style={{ backgroundColor: "#ffc107" }}
            ></div>
            <span className="project-text">Landing Page</span>
          </div>
        </div>
      </div>
    </>
  );
}