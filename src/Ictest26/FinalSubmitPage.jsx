import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaperSelectionModal from "./components/PaperSelectionModal";
import LoadingSpinner from "./components/LoadingSpinner";

export default function FinalSubmitPage() {
  const [finalSubmitted, setFinalSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paperId, setPaperId] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [regCats, setRegCats] = useState([]);
  const [modal, setModal] = useState(false);
  const [papers, setPapers] = useState(null);

  useEffect(() => {
    const fetchPaperId = async () => {
      const email = localStorage.getItem("ictest26_user");
      if (!email) {
        setLoading(false); 
        return;
      }
      const { data: loginData } = await window.supabase
        .from("login")
        .select("login_id")
        .eq("email", email)
        .single();
      if (loginData) {
        const { data: paperData } = await window.supabase
          .from("paper")
          .select("paper_id, paper_title")
          .eq("login_id", loginData.login_id);
        if (paperData) {
          setPapers(paperData);
          if (paperData.length === 1) {
            setPaperId(paperData[0].paper_id);
          } else {
            setModal(true);
            setLoading(false); 
          }
        } else {
          setLoading(false); 
        }
      } else {
        setLoading(false); 
      }
    };
    fetchPaperId();
  }, []);

  useEffect(() => {
    const fetchFinalSubmit = async () => {
      if (!paperId) return;
      const { data, error } = await window.supabase
        .from("paper")
        .select("final_submit")
        .eq("paper_id", paperId)
        .single();
      if (!error && data && data.final_submit) setFinalSubmitted(true);
      setLoading(false);
    };
    if (paperId) fetchFinalSubmit();
  }, [paperId]);

  // Fetch registration categories for lookup
  useEffect(() => {
    const fetchRegCats = async () => {
      const { data, error } = await window.supabase.from("registrationcategory").select("reg_cat_id, category_name");
      if (!error && data) setRegCats(data);
      else setRegCats([]);
    };
    fetchRegCats();
  }, []);

  // Fetch authors for this paper
  useEffect(() => {
    const fetchAuthors = async () => {
      setAuthorsLoading(true);
      if (!paperId) {
        setAuthors([]);
        setAuthorsLoading(false);
        return;
      }
      const { data, error } = await window.supabase
        .from("author")
        .select("author_id, salutation, author_name, email_id, mob_no, reg_cat_id, is_primary_author, is_presenter")
        .eq("paper_id", paperId)
        .order("author_id", { ascending: true });
      if (!error && data) setAuthors(data);
      else setAuthors([]);
      setAuthorsLoading(false);
    };
    if (paperId) fetchAuthors();
    else {
      setAuthors([]);
      setAuthorsLoading(false);
    }
  }, [paperId]);

  const handleFinalSubmit = async () => {
    if (!paperId) {
      alert('No paper selected');
      return;
    }
    if (!window.confirm('Are you sure? After final submit, you cannot add or edit authors.')) return;
    
    try {
      const { data, error } = await window.supabase
        .from("paper")
        .update({ final_submit: true })
        .eq("paper_id", paperId);
      
      if (error) {
        alert(`Error submitting paper: ${error.message}. Please try again.`);
        console.error('Final submit error details:', error);
        return;
      }
      
      setFinalSubmitted(true);
    } catch (err) {
      alert(`Error submitting paper: ${err.message}. Please try again.`);
      console.error('Final submit exception:', err);
    }
  };

  if (loading) return <LoadingSpinner text={"Checking for papers..."} fullScreen={false} />
  
  if (modal) {
    return (
      <PaperSelectionModal
        papers={papers}
        setPaperId={setPaperId}
        isOpen={modal}
        onClose={setModal}
        curr={paperId}
      />
    );
  }

  return (
    <div style={{maxWidth: 900, margin: '40px auto', background: '#001a33', borderRadius: 18, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.22)', border: '2px solid #375a7f', padding: '3rem 2rem', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <h3 style={{textTransform: 'uppercase', letterSpacing: 1.5, color: '#fff', fontWeight: 800, fontSize: '2rem', marginBottom: 24, textShadow: '0 2px 8px #00336655'}}>Final Submit</h3>
      {/* Show author details if not final submitted */}
      {!finalSubmitted && (
        <div style={{width:'100%', marginBottom: 28, background:'#00224d', borderRadius:10, padding:'1.2rem 1rem', border:'1.5px solid #375a7f'}}>
          <div style={{fontWeight:700, fontSize:'1.13rem', marginBottom:10, color:'#ffe066'}}>Author Details</div>
          {authorsLoading ? (
            <div style={{color:'#fff'}}>Loading authors...</div>
          ) : (
            <>
              <table style={{width:'100%', color:'#fff', fontSize:'1.05rem', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid #375a7f'}}>
                    <th style={{textAlign:'left', padding:'4px 8px'}}>#</th>
                    <th style={{textAlign:'left', padding:'4px 8px'}}>Name</th>
                    <th style={{textAlign:'left', padding:'4px 8px'}}>Email</th>
                    <th style={{textAlign:'left', padding:'4px 8px'}}>Mobile</th>
                    <th style={{textAlign:'left', padding:'4px 8px'}}>Reg. Category</th>
                    <th style={{textAlign:'left', padding:'4px 8px'}}>Primary</th>
                    <th style={{textAlign:'left', padding:'4px 8px'}}>Presenter</th>
                  </tr>
                </thead>
                <tbody>
                  {authors.length === 0 ? (
                    <tr><td colSpan={7} style={{textAlign:'center', color:'#ffb347', padding:'10px'}}>No authors added yet.</td></tr>
                  ) : (
                    authors.map((a, idx) => (
                      <tr key={a.author_id} style={{borderBottom:'1px solid #375a7f'}}>
                        <td style={{padding:'4px 8px'}}>{idx+1}</td>
                        <td style={{padding:'4px 8px'}}>{a.salutation} {a.author_name}</td>
                        <td style={{padding:'4px 8px'}}>{a.email_id}</td>
                        <td style={{padding:'4px 8px'}}>{a.mob_no}</td>
                        <td style={{padding:'4px 8px'}}>{(regCats.find(r => String(r.reg_cat_id) === String(a.reg_cat_id)) || {}).category_name || a.reg_cat_id}</td>
                        <td style={{padding:'4px 8px', textAlign:'center'}}>{a.is_primary_author ? '✔️' : ''}</td>
                        <td style={{padding:'4px 8px', textAlign:'center'}}>{a.is_presenter ? '✔️' : ''}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div style={{marginTop:10, color:'#ffe066', fontSize:'0.98rem'}}>If you need to make changes, go back and edit before final submit.</div>
            </>
          )}
        </div>
      )}
      {finalSubmitted ? (
        <div style={{width:'100%', background:'#001a33', color:'#fff', borderRadius:10, padding:'1.5rem', textAlign:'center', fontWeight:600, fontSize:'1.15rem', boxShadow:'0 2px 8px 0 rgba(0,0,0,0.10)', border:'1.5px solid #375a7f'}}>
          <div style={{fontSize:'1.15rem', marginBottom:8}}>Final submission completed.</div>
          <div style={{marginTop:10}}>No more add or edit of authors is possible.</div>
          <div style={{marginTop:18}}>Waiting for admin approval...</div>
        </div>
      ) : (
        <>
          <div style={{marginBottom:24, color:'#fff', fontSize:'1.1rem', textAlign:'center', background:'#001a33', borderRadius:10, padding:'1.2rem 1rem', border:'1.5px solid #375a7f'}}>
            <b>Instructions:</b><br/>
            <ul style={{textAlign:'left', margin:'12px 0 0 0', paddingLeft:22, color:'#fff', fontSize:'1.05rem', lineHeight:1.7}}>
              <li>Review all author details carefully before proceeding. Once you click <b>Final Submit</b>, <span style={{color:'#ffb347'}}>no further changes</span> can be made to the author list.</li>
              <li>Ensure that all required documents (such as proof of registration category) are uploaded for each author.</li>
              <li>After final submission, your author list will be locked and sent for admin approval.</li>
              <li>If you need to make corrections, do so <b>before</b> clicking Final Submit.</li>
              <li>Once submitted, you will see a confirmation and a message indicating you are waiting for admin approval.</li>
            </ul>
          </div>
          <button
        onClick={() => setModal(true)}
        style={{
          width: "100%",
          background: "#003366",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "0.9rem 0",
          fontWeight: 800,
          fontSize: "1.15rem",
          cursor: "pointer",
          marginBottom: 12,
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
          transition: "background 0.2s",
        }}
      >
        Select paper
      </button>
          <button onClick={handleFinalSubmit} style={{width: '100%', background:'linear-gradient(90deg,#28a745 60%,#218838 100%)', color:'#fff', border:'none', borderRadius:12, padding:'1.1rem 0', fontWeight:900, fontSize:'1.18rem', cursor:'pointer', marginTop:18, marginBottom:12, boxShadow:'0 2px 8px 0 rgba(0,0,0,0.10)', transition:'background 0.2s', letterSpacing:1}}>Final Submit</button>
        </>
      )}
    </div>
  );
}
