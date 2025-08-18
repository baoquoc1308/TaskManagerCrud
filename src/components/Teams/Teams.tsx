import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  UserPlus,
  Settings,
  Crown,
  Star,
  MessageCircle,
  Calendar,
  TrendingUp,
  Home,
} from "lucide-react";
import "./Teams.css";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "online" | "offline" | "away";
  joinDate: string;
  tasksCompleted: number;
  isLead: boolean;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  color: string;
  progress: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
}

const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });

  useEffect(() => {
    const mockTeams: Team[] = [
      {
        id: "1",
        name: "Frontend Development",
        description: "Building beautiful and responsive user interfaces",
        color: "#4ade80",
        progress: 78,
        activeProjects: 3,
        totalTasks: 24,
        completedTasks: 18,
        members: [
          {
            id: "1",
            name: "Sarah Chen",
            role: "Lead Developer",
            avatar: "SC",
            status: "online",
            joinDate: "2024-01-15",
            tasksCompleted: 45,
            isLead: true,
          },
          {
            id: "2",
            name: "Mike Johnson",
            role: "Senior Developer",
            avatar: "MJ",
            status: "online",
            joinDate: "2024-02-01",
            tasksCompleted: 38,
            isLead: false,
          },
          {
            id: "3",
            name: "Anna Wu",
            role: "UI/UX Designer",
            avatar: "AW",
            status: "away",
            joinDate: "2024-02-20",
            tasksCompleted: 22,
            isLead: false,
          },
        ],
      },
      {
        id: "2",
        name: "Backend Development",
        description: "Server-side architecture and API development",
        color: "#22c55e",
        progress: 65,
        activeProjects: 2,
        totalTasks: 18,
        completedTasks: 12,
        members: [
          {
            id: "5",
            name: "Alex Rodriguez",
            role: "Backend Lead",
            avatar: "AR",
            status: "online",
            joinDate: "2024-01-10",
            tasksCompleted: 52,
            isLead: true,
          },
          {
            id: "6",
            name: "Lisa Zhang",
            role: "DevOps Engineer",
            avatar: "LZ",
            status: "online",
            joinDate: "2024-01-25",
            tasksCompleted: 41,
            isLead: false,
          },
        ],
      },
      {
        id: "3",
        name: "Product Design",
        description: "Creating intuitive and engaging user experiences",
        color: "#16a34a",
        progress: 92,
        activeProjects: 4,
        totalTasks: 32,
        completedTasks: 29,
        members: [
          {
            id: "8",
            name: "Emma Davis",
            role: "Design Lead",
            avatar: "ED",
            status: "online",
            joinDate: "2024-01-05",
            tasksCompleted: 67,
            isLead: true,
          },
          {
            id: "9",
            name: "Chris Lee",
            role: "Product Designer",
            avatar: "CL",
            status: "online",
            joinDate: "2024-01-20",
            tasksCompleted: 43,
            isLead: false,
          },
        ],
      },
    ];
    setTeams(mockTeams);
  }, []);

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTeam = () => {
    if (newTeam.name.trim()) {
      const team: Team = {
        id: Date.now().toString(),
        name: newTeam.name,
        description: newTeam.description,
        color: "#4ade80",
        progress: 0,
        activeProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        members: [],
      };
      setTeams((prev) => [...prev, team]);
      setNewTeam({ name: "", description: "" });
      setShowCreateModal(false);
    }
  };

  return (
    <div className="teams-container">
      <motion.div
        className="teams-header"
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
          <h1 className="teams-title">
            <Users className="title-icon" />
            Teams
            <span className="teams-count">{teams.length}</span>
          </h1>
          <p className="teams-subtitle">
            Collaborate and manage your team projects
          </p>
        </div>

        <div className="header-actions">
          <button
            className="create-team-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Create Team
          </button>
        </div>
      </motion.div>

      <motion.div
        className="teams-toolbar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </motion.div>

      <div className="teams-content">
        <motion.div
          className="teams-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence>
            {filteredTeams.map((team, index) => (
              <motion.div
                key={team.id}
                className="team-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setSelectedTeam(team)}
                style={{ "--team-color": team.color } as React.CSSProperties}
              >
                <div className="team-card-header">
                  <div className="team-info">
                    <h3 className="team-name">{team.name}</h3>
                    <p className="team-description">{team.description}</p>
                  </div>

                  <div className="team-actions">
                    <button className="team-action-btn">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>

                <div className="team-stats">
                  <div className="stat-item">
                    <span className="stat-label">Progress</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${team.progress}%` }}
                      ></div>
                    </div>
                    <span className="stat-value">{team.progress}%</span>
                  </div>

                  <div className="stats-row">
                    <div className="stat-item">
                      <span className="stat-label">Projects</span>
                      <span className="stat-value">{team.activeProjects}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tasks</span>
                      <span className="stat-value">
                        {team.completedTasks}/{team.totalTasks}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="team-members">
                  <div className="members-avatars">
                    {team.members.slice(0, 4).map((member) => (
                      <div
                        key={member.id}
                        className={`member-avatar ${member.status}`}
                        title={member.name}
                      >
                        {member.avatar}
                        {member.isLead && (
                          <Crown className="lead-crown" size={10} />
                        )}
                      </div>
                    ))}
                    {team.members.length > 4 && (
                      <div className="members-overflow">
                        +{team.members.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="members-count">
                    {team.members.length} members
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {selectedTeam && (
            <motion.div
              className="team-detail"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
            >
              <div className="detail-header">
                <button
                  className="close-detail"
                  onClick={() => setSelectedTeam(null)}
                >
                  ×
                </button>
                <h2>{selectedTeam.name}</h2>
                <button className="team-settings">
                  <Settings size={18} />
                </button>
              </div>

              <div className="detail-content">
                <div className="team-overview">
                  <p className="team-desc">{selectedTeam.description}</p>

                  <div className="overview-stats">
                    <div className="overview-stat">
                      <TrendingUp className="stat-icon" />
                      <div>
                        <div className="stat-number">
                          {selectedTeam.progress}%
                        </div>
                        <div className="stat-label">Progress</div>
                      </div>
                    </div>
                    <div className="overview-stat">
                      <Calendar className="stat-icon" />
                      <div>
                        <div className="stat-number">
                          {selectedTeam.activeProjects}
                        </div>
                        <div className="stat-label">Projects</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="members-section">
                  <div className="section-header">
                    <h3>Team Members</h3>
                    <button className="add-member-btn">
                      <UserPlus size={16} />
                      Add Member
                    </button>
                  </div>

                  <div className="members-list">
                    {selectedTeam.members.map((member) => (
                      <div key={member.id} className="member-item">
                        <div className="member-info">
                          <div
                            className={`member-avatar-large ${member.status}`}
                          >
                            {member.avatar}
                            {member.isLead && (
                              <Crown className="lead-crown" size={12} />
                            )}
                          </div>
                          <div className="member-details">
                            <div className="member-name">
                              {member.name}
                              {member.isLead && (
                                <Star className="lead-star" size={14} />
                              )}
                            </div>
                            <div className="member-role">{member.role}</div>
                            <div className="member-stats">
                              {member.tasksCompleted} tasks completed
                            </div>
                          </div>
                        </div>

                        <div className="member-actions">
                          <button className="member-action">
                            <MessageCircle size={16} />
                          </button>
                          <button className="member-action">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Create New Team</h3>
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) =>
                    setNewTeam((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter team name..."
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) =>
                    setNewTeam((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your team's purpose..."
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button className="create-btn" onClick={handleCreateTeam}>
                  Create Team
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teams;
