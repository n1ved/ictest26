import React from 'react';
import './ProgramSchedule.css';

const ProgramSchedule = () => {
  const schedule = [
    { day: 'Inauguration Ceremony', time: '', event: 'Prayer', speaker: '' },
    { day: 'Inauguration Ceremony', time: '', event: 'Welcome', speaker: 'Dr. Mini M G', description: 'Principal, Govt. Model Engineering College, Ernakulam' },
    { day: 'Inauguration Ceremony', time: '', event: 'Presidential Address', speaker: 'Dr. V A Arun Kumar', description: 'Director, Institute of Human Resources Development (IHRD)' },
    { day: 'Inauguration Ceremony', time: '', event: 'Inauguration', speaker: 'Dr. Duvvuri Seshagiri', description: 'Director, Naval Physical and Oceanographic Laboratory (NPOL), Kochi' },
    { day: 'Inauguration Ceremony', time: '', event: 'Felicitation', speaker: 'Dr. B S Manoj', description: 'Chair, IEEE Kerala Section\n Associate Dean, IIST' },
    { day: 'Inauguration Ceremony', time: '', event: '', speaker: 'Dr. Jaison Mathew', description: 'Chair, Conference Activities ' },
    { day: 'Inauguration Ceremony', time: '', event: '', speaker: 'Ms. Salini', description: 'Manager, SBI, Edappally Br ' },
    { day: 'Inauguration Ceremony', time: '', event: '', speaker: 'Dr. Manjula Devananda', description: 'Senior Manager AI Research Scientist, Fusemachines USA' },
    { day: 'Inauguration Ceremony', time: '', event: '', speaker: 'Dr. Rajesh V G', description: 'Dean, Model Engineering College, Thrikkakara' },
    { day: 'Inauguration Ceremony', time: '', event: 'Vote of Thanks', speaker: 'Dr. Jagadeesh Kumar P', description: 'General Chair, ICTEST' },
    { day: 'Inauguration Ceremony', time: '', event: 'National Anthem', speaker: '' },
    { day: 'Day 1', date: 'April 3, 2025', time: '11:00 AM', event: 'Plenary Session', speaker: 'Dr. B S Manoj', description: 'Chair, IEEE Kerala Section, Associate Dean, IIST', venue: '' },
    { day: 'Day 1', date: 'April 3, 2025', time: '1:00 PM - 2:00 PM', event: 'Lunch Break', speaker: '', venue: '' },
    { day: 'Day 1', date: 'April 3, 2025', time: '2:00 PM', event: 'Plenary Session', speaker: 'Dr. Manjula Devananda', description: 'PhD in Information Science from the University of Otago, New Zealand\nSenior Manager AI Research Scientist, Fusemachines USA', venue: '' },
    { day: 'Day 2', date: 'April 4, 2025', time: '10:00 AM', event: 'Plenary Session', speaker: 'Dr.Meena D', description: 'Scientist, Electronics and Radar Development Establishment, LRDE, DRDO, Bangalore', venue: '' },
    { day: 'Day 2', date: 'April 4, 2025', time: '9:00 AM', event: 'Plenary Session', speaker: 'Dr. Arvind Ajoy', description: 'Associate Professor, IIT Palakkad', venue: '' },
    { day: 'Day 2', date: 'April 4, 2025', time: '2:00 PM', event: 'Plenary Session', speaker: 'Dr. Varun P Gopi', description: 'Associate Professor, NIT Trichi', venue: '' },
    { day: 'Day 3', date: 'April 5, 2025', time: '9:00 AM', event: 'Plenary Session', speaker: 'Gopan V.P', description: 'General Manager, South Asia - NVIDIA', venue: '' },
    { day: 'Day 3', date: 'April 5, 2025', time: '12:00 PM', event: 'Panel Discussion : The Intersection of Technology and Industry : Innovations and Impact.', speaker: '', venue: '' },
    { day: 'Day 3', date: 'April 5, 2025', time: '10:45 AM', event: 'Plenary Session', speaker: 'Maya R Nair',description:'Director - Chief Information Security Officer , CRISIL Limited', venue: '' },
  ];

  const renderInauguration = () => {
    return schedule
      .filter(item => item.day === 'Inauguration Ceremony')
      .map((item, index) => (
        <tr key={index}>
          <td colSpan={item.speaker ? 1 : 3} className={!item.speaker ? 'centered' : ''}>{item.event}</td>
          {item.speaker && (
            <td>
              <strong>{item.speaker}</strong>
              {item.description && (
                <div className="speaker-description">
                  {item.description.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                </div>
              )}
            </td>
          )}
        </tr>
      ));
  };


  const renderSchedule = (day) => {
    return schedule
      .filter(item => item.day === day)
      .map((item, index) => (
        <tr key={index}>
          <td>{item.time}</td>
          <td colSpan={item.speaker ? 1 : 2} className={!item.speaker ? 'centered' : ''}>
            {item.event}
            {
              item.event === "Panel Discussion : The Intersection of Technology and Industry : Innovations and Impact." &&
              (
                <div className="speaker-description">
                  <h2>Panelists</h2>
                  <ul style={{listStyleType:"none"}}>
                    <li>SBI, Bank representative</li>
                    <li>NAICO, Medical industry representative</li>
                    <li>Citrus Informatics, Software industry representative</li>
                    <li>NPOL, research representative</li>
                  </ul>
                </div>
              )

            }
          </td>
          {item.speaker && (
            <td>
              <strong>{item.speaker}</strong>
              {item.description && (
                <div className="speaker-description">
                  {item.description.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                </div>
              )}
            </td>
          )}
          {
            item.venue && (
              <td>{item.venue}</td>
            )
          }
        </tr>
      ));
  };

  return (
    <div className="schedule-container">
      <h1 className="centered-heading">Program Schedule</h1>

      <div className="schedule-section">
        <h3>Inauguration Ceremony</h3>
        <div className="schedule-table-container">
          <table className="schedule-table">
            <tbody>{renderInauguration()}</tbody>
          </table>
        </div>
      </div>

      {['Day 1 - April 3, 2025', 'Day 2 - April 4, 2025', 'Day 3 - April 5, 2025'].map((day, index) => (
        <div className="schedule-section" key={index}>
          <h3>{day}</h3>
          <div className="schedule-table-container">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>Speaker</th>
                  {/*<th>Venue</th>*/}
                </tr>
              </thead>
              <tbody>{renderSchedule(day.split(' - ')[0])}</tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgramSchedule;
