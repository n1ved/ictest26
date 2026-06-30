import "../Ictest25/Accomodation.css";
import React from "react";
import { Map } from "lucide-react";

export default function Accommodations26() {
  const navigationHandler = (url) => {
    window.open(url, "_blank");
  };

  const recommendedHotels = [
    {
      name: "The Renai Cochin",
      location: "Palarivattom, Kochi, Kerala",
      url: "https://maps.app.goo.gl/z4ZFD9nHANW9wDvQA",
    },
    {
      name: "Itsy Hotels Rain Tulsi Stayz",
      location: "Palarivattom, Kochi, Kerala",
      url: "https://maps.app.goo.gl/avkpL6A9eKdiJpzT7",
    },
    {
      name: "Luxo Kochi",
      location: "Palarivattom, Kochi, Kerala",
      url: "https://maps.app.goo.gl/vPvXv73G9Y9MqWqLA",
    },
    {
      name: "Monsoon Empress Hotel",
      location: "Palarivattom, Kochi, Kerala",
      url: "https://maps.app.goo.gl/GYDwnuU4cam1zVEM9",
    },
    {
      name: "Uniro Hotels & Appartments",
      location: "Palarivattom, Kochi, Kerala",
      url: "https://maps.app.goo.gl/R11TxSQKoxnPnffP8",
    },
    {
      name: "Townbridge Hotels & Suites",
      location: "Ernakulam South, Ernakulam, Kerala",
      url: "https://maps.app.goo.gl/fWdLBj2HYUrgQqWV7",
    },
    {
      name: "Hotel O by OYO",
      location: "Palarivattom, Kochi, Kerala",
      url: "https://maps.app.goo.gl/vqKce73yHTPduxhf6",
    },
    {
      name: "Pleasant Inn",
      location: "Padivattom, Edappally, Kochi",
      url: "https://maps.app.goo.gl/XMtjHHsqjtNYufE29",
    },
    {
      name: "Casilda By The Oaks Inn",
      location: "Palarivattom, Kochi, Kerala",
      url: "https://maps.app.goo.gl/XWoz6Ed7MkBHRU398",
    },
    {
      name: "Laimar Hotels",
      location: "Edappally, Kochi",
      url: "https://maps.app.goo.gl/5f4AZQCk3phAumRj8",
    },
    {
      name: "Esquina Residency",
      location: "Edappally, Kochi",
      url: "https://maps.app.goo.gl/Cuzcx6F9Fvmx5Qy18",
    },
    {
      name: "Abab Residency",
      location: "Edappally, Kochi",
      url: "https://maps.app.goo.gl/5f4AZQCk3phAumRj8",
    },
    {
      name: "Kochi Marriott Hotel",
      location: "Edappally, Kochi",
      url: "https://maps.app.goo.gl/9pTCx35KxEFG575t9",
    },
    {
      name: "Gokulam Park Hotel",
      location: "Kaloor, Kochi",
      url: "https://maps.app.goo.gl/qPNeRRqAQfQd8LWf7",
    },
    {
      name: "PGS Vedanta",
      location: "Kaloor, Kochi",
      url: "https://maps.app.goo.gl/PunzW21Rd5ZDtvFU6",
    },
    {
      name: "YMCA International House",
      location: "Chittoor Road, Ernakulam, Cochin 682035",
      url: "https://www.ymcaernakulam.in/accommodation/international-house/",
    },
    {
      name: "YMCA International Youth Centre",
      location:
        "YMCA Road Opp. Medical Centre Hospital Ernakulam, Palarivattom, Kochi, Kerala 682025",
      url: "https://www.ymcaernakulam.in/accommodation/ymca-international-youth-centre/",
    },
    {
      name: "YMCA Hostels",
      location: "Palarivattom, Kadavanthra, Thrikkakara",
      url: "https://www.ymcaernakulam.in/accommodation/",
    },
    {
      name: "Hotel Kochi Crown",
      location: "Pipeline Junction, Kochi, India",
      url: "https://crown.kerala-hotels.net/en/?from=2026-07-01&to=2026-07-02&adults=2&children=0&clirder=1&_1782804648146https://crown.kerala-hotels.net/en/#rooms",
    },
  ];

  return (
    <div className="accommodation-container">
      <h2 className="accommodation-title">Accommodation</h2>
      <p>
        ICTEST 2026 accommodation details will be provided once the venue is
        confirmed. We will list recommended hotels and lodging options for your
        convenience.
      </p>
      {/* <div
        className="instruction-content"
        style={{ marginBottom: "2rem", textAlign: "center" }}
      >
        <p>
          <strong>
            Accommodation information for ICTEST 2026 will be updated soon!
          </strong>
        </p>
      </div>*/}
      <div className="hotel-grid">
        {recommendedHotels.map((hotel, index) => (
          <div className="hotel-card" key={index}>
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
