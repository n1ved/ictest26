import React from 'react';
import '../Ictest25/Notifications.css';

export default function Notifications26() {
  return (
      <div className="notifications-container notifications-container-26" id="notifications">
        <h2>Notifications</h2>
        <div className="instruction-container instruction-container-26">
          <h3 className="instruction-title">Important Notification</h3>
          <div className="instruction-content">
            <p>
              To view the reviewer comments, please log in to the submission portal:{' '}
              <a
                href="https://cmt3.research.microsoft.com/ICTEST2026"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://cmt3.research.microsoft.com/ICTEST2026
              </a>{' '}
              using your registered email ID.
            </p>
            <p>
              Kindly incorporate all reviewer suggestions while preparing the camera-ready version of your manuscript. Ensure that your paper adheres strictly to the IEEE format and is free from typographical errors.
            </p>
            <p><strong>Registration Details</strong></p>
            <p>
              Registration for ICTEST 2026 will be open from <span className="date-values">25th April 2026</span> to <span className="date-values">10th May 2026</span>. Please note that registration will close on <span className="date-values">10th May 2026</span>.
            </p>
            <p>
              Each accepted paper requires a separate registration. For example, if you have two accepted papers, two registrations are required for publication.
            </p>
            <p>
              The registration link and guidelines for preparing the camera-ready paper (CRP) will be shared shortly.
            </p>
            <p>
              For publication related queries, please contact: <span className="contact-numbers">+91 9388815039, +91 9605497787</span>
            </p>
          </div>
        </div>
      </div>
  );
}
