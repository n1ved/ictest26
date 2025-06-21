import React, { useEffect, useState } from "react";
import "./Venue.css";

import venueImage1 from "./venue_images/venue1.avif";
import venueImage2 from "./venue_images/venue2.webp";
import venueImage3 from "./venue_images/venue3.webp";

const images = [
  venueImage1,
  venueImage2,
  venueImage3,
];

export default function Venue() {
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
          <h2>The Renai Cochin</h2>
          <p>Palarivattom, Kochi, Kerala.</p>
          <div className="button-container">
            <button onClick={getDirectionHandler}>Get Directions</button>
          </div>
        </div>
      </div>
    </div>
  );
}
