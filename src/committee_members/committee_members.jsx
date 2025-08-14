import "./committee_members.css";
import Navbar from "../navbar/navbar.jsx";

import principal_img from "../committee_images/principal.png";
import arunkumar_img from "../committee_images/arunkumar.jpg";
import rajesh_img from "../committee_images/rajesh-vg.png";
// import jaimon_img from "../committee_images/jaimon.jpg"; // no longer used
// removed old roles/images no longer used
// import jagadeesh_img from "../committee_images/jagadeesh.jpeg";
// import jobymol_img from "../committee_images/jobymol.jpg";
import jessy_img from "../committee_images/Jessy.jpeg";
import vasudevan_img from "../committee_images/vasudevan.jpeg";
import varun_img from "../committee_images/varun.jpeg";
import manju_img from "../committee_images/manju.jpg";
// import sony_img from "../committee_images/sonyp.jpg";
import shaija_img from "../committee_images/shaija1.jpg";
import sindhu_img from "../committee_images/sindhu.jpg";
import bindu_img from "../committee_images/bindu_v.jpg";
import sajitha_img from "../committee_images/sajitha.jpg";
import vinitha_img from "../committee_images/vinitha.jpg";
import priya_img from "../committee_images/priya.jpg";
import jibi_img from "../committee_images/jibi.jpg";
import aparnadevi_img from "../committee_images/aparnadevi.jpg";

export default function Committee_members() {
  const events = [
    // Keep leadership positions
    {
      image: arunkumar_img,
      title: "Director",
      name: "Dr. Arunkumar V A",
      position: "Director, Institute of Human Resources Development (IHRD)",
    },
    {
      image: principal_img,
      title: "Principal",
      name: "Dr. Mini M G",
      position: "Principal, Govt. Model Engineering College, Ernakulam",
    },
    {
      image: rajesh_img,
      title: "Dean",
      name: "Dr. Rajesh V G",
      position: "Dean, Govt. Model Engineering College, Ernakulam",
    },

    // General Chairs
    {
      image: shaija_img,
      title: "General Chair",
      name: "Dr. Shaija P. J.",
      position:
        "Asst. Professor, Department of Electrical Engineering, Govt. Model Engineering College",
      email: "shaija@mec.ac.in",
      phone: "9447991108",
      ieeeNumber: "99120551",
    },
    {
      image: manju_img,
      title: "General Chair",
      name: "Dr. Manju K",
      position:
        "Asst. Professor in Computer Science and Engineering, Govt. Model Engineering College",
      email: "manju@mec.ac.in",
      phone: "9447380826",
    },

    // TPC Chair(s)
    {
      image: jessy_img,
      title: "TPC Chair",
      name: "Dr. Jessy John",
      position:
        "Professor, Department of Biomedical Engineering, Govt. Model Engineering College",
      email: "jessyjohn@mec.ac.in",
      phone: "9744560350",
      ieeeNumber: "97660856",
    },

    // Co-TPC Chair(s)
    {
  image: bindu_img,
      title: "Co-TPC Chair",
      name: "Dr. Bindu V.",
      position:
        "Professor, Department of Electrical Engineering, Govt. Model Engineering College",
      email: "binduv@mec.ac.in",
      phone: "8547310981",
    },
    {
      image: vasudevan_img,
      title: "Co-TPC Chair",
      name: "Dr. K Vasudevan",
      position:
        "Professor Emeritus, Dept. of Electronics, Centre for Research in Electromagnetics & Antennas (CREMA), Cochin University of Science and Technology (CUSAT)",
      email: "vasudevankdr@gmail.com",
      phone: "9447357328",
    },

    // Publication Chair(s)
    {
  image: sajitha_img,
      title: "Publication Chair",
      name: "Dr. Sajitha S.",
      position:
        "Asst. Professor, Department of Biomedical Engineering, Govt. Model Engineering College",
      email: "sajitha@mec.ac.in",
      phone: "9605497787",
    },
    {
  image: vinitha_img,
      title: "Publication Chair",
      name: "Vinitha George E.",
      position:
        "Associate Professor in Electronics Engineering, Govt. Model Engineering College",
      email: "vinithageorge@mec.ac.in",
      phone: "9388815039",
      ieeeNumber: "80334516",
    },

    // Co-Publication Chair(s)
    {
      image: varun_img,
      title: "Co-Publication Chair",
      name: "Dr. Varun P Gopi",
      position:
        "Associate Professor, Department of ECE, NIT, Tiruchirappalli, Tamil Nadu",
      email: "varun@nitt.edu",
      phone: "9995114547",
      ieeeNumber: "94396556",
    },

    // Publicity Chair(s)
    {
  image: priya_img,
      title: "Publicity Chair",
      name: "Dr. Priya S",
      position:
        "Professor in Computer Science and Engineering, Govt. Model Engineering College",
      email: "priya@mec.ac.in",
      phone: "9447348670",
    },
    {
  image: jibi_img,
      title: "Publicity Chair",
      name: "Ms. Jibi John",
      position:
        "Associate Professor in Electronics Engineering, Govt. Model Engineering College",
      email: "jibi@mec.ac.in",
      phone: "9846466044",
    },
    {
  image: aparnadevi_img,
      title: "Publicity Chair",
      name: "Ms. Aparna Devi",
      position:
        "Asst Professor in Electronics Engineering, Govt. Model Engineering College",
      email: "aparnadevi@mec.ac.in",
      phone: "9447249042",
      ieeeNumber: "80120579",
    },

    // Finance Committee Chair(s)
    {
      image: sindhu_img,
      title: "Finance Committee Chair",
      name: "Dr. Sindhu S",
      position:
        "Associate Professor in the Dept. of Applied Science, Govt. Model Engineering College",
      email: "sindhus@mec.ac.in",
      phone: "9446445501",
    },
    {
      title: "Finance Committee Chair",
      name: "Ms. Radha Balakrishnan",
      position:
        "Asst Professor in the Dept. of Applied Science, Govt. Model Engineering College",
      email: "radha@mec.ac.in",
      phone: "9446565860",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="committee-members">
        <h1>Committee Members</h1>
        <div className="event-grid">
          {events.map((event, index) => (
            <div className="event-card" key={index}>
              {event.image && <img src={event.image} alt={event.title} />}
              <h2>{event.title}</h2>
              <h3>{event.name}</h3>
              <p>{event.position}</p>
              {(event.email || event.phone || event.ieeeNumber) && (
                <div className="event-contact">
                  {event.email && (
                    <p className="email">
                      <span className="label">Email:</span>
                      <a href={`mailto:${event.email}`}>{event.email}</a>
                    </p>
                  )}
                  {event.phone && (
                    <p className="phone">
                      <span className="label">Phone:</span>
                      {(() => {
                        const raw = String(event.phone).trim();
                        const digits = raw.replace(/\D+/g, "");
                        const hasCountry = /^\+?91/.test(raw);
                        const href = `tel:+91${digits.replace(/^91/, "")}`;
                        const display = hasCountry ? raw : `+91 ${raw}`;
                        return <a href={href}>{display}</a>;
                      })()}
                    </p>
                  )}
                  {event.ieeeNumber && (
                    <p className="ieee">IEEE Member No: {event.ieeeNumber}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
