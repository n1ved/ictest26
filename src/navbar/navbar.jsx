import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
import mecLogo from "../assets/mecLogo.png";
import kerala_chapter from "../assets/kerala_chapter.jpg";
import ihrdLogo from "../assets/ihrdlogo.jpg";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoCloseOutline } from "react-icons/io5";

export default function Navbar() {
  const [mobilenav, setmobilenav] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown on navigation or outside click (mobile)
  useEffect(() => {
    if (!mobilenav) setDropdownOpen(false);
    const handleClick = (e) => {
      if (!e.target.closest('.dropdown')) setDropdownOpen(false);
    };
    if (mobilenav && dropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobilenav, dropdownOpen]);

  return (
    <div className="navbar">
      <div className="logo-div">
        <div className="logo-text">
          <a href="https://r10.ieee.org/kerala-es/" target="_blank">
            <img className="logo-image" src={kerala_chapter} alt="" />
          </a>
          <span>IEEE KERALA CHAPTER</span>
        </div>
        <span className="ictest">ICTEST</span>
      </div>
      <ul>
        <li>
          <div className="hover-circle"></div>
          <a href={"/"}>home</a>
        </li>
        <li>
          <div className="hover-circle"></div>
          <a href={"/forauthors"}>Schedule</a>
        </li>
        <li>
          <div className="hover-circle"></div>
          <a href={"/committee"}>committee </a>
        </li>
        <li>
          <div className="hover-circle"></div>
          <a href={"/guidelines"}>Author guidelines </a>
        </li>
        <li
          className="dropdown"
          onMouseEnter={() => !mobilenav && setDropdownOpen(true)}
          onMouseLeave={() => !mobilenav && setDropdownOpen(false)}
        >
          <div className="hover-circle"></div>
          <span
            className="dropdown-toggle"
            tabIndex={0}
            onClick={() => setDropdownOpen((v) => !v)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') setDropdownOpen((v) => !v);
            }}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            Previous Editions
          </span>
          <ul className="dropdown-menu" style={{ display: dropdownOpen ? 'block' : undefined }}>
            <li>
              <a href="/gallery">ICTEST <span className="year-2024">2024</span></a>
            </li>
            <li>
              <a href="/2025">ICTEST 2025</a>
            </li>
          </ul>
        </li>
        <li>
          <div className="hover-circle blink"></div>
          <a href={"/2026"} className="blink">
            ICTEST 2026
          </a>
        </li>
      </ul>
      <div className="logo-div mec-logo">
        <div className="logo-text">
          <div className="logo-row">
            <a href="https://ihrd.ac.in/" target="_blank" aria-label="IHRD">
              <img className="ihrd-logo" src={ihrdLogo} alt="IHRD" />
            </a>
            <a href="https://www.mec.ac.in/" target="_blank" aria-label="Govt. Model Engineering College">
              <img className="mec-logo-img" src={mecLogo} alt="Govt. Model Engineering College" />
            </a>
          </div>
          <span>Govt. Model Engineering College</span>
        </div>
      </div>
      <button onClick={() => setmobilenav(!mobilenav)} className="hamburger">
        {!mobilenav ? (
          <RxHamburgerMenu className="text-[40px] text-gray-light" />
        ) : (
          <IoCloseOutline className="text-[40px] text-gray-light" />
        )}
      </button>

      {mobilenav && (
        <div className="element">
          <ul>
            <li>
              <div className="hover-circle"></div>
              <a href={"/"}>home</a>
            </li>
            <li>
              <div className="hover-circle"></div>
              <a href={"/forauthors"}>For Authors</a>
            </li>
            <li>
              <div className="hover-circle"></div>
              <a href={"/committee"}>committee </a>
            </li>
            <li>
              <div className="hover-circle"></div>
              <a href={"/guidelines"}>guidelines </a>
            </li>
            <li
              className="dropdown"
            >
              <div className="hover-circle"></div>
              <span
                className="dropdown-toggle"
                tabIndex={0}
                onClick={() => setDropdownOpen((v) => !v)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') setDropdownOpen((v) => !v);
                }}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                Previous Editions
              </span>
              <ul className="dropdown-menu" style={{ display: dropdownOpen ? 'block' : undefined }}>
                <li>
                  <a href="/gallery">ICTEST <span className="year-2024">2024</span></a>
                </li>
                <li>
                  <a href="/2025">ICTEST 2025</a>
                </li>
              </ul>
            </li>
            <li>
              <div className="hover-circle blink"></div>
              <a href={"/2026"} className="blink">
                ICTEST 2026
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
