import React, { useEffect, useState } from "react";
import "./Payments.css";
import jsPDF from "jspdf";

export default function Payments() {
  const [paperId, setPaperId] = useState(null);
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [regCats, setRegCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState({
    totalAmount: 0,
    breakdown: [],
    currency: "INR"
  });
  const [paymentStatus, setPaymentStatus] = useState({
    isPaid: false,
    paymentId: null,
    paymentDate: null,
    paymentMethod: null
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Remove hardcoded category fees since we'll use database fees
  // Registration fees are now fetched from the database

  // Additional fees (keep these as they might not be in the database)
  const additionalFees = {
    "accommodation": 1500,
    "banquet": 800,
    "kit": 500
  };

  useEffect(() => {
    const fetchPapers = async () => {
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
          .select("paper_id, paper_title, created_at")
          .eq("login_id", loginData.login_id)
          .order("paper_id", { ascending: true });
        if (paperData && paperData.length > 0) {
          setPapers(paperData);
          // Set the first paper as default selected
          setSelectedPaper(paperData[0]);
          setPaperId(paperData[0].paper_id);
        }
      }
      setLoading(false);
    };
    fetchPapers();
  }, []);

  // Fetch registration categories for lookup
  useEffect(() => {
    const fetchRegCats = async () => {
      const { data, error } = await window.supabase
        .from("registrationcategory")
        .select("reg_cat_id, category_name, fee, currency");
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
        .select("author_id, salutation, author_name, email_id, reg_cat_id, is_attending_at_venue, is_primary_author")
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

  // Fetch paper details including page count
  useEffect(() => {
    const fetchPaperDetails = async () => {
      if (!paperId) return;
      const { data, error } = await window.supabase
        .from("paper")
        .select("num_pages")
        .eq("paper_id", paperId)
        .single();
      if (!error && data) {
        setSelectedPaper(prev => ({...prev, num_pages: data.num_pages}));
      }
    };
    if (paperId) fetchPaperDetails();
  }, [paperId]);

  // Calculate payment details when authors or regCats change
  useEffect(() => {
    if (authors.length === 0 || regCats.length === 0) {
      setPaymentDetails({ totalAmount: 0, breakdown: [], currency: "INR" });
      return;
    }

    console.log('Authors data:', authors); // Debug log
    console.log('RegCats data:', regCats); // Debug log
    console.log('Selected paper:', selectedPaper); // Debug log

    const breakdown = [];
    let totalAmountINR = 0;
    let totalAmountUSD = 0;
    let hasForeignDelegate = false;

    // Find the primary author first
    const primaryAuthor = authors.find(author => 
      author.is_primary_author === true || 
      author.is_primary_author === 'true' || 
      author.is_primary_author === 1
    );

    // Calculate page charges
    const pageCount = selectedPaper?.num_pages || 0;
    let pageCharges = 0;
    let pageChargeDetails = "";
    
    if (pageCount > 6) {
      const extraPages = Math.min(pageCount - 6, 2); // Maximum 2 extra pages (up to 8 total)
      pageCharges = extraPages * 500;
      pageChargeDetails = `Pages 7-${Math.min(pageCount, 8)}: ${extraPages} × ₹500`;
    }

    // Add page charges to breakdown if applicable
    if (pageCharges > 0) {
      breakdown.push({
        authorName: "Page Charges",
        category: `Extra Pages (${pageChargeDetails})`,
        fee: pageCharges,
        currency: "INR",
        isPrimary: false,
        isPageCharge: true
      });
      totalAmountINR += pageCharges;
    }

    // Process all authors to find who pays what
    authors.forEach((author, index) => {
      const regCat = regCats.find(cat => String(cat.reg_cat_id) === String(author.reg_cat_id));
      const categoryName = regCat ? regCat.category_name : "Unknown";
      
      // Handle different boolean representations for is_primary_author and is_attending_at_venue
      const isPrimary = author.is_primary_author === true || 
                       author.is_primary_author === 'true' || 
                       author.is_primary_author === 1;
      
      const isAttending = author.is_attending_at_venue === true || 
                         author.is_attending_at_venue === 'true' || 
                         author.is_attending_at_venue === 1;
      
      console.log(`Author ${author.author_name}: isPrimary = ${isPrimary}, isAttending = ${isAttending}`);
      
      let fee = 0;
      let currency = "INR";
      let shouldInclude = false;
      let chargeDescription = "";

      if (isPrimary) {
        // Primary author always pays registration fee (regardless of attendance)
        if (regCat) {
          fee = Number(regCat.fee);
          currency = regCat.currency;
          shouldInclude = true;
          chargeDescription = categoryName;
        }
      } else if (isAttending) {
        // Co-authors only pay if they are attending at venue (₹1000)
        fee = 1000;
        currency = "INR";
        shouldInclude = true;
        chargeDescription = "Co-author Attendance Fee";
      }

      // Only add to breakdown if there's a charge
      if (shouldInclude && fee > 0) {
        if (currency === "USD") {
          hasForeignDelegate = true;
          totalAmountUSD += fee;
        } else {
          totalAmountINR += fee;
        }

        breakdown.push({
          authorName: `${author.salutation} ${author.author_name}`,
          category: chargeDescription,
          fee: fee,
          currency: currency,
          isPrimary: isPrimary,
          isPageCharge: false
        });
      }
    });

    console.log('Payment breakdown:', breakdown); // Debug log

    // Check if there are any charges at all (from authors or page charges)
    if (breakdown.length === 0) {
      setPaymentDetails({ 
        totalAmount: 0, 
        breakdown: [], 
        currency: "INR",
        pageCharges: 0,
        pageDetails: "",
        pageCount: pageCount
      });
      return;
    }

    // Determine the main currency and total
    let mainCurrency = "INR";
    let mainTotal = totalAmountINR;
    
    if (hasForeignDelegate && totalAmountINR === 0) {
      mainCurrency = "USD";
      mainTotal = totalAmountUSD;
    } else if (hasForeignDelegate) {
      mainCurrency = "Mixed";
      mainTotal = totalAmountINR;
    }

    setPaymentDetails({
      totalAmount: mainTotal,
      totalAmountUSD: totalAmountUSD,
      breakdown,
      currency: mainCurrency,
      hasForeignDelegate,
      pageCharges: pageCharges,
      pageDetails: pageChargeDetails,
      pageCount: pageCount
    });
  }, [authors, regCats, selectedPaper]);

  // Check for existing payments
  useEffect(() => {
    const checkExistingPayment = async () => {
      if (!paperId) return;
      
      try {
        const { data, error } = await window.supabase
          .from('payments')
          .select('payment_id, amount, currency, payment_method, payment_date, payment_status')
          .eq('paper_id', paperId)
          .eq('payment_status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const payment = data[0];
          setPaymentStatus({
            isPaid: true,
            paymentId: payment.payment_id,
            paymentDate: payment.payment_date,
            paymentMethod: payment.payment_method
          });
        }
      } catch (error) {
        console.error('Error checking existing payments:', error);
      }
    };

    if (paperId) checkExistingPayment();
  }, [paperId]);

  const generatePaymentId = () => {
    return `ICTEST26_${paperId}_${Date.now()}`;
  };

  const handlePayment = () => {
    setShowPaymentForm(true);
  };

  const processPayment = async (paymentMethod) => {
    // Here you would integrate with your payment gateway
    // For now, we'll simulate a successful payment
    const paymentId = generatePaymentId();
    
    // Simulate payment processing
    setTimeout(async () => {
      const newPaymentStatus = {
        isPaid: true,
        paymentId: paymentId,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: paymentMethod
      };
      
      setPaymentStatus(newPaymentStatus);
      setShowPaymentForm(false);
      
      // Save payment to database
      try {
        const { data: paymentData, error: paymentError } = await window.supabase
          .from('payments')
          .insert({
            payment_id: paymentId,
            paper_id: paperId,
            amount: paymentDetails.totalAmount,
            currency: paymentDetails.currency === 'Mixed' ? 'INR' : paymentDetails.currency,
            payment_method: paymentMethod,
            payment_date: new Date().toISOString().split('T')[0],
            payment_status: 'completed'
          });

        if (!paymentError) {
          // Save individual payment items
          const paymentItems = paymentDetails.breakdown.map(item => ({
            payment_id: paymentId,
            author_id: authors.find(a => `${a.salutation} ${a.author_name}` === item.authorName)?.author_id,
            category: item.category,
            amount: item.fee,
            currency: item.currency
          }));

          await window.supabase
            .from('payment_items')
            .insert(paymentItems);

          console.log('Payment saved to database successfully');
        }
      } catch (error) {
        console.error('Error saving payment to database:', error);
        // Payment still succeeds even if database save fails
      }
      
      alert(`Payment successful!\nPayment ID: ${paymentId}\nAmount: ${paymentDetails.totalAmount} ${paymentDetails.currency}`);
    }, 2000);
  };

  // Generate Invoice PDF with NOT PAID watermark
  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ICTEST 2026 - Registration Invoice", 15, 20);
    doc.setFontSize(12);
    doc.text(`Paper ID: ${paperId || "-"}`, 15, 32);
    doc.text(`Paper Title: ${selectedPaper?.paper_title || "-"}`, 15, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 48);
    doc.text("Status: NOT PAID", 15, 56);

    // Watermark
    doc.setTextColor(220, 53, 69);
    doc.setFontSize(50);
    doc.text("NOT PAID", 35, 130, { angle: 30, opacity: 0.2 });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    let y = 68;
    doc.text("Author Payment Breakdown:", 15, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Author", 15, y);
    doc.text("Category", 70, y);
    doc.text("Role", 120, y);
    doc.text("Fee", 160, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 7;
    paymentDetails.breakdown.forEach((item) => {
      doc.text(item.authorName, 15, y);
      doc.text(item.category, 70, y);
      doc.text(item.isPrimary ? "Primary" : "Co-author", 120, y);
      doc.text(`${item.currency} ${item.fee.toLocaleString()}`, 160, y, { align: "right" });
      y += 7;
    });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total: ${paymentDetails.currency === "USD" ? "$" : "₹"}${paymentDetails.totalAmount.toLocaleString()}`,
      15,
      y
    );
    doc.setFont("helvetica", "normal");
    y += 10;
    doc.text("* This invoice is system generated and valid for payment at ICTEST 2026.", 15, y);
    y += 7;
    doc.text("* Please pay before the conference deadline.", 15, y);
    y += 7;
    doc.text("* This invoice is not valid as a receipt until payment is completed.", 15, y);
    doc.save(`ICTEST2026_Invoice_Paper${paperId || ""}.pdf`);
  };

  // Handle paper selection change
  const handlePaperChange = (event) => {
    const selectedPaperId = parseInt(event.target.value);
    const paper = papers.find(p => p.paper_id === selectedPaperId);
    setSelectedPaper(paper);
    setPaperId(selectedPaperId);
    
    // Reset payment status when changing papers
    setPaymentStatus({
      isPaid: false,
      paymentId: null,
      paymentDate: null,
      paymentMethod: null
    });
  };

  if (loading) {
    return (
      <div style={{color:'#fff', textAlign:'center', marginTop:40}}>
        Loading payment information...
      </div>
    );
  }

  if (!paperId || papers.length === 0) {
    return (
      <div style={{maxWidth: 800, margin: '40px auto', background: '#001a33', borderRadius: 18, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.22)', border: '2px solid #375a7f', padding: '3rem 2rem', color: '#fff', textAlign: 'center'}}>
        <h3 style={{color: '#ffb347', marginBottom: 20}}>No Papers Found</h3>
        <p>Please add a paper first before proceeding with payment.</p>
      </div>
    );
  }

  return (
    <div style={{maxWidth: 1000, margin: '40px auto', background: '#001a33', borderRadius: 18, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.22)', border: '2px solid #375a7f', padding: '3rem 2rem', color: '#fff'}}>
      <h3 style={{textTransform: 'uppercase', letterSpacing: 1.5, color: '#fff', fontWeight: 800, fontSize: '2rem', marginBottom: 24, textShadow: '0 2px 8px #00336655', textAlign: 'center'}}>
        Registration Payment
      </h3>

      {/* Paper Selection */}
      {papers.length > 1 && (
        <div style={{marginBottom: 32, background:'#00224d', borderRadius:12, padding:'1.5rem', border:'1.5px solid #375a7f'}}>
          <h4 style={{fontWeight:700, fontSize:'1.15rem', marginBottom:12, color:'#ffe066'}}>
            Select Paper for Payment
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
        <div style={{marginBottom: 32, background:'#00224d', borderRadius:12, padding:'1.5rem', border:'1.5px solid #375a7f'}}>
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

      {/* Payment Status Display */}
      {paymentStatus.isPaid && (
        <div style={{marginBottom: 32, background:'#28a745', borderRadius:12, padding:'1.5rem', border:'2px solid #218838'}}>
          <h4 style={{fontWeight:700, fontSize:'1.25rem', marginBottom:12, color:'#fff', textAlign:'center'}}>
            ✅ Payment Completed
          </h4>
          <div style={{background:'#fff', borderRadius:8, padding:'1rem', color:'#333'}}>
            <div style={{marginBottom:8}}><strong>Payment ID:</strong> {paymentStatus.paymentId}</div>
            <div style={{marginBottom:8}}><strong>Amount:</strong> ₹{paymentDetails.totalAmount.toLocaleString()}</div>
            <div style={{marginBottom:8}}><strong>Payment Date:</strong> {paymentStatus.paymentDate}</div>
            <div><strong>Payment Method:</strong> {paymentStatus.paymentMethod}</div>
          </div>
        </div>
      )}

      {authorsLoading ? (
        <div style={{color:'#fff', textAlign:'center'}}>Loading authors...</div>
      ) : (
        <>
          {/* Author Payment Breakdown */}
          <div style={{marginBottom: 32, background:'#00224d', borderRadius:12, padding:'1.5rem', border:'1.5px solid #375a7f'}}>
            <h4 style={{fontWeight:700, fontSize:'1.25rem', marginBottom:16, color:'#ffe066'}}>
              Payment Breakdown
            </h4>
            
            {paymentDetails.breakdown.length === 0 ? (
              <div>
                <div style={{color:'#ffb347', textAlign:'center', padding:'20px', marginBottom:'20px'}}>
                  No charges found for this paper. The primary author must have a registration category, and co-authors will only be charged if attending at venue.
                </div>
                
                {/* Debug Information */}
                {authors.length > 0 && (
                  <div style={{background:'#001a33', borderRadius:8, padding:'1rem', marginBottom:'20px'}}>
                    <h5 style={{color:'#ffe066', marginBottom:'12px', fontSize:'1rem'}}>📋 Debug Information:</h5>
                    <div style={{fontSize:'0.9rem', color:'#b3c6e0'}}>
                      <div style={{marginBottom:'8px'}}><strong>Total Authors:</strong> {authors.length}</div>
                      <div style={{marginBottom:'12px'}}><strong>Authors List:</strong></div>
                      {authors.map((author, index) => (
                        <div key={index} style={{marginLeft:'20px', marginBottom:'8px', lineHeight:'1.4'}}>
                          <div><strong>{author.salutation} {author.author_name}</strong></div>
                          <div style={{fontSize:'0.8rem', color:'#9aa8b8'}}>
                            • Attending venue: <span style={{color: author.is_attending_at_venue ? '#28a745' : '#dc3545'}}>{String(author.is_attending_at_venue)}</span><br/>
                            • Primary author: <span style={{color: author.is_primary_author ? '#28a745' : '#6c757d'}}>{String(author.is_primary_author)}</span><br/>
                            • Registration category ID: {author.reg_cat_id || 'Not set'}
                          </div>
                        </div>
                      ))}
                      <div style={{marginTop:'12px', padding:'8px', background:'rgba(255, 179, 71, 0.1)', borderRadius:'4px', fontSize:'0.8rem'}}>
                        💡 Payment Rules: Primary author always pays registration fee. Co-authors pay ₹1000 only if "Attending at venue" is checked.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{overflowX: 'auto'}}>
                <table style={{width:'100%', color:'#fff', fontSize:'1.05rem', borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{borderBottom:'2px solid #375a7f'}}>
                      <th style={{textAlign:'left', padding:'12px 8px', color:'#ffe066'}}>Author Name</th>
                      <th style={{textAlign:'left', padding:'12px 8px', color:'#ffe066'}}>Registration Category</th>
                      <th style={{textAlign:'center', padding:'12px 8px', color:'#ffe066'}}>Role</th>
                      <th style={{textAlign:'right', padding:'12px 8px', color:'#ffe066'}}>Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentDetails.breakdown.map((item, index) => (
                      <tr key={index} style={{borderBottom:'1px solid #375a7f', background: item.isPrimary ? 'rgba(255, 227, 102, 0.1)' : 'transparent'}}>
                        <td style={{padding:'12px 8px'}}>
                          {item.authorName}
                          {item.isPrimary && <span style={{color:'#ffe066', fontSize:'0.8rem', marginLeft:'8px'}}>⭐</span>}
                        </td>
                        <td style={{padding:'12px 8px'}}>{item.category}</td>
                        <td style={{padding:'12px 8px', textAlign:'center', fontSize:'0.9rem'}}>
                          {item.isPrimary ? (
                            <span style={{color:'#ffe066', fontWeight:'600'}}>Primary</span>
                          ) : (
                            <span style={{color:'#b3c6e0'}}>Co-author</span>
                          )}
                        </td>
                        <td style={{padding:'12px 8px', textAlign:'right', fontWeight:'600'}}>
                          {item.currency} {item.fee.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          {paymentDetails.breakdown.length > 0 && (
            <div style={{marginBottom: 32, background:'#001a33', borderRadius:12, padding:'1.5rem', border:'2px solid #28a745'}}>
              <h4 style={{fontWeight:700, fontSize:'1.25rem', marginBottom:16, color:'#28a745'}}>
                Payment Summary
              </h4>
              
              {paymentDetails.hasForeignDelegate ? (
                <div>
                  <div style={{fontSize:'1.1rem', marginBottom:8}}>
                    <strong>INR Total:</strong> ₹{paymentDetails.totalAmount.toLocaleString()}
                  </div>
                  <div style={{fontSize:'1.1rem', marginBottom:8}}>
                    <strong>USD Total:</strong> ${paymentDetails.totalAmountUSD ? paymentDetails.totalAmountUSD.toLocaleString() : '0'}
                  </div>
                  <div style={{fontSize:'0.9rem', color:'#ffe066', marginTop:12}}>
                    * Foreign delegate fees to be paid separately in USD
                  </div>
                </div>
              ) : (
                <div style={{fontSize:'1.2rem', fontWeight:'700'}}>
                  <strong>Total Amount: {paymentDetails.currency === 'USD' ? '$' : '₹'}{paymentDetails.totalAmount.toLocaleString()}</strong>
                </div>
              )}
              
              {/* Fee Structure Explanation */}
              <div style={{marginTop:16, padding:'12px', background:'rgba(255, 227, 102, 0.1)', borderRadius:8, fontSize:'0.9rem'}}>
                <div style={{color:'#ffe066', fontWeight:'600', marginBottom:4}}>💡 Fee Structure:</div>
                <div style={{color:'#fff', lineHeight:1.4}}>
                  • Primary authors pay full registration fee (based on category)<br/>
                  • Co-authors pay ₹1000 only if attending at venue<br/>
                  • Page charges: Pages 7-8 cost ₹500 per page (pages 1-6 are free)
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selection Modal */}
          {showPaymentForm && (
            <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
              <div style={{background:'#001a33', borderRadius:12, padding:'2rem', maxWidth:400, width:'90%', border:'2px solid #375a7f'}}>
                <h4 style={{color:'#ffe066', marginBottom:20, textAlign:'center'}}>Select Payment Method</h4>
                <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                  <button 
                    onClick={() => processPayment('Online Payment Gateway')}
                    style={{padding:'1rem', background:'#28a745', color:'#fff', border:'none', borderRadius:8, fontSize:'1rem', cursor:'pointer'}}
                  >
                    💳 Online Payment Gateway
                  </button>
                  <button 
                    onClick={() => processPayment('Bank Transfer')}
                    style={{padding:'1rem', background:'#007bff', color:'#fff', border:'none', borderRadius:8, fontSize:'1rem', cursor:'pointer'}}
                  >
                    🏦 Bank Transfer
                  </button>
                  <button 
                    onClick={() => processPayment('UPI Payment')}
                    style={{padding:'1rem', background:'#6f42c1', color:'#fff', border:'none', borderRadius:8, fontSize:'1rem', cursor:'pointer'}}
                  >
                    📱 UPI Payment
                  </button>
                  <button 
                    onClick={() => setShowPaymentForm(false)}
                    style={{padding:'1rem', background:'#6c757d', color:'#fff', border:'none', borderRadius:8, fontSize:'1rem', cursor:'pointer'}}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Instructions */}
          <div style={{marginBottom: 32, background:'#00224d', borderRadius:12, padding:'1.5rem', border:'1.5px solid #375a7f'}}>
            <h4 style={{fontWeight:700, fontSize:'1.15rem', marginBottom:12, color:'#ffe066'}}>
              Payment Instructions
            </h4>
            <ul style={{margin:0, paddingLeft:20, lineHeight:1.8, color:'#fff'}}>
              <li><strong>Primary authors</strong> pay full registration fee based on their category</li>
              <li><strong>Co-authors</strong> pay ₹1000 only if attending at venue (otherwise ₹0)</li>
              <li><strong>Page charges:</strong> Up to 6 pages are free; pages 7-8 cost ₹500 per page</li>
              <li>Primary author registration fee is mandatory regardless of attendance</li>
              <li>Co-authors are only charged if marked as "attending at venue"</li>
              <li>Payment should be completed before the conference deadline</li>
              <li>Foreign delegates pay in USD as per the breakdown</li>
              <li>Keep your payment receipt for conference registration</li>
            </ul>
          </div>

          {/* Download Invoice Button (before payment) */}
          {paymentDetails.breakdown.length > 0 && !paymentStatus.isPaid && (
            <div style={{textAlign:'center', marginBottom: 24}}>
              <button
                onClick={handleDownloadInvoice}
                style={{
                  background:'#ffc107',
                  color:'#222',
                  border:'none',
                  borderRadius:12,
                  padding:'1rem 2.5rem',
                  fontWeight:700,
                  fontSize:'1.1rem',
                  cursor:'pointer',
                  boxShadow:'0 2px 8px 0 rgba(255,193,7,0.15)',
                  marginBottom: 8
                }}
                onMouseOver={e => e.currentTarget.style.background = '#ffb300'}
                onMouseOut={e => e.currentTarget.style.background = '#ffc107'}
              >
                Download Invoice (NOT PAID)
              </button>
              <div style={{fontSize:'0.9rem', color:'#ffe066', marginTop:4}}>
                Download a proforma invoice before payment
              </div>
            </div>
          )}

          {/* Payment Button */}
          {paymentDetails.breakdown.length > 0 && paymentDetails.totalAmount > 0 && !paymentStatus.isPaid && (
            <div style={{textAlign:'center'}}>
              <button 
                onClick={handlePayment}
                style={{
                  background:'linear-gradient(90deg,#28a745 60%,#218838 100%)', 
                  color:'#fff', 
                  border:'none', 
                  borderRadius:12, 
                  padding:'1.2rem 3rem', 
                  fontWeight:900, 
                  fontSize:'1.18rem', 
                  cursor:'pointer', 
                  boxShadow:'0 4px 12px 0 rgba(40,167,69,0.3)', 
                  transition:'all 0.3s ease',
                  letterSpacing:1
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Proceed to Payment
              </button>
              <div style={{marginTop:12, fontSize:'0.9rem', color:'#b3c6e0'}}>
                Secure payment powered by trusted gateway
              </div>
            </div>
          )}

          {/* Bank Details for Manual Payment */}
          <div style={{marginTop: 32, background:'#00224d', borderRadius:12, padding:'1.5rem', border:'1.5px solid #375a7f'}}>
            <h4 style={{fontWeight:700, fontSize:'1.15rem', marginBottom:12, color:'#ffe066'}}>
              Bank Details for Manual Payment
            </h4>
            <div style={{background:'#001a33', borderRadius:8, padding:'1rem', fontFamily:'monospace', fontSize:'0.95rem'}}>
              <div style={{marginBottom:8}}><strong>Account Name:</strong> ICTEST 2026</div>
              <div style={{marginBottom:8}}><strong>Account Number:</strong> 1234567890</div>
              <div style={{marginBottom:8}}><strong>Bank:</strong> Sample Bank</div>
              <div style={{marginBottom:8}}><strong>IFSC Code:</strong> SAMP0001234</div>
              <div style={{marginBottom:8}}><strong>Branch:</strong> Main Branch</div>
            </div>
            <div style={{marginTop:12, fontSize:'0.9rem', color:'#ffe066'}}>
              * Please mention your Paper ID: {paperId} in payment reference
            </div>
          </div>
        </>
      )}
    </div>
  );
}
