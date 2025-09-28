import "./schedule.css";
import Navbar from "../navbar/navbar.jsx";

export default function Schedule() {
  const events = [
    {
      name: "Conference Dates",
      date: "16-18 July, 2026",
    },
    {
      name: "Conference Location",
      date: "Kochi 21, Kerala, India",
    },
    {
      name: "Call For Papers Announcement",
      date: "1 September, 2025",
    },
    {
      name: "Last Date For Draft Paper Submission",
      date: "10 February, 2026"
    },
    {
      name: "Notification Of Acceptance",
      date: "15 March, 2026"
    },
    {
      name: "Deadline For Submitting Final Camera-Ready Paper",
      date: "15 April, 2026",
    },
  ];
  const handleRedirectPaperSubmission = () => {
    window.open("https://cmt3.research.microsoft.com/ICTEST2025", "_blank"); // Replace with your URL
  };
  const handleRedirectRegistration = () => {
    window.open("https://forms.gle/aWHQbBVx7hr3HSLj6", "_blank"); // Replace with your URL
  };
  const handleGuildlinesURL = () => {
    window.open(
      "https://drive.google.com/file/d/1SxPVGw5x6eA2PUYlBiLNjhnbt09ykwrN/view",
      "_blank",
    ); // Replace with your URL
  };

  return (
    <>
      <Navbar />
      <div className="schedule-bg">
        <h1>Schedule</h1>
        <div className="schedule">
          {events.map((event) => (
            <>
              <div className="event" key={event.name}>
                <h2>{event.name}</h2>
                <p>{event.date}</p>
              </div>
              <hr />
            </>
          ))}
        </div>
        {/*TODO : BUTTONS FOR REGISTRATION*/}
        {/*<div className="button-container">*/}
        {/*  <button onClick={handleRedirectPaperSubmission}>Submit Paper</button>*/}
        {/*  <button onClick={handleRedirectRegistration}>*/}
        {/*    Author Registration - ICTEST 2025*/}
        {/*  </button>*/}
        {/*  <button onClick={handleGuildlinesURL}>*/}
        {/*    Common guidelines for CRP*/}
        {/*  </button>*/}
        {/*</div>*/}
        <div className="contact-info">
          <h3>Contact Information</h3>
          <span>Email: <a href="mailto:ictest@mec.ac.in" className="contact-link">ictest@mec.ac.in</a></span>
          <br></br>
          <span>Phone: +91 9447991108, +91 9447380826</span>
        </div>
      </div>
    </>
  );
}
