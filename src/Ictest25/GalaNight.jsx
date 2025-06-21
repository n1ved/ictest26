import React from "react";
import "./GalaNight.css";
import Lakshmi from "./gala_images/Lakshmi.jpeg";
import Chaithanya from "./gala_images/Chaithanya.jpeg";

const GalaNight = () => {
  return (
    <div className="gala-night-container p-6 bg-gray-900 text-white text-center">
      <h1 className="text-4xl font-bold mb-4">Gala Night</h1>
      <p className="text-lg mb-2">Join us for an unforgettable evening of music, dance, and entertainment!</p>
      <p className="text-lg font-semibold highlight">Date: April 4, 2025 (Day 2)</p>
      <p className="text-lg font-semibold highlight">Venue: Model Engineering College, Kochi</p>

      <div className="performances mt-6">
        <h2 className="text-2xl font-semibold mb-3">Featured Performances</h2>
        <ul className="list-disc list-inside text-lg">
          <li className="performer">
            <img src={Lakshmi} alt="Lakshmi M A" className="performer-image" />
            <span>Lakshmi M A</span>
          </li>
          <li className="performer">
            <img src={Chaithanya} alt="Chaithanya P" className="performer-image" />
            <span>Chaithanya P</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GalaNight;
