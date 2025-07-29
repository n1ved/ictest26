import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from 'bcryptjs';
import AdminMessages from './AdminMessages';
import './AdminMessages.css';
import AdminSettings from './AdminSettings';
import './AdminSettings.css';

export default function AdminDashboard() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeMenu, setActiveMenu] = useState("view");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({});
  const [editRowIdx, setEditRowIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showMessages, setShowMessages] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  // Function to refresh table data with enhanced queries
  const refreshTableData = async () => {
    if (!selectedTable) return;
    try {
      let query;
      
      if (selectedTable === 'messages') {
        query = window.supabase
          .from(selectedTable)
          .select(`
            *,
            paper:paper_id(paper_title),
            author:author_id(author_name, email_id),
            admin:admin_id(email)
          `);
      } else if (selectedTable === 'attachments') {
        query = window.supabase
          .from(selectedTable)
          .select(`
            *,
            message:message_id(subject, type)
          `);
      } else if (selectedTable === 'paper') {
        query = window.supabase
          .from(selectedTable)
          .select(`
            *,
            login:login_id(email),
            track:track_id(*)
          `);
      } else if (selectedTable === 'author') {
        query = window.supabase
          .from(selectedTable)
          .select(`
            *,
            paper:paper_id(paper_title)
          `);
      } else {
        query = window.supabase.from(selectedTable).select("*");
      }

      const { data, error } = await query;
      if (error) throw error;
      setRows(data);
      if (data && data.length > 0) {
        setColumns(Object.keys(data[0]));
      }
    } catch (err) {
      console.error('Failed to refresh table data:', err);
    }
  };

  // Reset states when changing menu or table
  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    setEditRowIdx(null);
    setEditForm({});
    setShowAddForm(false);
    setAddForm({});
    setError("");
  };

  const handleTableChange = (table) => {
    setSelectedTable(table);
    setEditRowIdx(null);
    setEditForm({});
    setShowAddForm(false);
    setAddForm({});
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("ictest26_user");
    localStorage.removeItem("ictest26_role");
    navigate("/2026/login");
  };

  // Fetch all table names from Supabase
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const { data, error } = await window.supabase
          .rpc('list_tables');
        if (error) throw error;
        setTables(data);
      } catch (err) {
        setError("Failed to fetch tables");
      }
    };
    fetchTables();
  }, []);

  // Fetch rows and columns for selected table
  useEffect(() => {
    if (!selectedTable) return;
    setLoading(true);
    setError("");
    const fetchRows = async () => {
      try {
        let query;
        
        // Enhanced queries for specific tables to include related data
        if (selectedTable === 'messages') {
          query = window.supabase
            .from(selectedTable)
            .select(`
              *,
              paper:paper_id(paper_title),
              author:author_id(author_name, email_id),
              admin:admin_id(email)
            `);
        } else if (selectedTable === 'attachments') {
          query = window.supabase
            .from(selectedTable)
            .select(`
              *,
              message:message_id(subject, type)
            `);
        } else if (selectedTable === 'paper') {
          query = window.supabase
            .from(selectedTable)
            .select(`
              *,
              login:login_id(email),
              track:track_id(*)
            `);
        } else if (selectedTable === 'author') {
          query = window.supabase
            .from(selectedTable)
            .select(`
              *,
              paper:paper_id(paper_title)
            `);
        } else {
          query = window.supabase.from(selectedTable).select("*");
        }

        const { data, error } = await query;
        if (error) throw error;
        setRows(data);
        if (data && data.length > 0) {
          setColumns(Object.keys(data[0]));
        } else {
          setColumns([]);
        }
      } catch (err) {
        setError("Failed to fetch table data");
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  }, [selectedTable]);

  // Handle Add Row
  const handleAddRow = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let insertData = { ...addForm };
      
      // Handle password hashing for login table
      if (selectedTable === 'login') {
        if (insertData.password) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(insertData.password, salt);
          insertData.password_hash = hash;
          delete insertData.password;
        }
        else if (insertData.password_hash && insertData.password_hash.length < 30) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(insertData.password_hash, salt);
          insertData.password_hash = hash;
        }
      }
      
      // Handle message creation with current admin ID
      if (selectedTable === 'messages') {
        const adminData = JSON.parse(localStorage.getItem('ictest26_user') || '{}');
        if (adminData.login_id && !insertData.admin_id) {
          insertData.admin_id = adminData.login_id;
        }
        // Set default values
        if (!insertData.status) insertData.status = 'unread';
        if (!insertData.type) insertData.type = 'general';
      }
      
      const { error } = await window.supabase.from(selectedTable).insert([insertData]);
      if (error) throw error;
      setShowAddForm(false);
      setAddForm({});
      
      // Refresh rows with enhanced query
      await refreshTableData();
    } catch (err) {
      setError("Failed to add row: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Row
  const handleEditRow = (idx) => {
    setEditRowIdx(idx);
    setEditForm(rows[idx]);
  };
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Find primary key (assume first column is PK)
      const pk = columns[0];
      const pkValue = editForm[pk];
      let updateData = { ...editForm };
      delete updateData[pk];
      // If editing login table, hash password if present
      if (selectedTable === 'login') {
        if (updateData.password) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(updateData.password, salt);
          updateData.password_hash = hash;
          delete updateData.password;
        } else if (updateData.password_hash && updateData.password_hash.length < 30) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(updateData.password_hash, salt);
          updateData.password_hash = hash;
        }
      }
      const { error } = await window.supabase.from(selectedTable).update(updateData).eq(pk, pkValue);
      if (error) throw error;
      setEditRowIdx(null);
      setEditForm({});
      // Refresh rows with enhanced query
      await refreshTableData();
    } catch (err) {
      setError("Failed to update row: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Row
  const handleDeleteRow = async (idx) => {
    if (!window.confirm("Are you sure you want to delete this row?")) return;
    setLoading(true);
    setError("");
    try {
      const pk = columns[0];
      const pkValue = rows[idx][pk];
      const { error } = await window.supabase.from(selectedTable).delete().eq(pk, pkValue);
      if (error) throw error;
      // Refresh rows with enhanced query
      await refreshTableData();
    } catch (err) {
      setError("Failed to delete row: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <div style={{ minHeight: '100vh', background: '#0a1833', color: '#e6eaff', padding: 0, margin: 0 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#e6eaff', fontWeight: 800, fontSize: '2.2rem', letterSpacing: 1.2, marginBottom: 32, marginTop: 48, paddingTop: 32, textShadow: '0 2px 8px #00336655', textAlign: 'center', borderBottom: '2px solid #375a7f', paddingBottom: 18, background: 'none' }}>Admin Dashboard</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => {
                setShowMessages(!showMessages);
                setShowSettings(false);
              }} 
              style={{ 
                background: showMessages ? '#375a7f' : '#254a7c', 
                color: '#e6eaff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '0.7rem 2rem', 
                fontWeight: 700, 
                cursor: 'pointer', 
                fontSize: '1.08rem', 
                boxShadow: '0 2px 8px #001a3340', 
                letterSpacing: 0.5, 
                transition: 'background 0.2s', 
                height: 48 
              }}
            >
              {showMessages ? 'Back to Dashboard' : 'Message Center'}
            </button>
            <button 
              onClick={() => {
                setShowSettings(!showSettings);
                setShowMessages(false);
              }} 
              style={{ 
                background: showSettings ? '#375a7f' : '#254a7c', 
                color: '#e6eaff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '0.7rem 2rem', 
                fontWeight: 700, 
                cursor: 'pointer', 
                fontSize: '1.08rem', 
                boxShadow: '0 2px 8px #001a3340', 
                letterSpacing: 0.5, 
                transition: 'background 0.2s', 
                height: 48 
              }}
            >
              {showSettings ? 'Back to Dashboard' : 'Settings'}
            </button>
            <button onClick={handleLogout} style={{ background: '#254a7c', color: '#e6eaff', border: 'none', borderRadius: 8, padding: '0.7rem 2rem', fontWeight: 700, cursor: 'pointer', fontSize: '1.08rem', boxShadow: '0 2px 8px #001a3340', letterSpacing: 0.5, transition: 'background 0.2s', height: 48 }}>Logout</button>
          </div>
        </div>
        {showMessages ? (
          <AdminMessages />
        ) : showSettings ? (
          <AdminSettings />
        ) : (
          <div style={{ background: '#14244a', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', padding: '2rem', marginBottom: 32 }}>
            {error && <div style={{ color: '#fff', background: '#003366', borderRadius: 6, padding: '0.5rem 1rem', marginBottom: 16 }}>{error}</div>}
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: '#b3c6e0', fontWeight: 600, fontSize: '1.08rem', marginRight: 12 }}>Select Table: </label>
              <select value={selectedTable} onChange={e => handleTableChange(e.target.value)} style={{ padding: '0.7rem 1.2rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff', fontWeight: 600, letterSpacing: 0.5 }}>
                <option value="">-- Select Table --</option>
                {tables.map((t) => (
                  <option key={t.table_name} value={t.table_name}>{t.table_name}</option>
                ))}
              </select>
            </div>

          {/* Menu Navigation */}
          {selectedTable && (
            <div style={{ marginBottom: 24, display: 'flex', gap: 12, borderBottom: '2px solid #375a7f', paddingBottom: 16 }}>
              <button 
                onClick={() => handleMenuChange("view")} 
                style={{ 
                  background: activeMenu === "view" ? '#375a7f' : '#254a7c', 
                  color: '#e6eaff', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '0.7rem 2rem', 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  fontSize: '1.08rem', 
                  boxShadow: '0 2px 8px #001a3340', 
                  letterSpacing: 0.5, 
                  transition: 'background 0.2s' 
                }}
              >
                View Data
              </button>
              <button 
                onClick={() => handleMenuChange("edit")} 
                style={{ 
                  background: activeMenu === "edit" ? '#375a7f' : '#254a7c', 
                  color: '#e6eaff', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '0.7rem 2rem', 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  fontSize: '1.08rem', 
                  boxShadow: '0 2px 8px #001a3340', 
                  letterSpacing: 0.5, 
                  transition: 'background 0.2s' 
                }}
              >
                Edit Data
              </button>
              <button 
                onClick={() => handleMenuChange("delete")} 
                style={{ 
                  background: activeMenu === "delete" ? '#375a7f' : '#254a7c', 
                  color: '#e6eaff', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '0.7rem 2rem', 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  fontSize: '1.08rem', 
                  boxShadow: '0 2px 8px #001a3340', 
                  letterSpacing: 0.5, 
                  transition: 'background 0.2s' 
                }}
              >
                Delete Data
              </button>
            </div>
          )}

          {selectedTable && !loading && activeMenu === "edit" && (
            <button onClick={() => { setShowAddForm(!showAddForm); setAddForm({}); }} style={{ background: '#254a7c', color: '#e6eaff', border: 'none', borderRadius: 8, padding: '0.7rem 2rem', fontWeight: 700, marginBottom: 18, cursor: 'pointer', fontSize: '1.08rem', boxShadow: '0 2px 8px #001a3340', letterSpacing: 0.5, transition: 'background 0.2s' }}>{showAddForm ? 'Cancel' : 'Add New Row'}</button>
          )}
          {showAddForm && (
            <form onSubmit={handleAddRow} style={{ marginBottom: 24, background: '#001a33', padding: 18, borderRadius: 8 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {columns.map(col => (
                  <div key={col} style={{ flex: '1 1 180px', minWidth: 120 }}>
                    <label style={{ color: '#b3c6e0', fontWeight: 600, fontSize: 14 }}>{col}</label>
                    {/* Special handling for certain fields */}
                    {col.includes('_id') && selectedTable === 'messages' && (col === 'paper_id' || col === 'author_id') ? (
                      <select
                        value={addForm[col] || ''}
                        onChange={e => setAddForm({ ...addForm, [col]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1.5px solid #375a7f', background: '#00224d', color: '#fff', marginTop: 4 }}
                      >
                        <option value="">Select {col.replace('_id', '')}</option>
                        {/* This would need to be populated with actual data */}
                      </select>
                    ) : col === 'type' && selectedTable === 'messages' ? (
                      <select
                        value={addForm[col] || 'general'}
                        onChange={e => setAddForm({ ...addForm, [col]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1.5px solid #375a7f', background: '#00224d', color: '#fff', marginTop: 4 }}
                      >
                        <option value="general">General</option>
                        <option value="paper_comment">Paper Comment</option>
                        <option value="author_comment">Author Comment</option>
                        <option value="system">System</option>
                      </select>
                    ) : col === 'status' && selectedTable === 'messages' ? (
                      <select
                        value={addForm[col] || 'unread'}
                        onChange={e => setAddForm({ ...addForm, [col]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1.5px solid #375a7f', background: '#00224d', color: '#fff', marginTop: 4 }}
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                      </select>
                    ) : col === 'role' && selectedTable === 'login' ? (
                      <select
                        value={addForm[col] || 'author'}
                        onChange={e => setAddForm({ ...addForm, [col]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1.5px solid #375a7f', background: '#00224d', color: '#fff', marginTop: 4 }}
                      >
                        <option value="author">Author</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : col === 'content' && selectedTable === 'messages' ? (
                      <textarea
                        value={addForm[col] || ''}
                        onChange={e => setAddForm({ ...addForm, [col]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1.5px solid #375a7f', background: '#00224d', color: '#fff', marginTop: 4, minHeight: '80px' }}
                        rows="3"
                      />
                    ) : (
                      <input
                        type={col.includes('password') ? 'password' : col.includes('email') ? 'email' : 'text'}
                        value={addForm[col] || ''}
                        onChange={e => setAddForm({ ...addForm, [col]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1.5px solid #375a7f', background: '#00224d', color: '#fff', marginTop: 4 }}
                        placeholder={col.includes('_id') ? 'Enter ID' : ''}
                      />
                    )}
                  </div>
                ))}
              </div>
              <button type="submit" style={{ background: '#254a7c', color: '#e6eaff', border: 'none', borderRadius: 8, padding: '0.7rem 2rem', fontWeight: 700, marginTop: 18, cursor: 'pointer', fontSize: '1.08rem', boxShadow: '0 2px 8px #001a3340', letterSpacing: 0.5, transition: 'background 0.2s' }}>Save</button>
            </form>
          )}
          {loading && <div>Loading...</div>}
          
          {/* View Menu */}
          {selectedTable && !loading && activeMenu === "view" && (
            <div style={{ overflowX: 'auto' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 18, fontSize: '1.25rem', letterSpacing: 0.7, textAlign: 'center', textShadow: '0 2px 8px #00336655', borderBottom: '1.5px solid #375a7f', paddingBottom: 10, marginTop: 18 }}>Viewing Table: {selectedTable}</h3>
              <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', background: '#001a33', color: '#fff', marginBottom: 24 }}>
                <thead>
                  <tr>
                    {columns.map(col => <th key={col} style={{ background: '#003366', color: '#b3c6e0', fontWeight: 700, fontSize: '1.08rem', letterSpacing: 0.5 }}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} style={{ background: '#00224d', verticalAlign: 'middle' }}>
                      {columns.map(col => {
                        let cellValue = row[col];
                        
                        // Handle nested objects for display
                        if (typeof cellValue === 'object' && cellValue !== null) {
                          if (col === 'paper' && cellValue.paper_title) {
                            cellValue = cellValue.paper_title;
                          } else if (col === 'author' && cellValue.author_name) {
                            cellValue = `${cellValue.author_name} (${cellValue.email_id})`;
                          } else if (col === 'admin' && cellValue.email) {
                            cellValue = cellValue.email;
                          } else if (col === 'login' && cellValue.email) {
                            cellValue = cellValue.email;
                          } else if (col === 'message' && cellValue.subject) {
                            cellValue = `${cellValue.subject} (${cellValue.type})`;
                          } else {
                            cellValue = JSON.stringify(cellValue);
                          }
                        }
                        
                        return <td key={col}>{String(cellValue)}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit Menu */}
          {selectedTable && !loading && activeMenu === "edit" && (
            <div style={{ overflowX: 'auto' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 18, fontSize: '1.25rem', letterSpacing: 0.7, textAlign: 'center', textShadow: '0 2px 8px #00336655', borderBottom: '1.5px solid #375a7f', paddingBottom: 10, marginTop: 18 }}>Editing Table: {selectedTable}</h3>
              <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', background: '#001a33', color: '#fff', marginBottom: 24 }}>
                <thead>
                  <tr>
                    {columns.map(col => <th key={col} style={{ background: '#003366', color: '#b3c6e0', fontWeight: 700, fontSize: '1.08rem', letterSpacing: 0.5 }}>{col}</th>)}
                    <th style={{ background: '#003366', color: '#b3c6e0', fontWeight: 700, fontSize: '1.08rem', letterSpacing: 0.5, minWidth: 120, width: 120, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} style={{ background: '#00224d', verticalAlign: 'middle' }}>
                      {editRowIdx === idx ? (
                        columns.map(col => (
                          <td key={col}>
                            <input
                              type="text"
                              value={editForm[col] || ''}
                              onChange={e => setEditForm({ ...editForm, [col]: e.target.value })}
                              style={{ width: '100%', padding: '0.3rem', borderRadius: 6, border: '1.5px solid #375a7f', background: '#001a33', color: '#fff' }}
                            />
                          </td>
                        ))
                      ) : (
                        columns.map(col => {
                          let cellValue = row[col];
                          
                          // Handle nested objects for display
                          if (typeof cellValue === 'object' && cellValue !== null) {
                            if (col === 'paper' && cellValue.paper_title) {
                              cellValue = cellValue.paper_title;
                            } else if (col === 'author' && cellValue.author_name) {
                              cellValue = `${cellValue.author_name} (${cellValue.email_id})`;
                            } else if (col === 'admin' && cellValue.email) {
                              cellValue = cellValue.email;
                            } else if (col === 'login' && cellValue.email) {
                              cellValue = cellValue.email;
                            } else if (col === 'message' && cellValue.subject) {
                              cellValue = `${cellValue.subject} (${cellValue.type})`;
                            } else {
                              cellValue = JSON.stringify(cellValue);
                            }
                          }
                          
                          return <td key={col}>{String(cellValue)}</td>;
                        })
                      )}
                      <td style={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'center', minWidth: 120, width: 120, borderBottom: 'none', height: '100%' }}>
                        {editRowIdx === idx ? (
                          <>
                            <button onClick={handleSaveEdit} style={{ background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 2px 8px #001a3340', letterSpacing: 0.5, transition: 'background 0.2s', minWidth: 50 }}>✓</button>
                            <button onClick={() => { setEditRowIdx(null); setEditForm({}); }} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 2px 8px #001a3340', letterSpacing: 0.5, transition: 'background 0.2s', minWidth: 50 }}>✗</button>
                          </>
                        ) : (
                          <button onClick={() => handleEditRow(idx)} style={{ background: '#ffc107', color: '#000', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 2px 8px #001a3340', letterSpacing: 0.5, transition: 'background 0.2s', minWidth: 100 }}>Edit</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Delete Menu */}
          {selectedTable && !loading && activeMenu === "delete" && (
            <div style={{ overflowX: 'auto' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 18, fontSize: '1.25rem', letterSpacing: 0.7, textAlign: 'center', textShadow: '0 2px 8px #00336655', borderBottom: '1.5px solid #375a7f', paddingBottom: 10, marginTop: 18 }}>Delete from Table: {selectedTable}</h3>
              <div style={{ background: '#4a1717', borderRadius: 8, padding: '1rem', marginBottom: 16, border: '2px solid #dc3545' }}>
                <p style={{ margin: 0, color: '#ffcccc', fontWeight: 600, fontSize: '1rem' }}>⚠️Warning: Deletion is permanent and cannot be undone!</p>
              </div>
              <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', background: '#001a33', color: '#fff', marginBottom: 24 }}>
                <thead>
                  <tr>
                    {columns.map(col => <th key={col} style={{ background: '#003366', color: '#b3c6e0', fontWeight: 700, fontSize: '1.08rem', letterSpacing: 0.5 }}>{col}</th>)}
                    <th style={{ background: '#003366', color: '#b3c6e0', fontWeight: 700, fontSize: '1.08rem', letterSpacing: 0.5, minWidth: 120, width: 120, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} style={{ background: '#00224d', verticalAlign: 'middle' }}>
                      {columns.map(col => {
                        let cellValue = row[col];
                        
                        // Handle nested objects for display
                        if (typeof cellValue === 'object' && cellValue !== null) {
                          if (col === 'paper' && cellValue.paper_title) {
                            cellValue = cellValue.paper_title;
                          } else if (col === 'author' && cellValue.author_name) {
                            cellValue = `${cellValue.author_name} (${cellValue.email_id})`;
                          } else if (col === 'admin' && cellValue.email) {
                            cellValue = cellValue.email;
                          } else if (col === 'login' && cellValue.email) {
                            cellValue = cellValue.email;
                          } else if (col === 'message' && cellValue.subject) {
                            cellValue = `${cellValue.subject} (${cellValue.type})`;
                          } else {
                            cellValue = JSON.stringify(cellValue);
                          }
                        }
                        
                        return <td key={col}>{String(cellValue)}</td>;
                      })}
                      <td style={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'center', minWidth: 120, width: 120, borderBottom: 'none', height: '100%' }}>
                        <button onClick={() => handleDeleteRow(idx)} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 2px 8px #001a3340', letterSpacing: 0.5, transition: 'background 0.2s', minWidth: 100 }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
