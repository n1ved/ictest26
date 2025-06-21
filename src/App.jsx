import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./navbar/navbar";
import Dashboard from "./dashboard/dashboard";
import ForAuthors from "./forauthors/forauthors.jsx";
import Committee from "./committee/committee.jsx";
import ImageGallery from "./gallery/gallery.jsx";
import GuideLines from "./guidelines/GuideLines.jsx";
import ICtest25Info from "./Ictest25/ICtest25Info.jsx";
import ICtest26Info from "./Ictest26/ICtest26Info.jsx";
import Auth from "./Ictest26/Auth.jsx";
import Dashboard26 from "./Ictest26/Dashboard.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/gallery" element={<ImageGallery />} />
          <Route path="/forauthors" element={<ForAuthors />} />
          <Route path="/guidelines" element={<GuideLines />} />
          <Route path="/committee" element={<Committee />} />
          <Route path="/2025" element={<ICtest25Info />} />
          <Route path="/2026" element={<ICtest26Info />} />
          <Route path="/2026/login" element={<Auth />} />
          <Route path="/2026/dashboard" element={<Dashboard26 />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
