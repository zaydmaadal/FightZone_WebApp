import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/components/Sidebar.css";
import logo from "../../assets/images/fightzoneLogo.png";

const TrainerSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <img src={logo} alt="FightZone Logo" className="logo" />
      <nav className="menu">
        <Link to="/" className="menu-item">
          Dashboard
        </Link>
        <Link to="/members" className="menu-item">
          Ledenlijst
        </Link>
        <Link to="/settings" className="menu-item">
          Instellingen
        </Link>
      </nav>
      <button onClick={handleLogout} className="logout-button">
        Uitloggen
      </button>
    </div>
  );
};

export default TrainerSidebar;
