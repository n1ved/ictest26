import React from 'react';
import './Notifications.css';

export default function Notifications() {
  return (
    <div className="notifications-container" id="notifications">
      <h2>Notifications</h2>
      <div className="instruction-container">
        <h3 className="instruction-title">
          Regarding Paper Review Comments
        </h3>
        <div className="instruction-content">
          The review comments for your paper are available on the conference
          paper management site (
          <a href="https://cmt3.research.microsoft.com/ICTEST2025">
            https://cmt3.research.microsoft.com/ICTEST2025
          </a>
          )
          <br />
          Please log in using your email to view and address the comments:
          <div className="spacer" />
          <ul>
            <li>Revise your paper as per the review comments.</li>
            <li>
              Submit the final camera-ready version by the deadline,
              ensuring IEEE formatting compliance.
            </li>
            <li>
              Complete the registration process as per conference
              guidelines.
            </li>
          </ul>
          <div className="spacer" />
          Failure to incorporate all required changes may result in the
          withdrawal of your paper from the final program and publication.
        </div>
      </div>
    </div>
  );
}
