import "./Sessions.css";

import ManjulaDevananda from "./speaker_images/manjula_devananda.jpeg";
import dp from "./speaker_images/dp.jpg";
import Maya_R from "./speaker_images/maya_r.jpeg";
import BS_Manoj from "./speaker_images/BS Manoj.jpg";
import Ambika_Prasad_Shah from "./speaker_images/ambika prasad.jpg";
import Varun_P_Gopi from "./speaker_images/Varun P Gopi.png";
import AravindAjoy from "./speaker_images/aravind_ajoy.jpg"
import MeenaD from "./speaker_images/meena_d.jpeg"
import GopanVP from "./speaker_images/gopan_vp.jpeg"
import Nanditha from "./speaker_images/nanditha.jpeg"
import Jyothish from "./speaker_images/jyothish.jpeg"

export default function Sessions() {
  const sessions = [
    {
      date: "03-04-2025",
      time: "2:00 PM",
      topic: "Federated Learning in AI",
      speaker: "Dr. Manjula Devananda",
      designation: [
        "PhD in Information Science from the University of Otago, New Zealand",
        "Senior Manager AI Research Scientist, Fusemachines USA",
      ],
      speaker_desc:
        "Dr. Manjula Devananda holds a PhD in Information Science from the University of Otago, New Zealand...",
      image: ManjulaDevananda,
    },
    {
      date: "03-04-2025",
      time: "11:00 AM",
      topic: "On Achieving 6G KPIs",
      speaker: "Dr. B S Manoj",
      designation: ["Chair, IEEE Kerala Section", "Associate Dean, IIST"],
      speaker_desc:
        "Dr. B S Manoj is the Chair of IEEE Kerala Section and Associate Dean at IIST.",
      image: BS_Manoj,
    },
    {
      date: "04-04-2025",
      time: "9:00 AM",
      topic: "Analog and Digital System Design of 'ScopeX' : An Aid  for Electronics At Home",
      speaker: "Dr. Arvind Ajoy",
      designation: [
        "Associate Professor, IIT Palakkad"
      ],
      speaker_desc: "",
      image: AravindAjoy
    },
    {
      date: "04-04-2025",
      time: "10:00 AM", //10
      topic: "Photonic technologies for Radar applications",
      speaker: "Dr.Meena D",
      designation: ["Scientist, Electronics and Radar Development Establishment, LRDE, DRDO, Bangalore"],
      speaker_desc:
        "",
      image: MeenaD,
    },
    {
      date: "04-04-2025",
      time: "2:00 PM",
      topic: "Efficient AI and Autonomy: integrating hardware Acceleration with Algorithm Design",
      speaker: "Dr. Varun P Gopi",
      designation: ["Associate Professor, NIT Trichi"],
      speaker_desc: "Dr. Varun P Gopi is an Associate Professor at NIT Trichi.",
      image: Varun_P_Gopi,
    },
    {
      date: "04-04-2025",
      time: "3:00 PM",
      topic: "The Role of Emulation - Accelerating VLSI Design Validation",
      speaker: "Jyothish Balakrishnan",
      designation: ["Senior Enigneering Manager - Emulation at Google"],
      speaker_desc: "",
      image: Jyothish

    },
    {
      date: "05-04-2025",
      time: "9:00 AM",
      topic: "AI in Action : An industry perspective of real world use cases and benefits.",
      speaker: "Gopan V.P",
      designation: ["General Manager, South Asia - NVIDIA"],
      speaker_desc:
        "Gopan V.P is the General Manager for South Asia at NVIDIA.",
      image: GopanVP,
    },
    {
      date: "05-04-2025",
      time: "10:45 AM",
      topic: "Evolution of Cyber Security",
      speaker: "Maya R Nair",
      designation: [
        "Director - Chief Information Security Officer , CRISIL Limited"
      ],
      speaker_desc: "Maya R Nair is a keynote speaker.",
      image: Maya_R,
    },
  ];

  return (
    <div className="sessions-container">
      <h1 className="session-title">Plenary Sessions and Speakers</h1>
      <div className="session-container">
        {sessions.map((session, index) => (
          <div className="session-card" key={index}>
            <div className="session-pic-container">
              <img src={session.image} alt={session.speaker} />
            </div>
            <div className="session-details">
              <h3>Topic: <span>{session.topic ? session.topic : "To be announced"}</span></h3>
              <h4>Speaker: {session.speaker}</h4>
              {session.designation.map((each, index) => (
                <p key={index}>{each}</p>
              ))}
              {/* Single line for Date & Time */}
              <p className="session-time"><strong>{session.date} | {session.time}</strong></p>
            </div>
          </div>
        ))}
        <div className="session-card">
          <div className="session-pic-container">
            <img src={Nanditha} alt={""} />
          </div>
          <div className="session-details">
            <h3>Panel Discussion: <span>{" The Intersection of Technology and Industry : Innovations and Impact."}</span></h3>
            <h4>Moderator : Nanditha Elizabeth Roy</h4>
            <p>R&D Manager, Aries International Maritime Research Institute</p>
            {/*<br/>*/}
            {/*<h3>Panelists :</h3>*/}
            {/*<h4 style={{lineHeight:"1px"}}>Salini L S </h4>*/}
            {/*<p>Chief Manager, SBI, Edappally</p>*/}
            {/*<br/>*/}
            {/*<h4 style={{lineHeight:"1px"}}>Dr.Meena D</h4>*/}
            {/*<p>Scientist, Electronics and Radar Development Establishment, LRDE, DRDO, Bangalore</p>*/}

            {/* Single line for Date & Time */}
            <p className="session-time"><strong>05-04-2025 | 12:00 PM</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
