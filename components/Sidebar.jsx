"use client";
import { useAuth } from "../pages/services/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { QrCodeIcon } from "@heroicons/react/24/solid";
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  CalendarIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const getMenuItems = () => {
    if (!user || !user.role) return [];

    switch (user.role) {
      case "Vechter":
        return [
          { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
          { path: "/agenda", label: "Agenda", icon: CalendarIcon },
          {
            path: "/prestatie",
            label: "Prestaties",
            icon: ClipboardDocumentCheckIcon,
          },
        ];
      case "Trainer":
        return [
          { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
          { path: "/ledenlijst", label: "Ledenlijst", icon: UserGroupIcon },
          { path: "/agenda", label: "Agenda", icon: CalendarIcon },
          {
            path: "/resultaat",
            label: "Resultaat",
            icon: ClipboardDocumentCheckIcon,
          },
        ];
      case "VKBMO-lid":
        return [
          { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
          { path: "/jury", label: "Jury", icon: ClipboardDocumentCheckIcon },
          { path: "/clubs", label: "Cluboverzicht", icon: UserGroupIcon },
          { path: "/agenda", label: "Agenda", icon: CalendarIcon },
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

  const menuItems = getMenuItems();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <Image
              src="/FightZoneLogo.png"
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
          {menuItems.map((item) => {
            const isActive = pathname
              ? pathname === item.path ||
                (item.path === "/ledenlijst" &&
                  pathname.startsWith("/ledenlijst/")) ||
                (item.path === "/clubs" &&
                  (pathname.startsWith("/clubs/") ||
                    pathname.startsWith("/member/")))
              : false;

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
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav">
        <nav className="mobile-nav-items">
          {menuItems.map((item) => {
            const isActive = pathname
              ? pathname === item.path ||
                (item.path === "/ledenlijst" &&
                  pathname.startsWith("/ledenlijst/")) ||
                (item.path === "/clubs" &&
                  (pathname.startsWith("/clubs/") ||
                    pathname.startsWith("/member/")))
              : false;

            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`mobile-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon className="mobile-nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <style jsx global>{`
        /* Desktop Sidebar Styles */
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
          color: #9db2ce;
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
          background-color: #0b48ab;
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

        /* Mobile Navigation Styles */
        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: #ffffff;
          border-top: 1px solid #e8e8e8;
          padding: 8px 5px;
          z-index: 1000;
        }

        .mobile-nav-items {
          display: flex;
          justify-content: space-around;
          align-items: center;
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: #9db2ce;
          padding: 10px 5px;
          gap: 5px;
          border-radius: 9999px;
          transition: all 0.2s ease;
        }

        .mobile-nav-item.active {
          background-color: #0b48ab;
          color: #ffffff;
          flex-direction: row;
          gap: 8px;
          padding: 12px 14px;
        }

        .mobile-nav-icon {
          width: 24px;
          height: 24px;
          margin-bottom: 4px;
        }

        .mobile-nav-item.active .mobile-nav-icon {
          margin-bottom: 0;
        }

        .mobile-nav-item span {
          font-size: 12px;
          font-weight: 500;
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }

          .mobile-nav {
            display: block;
          }

          /* Add padding to main content to account for bottom nav */
          main {
            padding-bottom: 80px;
          }
        }
      `}</style>
    </>
  );
}
