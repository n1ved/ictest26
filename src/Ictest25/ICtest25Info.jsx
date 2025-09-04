import "../schedule/schedule.css";
import "./ICtest25Info.css";
import Navbar from "../navbar/navbar";
import { useState } from "react";
import { SquareArrowOutUpRight } from "lucide-react";

import Notifications from "./Notifications";
import Venue from "./Venue";
import Accommodations from "./Accomodation.jsx";
import GuideLines from "../guidelines/GuideLines.jsx";
import Sessions from "./Sessions.jsx";
import ProgramSchedule from "./ProgramSchedule.jsx";
import GeneralInstructions from "./GeneralInstructions.jsx";
import GalaNight from "./GalaNight.jsx";
import Sponsors from "./Sponsors.jsx";
import PreConfTalk from "./PreConfTalk.jsx";
import PaperSchedule from "./PaperSchedule.jsx";
import Publications2025 from "./Publications.jsx";

export default function ICTEST25Info() {
  const openNewWindowHandler = (url, name) => {
    window.open(url, name);
  };

  const menuSelectionHandler = (index, data) => {
    if (data.url) {
      window.open(data.url, data.name);
    } else {
      setCurrentSection(index);
    }
  };

  const ComingSoon = () => {
    return (
      <div className="info-container">
        <h2>Coming Soon</h2>
      </div>
    );
  };

  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
      {
        name : "Publications",
          content: <Publications2025/>
      },
    {
      name: "Notifications",
      content: <Notifications />,
    },
    {
      name: "Plenary sessions and speakers",
      content: <Sessions />,
    },
    {
      name: "List of accepted papers ",
      url: "/docs/accepted_papers.pdf",
    },
    {
      name: "General Instructions for CRP",
      content: <GeneralInstructions />,
    },
    {
      name: "Venue",
      content: <Venue />,
    },
    {
      name: "Program Schedule",
      content: <ProgramSchedule />,
    },
    {
      name: "Presentation Schedule",
      content: <PaperSchedule/>
    },
    {
      name: "Gala Night",
      content: <GalaNight />,
    },
    {
      name: "Accomodation Details",
      content: <Accommodations />,
    },
    {
      name: "Pre-Conference Events",
      content: <PreConfTalk />
    },
    {
      name: "Our Sponsors",
      content: <Sponsors />
    },
  ];

  return (
    <div className="info-main">
      <Navbar />
      <div className="ic25-navigation">
        <h4>Quick Links</h4>
        <hr />
        {sections.map((data, index) => (
          <div
            className={
              currentSection == index
                ? "navigation-btn navigation-btn-active"
                : "navigation-btn"
            }
            onClick={() => {
              menuSelectionHandler(index, data);
            }}
            key={data.name} // Important for React reconciliation
          >
            {data.name} {data.url ? <SquareArrowOutUpRight /> : null}
          </div>
        ))}
      </div>
      <div className="info-bg">{sections[currentSection].content}</div>
      <div className="info-bg-m">
        <div className="info-container">
          <h2>Quick Links</h2>
          <div className="button-container">
            {sections.map((data, index) =>
              data.url ? (
                <button
                  onClick={() => {
                    openNewWindowHandler(data.url, data.name);
                  }}
                  key={"button" + data.name}
                >
                  {data.name}
                </button>
              ) : null
            )}
          </div>
        </div>
        {sections.map((data, index) =>
          data.url ? null : data.cs ? null : data.content
        )}
      </div>
    </div>
  );
}
