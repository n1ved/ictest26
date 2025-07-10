import React from 'react';
import '../Ictest25/Notifications.css';

export default function Notifications26() {
  return (
    <div className="notifications-container" id="notifications">
      <h2>Notifications</h2>
      <div className="instruction-container">
        <h3 className="instruction-title">
          ICTEST 2026 - Updates Coming Soon
        </h3>
        <div className="instruction-content">
          Welcome to ICTEST 2026! We are currently preparing all the details for the upcoming conference.
          <br />
          Please stay tuned for important announcements regarding:
          <div className="spacer" />
          <ul>
            <li>Call for papers and submission deadlines</li>
            <li>
              Review process and guidelines for authors
            </li>
            <li>
              Registration details and conference schedule
            </li>
            <li>
              Venue information and accommodation options
            </li>
          </ul>
          <div className="spacer" />
          All updates will be posted here as they become available. Make sure to check back regularly for the latest information.
        </div>
      </div>
    </div>
  );
}
