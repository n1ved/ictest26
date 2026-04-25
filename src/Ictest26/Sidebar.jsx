import React from "react";
import { MdDashboard, MdOutlineMessage, MdLogout } from "react-icons/md";
import { IoNewspaperOutline } from "react-icons/io5";
import { FaCertificate } from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar({ sidebar, setSidebar, handleLogout }) {
  const isMessagesDisabled = true;
  const isCertificatesDisabled = true;

  return (
    <div className="dashboard-sidebar">
      <ul>

        <li>
          <button
            className={sidebar === "welcome" ? "sidebar-link active" : "sidebar-link"}
            onClick={() => setSidebar("welcome")}
            onMouseOver={e => e.currentTarget.style.background = "#003366"}
            onMouseOut={e => e.currentTarget.style.background = sidebar === "welcome" ? "#003366" : "none"}
          >
            <MdDashboard className="sidebar-icon" />
            <span className="sidebar-text">Dashboard</span>
          </button>
        </li>
        <li>
          <button
            className={sidebar === "registration" ? "sidebar-link active" : "sidebar-link"}
            onClick={() => setSidebar("registration")}
            onMouseOver={e => e.currentTarget.style.background = "#003366"}
            onMouseOut={e => e.currentTarget.style.background = sidebar === "registration" ? "#003366" : "none"}
          >
            <IoNewspaperOutline className="sidebar-icon" />
            <span className="sidebar-text">Details & Authors</span>
          </button>
        </li>
        <li>
          <button
            className={sidebar === "messages" ? "sidebar-link active" : "sidebar-link"}
            onClick={() => !isMessagesDisabled && setSidebar("messages")}
            disabled={isMessagesDisabled}
            style={{
              cursor: isMessagesDisabled ? "not-allowed" : "pointer",
              opacity: isMessagesDisabled ? 0.5 : 1,
              background: isMessagesDisabled ? "none" : (sidebar === "messages" ? "#003366" : "none")
            }}
            onMouseOver={e => { if (!isMessagesDisabled) e.currentTarget.style.background = "#003366"; }}
            onMouseOut={e => { if (!isMessagesDisabled) e.currentTarget.style.background = sidebar === "messages" ? "#003366" : "none"; }}
          >
            <MdOutlineMessage className="sidebar-icon" />
            <span className="sidebar-text">Messages</span>
          </button>
        </li>
        <li>
          <button
            className={sidebar === "certificates" ? "sidebar-link active" : "sidebar-link"}
            onClick={() => !isCertificatesDisabled && setSidebar("certificates")}
            disabled={isCertificatesDisabled}
            style={{
              cursor: isCertificatesDisabled ? "not-allowed" : "pointer",
              opacity: isCertificatesDisabled ? 0.5 : 1,
              background: isCertificatesDisabled ? "none" : (sidebar === "certificates" ? "#003366" : "none")
            }}
            onMouseOver={e => { if (!isCertificatesDisabled) e.currentTarget.style.background = "#003366"; }}
            onMouseOut={e => { if (!isCertificatesDisabled) e.currentTarget.style.background = sidebar === "certificates" ? "#003366" : "none"; }}
          >
            <FaCertificate className="sidebar-icon" />
            <span className="sidebar-text">Certificates</span>
          </button>
        </li>
        
        {/* Add more sidebar links here as needed */}
      </ul>
      <button className="ictest26-logout-btn" onClick={handleLogout}>
        <MdLogout className="sidebar-icon" />
        <span className="sidebar-text">Logout</span>
      </button>
    </div>
  );
}
