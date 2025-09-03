import "./conferenceTrack.css"
export default function ConferenceTrack() {
    const topics = [
        "Artificial Intelligence, Machine Learning and Data Science",
        "Cybersecurity and Network Technologies",
        "Internet of Things (IoT), Blockchain Technologies and Smart Systems",
        "Underwater GPS and Laser Communication",
        "VLSI and Embedded Systems",
        "Renewable Energy Systems, Management & Storage",
        "Image Processing, Signal Processing and Communication Systems",
        "Biomedical Engineering and Healthcare Technologies",
        "Power Electronics and Power Systems",
        "Mechatronics, Robotics, Control and Automation",
        "Electric & Hybrid Vehicles and Battery Technologies",
        "Reliability Engineering",
    ];
    return (
        <>
            <div className="conference">
                <h2>Conference Tracks : </h2>
                <div className="conference-track">
                    <ul>
                        {topics.map((topic, index) => (
                            <li key={index}>{topic}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}