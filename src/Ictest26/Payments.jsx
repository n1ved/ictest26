import React, { useEffect, useState } from "react";
import QR from '../registrationFees/upi.png';
import "./Payments.css";
import jsPDF from "jspdf";
import LoadingSpinner from "./components/LoadingSpinner";

export default function Payments() {
  // Supabase bucket name for payment screenshots
  const PAYMENT_BUCKET = 'payment-screenshots';
  const [userMarkedPaid, setUserMarkedPaid] = useState(false);
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
    paymentMethod: null,
    screenshotUrl: null
  });
  // Remove payment gateway modal
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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
      const userData = localStorage.getItem("ictest26_user");
      if (!userData) {
        setLoading(false);
        return;
      }
      
      let email;
      try {
        // Try parsing as JSON (new format)
        const userObj = JSON.parse(userData);
        email = userObj.email;
      } catch (error) {
        // Fall back to treating as string (legacy format)
        email = userData;
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
          .select('payment_id, amount, currency, payment_method, payment_date, payment_status, screenshot_url')
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
            paymentMethod: payment.payment_method,
            screenshotUrl: payment.screenshot_url
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

  // Remove handlePayment (no gateway)

  // Remove processPayment (no gateway)
  // Handle screenshot upload
  const handleScreenshotChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleScreenshotUpload = async () => {
    if (!screenshotFile || !paperId) return;
    setUploading(true);
    try {
      // Generate a unique filename
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `payment_${paperId}_${Date.now()}.${fileExt}`;
      const paymentId = generatePaymentId();
      
      // Upload to Supabase Storage
      const { data, error } = await window.supabase.storage
        .from(PAYMENT_BUCKET)
        .upload(fileName, screenshotFile, {
          cacheControl: '3600',
          upsert: false
        });
      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = window.supabase.storage
        .from(PAYMENT_BUCKET)
        .getPublicUrl(fileName);

      // Check if payment already exists for this paper
      const { data: existingPayment } = await window.supabase
        .from('payments')
        .select('payment_id')
        .eq('paper_id', paperId)
        .single();

      let finalPaymentId = paymentId;

      if (existingPayment) {
        // Update existing payment
        finalPaymentId = existingPayment.payment_id;
        const { error: updateError } = await window.supabase
          .from('payments')
          .update({
            amount: paymentDetails.totalAmount,
            currency: paymentDetails.currency === 'Mixed' ? 'INR' : paymentDetails.currency,
            payment_method: 'Bank Transfer / UPI',
            payment_date: new Date().toISOString().split('T')[0],
            payment_status: 'completed',
            screenshot_url: publicUrl
          })
          .eq('paper_id', paperId);
        if (updateError) throw updateError;
      } else {
        // Insert new payment
        const { error: insertError } = await window.supabase
          .from('payments')
          .insert({
            payment_id: paymentId,
            paper_id: paperId,
            amount: paymentDetails.totalAmount,
            currency: paymentDetails.currency === 'Mixed' ? 'INR' : paymentDetails.currency,
            payment_method: 'Bank Transfer / UPI',
            payment_date: new Date().toISOString().split('T')[0],
            payment_status: 'completed',
            screenshot_url: publicUrl
          });
        if (insertError) throw insertError;

        // Save individual payment items (only for new payments)
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
      }

      // Update payment status state
      setPaymentStatus({
        isPaid: true,
        paymentId: finalPaymentId,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer / UPI',
        screenshotUrl: publicUrl
      });

      setUploading(false);
      setUploadSuccess(true);
      setScreenshotFile(null);
      setUserMarkedPaid(false);
    } catch (err) {
      setUploading(false);
      alert('Error uploading screenshot: ' + (err.message || err));
    }
  };

  // Generate Invoice PDF with NOT PAID watermark
  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    
    // Header with blue background
    doc.setFillColor(0, 26, 51); // Dark blue background
    doc.rect(0, 0, 210, 40, 'F');
    
    // White text for header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("ICTEST 2026", 20, 20);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("International Conference on Testing", 20, 28);
    doc.text("Registration Invoice", 20, 37);
    
    // Reset text color to dark blue for main content
    doc.setTextColor(0, 26, 51);
    
    // Semi-transparent NOT PAID watermark (gray)
    doc.setTextColor(180, 180, 180); // Light gray color
    doc.setFontSize(50);
    doc.text("NOT PAID", 60, 150, { angle: 30, opacity: 0.15 });
    doc.setTextColor(0, 26, 51); // Reset to dark blue
    
    // Invoice details section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details:", 20, 55);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 67);
    doc.text(`Paper ID: ${paperId || "-"}`, 20, 75);
    
    // Handle long paper titles by wrapping
    const paperTitle = selectedPaper?.paper_title || "-";
    if (paperTitle.length > 50) {
      const firstLine = paperTitle.substring(0, 50);
      const secondLine = paperTitle.substring(50, 100);
      doc.text(`Paper Title: ${firstLine}`, 20, 83);
      if (secondLine) {
        doc.text(`${secondLine}`, 20, 91);
      }
    } else {
      doc.text(`Paper Title: ${paperTitle}`, 20, 83);
    }
    
    // Right side invoice info
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice #: ICT26-${paperId}-${Math.floor(Math.random() * 1000000)}`, 130, 67);
    doc.text("Status: PENDING", 130, 75);
    
    // Registration details section
    let currentY = paperTitle.length > 50 ? 105 : 97;
    doc.setFont("helvetica", "bold");
    doc.text("Registration Details:", 20, currentY);
    
    // Table header with background
    currentY += 12;
    doc.setFillColor(56, 90, 127); // Blue header background
    doc.rect(20, currentY, 170, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Author Name", 25, currentY + 6);
    doc.text("Role", 80, currentY + 6);
    doc.text("Category", 105, currentY + 6);
    doc.text("Fee", 155, currentY + 6);
    doc.text("Currency", 175, currentY + 6);
    
    // Table content
    doc.setTextColor(0, 26, 51);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    currentY += 16;
    paymentDetails.breakdown.forEach((item, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, currentY - 4, 170, 8, 'F');
      }
      
      doc.text(item.authorName, 25, currentY);
      doc.text(item.isPageCharge ? "-" : (item.isPrimary ? "Primary" : "Co-author"), 80, currentY);
      
      // Handle long category names by wrapping or truncating
      const category = item.category.length > 25 ? item.category.substring(0, 25) + "..." : item.category;
      doc.text(category, 105, currentY);
      
      doc.text(String(item.fee.toFixed(2)), 155, currentY);
      doc.text(item.currency, 175, currentY);
      currentY += 8;
    });
    
    // Total section with line
    currentY += 5;
    doc.setLineWidth(0.5);
    doc.line(20, currentY, 190, currentY);
    currentY += 10;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const totalAmount = String(paymentDetails.totalAmount);
    doc.text(`Total: Rs ${totalAmount}`, 130, currentY);
    
    // Payment instructions
    currentY += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Payment Instructions:", 20, currentY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    currentY += 10;
    doc.text("• Registration fee is mandatory for all attending authors", 25, currentY);
    currentY += 8;
    doc.text("• Primary authors pay full registration fee based on their category", 25, currentY);
    currentY += 8;
    doc.text("• Co-authors pay ₹1000 only if attending at venue", 25, currentY);
    currentY += 8;
    doc.text("• Payment should be completed before the conference deadline", 25, currentY);
    currentY += 8;
    doc.text("• Keep this invoice for your records", 25, currentY);
    currentY += 8;
    doc.text("• For payment queries, contact: support@ictest.in", 25, currentY);
    
    // Important note section
    currentY += 15;
    doc.setFillColor(255, 249, 196); // Light yellow background
    doc.rect(20, currentY - 5, 170, 20, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Important Note:", 25, currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    currentY += 8;
    doc.text("This is a proforma invoice for payment purposes. It will be replaced with an", 25, currentY);
    currentY += 6;
    doc.text("official receipt upon successful payment completion.", 25, currentY);
    
    // Footer
    currentY += 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("Generated by ICTEST 2026 Payment System", 20, currentY);
    currentY += 5;
    doc.text(`Generated on: ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`, 20, currentY);
    currentY += 5;
    doc.text("For queries, contact: support@ictest.in", 20, currentY);
    
    doc.save(`ICTEST2026_Invoice_Paper${paperId || ""}_PENDING.pdf`);
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
      paymentMethod: null,
      screenshotUrl: null
    });
  };

  if (loading) {
    return (
      <LoadingSpinner
        text={"Loading payment information..."}
        fullScreen={false}
      />
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
    <div style={{maxWidth: window.innerWidth <= 768 ? 250 : 1000, margin: '40px auto', background: '#001a33', borderRadius: 18, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.22)', border: '2px solid #375a7f', padding: '3rem 2rem', color: '#fff'}}>
      <h3 style={{textTransform: 'uppercase', letterSpacing: 1.5, color: '#fff', fontWeight: 800, fontSize: '2rem', marginBottom: 24, textShadow: '0 2px 8px #00336655', textAlign: 'center'}}>
        Registration Payment
      </h3>

      {/* Paper Selection */}
      {papers.length > 1 && (
        <div style={{marginBottom: 32, background:'#00224d', borderRadius:12, padding: window.innerWidth <= 768 ? '1rem' : '1.5rem', border:'1.5px solid #375a7f'}}>
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
            <div style={{marginBottom:8, wordBreak:'break-all', overflowWrap:'break-word'}}><strong>Payment ID:</strong> {paymentStatus.paymentId}</div>
            <div style={{marginBottom:8}}><strong>Amount:</strong> ₹{paymentDetails.totalAmount.toLocaleString()}</div>
            <div style={{marginBottom:8}}><strong>Payment Date:</strong> {paymentStatus.paymentDate}</div>
            <div style={{marginBottom:8}}><strong>Payment Method:</strong> {paymentStatus.paymentMethod}</div>
            {paymentStatus.screenshotUrl && (
              <div style={{marginTop:16}}>
                <strong>Payment Screenshot:</strong>
                <div style={{marginTop:8}}>
                  <img 
                    src={paymentStatus.screenshotUrl} 
                    alt="Payment Screenshot" 
                    style={{
                      maxWidth:'100%', 
                      maxHeight:'400px', 
                      borderRadius:8, 
                      border:'2px solid #ddd',
                      objectFit:'contain'
                    }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {authorsLoading ? (
        <LoadingSpinner text={"Loading authors..."} fullScreen={false} />
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
                  <div style={{
                    background:'#001a33', 
                    borderRadius:8, 
                    padding: window.innerWidth <= 768 ? '0.8rem' : '1rem', 
                    marginBottom:'20px'
                  }}>
                    <h5 style={{
                      color:'#ffe066', 
                      marginBottom:'12px', 
                      fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem'
                    }}>📋 Debug Information:</h5>
                    <div style={{
                      fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem', 
                      color:'#b3c6e0'
                    }}>
                      <div style={{marginBottom:'8px'}}><strong>Total Authors:</strong> {authors.length}</div>
                      <div style={{marginBottom:'12px'}}><strong>Authors List:</strong></div>
                      {authors.map((author, index) => (
                        <div key={index} style={{
                          marginLeft: window.innerWidth <= 768 ? '10px' : '20px', 
                          marginBottom:'8px', 
                          lineHeight:'1.4'
                        }}>
                          <div style={{
                            wordBreak: 'break-word',
                            fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem'
                          }}>
                            <strong>{author.salutation} {author.author_name}</strong>
                          </div>
                          <div style={{
                            fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.8rem', 
                            color:'#9aa8b8'
                          }}>
                            • Attending venue: <span style={{color: author.is_attending_at_venue ? '#28a745' : '#dc3545'}}>{String(author.is_attending_at_venue)}</span><br/>
                            • Primary author: <span style={{color: author.is_primary_author ? '#28a745' : '#6c757d'}}>{String(author.is_primary_author)}</span><br/>
                            • Registration category ID: {author.reg_cat_id || 'Not set'}
                          </div>
                        </div>
                      ))}
                      <div style={{
                        marginTop:'12px', 
                        padding: window.innerWidth <= 768 ? '6px' : '8px', 
                        background:'rgba(255, 179, 71, 0.1)', 
                        borderRadius:'4px', 
                        fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.8rem'
                      }}>
                        💡 Payment Rules: Primary author always pays registration fee. Co-authors pay ₹1000 only if "Attending at venue" is checked.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                overflowX: window.innerWidth <= 768 ? 'auto' : 'visible',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: '#375a7f #002147'
              }}>
                <table style={{
                  width:'100%', 
                  minWidth: window.innerWidth <= 768 ? '500px' : 'auto',
                  color:'#fff', 
                  fontSize: window.innerWidth <= 768 ? '0.9rem' : '1.05rem', 
                  borderCollapse:'collapse', 
                  tableLayout: window.innerWidth <= 768 ? 'auto' : 'fixed'
                }}>
                  <thead>
                    <tr style={{borderBottom:'2px solid #375a7f'}}>
                      <th style={{
                        textAlign:'left', 
                        padding: window.innerWidth <= 768 ? '8px 6px' : '12px 8px', 
                        color:'#ffe066', 
                        width: window.innerWidth <= 768 ? 'auto' : '25%',
                        minWidth: window.innerWidth <= 768 ? '120px' : 'auto'
                      }}>Author Name</th>
                      <th style={{
                        textAlign:'left', 
                        padding: window.innerWidth <= 768 ? '8px 6px' : '12px 8px', 
                        color:'#ffe066', 
                        width: window.innerWidth <= 768 ? 'auto' : '40%',
                        minWidth: window.innerWidth <= 768 ? '150px' : 'auto'
                      }}>Registration Category</th>
                      <th style={{
                        textAlign:'center', 
                        padding: window.innerWidth <= 768 ? '8px 6px' : '12px 8px', 
                        color:'#ffe066', 
                        width: window.innerWidth <= 768 ? 'auto' : '15%',
                        minWidth: window.innerWidth <= 768 ? '80px' : 'auto'
                      }}>Role</th>
                      <th style={{
                        textAlign:'right', 
                        padding: window.innerWidth <= 768 ? '8px 6px' : '12px 8px', 
                        color:'#ffe066', 
                        width: window.innerWidth <= 768 ? 'auto' : '20%',
                        minWidth: window.innerWidth <= 768 ? '100px' : 'auto'
                      }}>Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentDetails.breakdown.map((item, index) => (
                      <tr key={index} style={{borderBottom:'1px solid #375a7f', background: item.isPrimary ? 'rgba(255, 227, 102, 0.1)' : 'transparent'}}>
                        <td style={{
                          padding: window.innerWidth <= 768 ? '8px 6px' : '12px 8px', 
                          wordWrap:'break-word', 
                          overflow:'hidden'
                        }}>
                          {item.authorName}
                          {item.isPrimary && <span style={{color:'#ffe066', fontSize:'0.8rem', marginLeft:'8px'}}>⭐</span>}
                        </td>
                        <td style={{
                          padding: window.innerWidth <= 768 ? '8px 6px' : '12px 8px', 
                          wordWrap:'break-word', 
                          overflow:'hidden', 
                          fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.95rem'
                        }}>
                          {item.category}
                        </td>
                        <td style={{
                          padding: window.innerWidth <= 768 ? '8px 6px' : '12px 8px', 
                          textAlign:'center', 
                          fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem'
                        }}>
                          {item.isPageCharge ? (
                            <span style={{color:'#9aa8b8'}}>-</span>
                          ) : item.isPrimary ? (
                            <span style={{color:'#ffe066', fontWeight:'600'}}>Primary</span>
                          ) : (
                            <span style={{color:'#b3c6e0'}}>Co-author</span>
                          )}
                        </td>
                        <td style={{
                          padding: window.innerWidth <= 768 ? '8px 6px' : '12px 8px', 
                          textAlign:'right', 
                          fontWeight:'600'
                        }}>
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
            <div style={{marginBottom: 32, background:'#001a33', borderRadius:12, padding: window.innerWidth <=768 ? '1rem' : '1.5rem', border:'2px solid #28a745'}}>
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

          {/* Bank Account Details Section - only if payment not completed */}
          {!paymentStatus.isPaid && (
            <div style={{marginBottom: 32, background:'#00224d', borderRadius:12, padding:'1.5rem', border:'1.5px solid #375a7f'}}>
              <h4 style={{textAlign:'center', color:'#28a7e0', fontWeight:700, fontSize:'1.15rem', marginBottom:'1.5rem', letterSpacing:1}}>
                Bank Account Details
              </h4>
              <div style={{display:'flex', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', alignItems:'center', justifyContent:'center', gap:'2rem'}}>
                <img src={QR} alt="Scan to pay" style={{width: window.innerWidth <= 768 ? '180px' : '200px', height: window.innerWidth <= 768 ? '180px' : '200px', borderRadius:'8px', boxShadow:'0 2px 8px #00336655', background:'#fff'}} />
                <div style={{background:'#001a33', borderRadius:8, padding:'1.5rem', fontFamily:'monospace', fontSize:'1rem', color:'#fff', minWidth: window.innerWidth <= 768 ? 'auto' : '340px', boxShadow:'0 2px 8px #00336655'}}>
                  <p>Account Name: <strong>International Conference on Trends in Engineering Systems and technologies</strong></p>
                  <p>Account Number: <strong>42346083528</strong></p>
                  <p>IFSC Code: <strong>SBIN0070218</strong></p>
                  <p>Bank Name: <strong>State bank of India</strong></p>
                  <p>Branch: <strong>Edappally</strong></p>
                  <p>MICR Code: <strong>682002905</strong></p>
                </div>
              </div>
              <div style={{marginTop:'1.5rem', color:'#ffe066', fontSize:'1rem', textAlign:'center'}}>
                You can pay via UPI using the QR code or via bank transfer using the details above.<br/>
                Please upload your payment screenshot after completing the payment.
              </div>
            </div>
          )}

          {/* Payment Confirmation and Screenshot Upload Section */}
          {!paymentStatus.isPaid && (
            <div style={{marginBottom: 32, background:'#00224d', borderRadius:12, padding:'1.5rem', border:'1.5px solid #375a7f'}}>
              <label style={{display:'flex', alignItems:'center', marginBottom:'1rem', fontSize:'1.05rem', color:'#ffe066'}}>
                <input
                  type="checkbox"
                  checked={userMarkedPaid}
                  onChange={e => setUserMarkedPaid(e.target.checked)}
                  style={{marginRight:'0.75rem', width:'1.2rem', height:'1.2rem'}}
                />
                I have completed the payment
              </label>
              {userMarkedPaid && (
                <>
                  <h4 style={{fontWeight:700, fontSize:'1.15rem', marginBottom:12, color:'#ffe066'}}>
                    Upload Payment Screenshot
                  </h4>
                  <input type="file" accept="image/*" onChange={handleScreenshotChange} style={{marginBottom:'1rem'}} />
                  <button
                    onClick={handleScreenshotUpload}
                    disabled={!screenshotFile || uploading}
                    style={{background:'#28a745', color:'#fff', border:'none', borderRadius:8, padding:'0.8rem 2rem', fontWeight:700, fontSize:'1rem', cursor:'pointer'}}
                  >
                    {uploading ? 'Uploading...' : 'Upload Screenshot'}
                  </button>
                  {uploadSuccess && (
                    <div style={{color:'#28a745', marginTop:'1rem', fontWeight:700}}>
                      Screenshot uploaded successfully!
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Payment Instructions - only if payment not completed */}
          {!paymentStatus.isPaid && (
            <div style={{marginBottom: 32, background:'#00224d', borderRadius:12, padding: window.innerWidth <=768 ? '1rem' : '1.5rem', border:'1.5px solid #375a7f'}}>
              <h4 style={{fontWeight:700, fontSize:'1.15rem', marginBottom:12, color:'#ffe066'}}>
                Payment Instructions
              </h4>
              <ul style={{margin:0, paddingLeft: window.innerWidth <=768 ? '10' : '20', lineHeight:1.8, color:'#fff'}}>
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
          )}

          {/* Download Invoice Button (before payment) */}
          {paymentDetails.breakdown.length > 0 && !paymentStatus.isPaid && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              marginBottom: 24,
              width: '100%'
            }}>
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

          {/* Remove payment gateway button section */}
        </>
      )}
    </div>
  );
}
