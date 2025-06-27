import React, { useState, useEffect } from "react";
import "./AddPaper.css";
import LoadingSpinner from "./components/LoadingSpinner";

export default function AddPaper({ onSuccess }) {
  const [form, setForm] = useState({
    paper_title: "",
    track_id: "",
    num_pages: "",
    presentation_mode: "Oral",
    paper_attached: null,
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [paper, setPaper] = useState(null); // holds the submitted paper
  const [editMode, setEditMode] = useState(false);
  const [tracks, setTracks] = useState([]); // holds the list of tracks
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(0);

  const isFormValid = form.paper_title && form.track_id && form.num_pages && form.presentation_mode && form.paper_attached && !uploading;

  // Fetch tracks on mount
  useEffect(() => {
    const fetchTracks = async () => {
      const { data, error } = await window.supabase.from('tracks').select('*');
      if (!error && data) setTracks(data);
    };
    fetchTracks();
  }, []);

  // Fetch paper after mount or after submit
  useEffect(() => {
    setLoading(true);
    const fetchPaper = async () => {
      const email = localStorage.getItem("ictest26_user");
      if (!email) return;
      const { data: loginData, error: loginError } = await window.supabase
        .from('login')
        .select('login_id')
        .eq('email', email)
        .single();
      if (loginError || !loginData) return;
      const { data: paperData } = await window.supabase
        .from('paper')
        .select('*')
        .eq('login_id', loginData.login_id)
        // .maybeSingle();
      if (paperData) {
        setPaper(paperData);
      } else {
        setPaper(null);
      }
      setLoading(false);
    };
    fetchPaper();
  }, [success]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm({ ...form, [name]: files[0] });
      setFileName(files[0] ? files[0].name : "");
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleEdit = (index) => {
    setEditMode(true);
    setEditIndex(index);
    setForm({
      paper_title: paper[index].paper_title,
      track_id: paper[index].track_id ? String(paper[index].track_id) : "",
      num_pages: paper[index].num_pages,
      presentation_mode: paper[index].presentation_mode,
      paper_attached: null,
    });
    setFileName("");
    setSuccess("");
    setError("");
  };

  const handleSave = async (index) => {
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      let pdfUrl = paper[index].paper_attached;
      if (form.paper_attached) {
        const fileName = `${Date.now()}_${form.paper_attached.name}`;
        const { data: uploadData, error: uploadError } = await window.supabase.storage
          .from('papers')
          .upload(fileName, form.paper_attached);
        if (uploadError) throw uploadError;
        pdfUrl = uploadData.path;
      }
      const { error: updateError } = await window.supabase
        .from('paper')
        .update({
          paper_title: form.paper_title,
          track_id: form.track_id ? parseInt(form.track_id) : null,
          num_pages: form.num_pages ? parseInt(form.num_pages) : null,
          presentation_mode: form.presentation_mode,
          paper_attached: pdfUrl,
        })
        .eq('paper_id', paper[index].paper_id);
      if (updateError) throw updateError;
      setSuccess("Paper updated successfully!");
      setEditMode(false);
      setFileName("");
      // Refetch paper
      const { data: updatedPaper } = await window.supabase
        .from('paper')
        .select('*')
        .eq('paper_id', paper[index].paper_id)
        .single();
      setPaper(updatedPaper);
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      // 1. Upload PDF to Supabase Storage
      let pdfUrl = null;
      if (form.paper_attached) {
        const fileName = `${Date.now()}_${form.paper_attached.name}`;
        const { data: uploadData, error: uploadError } = await window.supabase.storage
          .from('papers')
          .upload(fileName, form.paper_attached);
        if (uploadError) throw uploadError;
        pdfUrl = uploadData.path;
      }
      // 2. Get login_id from user email (assume a login table exists)
      const email = localStorage.getItem("ictest26_user");
      const { data: loginData, error: loginError } = await window.supabase
        .from('login')
        .select('login_id')
        .eq('email', email)
        .single();
      if (loginError) throw loginError;
      // 3. Insert into paper table
      const { error: insertError } = await window.supabase.from('paper').insert([
        {
          login_id: loginData.login_id,
          paper_title: form.paper_title,
          track_id: form.track_id ? parseInt(form.track_id) : null,
          num_pages: form.num_pages ? parseInt(form.num_pages) : null,
          presentation_mode: form.presentation_mode,
          paper_attached: pdfUrl,
          cmt_validated: false,
          admin_validated: false,
        },
      ]);
      if (insertError) throw insertError;
      setSuccess("Paper submitted successfully!");
      setForm({
        paper_title: "",
        track_id: "",
        num_pages: "",
        presentation_mode: "Oral",
        paper_attached: null,
      });
      setFileName("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setUploading(false);
    }
  };

  // Helper to get track name from id
  const getTrackName = (id) => {
    const t = tracks.find((tr) => String(tr.track_id) === String(id));
    return t ? t.track_name || t.name : id;
  };
  if(loading){
    return (
      <LoadingSpinner text={"Checking for papers..."} fullScreen={false} />
    );
  }

  // If paper exists and not in edit mode, show card
  if (paper && paper.length > 0 && !editMode) {
    return (
      <div>
      <div className="paper-form-container" style={{maxWidth: 600, padding: 0, background: 'none', boxShadow: 'none', margin: '40px auto', border: 'none'}}>
        <h2 style={{color:'#fff', textAlign:'center', marginBottom:'2rem', fontWeight:800, fontSize:'2.2rem', letterSpacing:1.2, textShadow:'0 2px 8px #00336655'}}>
          Submitted Papers ({paper.length})
        </h2>
        <button 
    onClick={() => {
      setForm({
        paper_title: "",
        track_id: "",
        num_pages: "",
        presentation_mode: "In-person",
        paper_attached: null,
      });
      setPaper(null);
      setFileName("");
      setSuccess("");
      setError("");
    }} 
    style={{
      background: '#375a7f', 
      color: '#fff', 
      border: 'none', 
      borderRadius: 10, 
      padding: '0.8rem 1.5rem', 
      fontWeight: 800, 
      fontSize: '1rem', 
      cursor: 'pointer', 
      boxShadow: '0 4px 12px rgba(55, 90, 127, 0.3)', 
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      letterSpacing: '0.5px',
      flexShrink: 0,
      position: 'absolute',
      top: '20%',
      right: '20px'
    }}
    onMouseEnter={(e) => {
      e.target.style.background = '#003366';
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 6px 16px rgba(0, 51, 102, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.target.style.background = '#375a7f';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 12px rgba(55, 90, 127, 0.3)';
    }}
  >
    <i className="fa fa-plus" style={{fontSize: '14px'}}></i>
    Add New Paper
  </button>
        {paper.map((singlePaper, index) => (
        <div style={{
          background: 'transparent',
          borderRadius: 18,
          padding: '3rem 2rem',
          color: '#e6eaff',
          width: '100%',
          maxWidth: 600,
          margin: '3rem auto',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '2px solid #375a7f',
          position: 'relative',
          minHeight: 420,
        }}>
          <div style={{
            position: 'absolute',
            top: 24,
            right: 32,
            fontSize: 20,
            color: '#ffe066',
            fontWeight: 700,
            letterSpacing: 1.2
          }}>
            <i className="fa fa-check-circle" style={{marginRight:8, color:'#ffe066', fontSize:26}}></i>Submitted
          </div>
          <h3 style={{color:'#fff', marginBottom:24, fontWeight:800, fontSize:'2rem', letterSpacing:1.2, textShadow:'0 2px 8px #00336655'}}>Paper Added</h3>
          <div style={{width:'100%', marginBottom:16, fontSize:'1.13rem'}}><b>Title:</b> <span style={{color:'#fff'}}>{singlePaper.paper_title}</span></div>
          <div style={{width:'100%', marginBottom:16, fontSize:'1.13rem'}}><b>Track:</b> <span style={{color:'#fff'}}>{getTrackName(singlePaper.track_id)}</span></div>
          <div style={{width:'100%', marginBottom:16, fontSize:'1.13rem'}}><b>Pages:</b> <span style={{color:'#fff'}}>{singlePaper.num_pages}</span></div>
          <div style={{width:'100%', marginBottom:16, fontSize:'1.13rem'}}><b>Presentation Mode:</b> <span style={{color:'#fff'}}>{singlePaper.presentation_mode}</span></div>
          <div style={{width:'100%', marginBottom:24, fontSize:'1.13rem'}}><b>PDF:</b> {singlePaper.paper_attached ? <a href={`https://lmlndvlfcqlluydshvko.supabase.co/storage/v1/object/public/papers/${paper.paper_attached}`} target="_blank" rel="noopener noreferrer" style={{color:'#ffe066', textDecoration:'underline', fontWeight:600}}>View</a> : <span style={{color:'#ff7f7f'}}>Not uploaded</span>}</div>
          <button onClick={() => handleEdit(index)} style={{background:'#003366', color:'#fff', border:'none', borderRadius:10, padding:'0.9rem 2.5rem', fontWeight:800, fontSize:'1.15rem', cursor:'pointer', marginBottom:22, boxShadow:'0 2px 8px 0 rgba(0,0,0,0.10)', transition:'background 0.2s'}}>
            Edit
          </button>
          <div style={{marginTop:8, color:'#ffe066', fontWeight:700, fontSize:'1.15rem', textAlign:'center', letterSpacing:0.5}}>
            <i className="fa fa-user-plus" style={{marginRight:8, color:'#ffe066'}}></i>
            Now add authors for this paper.
          </div>
        </div>
        ))
      }
      </div>
      </div>
    );
  }

  return (
    <div className="paper-form-container" style={{position: 'relative'}}>
      {editMode ? <button
          onClick={() => setEditMode(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#b3c6e0',
            fontSize: '50px',
            fontWeight: 10,
            lineHeight: 1,
            padding: '4px',
            transition: 'color 0.2s ease',
            position: 'absolute',
            top: '16px',
            left: '16px'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#375a7f";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#b3c6e0';
          }}
        >
          ×
      </button> : <></>}
      <h3 className="add-paper-title" style={{textTransform: 'uppercase', letterSpacing: 1.5}}>{editMode ? 'EDIT PAPER' : 'ADD PAPER'}</h3>
      <form onSubmit={editMode ? (e) => { e.preventDefault(); handleSave(editIndex); } : handleSubmit} className="paper-form" autoComplete="off" style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 18}}>
        <div style={{width: '100%'}}>
          <label htmlFor="paper_title" style={{width: '100%', color: '#b3c6e0', fontWeight: 600, marginBottom: 6, fontSize: '1.08rem', letterSpacing: 0.5, display: 'block', paddingBottom: 6}}>
            Paper Title <span style={{color: 'red'}}>*</span>
          </label>
          <input
            type="text"
            id="paper_title"
            name="paper_title"
            placeholder="Enter the paper title"
            value={form.paper_title}
            onChange={handleChange}
            required
            style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}}
          />
        </div>
        <div style={{width: '100%'}}>
          <label htmlFor="track_id" style={{width: '100%', color: '#b3c6e0', fontWeight: 600, marginBottom: 6, fontSize: '1.08rem', letterSpacing: 0.5, display: 'block', paddingBottom: 6}}>
            Track / Category <span style={{color: 'red'}}>*</span>
          </label>
          <select
            id="track_id"
            name="track_id"
            value={form.track_id}
            onChange={handleChange}
            required
            style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}}
          >
            <option value="">Select Track</option>
            {tracks.map((track) => (
              <option key={track.track_id} value={track.track_id}>
                {track.track_name || track.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{width: '100%'}}>
          <label htmlFor="num_pages" style={{width: '100%', color: '#b3c6e0', fontWeight: 600, marginBottom: 6, fontSize: '1.08rem', letterSpacing: 0.5, display: 'block', paddingBottom: 6}}>
            Number of Pages <span style={{color: 'red'}}>*</span>
          </label>
          <input
            type="number"
            id="num_pages"
            name="num_pages"
            placeholder="Number of Pages (1-8)"
            value={form.num_pages}
            onChange={handleChange}
            min={1}
            max={8}
            required
            style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}}
          />
        </div>
        <div style={{width: '100%'}}>
          <label htmlFor="presentation_mode" style={{width: '100%', color: '#b3c6e0', fontWeight: 600, marginBottom: 6, fontSize: '1.08rem', letterSpacing: 0.5, display: 'block', paddingBottom: 6}}>
            Presentation Mode <span style={{color: 'red'}}>*</span>
          </label>
          <select
            id="presentation_mode"
            name="presentation_mode"
            value={form.presentation_mode}
            onChange={handleChange}
            required
            style={{width: '100%', boxSizing: 'border-box', padding: '1.1rem', borderRadius: 8, border: '1.5px solid #375a7f', fontSize: '1.1rem', background: '#001a33', color: '#fff'}}
          >
            <option value="In-person">In-person</option>
            <option value="Online">Online</option>
          </select>
        </div>
        <div style={{width: '100%'}}>
          <label htmlFor="paper_attached" style={{width: '100%', color: '#b3c6e0', fontWeight: 600, marginBottom: 6, fontSize: '1.08rem', letterSpacing: 0.5, display: 'block', paddingBottom: 6}}>
            Attach Paper (PDF) <span style={{color: 'red'}}>*</span>
          </label>
          <div style={{width: '100%', marginBottom: 0}}>
            <input
              type="file"
              id="paper_attached"
              name="paper_attached"
              accept="application/pdf"
              onChange={handleChange}
              required
              style={{display: 'none'}}
            />
            <label htmlFor="paper_attached" style={{
              display: 'inline-block',
              background: '#375a7f',
              color: '#fff',
              padding: '0.6rem 1.2rem',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              marginRight: 12,
              transition: 'background 0.2s',
              border: uploading ? '2px solid #7fff7f' : '2px solid #375a7f',
              opacity: uploading ? 0.7 : 1
            }}>
              {uploading ? 'Uploading...' : (fileName ? 'Change File' : 'Select PDF File')}
            </label>
            {fileName && (
              <span style={{color:'#7fff7f', fontWeight:600, fontSize:14}}>
                <i className="fa fa-file-pdf-o" style={{marginRight:4, color:'#ff7f7f'}}></i>{fileName}
              </span>
            )}
          </div>
        </div>
        <button type="submit" disabled={!isFormValid} style={{width: '100%', background:'#003366', color:'#fff', border:'none', borderRadius:10, padding:'0.9rem 0', fontWeight:800, fontSize:'1.15rem', cursor:'pointer', marginBottom:12, boxShadow:'0 2px 8px 0 rgba(0,0,0,0.10)', transition:'background 0.2s'}}>
          {uploading ? (editMode ? "Saving..." : "Submitting...") : (editMode ? "Save Changes" : "Submit Paper")}
        </button>
        {success && <div className="paper-success">{success}</div>}
        {error && <div className="paper-error">{error}</div>}
      </form>
      <div style={{color:'#b3c6e0', fontSize:'0.95em', marginTop:16, textAlign:'left', width:'100%'}}>
        <ul style={{margin:0, paddingLeft:18}}>
          <li>Fields marked <span style={{color:'red'}}>*</span> are required.</li>
          <li>PDF must be in the correct format.</li>
          <li>After submission, you can add authors for this paper.</li>
        </ul>
      </div>
    </div>
  );
}
