import React from "react";
import Navbar from "../navbar/navbar";
import "./ICtest26Info.css";

export default function ICtest26Info() {
  return (
    <div className="info-main">
      <Navbar />
      <div className="info-container">
        <h2>ICTEST 2026</h2>
        <p>Details for ICTEST 2026 will be updated soon. Stay tuned!</p>
        <a href="/2026/login" className="ictest26-login-btn">
          Login / Sign Up for ICTEST 2026
        </a>
      </div>
    </div>
  );
}
