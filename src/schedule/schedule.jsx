import "./schedule.css";
import Navbar from "../navbar/navbar.jsx";

export default function Schedule() {
  const events = [
    {
      name: "Conference Dates",
      date: "July 16, 17 and 18, 2026",
    },
    {
      name: "Conference Location",
      date: "Kochi 21, Kerala, India",
    },
    {
      name: "Call for Papers Announcement",
      date: "August 15th, 2025",
    },
    {
      name: "Last date for draft paper submission",
      date: "January 10th, 2026"
    },
    {
      name: "Notification of Acceptance",
      date: "March 15th, 2026"
    },
    // {
    //   name: "Author Registration",
    //   date: "Mar 5 - Mar 15, 2025",
    // },
    {
      name: "Deadline for Submitting Final Camera-ready Paper",
      date: "April 15th, 2026",
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
          <span>Phone: +91 9447991108, +91 9447219957</span>
        </div>
      </div>
    </>
  );
}
