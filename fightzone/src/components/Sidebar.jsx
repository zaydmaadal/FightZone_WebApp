import React from "react";
import { Link } from "react-router-dom";
import "../assets/styles/components/Sidebar.css";
import logo from "../assets/images/fightzoneLogo.png"; // Zorg dat je logo hier correct is geplaatst

const Sidebar = () => {
  return (
    <div className="sidebar">
      <img src={logo} alt="FightZone Logo" className="logo" />
      <nav className="menu">
        <Link to="/" className="menu-item">Dashboard</Link>
        <Link to="/members" className="menu-item">Ledenlijst</Link>
        <Link to="/events" className="menu-item">Evenementen</Link>
        <Link to="/settings" className="menu-item">Instellingen</Link>
      </nav>
      <p className="footer-text">VKBMO</p>
    </div>
  );
};

export default Sidebar;
