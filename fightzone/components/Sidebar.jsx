"use client";
import { useAuth } from "../pages/services/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const getMenuItems = () => {
    switch (user.role) {
      case "Vechter":
        return [
          { path: "/dashboard", label: "Dashboard" },
          { path: "/profile", label: "Mijn Profiel" },
          { path: "/training", label: "Training" },
          { path: "/matches", label: "Wedstrijden" },
          { path: "/schedule", label: "Schema" },
        ];
      case "Trainer":
        return [
          { path: "/members", label: "Leden" },
          { path: "/training", label: "Training" },
          { path: "/schedule", label: "Schema" },
          { path: "/matches", label: "Wedstrijden" },
          { path: "/reports", label: "Rapporten" },
        ];
      case "VKBMO-lid":
        return [
          { path: "/clubs", label: "Clubs" },
          { path: "/members", label: "Leden" },
          { path: "/tournaments", label: "Toernooien" },
          { path: "/reports", label: "Rapporten" },
          { path: "/settings", label: "Instellingen" },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>FightZone</h2>
        <p className="user-role">{user.role}</p>
      </div>
      <nav className="sidebar-nav">
        {getMenuItems().map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`nav-item ${pathname === item.path ? "active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <style jsx>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          background-color: #1a1a1a;
          color: white;
          padding: 20px;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }

        .sidebar-header {
          padding-bottom: 20px;
          border-bottom: 1px solid #333;
          margin-bottom: 20px;
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 24px;
          color: #fff;
        }

        .user-role {
          margin: 5px 0 0;
          font-size: 14px;
          color: #888;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .nav-item {
          padding: 12px 15px;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          transition: background-color 0.2s;
        }

        .nav-item:hover {
          background-color: #333;
        }

        .nav-item.active {
          background-color: #4a90e2;
        }
      `}</style>
    </div>
  );
}
