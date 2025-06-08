"use client";
import { useAuth } from "../src/services/auth";
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
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
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

            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon className="nav-icon" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <Link
            href="/settings"
            className={`nav-item ${pathname === "/settings" ? "active" : ""}`}
          >
            <Cog6ToothIcon className="nav-icon" />
            Instellingen
          </Link>
          <button onClick={handleLogout} className="nav-item logout-button">
            <ArrowRightStartOnRectangleIcon className="nav-icon" />
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
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 14px 15px;
          color: #62789b;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 16px;
          font-weight: 500;
        }

        .nav-item:hover {
          background-color: #f8f9fb;
        }

        .nav-item.active {
          background-color: #ebf3ff;
          color: #3483fe;
          font-weight: 600;
          padding: 0.85rem 1.2rem;
        }

        .nav-item svg {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          color: inherit;
        }

        .nav-item.active svg {
          color: #3483fe;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #e8e8e8;
        }

        .logout-button {
          width: 100%;
          background-color: transparent;
          color: #62789b;
          border: none;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 14px 15px;
          text-align: left;
        }

        .logout-button:hover {
          background-color: #f8f9fb;
        }

        .logout-button svg {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          color: inherit;
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
          color: #62789b;
          padding: 10px 5px;
          gap: 5px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .mobile-nav-item.active {
          background-color: #ebf3ff;
          color: #3483fe;
          flex-direction: row;
          gap: 8px;
          padding: 12px 14px;
        }

        .mobile-nav-icon {
          width: 24px;
          height: 24px;
          color: inherit;
        }

        .mobile-nav-item.active .mobile-nav-icon {
          color: #3483fe;
        }

        .mobile-nav-item span {
          font-size: 12px;
          font-weight: 500;
        }

        .mobile-nav-item.logout-button {
          background-color: transparent;
          color: #62789b;
          border: none;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          padding: 10px 5px;
        }

        .mobile-nav-item.logout-button:hover {
          background-color: #f8f9fb;
        }

        .mobile-nav-item.logout-button svg {
          width: 24px;
          height: 24px;
          color: inherit;
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
