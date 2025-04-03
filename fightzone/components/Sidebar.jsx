"use client";
import { useAuth } from "../pages/services/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const getMenuItems = () => {
    switch (user.role) {
      case "Vechter":
        return [
          { path: "/dashboard", label: "Dashboard" },
          { path: "/agenda", label: "Agenda" },
          { path: "/prestatie", label: "Prestaties" },
        ];
      case "Trainer":
        return [
          { path: "/dashboard", label: "Dashboard" },
          { path: "/leden", label: "Ledenlijst" },
          { path: "/agenda", label: "Agenda" },
          { path: "/resultaat", label: "Resultaat" },
        ];
      case "VKBMO-lid":
        return [
          { path: "/dashboard", label: "Dashboard" },
          { path: "/jury", label: "Jury" },
          { path: "/clubs", label: "Cluboverzicht" },
          { path: "/agenda", label: "Agenda" },
        ];
      default:
        return [];
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <Image
            src="/Logo.png"
            alt="FightZone Logo"
            width={160}
            height={80}
            className="logo"
            priority
          />
        </div>
        <p className="user-role">{user.role}</p>
      </div>
      <nav className="sidebar-nav">
        {getMenuItems().map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          Uitloggen
        </button>
      </div>
      <style jsx global>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          background-color: #ffffff;
          color: #333333;
          padding: 20px 14px;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
          border-right: 1px solid #e8e8e8;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding-bottom: 20px;
          border-bottom: 1px solid #e8e8e8;
          margin-bottom: 20px;
          text-align: center;
        }

        .logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 10px;
        }

        .logo {
          object-fit: contain;
        }

        .user-role {
          margin: 5px 0 0;
          font-size: 16px;
          color: #666666;
          font-weight: 500;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-grow: 1;
        }

        .nav-item {
          display: block;
          padding: 14px 15px;
          color: #333333;
          text-decoration: none;
          border-radius: 5px;
          transition: all 0.2s ease;
          font-size: 16px;
          font-weight: 500;
        }

        .nav-item:hover {
          background-color: #f5f5f5;
        }

        .nav-item.active {
          background-color: #3483fe;
          color: #ffffff;
          font-weight: 600;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #e8e8e8;
        }

        .logout-button {
          width: 100%;
          padding: 12px;
          background-color: #ff4444;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .logout-button:hover {
          background-color: #cc0000;
        }
      `}</style>
    </div>
  );
}
