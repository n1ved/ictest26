import React, { useState, useEffect, useRef } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { AiOutlineEdit } from "react-icons/ai";
import LoadingSpinner from "./components/LoadingSpinner";
import "./Registration.css";

const defaultAuthorForm = {
  salutation: "",
  author_name: "",
  reg_cat_id: "",
  state_id: "",
  district_id: "",
  manual_district: "",
  pin_code: "",
  is_primary_author: false,
  is_presenter: false,
  is_attending_at_venue: false,
  proof_reg_cat_url: "",
  email_id: "",
  mob_no: "",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "1rem",
  borderRadius: 8,
  border: "1.5px solid #375a7f",
  fontSize: "1.05rem",
  background: "#001a33",
  color: "#fff",
};

export default function Registration() {
  const [papers, setPapers] = useState([]);
  const [authorsMap, setAuthorsMap] = useState({});
  const [showAddPaperForm, setShowAddPaperForm] = useState(false);
  const [paperForm, setPaperForm] = useState({ external_id: "", paper_title: "" });
  const [activePaperId, setActivePaperId] = useState(null);
  const [authorForm, setAuthorForm] = useState(defaultAuthorForm);
  const [editAuthorId, setEditAuthorId] = useState(null);
  const [regCats, setRegCats] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingPaper, setSubmittingPaper] = useState(false);
  const [submittingAuthor, setSubmittingAuthor] = useState(false);
  const [paperError, setPaperError] = useState("");
  const [authorError, setAuthorError] = useState("");
  const [authorSuccess, setAuthorSuccess] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [proofFileName, setProofFileName] = useState("");
  const loginIdRef = useRef(null);

  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    const init = async () => {
      const userDataString = localStorage.getItem("ictest26_user");
      if (!userDataString) { setLoading(false); return; }

      let email;
      try { email = JSON.parse(userDataString).email; }
      catch { email = userDataString; }

      const { data: loginData } = await window.supabase
        .from("login").select("login_id").eq("email", email).single();
      if (!loginData) { setLoading(false); return; }
      loginIdRef.current = loginData.login_id;

      const [paperRes, regcatRes, statesRes, distsRes] = await Promise.all([
        window.supabase.from("paper")
          .select("paper_id, paper_title, created_at")
          .eq("login_id", loginData.login_id)
          .order("paper_id", { ascending: true }),
        window.supabase.from("registrationcategory").select("reg_cat_id, category_name"),
        window.supabase.from("states").select("state_id, state_name"),
        window.supabase.from("districts").select("district_id, district_name, state_id"),
      ]);

      setRegCats(regcatRes.data || []);
      setStates(statesRes.data || []);
      setDistricts(distsRes.data || []);

      if (paperRes.data && paperRes.data.length > 0) {
        setPapers(paperRes.data);
        await loadAuthors(paperRes.data.map(p => p.paper_id));
      } else {
        setShowAddPaperForm(true);
      }

      setLoading(false);
    };
    init();
  }, []);

  const loadAuthors = async (paperIds) => {
    if (!paperIds || paperIds.length === 0) return;
    const { data } = await window.supabase
      .from("author").select("*").in("paper_id", paperIds);
    if (data) {
      const map = {};
      paperIds.forEach(id => { map[id] = []; });
      data.forEach(a => {
        if (!map[a.paper_id]) map[a.paper_id] = [];
        map[a.paper_id].push(a);
      });
      setAuthorsMap(map);
    }
  };

  const refreshPapers = async () => {
    const uid = loginIdRef.current;
    if (!uid) return;
    const { data } = await window.supabase
      .from("paper")
      .select("paper_id, paper_title, created_at")
      .eq("login_id", uid)
      .order("paper_id", { ascending: true });
    if (data) {
      setPapers(data);
      await loadAuthors(data.map(p => p.paper_id));
    }
  };

  const refreshAuthorsForPaper = async (paperId) => {
    const { data } = await window.supabase.from("author").select("*").eq("paper_id", paperId);
    setAuthorsMap(prev => ({ ...prev, [paperId]: data || [] }));
  };

  const handleAddPaper = async (e) => {
    e.preventDefault();
    if (!paperForm.external_id.trim() || !paperForm.paper_title.trim()) {
      setPaperError("Both fields are required.");
      return;
    }
    setSubmittingPaper(true);
    setPaperError("");
    try {
      const parsedPaperId = Number(paperForm.external_id.trim());
      if (!Number.isInteger(parsedPaperId) || parsedPaperId < 1 || parsedPaperId > 9999) {
        setPaperError("Paper ID must be a number between 1 and 9999.");
        setSubmittingPaper(false);
        return;
      }

      const { data, error } = await window.supabase.from("paper").insert([{
        paper_id: parsedPaperId,
        login_id: loginIdRef.current,
        paper_title: paperForm.paper_title.trim(),
      }]).select().single();
      if (error?.code === "23505") {
        throw new Error("This Paper ID already exists. Please use a different Paper ID.");
      }
      if (error) throw error;
      setPaperForm({ external_id: "", paper_title: "" });
      setShowAddPaperForm(false);
      await refreshPapers();
      setActivePaperId(data.paper_id);
      setAuthorForm(defaultAuthorForm);
      setEditAuthorId(null);
      setAuthorError("");
      setAuthorSuccess("");
    } catch (err) {
      setPaperError(err.message || "Failed to add paper.");
    } finally {
      setSubmittingPaper(false);
    }
  };

  const isKerala = () => {
    const kerala = states.find(s => s.state_name.toLowerCase() === "kerala");
    return authorForm.state_id && kerala && String(authorForm.state_id) === String(kerala.state_id);
  };

  const handleAuthorChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "mob_no") {
      const num = value.replace(/\D/g, "");
      if (num.length > 10) { setMobileError("* 10 digits required"); return; }
      setMobileError("");
      setAuthorForm(prev => ({ ...prev, mob_no: num }));
      return;
    }
    if (name === "pin_code") {
      const num = value.replace(/\D/g, "");
      if (num.length > 6) return;
      setAuthorForm(prev => ({ ...prev, pin_code: num }));
      return;
    }
    if (name === "state_id") {
      // Reset district fields when state changes to avoid violating district/manual constraint.
      setAuthorForm(prev => ({ ...prev, state_id: value, district_id: "", manual_district: "" }));
      return;
    }
    if (name === "is_primary_author" && checked) {
      const currentAuthors = authorsMap[activePaperId] || [];
      const alreadyPrimary = currentAuthors.some(
        a => a.is_primary_author && (!editAuthorId || a.author_id !== editAuthorId)
      );
      if (alreadyPrimary) { setAuthorError("Only one author can be the primary author."); return; }
    }
    setAuthorError("");
    setAuthorForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofFileName(file.name);
    setUploading(true);
    setAuthorError("");
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `proof_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await window.supabase.storage.from("proofs").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = window.supabase.storage.from("proofs").getPublicUrl(fileName);
      setAuthorForm(prev => ({ ...prev, proof_reg_cat_url: publicUrlData.publicUrl }));
    } catch (err) {
      setAuthorError("File upload failed. " + (err.message || ""));
    } finally {
      setUploading(false);
    }
  };

  const handleAuthorSubmit = async (e) => {
    e.preventDefault();
    if (!activePaperId) return;
    if (!authorForm.proof_reg_cat_url) {
      setAuthorError("Please upload a proof of registration category file.");
      return;
    }
    if (authorForm.mob_no.length !== 10) {
      setAuthorError("Mobile number must be exactly 10 digits.");
      setMobileError("* 10 digits required");
      return;
    }
    if (!/^\d{6}$/.test(authorForm.pin_code || "")) {
      setAuthorError("Pin code must be exactly 6 digits.");
      return;
    }
    setAuthorError("");
    setAuthorSuccess("");
    setSubmittingAuthor(true);

    const submitData = {
      salutation: authorForm.salutation.trim(),
      author_name: authorForm.author_name.trim(),
      reg_cat_id: Number(authorForm.reg_cat_id),
      state_id: Number(authorForm.state_id),
      district_id: authorForm.district_id ? Number(authorForm.district_id) : null,
      manual_district: authorForm.manual_district ? authorForm.manual_district.trim() : null,
      pin_code: authorForm.pin_code.trim(),
      is_primary_author: !!authorForm.is_primary_author,
      is_presenter: !!authorForm.is_presenter,
      is_attending_at_venue: !!authorForm.is_attending_at_venue,
      proof_reg_cat_url: authorForm.proof_reg_cat_url,
      email_id: authorForm.email_id.trim(),
      mob_no: authorForm.mob_no.trim(),
    };

    if (isKerala()) {
      if (!submitData.district_id) {
        setAuthorError("Please select district.");
        setSubmittingAuthor(false);
        return;
      }
      submitData.manual_district = null;
    } else {
      if (!submitData.manual_district) {
        setAuthorError("Please enter district.");
        setSubmittingAuthor(false);
        return;
      }
      submitData.district_id = null;
    }

    try {
      if (editAuthorId) {
        const { error } = await window.supabase
          .from("author")
          .update({ paper_id: activePaperId, ...submitData })
          .eq("author_id", editAuthorId);
        if (error) throw error;
        setAuthorSuccess("Author updated successfully!");
      } else {
        const { error } = await window.supabase
          .from("author")
          .insert([{ paper_id: activePaperId, ...submitData }]);
        if (error) throw error;
        setAuthorSuccess("Author added successfully!");
      }
      setAuthorForm(defaultAuthorForm);
      setEditAuthorId(null);
      await refreshAuthorsForPaper(activePaperId);
    } catch (err) {
      if (err?.code === "23505") {
        setAuthorError("Only one primary author is allowed for a paper.");
        return;
      }
      setAuthorError(err.message || "Failed to save author.");
    } finally {
      setSubmittingAuthor(false);
    }
  };

  const handleEditAuthor = (author) => {
    setEditAuthorId(author.author_id);
    setActivePaperId(author.paper_id);
    setAuthorForm({
      salutation: author.salutation || "",
      author_name: author.author_name || "",
      reg_cat_id: author.reg_cat_id || "",
      state_id: author.state_id || "",
      district_id: author.district_id || "",
      manual_district: author.manual_district || "",
      pin_code: author.pin_code || "",
      is_primary_author: author.is_primary_author || false,
      is_presenter: author.is_presenter || false,
      is_attending_at_venue: author.is_attending_at_venue || false,
      proof_reg_cat_url: author.proof_reg_cat_url || "",
      email_id: author.email_id || "",
      mob_no: author.mob_no || "",
    });
    setAuthorSuccess("");
    setAuthorError("");
  };

  const handleDeleteAuthor = async (authorId, paperId) => {
    if (!window.confirm("Are you sure you want to delete this author?")) return;
    setAuthorError("");
    setAuthorSuccess("");
    const { error } = await window.supabase.from("author").delete().eq("author_id", authorId);
    if (error) setAuthorError(error.message || "Failed to delete.");
    else {
      setAuthorSuccess("Author deleted.");
      await refreshAuthorsForPaper(paperId);
    }
  };

  const handleOpenAuthorForm = (paperId) => {
    setActivePaperId(paperId);
    setAuthorForm(defaultAuthorForm);
    setEditAuthorId(null);
    setAuthorError("");
    setAuthorSuccess("");
  };

  const handleCancelAuthorForm = () => {
    setActivePaperId(null);
    setAuthorForm(defaultAuthorForm);
    setEditAuthorId(null);
    setAuthorError("");
    setAuthorSuccess("");
    setMobileError("");
    setProofFileName("");
  };

  if (loading) return <LoadingSpinner text="Loading your papers..." fullScreen={false} />;

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "2rem", textAlign: "center", marginBottom: "1.5rem", letterSpacing: 1.2, textShadow: "0 2px 8px #00336655" }}>
        Details & Authors
      </h2>

      {/* Instructions */}
      <div style={{ background: "#002147", borderRadius: 14, border: "2px solid #375a7f", color: "#fff", padding: "1.1rem 1.5rem", marginBottom: "2rem" }}>
        <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 10, color: "#b3c6e0", display: "flex", alignItems: "center", gap: 10 }}>
          <i className="fa fa-info-circle" style={{ color: "#b3c6e0", fontSize: 20 }}></i>
          Instructions
        </div>
        <ul style={{ margin: 0, paddingLeft: 24, color: "#fff", listStyle: "disc", lineHeight: 1.8 }}>
          <li>Enter your <b>Paper ID</b> (from CMT) and <b>Paper Title</b> to add a paper.</li>
          <li>Use the <b>exact paper title</b> from your submission. This title will be used for certificates.</li>
          <li>After adding a paper, add all author details for that paper and upload proof of registration category for each author.</li>
          <li>You can add multiple papers and multiple authors for each paper.</li>
          <li>Fields marked <span style={{ color: "#ff7f7f" }}>*</span> are mandatory.</li>
        </ul>
      </div>

      {/* Add Another Paper button */}
      {!showAddPaperForm && papers.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
          <button
            onClick={() => { setShowAddPaperForm(true); setPaperError(""); }}
            style={{ background: "#375a7f", color: "#fff", border: "none", borderRadius: 10, padding: "0.7rem 1.4rem", fontWeight: 700, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            <i className="fa fa-plus"></i> Add Another Paper
          </button>
        </div>
      )}

      {/* Add Paper Form */}
      {showAddPaperForm && (
        <div style={{ background: "#00224d", borderRadius: 14, border: "2px solid #375a7f", padding: "1.5rem 2rem", marginBottom: "2rem" }}>
          <h3 style={{ color: "#ffe066", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1.2rem" }}>
            {papers.length === 0 ? "Add Your Paper" : "Add Another Paper"}
          </h3>
          <form onSubmit={handleAddPaper} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Paper ID <span style={{ color: "red" }}>*</span>
                <span style={{ color: "#7fa8d0", fontWeight: 400, fontSize: "0.88rem", marginLeft: 8 }}>(from CMT)</span>
              </label>
              <input
                type="text"
                value={paperForm.external_id}
                onChange={e => setPaperForm(p => ({ ...p, external_id: e.target.value }))}
                placeholder="e.g. 1234"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Paper Title <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={paperForm.paper_title}
                onChange={e => setPaperForm(p => ({ ...p, paper_title: e.target.value }))}
                placeholder="Enter the full paper title"
                required
                style={inputStyle}
              />
            </div>
            {paperError && <div style={{ color: "#ff7f7f", fontWeight: 600 }}>{paperError}</div>}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="submit"
                disabled={submittingPaper || !paperForm.external_id.trim() || !paperForm.paper_title.trim()}
                style={{ flex: 1, background: "#003366", color: "#fff", border: "none", borderRadius: 10, padding: "0.9rem", fontWeight: 800, fontSize: "1.05rem", cursor: submittingPaper ? "not-allowed" : "pointer", opacity: submittingPaper ? 0.7 : 1 }}
              >
                {submittingPaper ? "Adding..." : "Add Paper"}
              </button>
              {papers.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setShowAddPaperForm(false); setPaperError(""); }}
                  style={{ background: "#555", color: "#fff", border: "none", borderRadius: 10, padding: "0.9rem 1.2rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Papers List */}
      {papers.map(paper => {
        const authors = authorsMap[paper.paper_id] || [];
        const isActive = activePaperId === paper.paper_id;

        return (
          <div key={paper.paper_id} className="pr-paper-card">
            {/* Paper Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: "1.2rem" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#ffe066", fontWeight: 600, fontSize: "0.9rem", marginBottom: 4 }}>
                  Paper ID: <span style={{ color: "#fff", fontWeight: 700 }}>{paper.paper_id || "—"}</span>
                </div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.15rem", wordBreak: "break-word" }}>
                  {paper.paper_title}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{
                  background: authors.length > 0 ? "#003366" : "#374151",
                  color: "#fff", borderRadius: 20, padding: "0.3rem 0.85rem",
                  fontSize: "0.88rem", fontWeight: 600
                }}>
                  {authors.length} author{authors.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Authors Table */}
            {authors.length > 0 && (
              <div style={{ marginBottom: "1.5rem", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", minWidth: isMobile ? 540 : "auto", background: "#002147", color: "#fff", borderRadius: 8, overflow: "hidden", fontSize: "0.93rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#375a7f" }}>
                      <th style={{ padding: "0.55rem 0.7rem", textAlign: "left" }}>Name</th>
                      <th style={{ padding: "0.55rem 0.7rem", textAlign: "left" }}>Email</th>
                      <th style={{ padding: "0.55rem 0.7rem", textAlign: "left" }}>Mobile</th>
                      <th style={{ padding: "0.55rem 0.7rem", textAlign: "left" }}>Reg. Category</th>
                      <th style={{ padding: "0.55rem 0.7rem", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authors.map(a => (
                      <tr key={a.author_id} style={{ borderBottom: "1px solid #375a7f" }}>
                        <td style={{ padding: "0.5rem 0.7rem" }}>{a.salutation} {a.author_name}</td>
                        <td style={{ padding: "0.5rem 0.7rem", wordBreak: "break-word" }}>{a.email_id}</td>
                        <td style={{ padding: "0.5rem 0.7rem" }}>{a.mob_no}</td>
                        <td style={{ padding: "0.5rem 0.7rem" }}>
                          {(regCats.find(r => String(r.reg_cat_id) === String(a.reg_cat_id)) || {}).category_name || a.reg_cat_id}
                        </td>
                        <td style={{ padding: "0.5rem 0.7rem" }}>
                          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            <button
                              onClick={() => handleEditAuthor(a)}
                              style={{ background: "#375a7f", color: "#fff", border: "none", borderRadius: 6, padding: "0.3rem 0.75rem", cursor: "pointer", fontWeight: 600 }}
                            >
                              {isMobile ? <AiOutlineEdit /> : "Edit"}
                            </button>
                            <button
                              onClick={() => handleDeleteAuthor(a.author_id, paper.paper_id)}
                              style={{ background: "#ff4d4d", color: "#fff", border: "none", borderRadius: 6, padding: "0.3rem 0.75rem", cursor: "pointer", fontWeight: 600 }}
                            >
                              {isMobile ? <MdDeleteOutline /> : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Success message on the active paper */}
            {isActive && authorSuccess && (
              <div style={{ color: "#7fff7f", fontWeight: 600, marginBottom: 12 }}>{authorSuccess}</div>
            )}

            {/* Author Form or Add Button */}
            {!isActive ? (
              <button
                onClick={() => handleOpenAuthorForm(paper.paper_id)}
                style={{ background: "#375a7f", color: "#fff", border: "none", borderRadius: 10, padding: "0.65rem 1.3rem", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <i className="fa fa-user-plus"></i>
                {authors.length === 0 ? "Add Author" : "Add Another Author"}
              </button>
            ) : (
              <div style={{ borderTop: "1px solid #375a7f", paddingTop: "1.5rem", marginTop: "0.5rem" }}>
                <h4 style={{ color: "#ffe066", fontWeight: 700, marginBottom: "1.2rem", fontSize: "1.05rem" }}>
                  {editAuthorId ? "Edit Author" : "Add Author"}
                  <span style={{ color: "#7fa8d0", fontWeight: 400, fontSize: "0.88rem", marginLeft: 8 }}>
                    for: {paper.paper_title}
                  </span>
                </h4>
                <form onSubmit={handleAuthorSubmit} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div>
                        <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 6 }}>
                          Salutation <span style={{ color: "red" }}>*</span>
                        </label>
                        <select name="salutation" value={authorForm.salutation} onChange={handleAuthorChange} required style={inputStyle}>
                          <option value="">Select Salutation</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                          <option value="Mr.">Mr.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Mrs.">Mrs.</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 6 }}>
                          Author Name <span style={{ color: "red" }}>*</span>
                        </label>
                        <input type="text" name="author_name" placeholder="Enter full name" value={authorForm.author_name} onChange={handleAuthorChange} required style={inputStyle} />
                      </div>

                      <div>
                        <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 6 }}>
                          Registration Category <span style={{ color: "red" }}>*</span>
                        </label>
                        <select name="reg_cat_id" value={authorForm.reg_cat_id} onChange={handleAuthorChange} required style={inputStyle}>
                          <option value="">Select Registration Category</option>
                          {regCats.map(r => <option key={r.reg_cat_id} value={r.reg_cat_id}>{r.category_name}</option>)}
                        </select>
                      </div>

                      <div>
                        <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 6 }}>
                          State <span style={{ color: "red" }}>*</span>
                        </label>
                        <select name="state_id" value={authorForm.state_id} onChange={handleAuthorChange} required style={inputStyle}>
                          <option value="">Select State</option>
                          {states.map(s => <option key={s.state_id} value={s.state_id}>{s.state_name}</option>)}
                        </select>
                      </div>

                      {authorForm.state_id && (
                        isKerala() ? (
                          <div>
                            <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 6 }}>
                              District <span style={{ color: "red" }}>*</span>
                            </label>
                            <select name="district_id" value={authorForm.district_id || ""} onChange={handleAuthorChange} required style={inputStyle}>
                              <option value="">Select District</option>
                              {districts
                                .filter(d => String(d.state_id) === String(authorForm.state_id))
                                .map(d => <option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 6 }}>
                              District <span style={{ color: "red" }}>*</span>
                            </label>
                            <input type="text" name="manual_district" placeholder="Enter district name" value={authorForm.manual_district || ""} onChange={handleAuthorChange} required style={inputStyle} />
                          </div>
                        )
                      )}

                      <div>
                        <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 6 }}>
                          Pin Code <span style={{ color: "red" }}>*</span>
                        </label>
                        <input type="text" name="pin_code" placeholder="6-digit pin code" value={authorForm.pin_code} onChange={handleAuthorChange} required style={inputStyle} />
                      </div>

                      <div>
                        <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 6 }}>
                          Email <span style={{ color: "red" }}>*</span>
                        </label>
                        <input type="email" name="email_id" placeholder="Enter email address" value={authorForm.email_id} onChange={handleAuthorChange} required style={inputStyle} />
                      </div>

                      <div>
                        <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 6 }}>
                          Mobile Number <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="mob_no"
                          placeholder="10-digit mobile number"
                          value={authorForm.mob_no}
                          onChange={handleAuthorChange}
                          required
                          style={{ ...inputStyle, border: mobileError ? "1.5px solid #fa5656" : "1.5px solid #375a7f" }}
                        />
                        {mobileError && <div style={{ color: "#ff7f7f", fontSize: "0.88rem", marginTop: 4 }}>{mobileError}</div>}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, margin: "4px 0" }}>
                        <label style={{ color: "#b3c6e0", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                          <input type="checkbox" name="is_primary_author" checked={authorForm.is_primary_author} onChange={handleAuthorChange} style={{ transform: "scale(1.2)" }} />
                          Primary Author
                        </label>
                        <label style={{ color: "#b3c6e0", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                          <input type="checkbox" name="is_presenter" checked={authorForm.is_presenter} onChange={handleAuthorChange} style={{ transform: "scale(1.2)" }} />
                          Presenter
                        </label>
                        <label style={{ color: "#b3c6e0", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                          <input type="checkbox" name="is_attending_at_venue" checked={authorForm.is_attending_at_venue} onChange={handleAuthorChange} style={{ transform: "scale(1.2)" }} />
                          Attending at Venue
                        </label>
                      </div>

                      <div>
                        <label style={{ color: "#b3c6e0", fontWeight: 600, display: "block", marginBottom: 8 }}>
                          Proof of Registration Category <span style={{ color: "red" }}>*</span>
                        </label>
                        <div
                          style={{
                            border: "1.5px dashed #375a7f",
                            borderRadius: 10,
                            padding: "0.9rem",
                            background: "#001a33",
                          }}
                        >
                          <input
                            id={`proof-upload-${paper.paper_id}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                          />
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <label
                              htmlFor={`proof-upload-${paper.paper_id}`}
                              style={{
                                background: "#375a7f",
                                color: "#fff",
                                borderRadius: 8,
                                padding: "0.45rem 0.85rem",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                              }}
                            >
                              Choose File
                            </label>
                            <span style={{ color: proofFileName ? "#fff" : "#9bb4cf", fontSize: "0.9rem" }}>
                              {proofFileName || "No file selected"}
                            </span>
                          </div>
                          <div style={{ color: "#7fa8d0", marginTop: 8, fontSize: "0.82rem" }}>
                            Allowed formats: PDF, JPG, JPEG, PNG
                          </div>
                        </div>
                        {uploading && <div style={{ color: "#7fff7f", marginTop: 6, fontSize: "0.9rem" }}>Uploading...</div>}
                        {authorForm.proof_reg_cat_url && !uploading && (
                          <div style={{ color: "#7fff7f", marginTop: 6, fontSize: "0.9rem" }}>
                            <i className="fa fa-check" style={{ marginRight: 4 }}></i>File uploaded
                          </div>
                        )}
                      </div>

                      {authorError && <div style={{ color: "#ff7f7f", fontWeight: 600 }}>{authorError}</div>}

                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          type="submit"
                          disabled={submittingAuthor || uploading}
                          style={{ flex: 1, background: "#003366", color: "#fff", border: "none", borderRadius: 10, padding: "0.9rem", fontWeight: 800, fontSize: "1.05rem", cursor: submittingAuthor ? "not-allowed" : "pointer", opacity: submittingAuthor ? 0.7 : 1 }}
                        >
                          {submittingAuthor ? "Saving..." : (editAuthorId ? "Update Author" : "Add Author")}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelAuthorForm}
                          style={{ background: "#555", color: "#fff", border: "none", borderRadius: 10, padding: "0.9rem 1.2rem", fontWeight: 600, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </div>
                </form>
              </div>
            )}
          </div>
        );
      })}

      {papers.length === 0 && !showAddPaperForm && (
        <div style={{ textAlign: "center", color: "#b3c6e0", marginTop: "3rem" }}>
          <p>No papers registered yet.</p>
          <button
            onClick={() => setShowAddPaperForm(true)}
            style={{ background: "#375a7f", color: "#fff", border: "none", borderRadius: 10, padding: "0.8rem 1.5rem", fontWeight: 700, cursor: "pointer", marginTop: 12 }}
          >
            Add Your First Paper
          </button>
        </div>
      )}
    </div>
  );
}
