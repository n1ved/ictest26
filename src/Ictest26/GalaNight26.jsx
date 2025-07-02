import React from 'react';
import '../Ictest25/GalaNight.css';

const GalaNight26 = () => {
    return (
        <div className="gala-night-container">
            <h1>Gala Night</h1>
            <div className="instruction-content" style={{marginBottom: "2rem", textAlign: "center"}}>
                <p><strong>ICTEST 2026 Gala Night details will be announced soon!</strong></p>
                <p>We are planning an exciting evening event for all conference participants. Stay tuned for more information.</p>
            </div>

            <div className="gala-details">
                <h3>Event Details (To Be Announced)</h3>
                <ul>
                    <li><strong>Date:</strong> TBD</li>
                    <li><strong>Time:</strong> TBD</li>
                    <li><strong>Venue:</strong> TBD</li>
                    <li><strong>Dress Code:</strong> TBD</li>
                    <li><strong>Registration:</strong> Details coming soon</li>
                </ul>

                <h3>What to Expect</h3>
                <p>Our Gala Night will feature:</p>
                <ul>
                    <li>Networking opportunities with fellow researchers and industry professionals</li>
                    <li>Cultural performances and entertainment</li>
                    <li>Awards and recognition ceremony</li>
                    <li>Dinner and refreshments</li>
                    <li>Special presentations and acknowledgments</li>
                </ul>

                <h3>Registration Information</h3>
                <p>Registration details and ticket information for the Gala Night will be provided along with the main conference registration process.</p>
            </div>
        </div>
    );
};

export default GalaNight26;
