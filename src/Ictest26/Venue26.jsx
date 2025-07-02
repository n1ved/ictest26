import React, { useEffect, useState } from "react";
import "../Ictest25/Venue.css";

// Using the same venue images for now - can be updated later
import venueImage1 from "../Ictest25/venue_images/venue1.avif";
import venueImage2 from "../Ictest25/venue_images/venue2.webp";
import venueImage3 from "../Ictest25/venue_images/venue3.webp";

const images = [
  venueImage1,
  venueImage2,
  venueImage3,
];

export default function Venue26() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getDirectionHandler = () => {
    window.open("https://maps.app.goo.gl/CzxXNc9Tc2nGUvVe6", "_blank");
  };

  return (
    <div className="venue-container" id="venue">
      <h1 className="centered-heading">Venue</h1>
      <div className="instruction-content" style={{marginBottom: "2rem", textAlign: "center"}}>
        <p>Venue details for ICTEST 2026 will be confirmed and updated soon.</p>
      </div>
      <div className="venue-wrapper">
        <div className="venue-image-slider">
          {images.map((image, index) => (
            <div
              key={index}
              className={`venue-image ${index === currentImageIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${image})` }}
            ></div>
          ))}
        </div>
        <div className="venue-details">
          <h2>Venue TBD</h2>
          <p>Location to be announced</p>
          <div className="button-container">
            <button onClick={() => alert("Venue details will be updated soon!")}>
              Venue Details Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
