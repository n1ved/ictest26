import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import AddPaper from "./AddPaper";
import Sidebar from "./Sidebar";
import "./Sidebar.css";
import AddAuthor from "./AddAuthor";
import "./AddAuthor.css";
import FinalSubmitPage from "./FinalSubmitPage";
import Payments from "./Payments";
import "./Payments.css";

export default function Dashboard() {
  const email = localStorage.getItem("ictest26_user");
  const role = localStorage.getItem("ictest26_role");
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState("welcome");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("ictest26_user");
    localStorage.removeItem("ictest26_role");
    navigate("/2026/login");
  };

  return (
    <div className="dashboard-outer-wrapper" style={{ paddingTop: 40, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div className="dashboard-container" style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} handleLogout={handleLogout} />
        <div style={{ flex: 1, padding: "2.5rem 2.5rem 2.5rem 300px", minHeight: "100vh", width: "100%", background: "#001a33", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {sidebar === "welcome" && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 0 }}>
              <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 32, marginBottom: 8, letterSpacing: 1, textAlign: "center" }}>Welcome to ICTEST 2026 Dashboard</h2>
              <p style={{ color: "#b3c6e0", fontWeight: 500, fontSize: 18, marginBottom: 32, textAlign: "center" }}>{email ? `Logged in as: ${email}` : "You are not logged in."}</p>
              <div style={{ background: "#00224d", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.10)", padding: "2rem", maxWidth: 600, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h3 style={{ color: "#b3c6e0", fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Quick Start</h3>
                <ul style={{ color: "#fff", fontSize: 16, lineHeight: 1.7, paddingLeft: 20, textAlign: "left" }}>
                  <li>Submit your paper using the <b>Add Paper</b> link.</li>
                  <li>Check your submission status here after submission.</li>
                  <li>Contact support for any queries.</li>
                </ul>
              </div>
            </div>
          )}
          {sidebar === "add-paper" && (
            <AddPaper />
          )}
          {sidebar === "add-authors" && (
            <AddAuthor />
          )}
          {sidebar === "payments" && (
            <Payments />
          )}
          {sidebar === "final-submit" && (
            <FinalSubmitPage />
          )}
        </div>
      </div>
    </div>
  );
}
