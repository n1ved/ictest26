import React, { useState, useEffect } from "react";
import "./AddAuthor.css";
import LoadingSpinner from "./components/LoadingSpinner";

export default function AddAuthor({ paperId: propPaperId, onSuccess }) {
  const [form, setForm] = useState({
    salutation: "",
    author_name: "",
    designation_id: "",
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
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [paperId, setPaperId] = useState(propPaperId || null);
  const [paperDetails, setPaperDetails] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [regCats, setRegCats] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [editAuthorId, setEditAuthorId] = useState(null);
  const [finalSubmitted, setFinalSubmitted] = useState(false);
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch paperId for current user if not provided
    setLoading(true);
    const fetchPaperId = async () => {
      if (!paperId) {
        const email = localStorage.getItem("ictest26_user");
        const { data: loginData } = await window.supabase
          .from("login")
          .select("login_id")
          .eq("email", email)
          .single();
        if (loginData) {
          const { data: paperData } = await window.supabase
            .from("paper")
            .select("paper_id, paper_title, presentation_mode, created_at")
            .eq("login_id", loginData.login_id)
            .order("paper_id", { ascending: true });
          if (paperData && paperData.length > 0) {
            setPapers(paperData);
            // Set the first paper as default selected
            setSelectedPaper(paperData[0]);
            setPaperId(paperData[0].paper_id);
          }
        }
      } else {
        // If paperId is provided, fetch paper details
        const { data: paperData } = await window.supabase
          .from("paper")
          .select("paper_id, paper_title, presentation_mode, created_at")
          .eq("paper_id", paperId)
          .single();
        if (paperData) {
          setSelectedPaper(paperData);
          setPaperDetails(paperData);
          // If online mode, automatically set state to Kerala
          if (paperData.presentation_mode === "Online") {
            const kerala = states.find(s => s.state_name.toLowerCase() === 'kerala');
            if (kerala) {
              setForm(prev => ({
                ...prev,
                state_id: kerala.state_id.toString()
              }));
            }
          }
        }
      }
      setLoading(false);
    };
    fetchPaperId();
  }, [paperId, states]);

  useEffect(() => {
    // Fetch dropdown data
    const fetchDropdowns = async () => {
      const { data: desig } = await window.supabase.from("designation").select("designation_id, designation");
      setDesignations(desig || []);
      const { data: regcat } = await window.supabase.from("registrationcategory").select("reg_cat_id, category_name");
      setRegCats(regcat || []);
      const { data: st } = await window.supabase.from("states").select("state_id, state_name");
      setStates(st || []);
      const { data: dists } = await window.supabase.from("districts").select("district_id, district_name, state_id");
      setDistricts(dists || []);
    };
    fetchDropdowns();
  }, []);

  // Fetch authors for the current paper
  useEffect(() => {
    if (!paperId) return;
    const fetchAuthors = async () => {
      const { data, error } = await window.supabase
        .from("author")
        .select("*")
        .eq("paper_id", paperId);
      if (!error) setAuthors(data || []);
    };
    fetchAuthors();
    // Check if final submit is done
    const checkFinalSubmit = async () => {
      const { data, error } = await window.supabase
        .from("paper")
        .select("final_submit")
        .eq("paper_id", paperId)
        .single();
      if (!error && data && data.final_submit) setFinalSubmitted(true);
    };
    checkFinalSubmit();
  }, [paperId, success]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "mob_no") {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 10) {
        setMobileError("* 10 digits required");
        return;
      // } else if (numericValue.length > 0 && numericValue.length < 10) {
      //   setMobileError("* 10 digits required");
      } else {
        setMobileError("");
      }
      setForm({ ...form, [name]: numericValue });
      return;
    }
    
    if (name === "is_primary_author" && checked) {
      // If selecting as primary, ensure no other author is primary
      const alreadyPrimary = authors.some(a => a.is_primary_author && (!editAuthorId || a.author_id !== editAuthorId));
      if (alreadyPrimary) {
        setError("Only one author can be selected as the primary author.");
        return;
      }
    }
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `proof_${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await window.supabase.storage.from('proofs').upload(fileName, file);
      if (uploadError) throw uploadError;
      // Get public URL
      const { data: publicUrlData } = window.supabase.storage.from('proofs').getPublicUrl(fileName);
      setForm({ ...form, proof_reg_cat_url: publicUrlData.publicUrl });
    } catch (err) {
      setError('File upload failed. ' + (err.message || ''));
    } finally {
      setUploading(false);
    }
  };

  // Edit author handler
  const handleEdit = (author) => {
    setEditAuthorId(author.author_id);
    setForm({
      salutation: author.salutation || "",
      author_name: author.author_name || "",
      designation_id: author.designation_id || "",
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditAuthorId(null);
    setForm({
      salutation: "",
      author_name: "",
      designation_id: "",
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
    });
  };

  // Update handleSubmit for edit mode
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (finalSubmitted) {
      setError("You cannot add or edit authors after final submit.");
      return;
    }
    
    // Add mobile number validation before submission
    // if (form.mob_no.length !== 10) {
    //   setError("Mobile number must be exactly 10 digits.");
    //   setMobileError("* 10 digits required");
    //   return;
    // }
    
    setError("");
    setSuccess("");
    if (!paperId) {
      setError("No paper found. Please add a paper first.");
      return;
    }
    // Only require proof_reg_cat_url if adding a new author, or if editing and the field is empty (i.e., user removed it)
    if (!form.proof_reg_cat_url || form.proof_reg_cat_url === "") {
      setError("Please upload a proof of registration category file.");
      return;
    }
    // Check if another author is already primary
    if (form.is_primary_author) {
      const alreadyPrimary = authors.some(a => a.is_primary_author && (!editAuthorId || a.author_id !== editAuthorId));
      if (alreadyPrimary) {
        setError("Only one author can be selected as the primary author.");
        return;
      }
    }
    // Set district_id or manual_district based on state
    let submitData = { ...form };
    if (isKerala()) {
      submitData.manual_district = null;
    } else {
      submitData.district_id = null;
    }
    try {
      if (editAuthorId) {
        // Ensure correct author is updated and only changed fields are sent
        const originalAuthor = authors.find(a => a.author_id === editAuthorId);
        if (!originalAuthor) {
          setError("Selected author not found. Please refresh and try again.");
          return;
        }
        // Only send changed fields (except for required ones)
        const updateData = { paper_id: paperId, certificate_verified: null };
        Object.keys(submitData).forEach(key => {
          if (submitData[key] !== originalAuthor[key]) {
            updateData[key] = submitData[key];
          }
        });
        // If the proof_reg_cat_url is unchanged, do not update it
        if (originalAuthor.proof_reg_cat_url === form.proof_reg_cat_url) {
          delete updateData.proof_reg_cat_url;
        }
        const { error: updateError } = await window.supabase
          .from("author")
          .update(updateData)
          .eq("author_id", editAuthorId)
          .select(); // Ensure the update returns the updated row
        if (updateError) throw updateError;
        setSuccess("Author updated successfully!");
      } else {
        // Add new author
        const { error: insertError } = await window.supabase.from("author").insert([
          {
            paper_id: paperId,
            ...submitData,
            certificate_verified: null,
          },
        ]);
        if (insertError) throw insertError;
        setSuccess("Author added successfully!");
      }
      setEditAuthorId(null);
      setForm({
        salutation: "",
        author_name: "",
        designation_id: "",
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
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to add author");
    }
  };

  // Delete author handler
  const handleDelete = async (authorId) => {
    if (finalSubmitted) return;
    if (!window.confirm("Are you sure you want to delete this author?")) return;
    setError("");
    setSuccess("");
    try {
      const { error: deleteError } = await window.supabase
        .from("author")
        .delete()
        .eq("author_id", authorId);
      if (deleteError) throw deleteError;
      setSuccess("Author deleted successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete author");
    }
  };

  // Helper to check if Kerala is selected
  const isKerala = () => {
    const kerala = states.find(s => s.state_name.toLowerCase() === 'kerala');
    return form.state_id && kerala && String(form.state_id) === String(kerala.state_id);
  };

  // Handle paper selection change
  const handlePaperChange = (event) => {
    const selectedPaperId = parseInt(event.target.value);
    const paper = papers.find(p => p.paper_id === selectedPaperId);
    setSelectedPaper(paper);
    setPaperId(selectedPaperId);
    setPaperDetails(paper);
    
    // Reset form and authors when changing papers
    setForm({
      salutation: "",
      author_name: "",
      designation_id: "",
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
    });
    setEditAuthorId(null);
    
    // If online mode, automatically set state to Kerala
    if (paper?.presentation_mode === "Online") {
      const kerala = states.find(s => s.state_name.toLowerCase() === 'kerala');
      if (kerala) {
        setForm(prev => ({
          ...prev,
          state_id: kerala.state_id.toString()
        }));
      }
    }
  };

  console.log(loading)
  if(loading){
    return <LoadingSpinner text={"Checking for papers..."} fullScreen={false} />
  }

  if (!paperId || papers.length === 0) {
    return (
      <div style={{maxWidth: 800, margin: '40px auto', background: '#001a33', borderRadius: 18, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.22)', border: '2px solid #375a7f', padding: '3rem 2rem', color: '#fff', textAlign: 'center'}}>
        <h3 style={{color: '#ffb347', marginBottom: 20}}>No Papers Found</h3>
        <p>Please add a paper first before adding authors.</p>
      </div>
    );
  }

  return (
    <div className="add-author-form-container" style={{maxWidth: 950, margin: '40px auto', background: '#001a33', borderRadius: 18, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.22)', border: '2px solid #375a7f', padding: '3rem 2rem', color: '#e6eaff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36}}>
      <h3 className="add-author-title" style={{textTransform: 'uppercase', letterSpacing: 1.5, color: '#fff', fontWeight: 800, fontSize: '2rem', marginBottom: 18, textShadow: '0 2px 8px #00336655'}}>Add Author</h3>
      
      {/* Paper Selection */}
      {papers.length > 1 && (
        <div style={{width: '100%', marginBottom: 32, background:'#00224d', borderRadius:12, padding:'1.5rem', border:'1.5px solid #375a7f'}}>
          <h4 style={{fontWeight:700, fontSize:'1.15rem', marginBottom:12, color:'#ffe066'}}>
            Select Paper for Author Addition
          </h4>
          <select 
            value={paperId || ''} 
            onChange={handlePaperChange}
            style={{
              width: '100%', 
              padding: '12px', 
              borderRadius: 8, 
              border: '1.5px solid #375a7f', 
              fontSize: '1rem', 
              background: '#001a33', 
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            {papers.map((paper) => (
              <option key={paper.paper_id} value={paper.paper_id}>
                Paper ID: {paper.paper_id} - {paper.paper_title}
              </option>
            ))}
          </select>
          {selectedPaper && (
            <div style={{marginTop: 12, fontSize: '0.9rem', color: '#b3c6e0'}}>
              <strong>Selected Paper:</strong> {selectedPaper.paper_title}<br/>
              <strong>Paper ID:</strong> {selectedPaper.paper_id}<br/>
              <strong>Submitted:</strong> {new Date(selectedPaper.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Single Paper Display */}
      {papers.length === 1 && selectedPaper && (
        <div style={{width: '100%', marginBottom: 32, background:'#00224d', borderRadius:12, padding:'1.5rem', border:'1.5px solid #375a7f'}}>
          <h4 style={{fontWeight:700, fontSize:'1.15rem', marginBottom:12, color:'#ffe066'}}>
            Paper Details
          </h4>
          <div style={{fontSize: '0.95rem', color: '#fff'}}>
            <div style={{marginBottom: 8}}><strong>Title:</strong> {selectedPaper.paper_title}</div>
            <div style={{marginBottom: 8}}><strong>Paper ID:</strong> {selectedPaper.paper_id}</div>
            <div><strong>Submitted:</strong> {new Date(selectedPaper.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      <div style={{
        width: '100%',
        maxWidth: 900,
        margin: '0 auto 36px auto',
        background: '#002147',
        borderRadius: 14,
        border: '2px solid #375a7f',
        color: '#fff',
        padding: '1.1rem 1.3rem',
        fontSize: '1.13rem',
        lineHeight: 1.8,
        boxShadow: '0 4px 16px 0 rgba(0,0,0,0.13)',
        position: 'relative',
        overflow: 'hidden',
        letterSpacing: 0.1,
      }}>
        <div style={{
          fontWeight: 800,
          fontSize: '1.25rem',
          marginBottom: 10,
          color: '#b3c6e0',
          textShadow: '0 2px 8px #00336655',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <i className="fa fa-info-circle" style={{color:'#b3c6e0', fontSize: 22}}></i>
          Author Submission Instructions
        </div>
        <ul style={{margin:0, paddingLeft:28, color:'#fff', fontSize:'1.09rem', listStyle:'disc'}}>
          <li>Fill in <b>all required author details</b> accurately. Fields marked with <span style={{color:'#ff7f7f'}}>*</span> are mandatory.</li>
          <li>Upload a <b>valid proof document</b> for registration category (PDF, JPG, JPEG, PNG).</li>
          <li>Click <b>Add Author</b> to save each author. You can add multiple authors for your paper.</li>
          <li>To <b>edit</b> an author, click the <b>Edit</b> button in the authors list below. To <b>remove</b> an author, use the <b>Delete</b> button.</li>
          <li>Only one author can be marked as <b>Primary Author</b>.</li>
          <li>After clicking <b>Final Submit</b> (from the sidebar), no further add or edit is possible. Please review all details before final submission.</li>
        </ul>
        <div style={{marginTop:18, color:'#b3c6e0', fontSize:'1.01rem', fontWeight:600}}>
          <i className="fa fa-exclamation-triangle" style={{marginRight:8, color:'#b3c6e0'}}></i>
          <span>Ensure all author details and documents are correct before final submission.</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="add-author-form" autoComplete="off" style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 18}}>
        <div style={{width: '100%'}}>
          <select name="salutation" value={form.salutation} onChange={handleChange} required style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}}>
            <option value="">Salutation *</option>
            <option value="Dr.">Dr.</option>
            <option value="Prof.">Prof.</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mrs.">Mrs.</option>
          </select>
        </div>
        <div style={{width: '100%'}}>
          <input type="text" name="author_name" placeholder="Author Name *" value={form.author_name} onChange={handleChange} required style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}} />
        </div>
        <div style={{width: '100%'}}>
          <select name="designation_id" value={form.designation_id} onChange={handleChange} required style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}}>
            <option value="">Designation *</option>
            {designations.map(d => <option key={d.designation_id} value={d.designation_id}>{d.designation}</option>)}
          </select>
        </div>
        <div style={{width: '100%'}}>
          <select name="reg_cat_id" value={form.reg_cat_id} onChange={handleChange} required style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}}>
            <option value="">Registration Category *</option>
            {regCats.map(r => <option key={r.reg_cat_id} value={r.reg_cat_id}>{r.category_name}</option>)}
          </select>
        </div>
        <div style={{width: '100%'}}>
          <label htmlFor="state_id" style={{width: '100%', color: '#b3c6e0', fontWeight: 600, marginBottom: 6, fontSize: '1.08rem', letterSpacing: 0.5, display: 'block', paddingBottom: 6}}>
            State <span style={{color: 'red'}}>*</span>
          </label>
          <select
            id="state_id"
            name="state_id"
            value={form.state_id}
            onChange={handleChange}
            required
            placeholder="Select State"
            style={{
              width: '100%', 
              boxSizing: 'border-box', 
              padding: '1.1rem', 
              borderRadius: 8, 
              border: '1.5px solid #375a7f', 
              fontSize: '1.1rem', 
              background: paperDetails?.presentation_mode === "Online" ? '#002147' : '#001a33', 
              color: form.state_id ? '#fff' : '#b3c6e0',
              cursor: paperDetails?.presentation_mode === "Online" ? 'not-allowed' : 'pointer',
              opacity: paperDetails?.presentation_mode === "Online" ? 0.8 : 1
            }}
          >
            {paperDetails?.presentation_mode === "Online" ? (
              <>
                <option value="" style={{color: '#b3c6e0'}}>Select State</option>
                {states
                  .filter(state => state.state_name.toLowerCase() !== 'kerala')
                  .map((state) => (
                    <option key={state.state_id} value={state.state_id}>
                      {state.state_name}
                    </option>
                  ))}
              </>
            ) : (
              <>
                <option value="" style={{color: '#b3c6e0'}}>Select State</option>
                {states.map((state) => (
                  <option key={state.state_id} value={state.state_id}>
                    {state.state_name}
                  </option>
                ))}
              </>
            )}
          </select>
          {paperDetails?.presentation_mode === "Online" && (
            <div style={{
              color: '#ff7f7f', 
              fontSize: '0.9rem', 
              marginTop: '6px', 
              fontWeight: '500',
              background: 'rgba(255, 127, 127, 0.1)',
              padding: '8px 12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fa fa-info-circle"></i>
              Online presentation is only for participants outside Kerala
            </div>
          )}
        </div>
        <div style={{width: '100%'}}>
          {isKerala() ? (
            <select name="district_id" value={form.district_id || ""} onChange={handleChange} required style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}}>
              <option value="">District *</option>
              {districts.filter(d => String(d.state_id) === String(form.state_id)).map(d => (
                <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
              ))}
            </select>
          ) : (
            <input type="text" name="manual_district" placeholder="District *" value={form.manual_district || ""} onChange={handleChange} required style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}} />
          )}
        </div>
        <div style={{width: '100%'}}>
          <input type="text" name="pin_code" placeholder="Pin Code *" value={form.pin_code} onChange={handleChange} required style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}} />
        </div>
        <div style={{width: '100%'}}>
          <input type="email" name="email_id" placeholder="Email *" value={form.email_id} onChange={handleChange} required style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}} />
        </div>
        <div style={{width: '100%'}}>
          <input type="text" name="mob_no" placeholder="Mobile Number *" value={form.mob_no} onChange={handleChange} required style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: mobileError ? '1.5px solid #fa5656' : '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}} />
          
          {mobileError && (
            <div style={{
              color: '#ff7f7f', 
              fontSize: '0.9rem', 
              marginTop: '5px', 
              fontWeight: '500'
            }}>
              {mobileError}
            </div>
          )}
          
        </div>
        <div style={{width:'100%', display:'flex', flexWrap:'wrap', gap:12, margin:'12px 0'}}>
          <label style={{color:'#b3c6e0', fontWeight:500, fontSize:'1.05rem'}}><input type="checkbox" name="is_primary_author" checked={form.is_primary_author} onChange={handleChange} style={{marginRight:10, transform:'scale(1.2)'}} /> Primary Author</label>
          <label style={{color:'#b3c6e0', fontWeight:500, fontSize:'1.05rem'}}><input type="checkbox" name="is_presenter" checked={form.is_presenter} onChange={handleChange} style={{marginRight:10, transform:'scale(1.2)'}} /> Presenter</label>
          <label style={{color:'#b3c6e0', fontWeight:500, fontSize:'1.05rem'}}><input type="checkbox" name="is_attending_at_venue" checked={form.is_attending_at_venue} onChange={handleChange} style={{marginRight:10, transform:'scale(1.2)'}} /> Attending at Venue</label>
        </div>
        <div className="proof-upload-container">
          <label className="proof-upload-label">Proof of Registration Category *</label>
          <input
            className="proof-upload-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            required
          />
          {uploading && <div className="proof-upload-status">Uploading...</div>}
          {form.proof_reg_cat_url && <div className="proof-upload-status">File uploaded!</div>}
        </div>
        <button type="submit" disabled={finalSubmitted} style={{width: '100%', background:'#003366', color:'#fff', border:'none', borderRadius:10, padding:'0.9rem 0', fontWeight:800, fontSize:'1.15rem', cursor: finalSubmitted ? 'not-allowed' : 'pointer', marginBottom:12, boxShadow:'0 2px 8px 0 rgba(0,0,0,0.10)', transition:'background 0.2s'}}>{editAuthorId ? 'Update Author' : 'Add Author'}</button>
        {editAuthorId && !finalSubmitted && <button type="button" onClick={handleCancelEdit} style={{width: '100%', background:'#888', color:'#fff', border:'none', borderRadius:10, padding:'0.7rem 0', fontWeight:600, fontSize:'1rem', cursor:'pointer', marginBottom:12}}>Cancel Edit</button>}
        {success && <div className="author-success" style={{color:'#fff', fontWeight:600, marginTop:12, textAlign:'center', fontSize:'1.1rem'}}>{success}</div>}
        {error && <div className="author-error" style={{color:'#ff7f7f', fontWeight:600, marginTop:12, textAlign:'center', fontSize:'1.1rem'}}>{error}</div>}
      </form>
      {/* Authors List */}
      {authors.length > 0 && (
        <div style={{width:'100%', marginTop:32}}>
          <h4 style={{color:'#fff', marginBottom:12}}>Added Authors</h4>
          <table style={{width:'100%', background:'#002147', color:'#fff', borderRadius:8, overflow:'hidden', fontSize:'1rem'}}>
            <thead>
              <tr style={{background:'#375a7f'}}>
                <th style={{padding:'0.6rem'}}>Name</th>
                <th style={{padding:'0.6rem'}}>Email</th>
                <th style={{padding:'0.6rem'}}>Mobile</th>
                <th style={{padding:'0.6rem'}}>Reg. Category</th>
                <th style={{padding:'0.6rem'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {authors.map(a => (
                <tr key={a.author_id} style={{borderBottom:'1px solid #375a7f'}}>
                  <td style={{padding:'0.5rem'}}>{a.salutation} {a.author_name}</td>
                  <td style={{padding:'0.5rem'}}>{a.email_id}</td>
                  <td style={{padding:'0.5rem'}}>{a.mob_no}</td>
                  <td style={{padding:'0.5rem'}}>{(regCats.find(r => String(r.reg_cat_id) === String(a.reg_cat_id)) || {}).category_name || a.reg_cat_id}</td>
                  <td style={{padding:'0.5rem'}}>
                    <div className="author-action-buttons">
                      <button
                        type="button"
                        onClick={() => handleEdit(a)}
                        style={{
                          background:'#375a7f',
                          color:'#fff',
                          border:'none',
                          borderRadius:6,
                          padding:'0.4rem 0.8rem',
                          cursor:'pointer',
                          fontWeight:600
                        }}
                        disabled={finalSubmitted}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a.author_id)}
                        style={{
                          background:'#ff4d4d',
                          color:'#fff',
                          border:'none',
                          borderRadius:6,
                          padding:'0.4rem 0.8rem',
                          cursor: finalSubmitted ? 'not-allowed' : 'pointer',
                          fontWeight:600
                        }}
                        disabled={finalSubmitted}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Waiting for admin approval message */}
      {finalSubmitted && (
        <div style={{width:'100%', marginTop:32, background:'#003366', color:'#fff', borderRadius:10, padding:'1.5rem', textAlign:'center', fontWeight:600, fontSize:'1.15rem', boxShadow:'0 2px 8px 0 rgba(0,0,0,0.10)'}}>
          Waiting for admin approval...<br/>
          <span style={{color:'#ffb347'}}>You cannot add or edit authors after final submit.</span>
        </div>
      )}
    </div>
  );
}
