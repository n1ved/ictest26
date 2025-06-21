import "./committee_members.css";
import Navbar from "../navbar/navbar.jsx";

import principal_img from "../committee_images/principal.png";
import arunkumar_img from "../committee_images/arunkumar.jpg";
import rajesh_img from "../committee_images/rajesh-vg.png";
import jaimon_img from "../committee_images/jaimon.jpg";
import jagadeesh_img from "../committee_images/jagadeesh.jpeg";
import jobymol_img from "../committee_images/jobymol.jpg";
import jessy_img from "../committee_images/Jessy.jpeg";
import vasudevan_img from "../committee_images/vasudevan.jpeg";
import varun_img from "../committee_images/varun.jpeg";
import manju_img from "../committee_images/manju.jpg";
import sony_img from "../committee_images/sonyp.jpg";
import shaija_img from "../committee_images/shaija1.jpg";
import sindhu_img from "../committee_images/sindhu.jpg";

export default function Committee_members() {
  const events = [
    {
      image: arunkumar_img, // Updated placeholder image URL
      title: "Director",
      name: "Dr. Arunkumar V A",
      position: "Director, Institute of Human Resources Development(IHRD).",
    },

    {
      image: principal_img, // Updated placeholder image URL
      title: "Principal",
      name: "Dr. Mini M G",
      position: "Principal, Govt. Model Engineering College, Ernakulam.",
    },
    {
      image: rajesh_img, // Updated placeholder image URL
      title: "Dean",
      name: "Dr. Rajesh V G",
      position: "Dean, Govt. Model Engineering College, Ernakulam.",
    },
    {
      image: jagadeesh_img, // Updated placeholder image URL
      title: "General Chair",
      name: "Dr. Jagadeesh Kumar P.",
      position:
        "Asst. Professor, Department of Electronics and Communication Engineering, Govt. Model Engineering College, Ernakulam.",
    },
    {
      image: jobymol_img, // Updated placeholder image URL
      title: "Co-General Chair",
      name: "Dr. Jobymole Jacob.",
      position:
        "Professor, Department of Electronics and Communication Engineering, Govt. Model Engineering College, Ernakulam.",
    },
    {
      image: jaimon_img, // Updated placeholder image URL
      title: "Co-General Chair",
      name: "Jaimon Jacob.",
      position:
        "Nodal Officer, Centre of Excellence (AI, ML, Robotics, Automation), Kerala Technological University.",
    },
    {
      image: jessy_img, // Updated placeholder image URL
      title: "TPC Chair",
      name: "Dr. Jessy John",
      position:
        "Professor, Department of Biomedical Engineering, Govt. Model Engineering College",
    },
    {
      image: vasudevan_img, // Updated placeholder image URL
      title: "Co-TPC Chair",
      name: "Dr. K Vasudevan",
      position:
        "Professor Emeritus, Dept. of Electronics, Centre for Research in Electromagnetics & Antennas (CREMA), Cochin University of Science and Technology (CUSAT)",
    },
    {
      image: manju_img, // Updated placeholder image URL
      title: "Publication Chair",
      name: "Dr. Manju K",
      position:
        "Assistant Professor in Computer Engineering, Govt. Model Engineering College",
    },
    {
      image: varun_img, // Updated placeholder image URL
      title: "Co-Publication Chair",
      name: "Dr. Varun P Gopi",
      position:
        "Associate Professor, Dept. of ECE, NIT Tiruchirappalli, Tamil Nadu",
    },
    {
      image: sony_img, // Updated placeholder image URL
      title: "Co-Publication Chair",
      name: "Dr. Sony P",
      position:
        "Assistant Professor in Computer Engineering, Govt. Model Engineering College",
    },
    {
      image: shaija_img, // Updated placeholder image URL
      title: "Publicity Chair",
      name: "Dr. Shaija P J",
      position:
        "Assistant Professor in Electrical and Electronics Engineering, Govt. Model Engineering College",
    },
    {
      image: sindhu_img, // Updated placeholder image URL
      title: "Finance Committee Chair",
      name: "Dr. Sindhu S",
      position:
        "Associate Professor in Applied Science, Govt. Model Engineering College",
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
              <img src={event.image} alt={event.title} />
              <h2>{event.title}</h2>
              <h3>{event.name}</h3>
              <p>{event.position}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
