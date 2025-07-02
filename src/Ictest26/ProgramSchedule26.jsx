import React from 'react';
import '../Ictest25/ProgramSchedule.css';

const ProgramSchedule26 = () => {
  const schedule = [
    { day: 'Inauguration Ceremony', time: '', event: 'Prayer', speaker: '' },
    { day: 'Inauguration Ceremony', time: '', event: 'Welcome', speaker: 'TBD', description: 'Details to be announced' },
    { day: 'Inauguration Ceremony', time: '', event: 'Presidential Address', speaker: 'TBD', description: 'Details to be announced' },
    { day: 'Inauguration Ceremony', time: '', event: 'Inauguration', speaker: 'TBD', description: 'Details to be announced' },
    { day: 'Inauguration Ceremony', time: '', event: 'Felicitation', speaker: 'TBD', description: 'Details to be announced' },
    { day: 'Inauguration Ceremony', time: '', event: 'Vote of Thanks', speaker: 'TBD', description: 'Details to be announced' },
    { day: 'Inauguration Ceremony', time: '', event: 'National Anthem', speaker: '' },
    { day: 'Day 1', date: 'TBD', time: 'TBD', event: 'Plenary Session', speaker: 'TBD', description: 'Details to be announced', venue: '' },
    { day: 'Day 1', date: 'TBD', time: 'TBD', event: 'Lunch Break', speaker: '', venue: '' },
    { day: 'Day 1', date: 'TBD', time: 'TBD', event: 'Plenary Session', speaker: 'TBD', description: 'Details to be announced', venue: '' },
    { day: 'Day 2', date: 'TBD', time: 'TBD', event: 'Plenary Session', speaker: 'TBD', description: 'Details to be announced', venue: '' },
    { day: 'Day 2', date: 'TBD', time: 'TBD', event: 'Plenary Session', speaker: 'TBD', description: 'Details to be announced', venue: '' },
    { day: 'Day 2', date: 'TBD', time: 'TBD', event: 'Plenary Session', speaker: 'TBD', description: 'Details to be announced', venue: '' },
    { day: 'Day 3', date: 'TBD', time: 'TBD', event: 'Plenary Session', speaker: 'TBD', description: 'Details to be announced', venue: '' },
    { day: 'Day 3', date: 'TBD', time: 'TBD', event: 'Panel Discussion', speaker: 'TBD', description: 'Details to be announced', venue: '' },
    { day: 'Day 3', date: 'TBD', time: 'TBD', event: 'Plenary Session', speaker: 'TBD', description: 'Details to be announced', venue: '' },
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
          <td>{item.event}</td>
          <td>
            {item.speaker && <strong>{item.speaker}</strong>}
            {item.description && (
              <div className="speaker-description">
                {item.description.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
            )}
          </td>
        </tr>
      ));
  };

  return (
    <div className="schedule-container">
      <h1>Program Schedule</h1>
      <div className="instruction-content" style={{marginBottom: "2rem", textAlign: "center"}}>
        <p><strong>ICTEST 2026 Program Schedule - Dates and times to be announced</strong></p>
        <p>The detailed program schedule will be updated once speaker confirmations and venue details are finalized.</p>
      </div>

      <div className="day-schedule">
        <h3>Inauguration Ceremony</h3>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Speaker/Description</th>
            </tr>
          </thead>
          <tbody>
            {renderInauguration()}
          </tbody>
        </table>
      </div>

      <div className="day-schedule">
        <h3>Day 1 - TBD</h3>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Speaker/Description</th>
            </tr>
          </thead>
          <tbody>
            {renderSchedule('Day 1')}
          </tbody>
        </table>
      </div>

      <div className="day-schedule">
        <h3>Day 2 - TBD</h3>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Speaker/Description</th>
            </tr>
          </thead>
          <tbody>
            {renderSchedule('Day 2')}
          </tbody>
        </table>
      </div>

      <div className="day-schedule">
        <h3>Day 3 - TBD</h3>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Speaker/Description</th>
            </tr>
          </thead>
          <tbody>
            {renderSchedule('Day 3')}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgramSchedule26;
