import React, { useState } from "react";
import { Link } from "react-router-dom";

import "../../styles/sidebarlayout.css";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode; // You can use a library like react-icons for icons
}

export const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sidebarItems: SidebarItem[] = [
    { name: "People", path: "/people", icon: <span>👤</span> }, // Replace with actual icons
    { name: "Teams", path: "/teams", icon: <span>👥</span> },
    { name: "Seasons", path: "/seasons", icon: <span>📅</span> },
    { name: "Athletes", path: "/athletes", icon: <span>🏃</span> },
    { name: "Contacts", path: "/contacts", icon: <span>📇</span> },
    { name: "Events", path: "/events", icon: <span>🏆</span> },
    { name: "Meets", path: "/meets", icon: <span>📍</span> },
    { name: "Individual Results", path: "/ind-results", icon: <span>📊</span> },
    { name: "Relay Results", path: "/relay-results", icon: <span>🏅</span> },
  ];

  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Start with it open on larger screens

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="sidebar-header">
          <button className="sidebar-toggle-button" onClick={toggleSidebar}>
            <span>{isSidebarOpen ? "⬅️" : "➡️"}</span>
          </button>
          <h1 className="sidebar-title">Cutter's Coaching</h1>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {sidebarItems.map((item) => (
              <li key={item.name} className="nav-item">
                <Link to={item.path} className="nav-link">
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main
        className={`main-content ${isSidebarOpen ? "main-content-shifted" : "main-content-full"}`}
      >
        {children}
      </main>
    </div>
  );
};
