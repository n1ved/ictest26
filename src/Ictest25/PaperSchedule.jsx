import React, { useState } from "react";
import "./ProgramSchedule.css";
import PaperData from "./PaperData.jsx";
import PaperDataOL from "./PaperDataOL.jsx";

const PaperSchedule = () => {
  const paperdata = PaperData();
  const paperdataOL = PaperDataOL();
  const days = [
    "Day 1 - April 3, 2025",
    "Day 2 - April 4, 2025",
    "Day 3 - April 5, 2025",
  ];

  // State to track the selected day
  const [selectedDay, setSelectedDay] = useState(days[0]);

  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  const renderPapers = (day) => {
    const dayPapers = paperdata.filter((paper) => paper.day === day);
    if (!dayPapers || !dayPapers.length) return null;
    return (
      <div className="papers-section">
        <div className="schedule-table-container">
          {dayPapers.map((paperData, index) => (
            <div key={index} className="paper-track-section">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>{paperData.venue}</th>
                    <th>{paperData.track}</th>
                    <th>{paperData.time}</th>
                  </tr>
                  <tr>
                    <th width="20%">ID</th>
                    <th colSpan="2">Title</th>
                  </tr>
                </thead>
                <tbody>
                  {paperData.presentations.map((paper) => (
                    <tr key={paper.paperId}>
                      <td>{paper.paperId}</td>
                      <td colSpan="2">{paper.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPapersOL = (day) => {
    const dayPapers = paperdataOL.filter((paper) => paper.day === day);
    if (!dayPapers || !dayPapers.length) return null;
    return (
      <div className="papers-section">
        <div className="schedule-table-container">
          {dayPapers.map((paperDataOL, index) => (
            <div key={index} className="paper-track-section">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>{paperDataOL.venue}</th>
                    <th>{paperDataOL.track}</th>
                    <th>{paperDataOL.time}</th>
                  </tr>
                  <tr>
                    <th width="20%">ID</th>
                    <th colSpan="2">Title</th>
                  </tr>
                </thead>
                <tbody>
                  {paperDataOL.presentations.map((paper) => (
                    <tr key={paper.paperId}>
                      <td>{paper.paperId}</td>
                      <td colSpan="2">{paper.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="schedule-container">
      <h1 className="centered-heading">Paper Presentation Schedule</h1>
      <div style={{ minHeight: "20px" }} />
      <h3>Download as PDF</h3>
      <div className="non-blinking-buttons">
        <a href="/docs/Master_ SCHEDULE_OFF.pdf" target="_blank">
          Presentation Schedule (OFFLINE)
        </a>

        <a href="/docs/Master_ SCHEDULE_OL.pdf" target="_blank">
          Presentation Schedule (ONLINE)
        </a>
      </div>
      <div className="day-selector">
        <label htmlFor="day-dropdown">Select Day: </label>
        <select
          id="day-dropdown"
          value={selectedDay}
          onChange={handleDayChange}
          className="day-dropdown"
        >
          {days.map((day, index) => (
            <option key={index} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      <div className="schedule-section">
        <h3>{selectedDay}</h3>
        {renderPapers(selectedDay.split(" - ")[0])}
      </div>
      <h2>Online Papers</h2>
      <div className="schedule-section">
        <h3>{selectedDay}</h3>
        {renderPapersOL(selectedDay.split(" - ")[0])}
      </div>
    </div>
  );
};

export default PaperSchedule;
