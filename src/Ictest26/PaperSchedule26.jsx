import React from 'react';
import '../Ictest25/ProgramSchedule.css';

const PaperSchedule26 = () => {
    return (
        <div className="schedule-container">
            <h1>Presentation Schedule</h1>
            <div className="instruction-content" style={{marginBottom: "2rem", textAlign: "center"}}>
                <p><strong>ICTEST 2026 Paper Presentation Schedule - To be announced after paper acceptance</strong></p>
                <p>The detailed presentation schedule will be published once the paper review process is complete and accepted papers are confirmed.</p>
            </div>

            <div className="schedule-info">
                <h3>Presentation Format Information</h3>
                <p>ICTEST 2026 will feature various presentation formats to accommodate different types of research contributions:</p>

                <div className="presentation-types">
                    <h4>Oral Presentations</h4>
                    <ul>
                        <li><strong>Duration:</strong> TBD (typically 15-20 minutes including Q&A)</li>
                        <li><strong>Format:</strong> Technical presentation with slides</li>
                        <li><strong>Sessions:</strong> Organized by technical tracks</li>
                        <li><strong>Equipment:</strong> Projector and microphone provided</li>
                    </ul>

                    <h4>Poster Presentations</h4>
                    <ul>
                        <li><strong>Size:</strong> Standard poster dimensions (to be specified)</li>
                        <li><strong>Duration:</strong> Interactive poster session</li>
                        <li><strong>Setup:</strong> Display boards and materials provided</li>
                        <li><strong>Format:</strong> Visual presentation with author interaction</li>
                    </ul>

                    <h4>Demo Sessions</h4>
                    <ul>
                        <li><strong>Format:</strong> Interactive demonstration of systems/prototypes</li>
                        <li><strong>Space:</strong> Dedicated demo area</li>
                        <li><strong>Equipment:</strong> Tables, power supply, and basic AV equipment</li>
                        <li><strong>Duration:</strong> Extended session for hands-on experience</li>
                    </ul>
                </div>

                <h3>Technical Tracks (Preliminary)</h3>
                <div className="tracks-info">
                    <p>Papers will be organized into technical sessions based on the following areas:</p>
                    <ul>
                        <li>Signal Processing and Communications</li>
                        <li>VLSI Design and Embedded Systems</li>
                        <li>Machine Learning and AI Applications</li>
                        <li>IoT and Sensor Networks</li>
                        <li>Power Electronics and Control Systems</li>
                        <li>Biomedical Engineering and Healthcare Technology</li>
                        <li>And more technical areas</li>
                    </ul>
                </div>

                <h3>Schedule Structure (Tentative)</h3>
                <div className="schedule-structure">
                    <h4>Day 1 - TBD</h4>
                    <ul>
                        <li>Morning: Keynote + Technical Sessions</li>
                        <li>Afternoon: Technical Sessions + Poster Session</li>
                    </ul>

                    <h4>Day 2 - TBD</h4>
                    <ul>
                        <li>Morning: Keynote + Technical Sessions</li>
                        <li>Afternoon: Technical Sessions + Demo Session</li>
                    </ul>

                    <h4>Day 3 - TBD</h4>
                    <ul>
                        <li>Morning: Technical Sessions + Panel Discussion</li>
                        <li>Afternoon: Final Sessions + Closing Ceremony</li>
                    </ul>
                </div>

                <h3>Important Information for Presenters</h3>
                <ul>
                    <li>Presentation guidelines will be sent to accepted authors</li>
                    <li>AV requirements and technical specifications to be provided</li>
                    <li>Registration confirmation required for inclusion in schedule</li>
                    <li>Backup materials and technical support will be available</li>
                </ul>

                <div className="update-notice" style={{marginTop: "2rem", padding: "1rem", background: "rgba(255, 255, 255, 0.1)", borderRadius: "8px"}}>
                    <p><strong>The detailed presentation schedule with specific times, room assignments, and session chairs will be published after the paper acceptance notifications are sent out.</strong></p>
                </div>
            </div>
        </div>
    );
};

export default PaperSchedule26;
