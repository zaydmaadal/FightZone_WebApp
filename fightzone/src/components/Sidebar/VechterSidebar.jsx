import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/components/Sidebar.css";
import logo from "../../assets/images/fightzoneLogo.png";

const VechterSidebar = () => {
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
        <Link to="/prestaties" className="menu-item">
          Mijn Prestaties
        </Link>
      </nav>
      <button onClick={handleLogout} className="logout-button">
        Uitloggen
      </button>
    </div>
  );
};

export default VechterSidebar;
