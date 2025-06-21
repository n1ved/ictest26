import "./Accomodation.css";
import React from "react";
import { Map } from "lucide-react";

export default function Accommodations() {
  const navigationHandler = (url) => {
    window.open(url, "_blank");
  };

  const recommendedHotels = [
    {
      name: "The Renai Cochin",
      location: "Palarivattom, Kochi, Kerala",
      url: "https://maps.app.goo.gl/z4ZFD9nHANW9wDvQA"
    },
    {
      name: "ADDRESS7",
      location: "Kalamassery, Kochi, Kerala",
      url: "https://maps.app.goo.gl/Boo66kxdavs343b46"
    },
    {
      name: "SpringField Billets",
      location: "Eranakulam North, Kochi, Kerala",
      url: "https://maps.app.goo.gl/T2r2K7KrnCJu6A5NA"
    },
    {
      name: "Ginger Kochi",
      location: "Kalamassery, Kochi, Kerala",
      url: "https://maps.app.goo.gl/8mq8eTR3zhXD2KMDA"
    },
    {
      name: "Puthens Capitol Inn",
      location: "Kaloor, Kochi, Kerala",
      url: "https://maps.app.goo.gl/s5iwW15aJd2TxSrg9"
    },
    {
      name: "Gokulam Park",
      location: "Kaloor, Kochi, Kerala",
      url: "https://maps.app.goo.gl/TdeZYhxaVidKnEWz5"
    },
    {
      name: "IMA House",
      location: "Palarivattom, Kochi, Kerala",
      url: "https://maps.app.goo.gl/u8WGLSJ9rerzrf7k6"
    },
    {
      name: "RECCAA Club",
      location: "Thrikkakara, Kakkanad, Kerala",
      url: "https://maps.app.goo.gl/p6q9JqQ6xkKWuFzt5"
    }
  ];

  return (
    <div className="accommodation-container">
      <h2 className="accommodation-title">Accommodation</h2>
      <p>ICTEST does not provide any accommodation to participants. However, we have listed some hotels below for your convenience.</p>
      <div className="hotel-grid">
        {recommendedHotels.map((hotel) => (
          <div className="hotel-card" key={hotel.name}>
            <div className="hotel-info">
              <h3>{hotel.name}</h3>
              <p className="hotel-address">{hotel.location}</p>
              <button onClick={() => navigationHandler(hotel.url)}>
                Get Directions <Map className="map-icon" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
