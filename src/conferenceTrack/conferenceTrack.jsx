import "./conferenceTrack.css"
export default function ConfernceTrack() {
    const topics = [
        "Artificial Intelligence",
        "Machine Learning and Data Science",

        "Cybersecurity and Network Technologies",

        "Internet of Things(IoT)",

        "Blockchain",

        "Technologies and Smart Systems",

        "Underwater GPS and Laser Communication",

        "VLSI and Embedded Systems",

        "Image Processing, Signal Processing and Communication Systems",

        "Biomedical Engineering and Healthcare Technologies",

        "Power Electronics",

        "Power Systems and Renewable Energy Mechatronics",

        "Robotics",

        "Control and Automation",

        "Electric & Hybrid Vehicles and Battery Technologies",

        "Energy Conservation and Management",

        "Reliability Engineering ",

        "Material Science",
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