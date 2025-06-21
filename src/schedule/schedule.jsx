import "./schedule.css";
import Navbar from "../navbar/navbar.jsx";

export default function Schedule() {
  const events = [
    {
      name: "Conference Dates",
      date: "April 3, 4 and 5, 2025",
    },
    {
      name: "Conference Location",
      date: "Kochi 21, Kerala, India",
    },
    {
      name: "Call for Papers Announcement",
      date: "1st September, 2024",
    },
    {
      name: "Last date for draft paper submission",
      date: "March 1, 2025"
    },
    {
      name: "Notification of Acceptance",
      date: "March 5, 2025"
    },
    {
      name: "Author Registration",
      date: "Mar 5 - Mar 15, 2025",
    },
    {
      name: "Deadline for Submitting Final Camera-ready Paper",
      date: "March 15, 2025",
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
        <div className="button-container">
          <button onClick={handleRedirectPaperSubmission}>Submit Paper</button>
          <button onClick={handleRedirectRegistration}>
            Author Registration - ICTEST 2025
          </button>
          <button onClick={handleGuildlinesURL}>
            Common guidelines for CRP
          </button>
        </div>
        <div className="contact-info">
          <h3>contact information</h3>
          <span>email: ictest25@mec.ac.in</span>
          <br></br>
          <span>(M) +91 9447991108, +919447219957</span>
        </div>
      </div>
    </>
  );
}
