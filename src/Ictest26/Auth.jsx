import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from 'bcryptjs';
import "./Auth.css";
import supabase from './supabaseClient';

// Ensure supabase is available globally for legacy code
if (typeof window !== 'undefined' && !window.supabase) {
  window.supabase = supabase;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      if (isLogin) {
        // LOGIN: fetch user by email, check password
        const { data, error: fetchError } = await window.supabase
          .from('login')
          .select('login_id, email, password_hash, role')
          .eq('email', email)
          .single();
        if (fetchError || !data) {
          setError("Invalid email or password.");
          return;
        }
        // Compare password using bcrypt
        const passwordMatch = await bcrypt.compare(password, data.password_hash);
        if (!passwordMatch) {
          setError("Invalid email or password.");
          return;
        }
        localStorage.setItem("ictest26_user", email);
        localStorage.setItem("ictest26_role", data.role || "author");
        navigate("/2026/dashboard");
      } else {
        // SIGNUP: check if email exists, then insert
        const { data: exists, error: existsError } = await window.supabase
          .from('login')
          .select('login_id')
          .eq('email', email)
          .maybeSingle();
        if (exists && exists.login_id) {
          setError("Email already registered. Please login.");
          return;
        }
        // Hash password before storing
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const { data: insertData, error: insertError } = await window.supabase.from('login').insert([
          { email, password_hash: hash, role: 'author' }
        ]);
        if (insertError) {
          console.error('Supabase signup error:', insertError, JSON.stringify(insertError, null, 2));
          setError("Signup failed. " + insertError.message);
          return;
        }
        localStorage.setItem("ictest26_user", email);
        localStorage.setItem("ictest26_role", "author");
        navigate("/2026/dashboard");
      }
    } catch (err) {
      console.error('Signup catch error:', err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "Login" : "Sign Up"} to ICTEST 2026</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
        </form>
        <div className="auth-toggle">
          {isLogin ? (
            <span>Don't have an account? <button onClick={() => { setIsLogin(false); setError(""); }}>Sign Up</button></span>
          ) : (
            <span>Already have an account? <button onClick={() => { setIsLogin(true); setError(""); }}>Login</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
