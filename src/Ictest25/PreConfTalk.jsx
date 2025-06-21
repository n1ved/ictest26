import "./PreConfTalk.css";

import conf1auth from "./speaker_images/ambika prasad.jpg";
import conf2auth from "./preconf_img/dr_shailesh.jpg";
import conf1gal1 from "./preconf_img/1_1.jpeg";
import conf1gal2 from "./preconf_img/1_2.jpeg";
import conf1gal3 from "./preconf_img/1_3.jpeg";

import conf2gal1 from "./preconf_img/2_1.jpeg"
import conf2gal2 from "./preconf_img/2_2.jpeg"
import conf2gal3 from "./preconf_img/2_3.jpeg"
import conf2gal4 from "./preconf_img/2_4.jpeg"
export default function PreConfTalk(){

  const confTalk = [
    {
      name:" Workshop on AI in Action: From Data to Deployment",
      author: "Dr. Shailesh Sivan",
      designation: " Assistant Professor, Department of Computer Science, CUSAT",
      date: "25th March - 26th March 2025 , 9:00 AM - 4:00 PM, SDPK, Model Engineering College",
      description : (
        <>
          <p>This hands-on workshop will guide participants through the end-to-end AI workflow, from data collection to model deployment. It is designed for students and researchers eager to gain practical insights into artificial intelligence applications.</p>
          <ul style={{listStyleType:"none"}}>
            <li>Prerequisite</li>
            <li>
              <ul>
                <li>Fair understanding of Python programming</li>
                <li>Participants must bring their own laptops</li>
              </ul>
            </li>
            <li>Agenda</li>
            <li>
              <ul>
                <li>Introduction to AI, ML, and Deep Learning</li>
                <li>Data Curation for AI Application Building</li>
                <li>Building AutoML Models</li>
                <li>Creating ML Applications using Streamlit</li>
                <li>Deep Learning Models for Image Analysis</li>
                <li>Developing LLM-based Applications</li>
              </ul>
            </li>
          </ul>
        </>
      ),
      authimg: conf2auth,
      images: [ conf2gal1,conf2gal2,conf2gal3,conf2gal4]
    },
    {
      name: "Integrated Circuits Reliability and Quality : Trends, Challenges and Opportunities",
      author: "Dr. Ambika Prasad Shah",
      designation: "Assistant Professor, IIT Jammu",
      date : "4th March 2025 , 09:30 AM, Internal Auditorium, Model Engineering College",
      authimg: conf1auth,
      images: [conf1gal1, conf1gal2, conf1gal3],
    }
  ]

  return (
    <div className="preconf-container">
      <div className="preconf-list-container">
        <h2>Pre-Conference Events</h2>
        <div className="preconf-list">
          {
            confTalk.map((talk) => (
              <div className="preconf-card">
                <div className="preconf-card-header">
                  <img src={talk.authimg} alt="Dr. John Doe" />
                  <div className="preconf-header-text">
                    <h2>{talk.name}</h2>
                    <h3>{talk.author}</h3>
                    <p>{talk.designation}</p>
                    <p>{talk.date}</p>
                  </div>
                </div>
                {
                  talk.description &&
                  (
                    talk.description
                  )
                }
                {
                  talk.images &&
                  (
                    <div className="preconf-card-images">
                      {
                        talk.images.map((img, index) => (
                          <img src={img} alt={`Gallery ${index + 1}`} key={img} />
                        ))
                      }
                    </div>
                  )
                }
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}