import React, { useEffect, useState } from "react";
import { MdDashboard, MdPeople, MdOutlineMessage, MdLogout } from "react-icons/md";
import { IoNewspaperOutline } from "react-icons/io5";
import { LuSend } from "react-icons/lu";
import { FaRupeeSign } from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar({ sidebar, setSidebar, handleLogout, paperAdded }) {
  const [hasPaper, setHasPaper] = useState(!!paperAdded);

  useEffect(() => {
    async function checkPaper() {
      if (paperAdded) {
        setHasPaper(true);
        return;
      }
      const email = localStorage.getItem("ictest26_user");
      if (!email) return;
      if (window.supabase) {
        const { data: loginData } = await window.supabase
          .from("login")
          .select("login_id")
          .eq("email", email)
          .single();
        if (loginData) {
          const { data: paperData } = await window.supabase
            .from("paper")
            .select("paper_id")
            .eq("login_id", loginData.login_id);
          setHasPaper(!!paperData);
        }
      }
    }
    checkPaper();
  }, [paperAdded]);

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
            className={sidebar === "add-paper" ? "sidebar-link active" : "sidebar-link"}
            onClick={() => setSidebar("add-paper")}
            onMouseOver={e => e.currentTarget.style.background = "#003366"}
            onMouseOut={e => e.currentTarget.style.background = sidebar === "add-paper" ? "#003366" : "none"}
          >
            <IoNewspaperOutline className="sidebar-icon" />
            <span className="sidebar-text">Add Paper</span>
          </button>
        </li>
        <li>
          <button
            className={sidebar === "add-authors" ? "sidebar-link active" : "sidebar-link"}
            onClick={() => hasPaper && setSidebar("add-authors")}
            disabled={!hasPaper}
            style={{
              cursor: hasPaper ? "pointer" : "not-allowed",
              opacity: hasPaper ? 1 : 0.5,
              background: sidebar === "add-authors" ? "#003366" : "none"
            }}
            onMouseOver={e => { if (hasPaper) e.currentTarget.style.background = "#003366"; }}
            onMouseOut={e => { if (hasPaper) e.currentTarget.style.background = sidebar === "add-authors" ? "#003366" : "none"; }}
          >
            <MdPeople className="sidebar-icon" />
            <span className="sidebar-text">Add Authors</span>
          </button>
        </li>
        <li>
          <button
            className={sidebar === "final-submit" ? "sidebar-link active" : "sidebar-link"}
            onClick={() => hasPaper && setSidebar("final-submit")}
            disabled={!hasPaper}
            style={{
              cursor: hasPaper ? "pointer" : "not-allowed",
              opacity: hasPaper ? 1 : 0.5,
              background: sidebar === "final-submit" ? "#003366" : "none"
            }}
            onMouseOver={e => { if (hasPaper) e.currentTarget.style.background = "#003366"; }}
            onMouseOut={e => { if (hasPaper) e.currentTarget.style.background = sidebar === "final-submit" ? "#003366" : "none"; }}
          >
            <LuSend className="sidebar-icon" />
            <span className="sidebar-text">Final Submit</span>
          </button>
        </li>
        <li>
          <button
            className={sidebar === "payments" ? "sidebar-link active" : "sidebar-link"}
            onClick={() => hasPaper && setSidebar("payments")}
            disabled={!hasPaper}
            style={{
              cursor: hasPaper ? "pointer" : "not-allowed",
              opacity: hasPaper ? 1 : 0.5,
              background: sidebar === "payments" ? "#003366" : "none"
            }}
            onMouseOver={e => { if (hasPaper) e.currentTarget.style.background = "#003366"; }}
            onMouseOut={e => { if (hasPaper) e.currentTarget.style.background = sidebar === "payments" ? "#003366" : "none"; }}
          >
            <FaRupeeSign className="sidebar-icon" />
            <span className="sidebar-text">Payments</span>
          </button>
        </li>
        <li>
          <button
            className={sidebar === "messages" ? "sidebar-link active" : "sidebar-link"}
            onClick={() => hasPaper && setSidebar("messages")}
            disabled={!hasPaper}
            style={{
              cursor: hasPaper ? "pointer" : "not-allowed",
              opacity: hasPaper ? 1 : 0.5,
              background: sidebar === "messages" ? "#003366" : "none"
            }}
            onMouseOver={e => { if (hasPaper) e.currentTarget.style.background = "#003366"; }}
            onMouseOut={e => { if (hasPaper) e.currentTarget.style.background = sidebar === "messages" ? "#003366" : "none"; }}
          >
            <MdOutlineMessage className="sidebar-icon" />
            <span className="sidebar-text">Messages</span>
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
