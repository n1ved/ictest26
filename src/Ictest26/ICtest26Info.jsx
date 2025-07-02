import "../schedule/schedule.css";
import "./ICtest26InfoPage.css";
import Navbar from "../navbar/navbar";
import { useState, useRef, useEffect } from "react";
import { SquareArrowOutUpRight } from "lucide-react";

// Import components - we'll create ICTEST26 versions
import Notifications26 from "./Notifications26";
import Venue26 from "./Venue26";
import Accommodations26 from "./Accommodations26";
import GuideLines from "../guidelines/GuideLines.jsx";
import Sessions26 from "./Sessions26";
import ProgramSchedule26 from "./ProgramSchedule26";
import GeneralInstructions26 from "./GeneralInstructions26";
import GalaNight26 from "./GalaNight26";
import Sponsors26 from "./Sponsors26";
import PreConfTalk26 from "./PreConfTalk26";
import PaperSchedule26 from "./PaperSchedule26";

export default function ICtest26Info() {
  const openNewWindowHandler = (url, name) => {
    window.open(url, name);
  };

  // Create refs for each section
  const sectionRefs = useRef([]);
  const [activeSection, setActiveSection] = useState(0);

  // Intersection Observer for scroll tracking
  useEffect(() => {
    const observers = [];
    const options = {
      root: null,
      rootMargin: '-80px 0px -50% 0px', // Account for navbar and better section detection
      threshold: [0.1, 0.5, 0.8], // Multiple thresholds for better detection
    };

    sectionRefs.current.forEach((section, index) => {
      if (section) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
              setActiveSection(index);
            }
          });
        }, options);

        observer.observe(section);
        observers.push(observer);
      }
    });

    // Backup scroll listener for more accurate detection
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Account for navbar
      
      sectionRefs.current.forEach((section, index) => {
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const sectionBottom = sectionTop + sectionHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call to set correct active section

    return () => {
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (index) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const menuSelectionHandler = (index, data) => {
    if (data.url) {
      window.open(data.url, data.name);
    } else {
      scrollToSection(index);
    }
  };

  const ComingSoon = () => {
    return (
      <div className="info-container">
        <h2>Coming Soon</h2>
      </div>
    );
  };

  const sections = [
    {
      name: "Notifications",
      content: <Notifications26 />,
    },
    {
      name: "Plenary sessions and speakers",
      content: <Sessions26 />,
    },
    {
      name: "List of accepted papers ",
      content: <ComingSoon />, // Will be updated later
    },
    {
      name: "General Instructions for CRP",
      content: <GeneralInstructions26 />,
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
      name: "Presentation Schedule",
      content: <PaperSchedule26/>
    },
    {
      name: "Gala Night",
      content: <GalaNight26 />,
    },
    {
      name: "Accomodation Details",
      content: <Accommodations26 />,
    },
    {
      name: "Pre-Conference Events",
      content: <PreConfTalk26 />
    },
    {
      name: "Our Sponsors",
      content: <Sponsors26 />
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
              activeSection === index
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
      <div className="info-bg">
        {sections.map((section, index) => (
          <div
            key={index}
            ref={(el) => (sectionRefs.current[index] = el)}
            className="info-section"
            id={`section-${index}`}
          >
            {section.content}
          </div>
        ))}
      </div>
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
