"use client";
import { useAuth } from "../src/services/auth";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  NewspaperIcon,
  SparklesIcon,
  ArrowRightCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [localLoading, setLocalLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    if (!loading) {
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

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
            icon: ClipboardDocumentListIcon,
          },
        ];
      case "Trainer":
        return [
          { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
          { path: "/ledenlijst", label: "Ledenlijst", icon: UsersIcon },
          { path: "/agenda", label: "Agenda", icon: CalendarIcon },
          {
            path: "/resultaat",
            label: "Resultaat",
            icon: ClipboardDocumentListIcon,
          },
        ];
      case "VKBMO-lid":
        return [
          { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
          { path: "/jury", label: "Jury", icon: ClipboardDocumentListIcon },
          { path: "/clubs", label: "Cluboverzicht", icon: UsersIcon },
          { path: "/agenda", label: "Agenda", icon: CalendarIcon },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <header className="header">
      {/* Desktop Header */}
      <div className="desktop-header">
        <div className="search"></div>

        {/* Profiel + dropdown */}
        <div
          className="profile-area"
          ref={dropdownRef}
          onClick={() => setIsDropdownOpen((o) => !o)}
        >
          <img
            src={user.profielfoto || "/default-avatar.png"}
            alt="Profile"
            className="profile-picture"
          />
          <div className="profile-text">
            <p className="user-name">{user.voornaam}</p>
            <p className="user-role">{user.role}</p>
          </div>
          <ChevronDownIcon
            className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
          />

          {isDropdownOpen && (
            <div className="dropdown-menu">
              {/* Legacy-behavior zorgt dat Next.js een <a> rendeert */}
              <Link href="/settings" legacyBehavior>
                <a className="dropdown-item">Instellingen</a>
              </Link>
              <button className="dropdown-item" onClick={logout}>
                Uitloggen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)}>
          <Bars3Icon />
        </button>
        <div className="mobile-profile">
          <img
            src={user.profielfoto || "/default-avatar.png"}
            alt="Profile"
            className="profile-picture"
          />
          <div>
            <p className="user-name">
              {user.voornaam} {user.achternaam}
            </p>
            <p className="user-role">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`sidebar-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside className={`sidebar ${isMobileMenuOpen ? "active" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo-row">
          <img
            src="/Sidebar-Logo.png"
            alt="FightZone Logo"
            className="logo-img"
          />
          <button
            className="logo-arrow-button"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ArrowRightCircleIcon
              className="logo-arrow"
              width={28}
              height={28}
            />
          </button>
        </div>
        <button
          className="close-button"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <XMarkIcon />
        </button>

        {/* Dynamic Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="sidebar-icon" width={24} height={24} />
                <span className="sidebar-title">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          <nav className="sidebar-nav">
            <Link
              href="/settings"
              className={`sidebar-nav-link${
                pathname === "/settings" ? " active" : ""
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Cog6ToothIcon className="sidebar-icon" width={24} height={24} />
              <span className="sidebar-title">Instellingen</span>
            </Link>
            <button onClick={logout} className="sidebar-logout">
              <span>Log uit</span>
            </button>
          </nav>
          <div className="sidebar-profile-block">
            <img
              src={user.profielfoto || "/default-avatar.png"}
              alt="Profile"
              className="profile-picture"
            />
            <div>
              <p className="user-name">
                {user.voornaam} {user.achternaam}
              </p>
              <p className="user-role">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        /* Sidebar Navigation Styles */
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sidebar-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #62789b;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 1rem;
          font-weight: 500;
        }

        .sidebar-nav-link:hover {
          background-color: #f8f9fb;
        }

        .sidebar-nav-link.active {
          background-color: #ebf3ff;
          color: #3483fe;
          padding: 0.85rem 1.2rem;
          font-weight: 600;
        }

        .sidebar-nav-link .sidebar-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          color: inherit;
        }

        .sidebar-nav-link.active .sidebar-icon {
          margin-right: 0.5rem;
          color: #3483fe;
        }

        .sidebar-nav-link .sidebar-title {
          font-size: 1rem;
          line-height: 1.2;
        }

        .sidebar-nav-link.active .sidebar-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #3483fe;
        }
      `}</style>

      <style jsx>{`
        .header {
          position: relative;
        }

        /* Desktop */
        .desktop-header {
          display: flex;
          align-items: center;
          padding: 1rem 2rem;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          gap: 1rem;
        }
        .search {
          flex: 1;
        }
        .search-input {
          width: 100%;
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
        }
        .profile-area {
          display: flex;
          align-items: center;
          position: relative;
          cursor: pointer;
        }
        .profile-text {
          text-align: right;
          margin-right: 0.75rem;
        }
        .user-name {
          margin: 0;
          font-weight: 600;
          font-size: 0.95rem;
        }
        .user-role {
          margin: 0;
          font-size: 0.75rem;
          color: #6b7280;
        }
        .profile-picture {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 0.5rem;
        }
        .dropdown-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }
        .dropdown-menu {
          position: absolute;
          top: 120%;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          z-index: 10;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          color: #374151;
          text-decoration: none;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .dropdown-item:hover {
          background: #f8f9fb;
        }
        .dropdown-item-icon {
          width: 16px;
          height: 16px;
          color: inherit;
        }

        /* Mobile Styles */
        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          position: relative;
          width: 100%;
        }
        @media (min-width: 769px) {
          .mobile-header {
            display: none;
          }
        }
        .mobile-profile {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: auto;
        }
        .profile-picture {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        .user-name {
          font-weight: 600;
          margin: 0;
          font-size: 1rem;
        }
        .user-role {
          color: #666;
          margin: 0;
          font-size: 0.85rem;
        }

        .hamburger {
          background: none;
          border: none;
          cursor: pointer;
          color: #3483fe;
          width: 28px;
          height: 28px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-icon {
          width: 24px;
          height: 24px;
          color: #3483fe;
          font-weight: bold;
        }

        /* Sidebar Styles */
        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(248, 249, 251, 0.7);
          z-index: 1001;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .sidebar-overlay.active {
          display: block;
          opacity: 1;
          pointer-events: auto;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          transform: translateX(-100%);
          width: 100%;
          max-width: 300px;
          height: 100vh;
          background-color: #fff;
          z-index: 1002;
          box-shadow: 2px 0 12px rgba(0, 0, 0, 0.07);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar.active {
          transform: translateX(0);
        }

        .sidebar-logo-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.2rem;
          margin-bottom: 1.2rem;
          color: #3483fe;
          width: 100%;
        }

        .logo-img {
          width: 73%;
        }

        .logo-arrow-button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          color: #3483fe;
          flex-shrink: 0;
        }

        .logo-arrow-button:hover {
          transform: scale(1.1);
        }

        .logo-arrow {
          width: 28px;
          height: 28px;
          color: inherit;
        }

        .close-button {
          position: absolute;
          top: 1.2rem;
          right: 1.2rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
        }

        .sidebar-section-title {
          font-size: 0.78rem;
          color: #a0a7ba;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 15px 0px;
        }

        .sidebar-bottom {
          margin-top: auto;
          border-top: 1px solid #f1f5fb;
          padding-top: 1.2rem;
        }

        .sidebar-profile-block {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1.2rem;
          padding: 0.5rem 0 0 0;
        }

        .profile-picture {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-name {
          font-weight: 700;
          margin: 0;
          font-size: 1.1rem;
          color: #222;
        }

        .user-role {
          color: #6b7a99;
          margin: 0;
          font-size: 0.98rem;
        }

        .sidebar-logout {
          background: none;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: none;
          text-align: center;
          color: #6b7a99;
          text-align: left;
          border-radius: 12px;
          font-size: 1em;
          font-weight: 500;
          cursor: pointer;
        }

        .sidebar-logout span {
          text-align: center;
        }

        .sidebar-logout:hover {
          background: #ffe5e5;
          color: #e53e3e;
        }

        /* Media Queries */
        @media (min-width: 769px) {
          .mobile-header {
            display: none;
          }
          .sidebar,
          .sidebar-overlay {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .desktop-header {
            display: none;
          }
          .mobile-header {
            display: flex;
            justify-content: space-between;
          }

          .sidebar {
            width: 75%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .sidebar {
            width: 75%;
            max-width: none;
          }
        }

        /* Loading states */
        .loading {
          background: #f0f0f0;
          animation: pulse 1.5s infinite;
        }

        .loading-text {
          background: #f0f0f0;
          color: transparent;
          border-radius: 4px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </header>
  );
}
