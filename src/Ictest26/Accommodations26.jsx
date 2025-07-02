import "../Ictest25/Accomodation.css";
import React from "react";
import { Map } from "lucide-react";

export default function Accommodations26() {
  const navigationHandler = (url) => {
    window.open(url, "_blank");
  };

  const recommendedHotels = [
    {
      name: "Hotel recommendations will be provided",
      location: "Location details to be announced",
      url: "#"
    },
    {
      name: "Accommodation options to be updated",
      location: "Based on venue confirmation",
      url: "#"
    },
    {
      name: "Details coming soon",
      location: "Stay tuned for updates",
      url: "#"
    }
  ];

  return (
    <div className="accommodation-container">
      <h2 className="accommodation-title">Accommodation</h2>
      <p>ICTEST 2026 accommodation details will be provided once the venue is confirmed. We will list recommended hotels and lodging options for your convenience.</p>
      <div className="instruction-content" style={{marginBottom: "2rem", textAlign: "center"}}>
        <p><strong>Accommodation information for ICTEST 2026 will be updated soon!</strong></p>
      </div>
      <div className="hotel-grid">
        {recommendedHotels.map((hotel, index) => (
          <div className="hotel-card" key={index}>
            <div className="hotel-info">
              <h3>{hotel.name}</h3>
              <p className="hotel-address">{hotel.location}</p>
              <button onClick={() => alert("Accommodation details will be updated soon!")}>
                Details Coming Soon <Map className="map-icon" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
