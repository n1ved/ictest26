import "../Ictest25/Sessions.css";

// Import placeholder images - these will be updated for ICTEST26
import PlaceholderImage from "../assets/ieeeLogo.png";

export default function Sessions26() {
  const sessions = [
    {
      date: "TBD",
      time: "TBD",
      topic: "TBD",
      speaker: "TBD",
      designation: [
        "Details to be announced"
      ],
      speaker_desc:
        "Speaker details will be updated soon.",
      image: PlaceholderImage,
    },
    {
      date: "TBD",
      time: "TBD",
      topic: "TBD",
      speaker: "TBD",
      designation: ["Details to be announced"],
      speaker_desc:
        "Speaker details will be updated soon.",
      image: PlaceholderImage,
    },
    {
      date: "TBD",
      time: "TBD",
      topic: "TBD",
      speaker: "TBD",
      designation: [
        "Details to be announced"
      ],
      speaker_desc: "Speaker details will be updated soon.",
      image: PlaceholderImage
    },
    {
      date: "TBD",
      time: "TBD",
      topic: "TBD",
      speaker: "TBD",
      designation: ["Details to be announced"],
      speaker_desc:
        "Speaker details will be updated soon.",
      image: PlaceholderImage,
    },
    {
      date: "TBD",
      time: "TBD",
      topic: "TBD",
      speaker: "TBD",
      designation: ["Details to be announced"],
      speaker_desc: "Speaker details will be updated soon.",
      image: PlaceholderImage,
    },
    {
      date: "TBD",
      time: "TBD",
      topic: "TBD",
      speaker: "TBD",
      designation: ["Details to be announced"],
      speaker_desc: "Speaker details will be updated soon.",
      image: PlaceholderImage,
    },
    {
      date: "TBD",
      time: "TBD",
      topic: "TBD",
      speaker: "TBD",
      designation: [
        "Details to be announced"
      ],
      speaker_desc:
        "Speaker details will be updated soon.",
      image: PlaceholderImage,
    },
    {
      date: "TBD",
      time: "TBD",
      topic: "TBD",
      speaker: "TBD",
      designation: [
        "Details to be announced"
      ],
      speaker_desc: "Speaker details will be updated soon.",
      image: PlaceholderImage,
    },
  ];

  return (
    <div className="sessions-container">
      <h1 className="session-title">Plenary Sessions and Speakers</h1>
      <div className="instruction-content" style={{marginBottom: "2rem", textAlign: "center"}}>
        <p>Details for ICTEST 2026 speakers and sessions will be updated soon. Stay tuned for announcements!</p>
      </div>
      <div className="session-container">
        {sessions.map((session, index) => (
          <div className="session-card" key={index}>
            <div className="session-pic-container">
              <img src={session.image} alt={session.speaker} />
            </div>
            <div className="session-details">
              <h3>Topic: <span>{session.topic}</span></h3>
              <h4>Speaker: {session.speaker}</h4>
              {session.designation.map((each, index) => (
                <p key={index}>{each}</p>
              ))}
              <p className="session-time"><strong>{session.date} | {session.time}</strong></p>
            </div>
          </div>
        ))}
        <div className="session-card">
          <div className="session-pic-container">
            <img src={PlaceholderImage} alt="Panel Discussion" />
          </div>
          <div className="session-details">
            <h3>Panel Discussion: <span>TBD</span></h3>
            <h4>Moderator: TBD</h4>
            <p>Details to be announced</p>
            <p className="session-time"><strong>TBD | TBD</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
