import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/components/Sidebar.css";
import logo from "../../assets/images/fightzoneLogo.png";

const VKBMOSidebar = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null); // Update de user state
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <img src={logo} alt="FightZone Logo" className="logo" />
      <nav className="menu">
        <Link to="/" className="menu-item">
          Dashboard
        </Link>
        <Link to="/clubs" className="menu-item">
          Clubs
        </Link>
      </nav>
      <button onClick={handleLogout} className="logout-button">
        Uitloggen
      </button>
    </div>
  );
};

export default VKBMOSidebar;
