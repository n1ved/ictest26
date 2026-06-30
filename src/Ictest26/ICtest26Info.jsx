import "../schedule/schedule.css";
import "./ICtest26InfoPage.css";
import Navbar from "../navbar/navbar";
import { useState } from "react";
import { SquareArrowOutUpRight } from "lucide-react";

import Notifications26 from "./Notifications26";
import Venue26 from "./Venue26";
import Accommodations26 from "./Accommodations26";
import Sessions26 from "./Sessions26";
import ProgramSchedule26 from "./ProgramSchedule26";
import GalaNight26 from "./GalaNight26";
import Sponsors26 from "./Sponsors26";
import PreConfTalk26 from "./PreConfTalk26";

export default function ICtest26Info() {
  const openNewWindowHandler = (url, name) => {
    window.open(url, name);
  };

  const menuSelectionHandler = (index, data) => {
    if (!data.isActive) return;
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
      name: "Notifications",
      content: <Notifications26 />,
      isActive: true,
    },
    {
      name: "General Instructions for CRP",
      url: "/docs/General Instructions for CRP - ICTEST 2026.pdf",
      isActive: true,
    },
    {
      name: "List of Accepted Papers ",
      url: "/docs/Accepted Papers List - ICTEST2026.pdf",
      isActive: true,
    },
    {
      name: "Presentation Schedule",
      url: "/docs/Presentation Schedule.pdf",
      isActive: true,
    },
    {
      name: "Plenary sessions and speakers",
      content: <Sessions26 />,
    },
    {
      name: "Venue",
      content: <Venue26 />,
    },
    {
      name: "Program Schedule",
      content: <ProgramSchedule26 />,
    },
    {
      name: "Gala Night",
      content: <GalaNight26 />,
    },
    {
      name: "Accomodation Details",
      content: <Accommodations26 />,
      isActive: true,
    },
    {
      name: "Pre-Conference Events",
      content: <PreConfTalk26 />,
    },
    {
      name: "Our Sponsors",
      content: <Sponsors26 />,
    },
  ];

  return (
    <div className="info-main">
      <Navbar />
      <div className="ic26-navigation">
        <h4>Quick Links</h4>
        <hr />
        {sections.map((data, index) => (
          <div
            className={
              !data.isActive
                ? "navigation-btn navigation-btn-disabled"
                : currentSection == index
                  ? "navigation-btn navigation-btn-active"
                  : "navigation-btn"
            }
            onClick={() => {
              menuSelectionHandler(index, data);
            }}
            key={data.name}
          >
            {data.name} {data.url ? <SquareArrowOutUpRight /> : null}
          </div>
        ))}
      </div>
      <div className="info-bg">{sections[currentSection].content}</div>
      <div className="info-bg-m">
        <div className="info-container info-container-mobile-header">
          <h2>Quick Links</h2>
        </div>
        {sections.map((data, index) =>
          data.url ? null : data.isActive ? data.content : null,
        )}
        <div className="info-container">
          <div className="button-container">
            {sections.map((data, index) =>
              data.url && data.isActive ? (
                <button
                  onClick={() => {
                    openNewWindowHandler(data.url, data.name);
                  }}
                  key={"button" + data.name}
                >
                  {data.name}
                </button>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
