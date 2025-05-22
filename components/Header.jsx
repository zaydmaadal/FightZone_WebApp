"use client";
import { useAuth } from "../src/services/auth";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="header">
      {/* Desktop Header */}
      <div className="desktop-header">
        <div className="profile-info">
          <img
            src={user.profilePicture}
            alt="Profile"
            className="profile-picture"
          />
          <div>
            <p className="user-name">{user.voornaam}</p>
            <p className="user-role">{user.role}</p>
          </div>
        </div>

        <nav className="desktop-nav">
          <Link href="/settings" className="nav-link">
            Instellingen
          </Link>
          <button onClick={logout} className="logout-button">
            Uitloggen
          </button>
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-header-left">
          <button
            className="hamburger profile-icon"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Bars3Icon />
          </button>
          <div className="mobile-profile">
            <img
              src={user.profilePicture || "/default-avatar.png"}
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
            src="/FightZoneLogo.png"
            alt="FightZone Logo"
            className="logo-img"
          />
          <ArrowRightCircleIcon className="logo-arrow" width={28} height={28} />
        </div>
        <button
          className="close-button"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <XMarkIcon />
        </button>
        <nav className="sidebar-nav">
          <Link
            href="/dashboard"
            className={`sidebar-nav-link${
              typeof window !== "undefined" &&
              window.location.pathname === "/dashboard"
                ? " active"
                : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <HomeIcon className="sidebar-icon" width={24} height={24} />
            <span className="sidebar-title">Home</span>
          </Link>
          <Link
            href="/leden"
            className={`sidebar-nav-link${
              typeof window !== "undefined" &&
              window.location.pathname === "/leden"
                ? " active"
                : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <UsersIcon className="sidebar-icon" width={24} height={24} />
            <span className="sidebar-title">Ledenlijst</span>
          </Link>
          <Link
            href="/agenda"
            className={`sidebar-nav-link${
              typeof window !== "undefined" &&
              window.location.pathname === "/agenda"
                ? " active"
                : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <CalendarIcon className="sidebar-icon" width={24} height={24} />
            <span className="sidebar-title">Agenda</span>
          </Link>
          <Link
            href="/results"
            className={`sidebar-nav-link${
              typeof window !== "undefined" &&
              window.location.pathname === "/results"
                ? " active"
                : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ClipboardDocumentListIcon
              className="sidebar-icon"
              width={24}
              height={24}
            />
            <span className="sidebar-title">Results</span>
          </Link>
        </nav>
        <div className="sidebar-section-title">VKBMO</div>
        <nav className="sidebar-nav">
          <Link
            href="/events"
            className={`sidebar-nav-link${
              typeof window !== "undefined" &&
              window.location.pathname === "/events"
                ? " active"
                : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <SparklesIcon className="sidebar-icon" width={24} height={24} />
            <span className="sidebar-title">Evenementen</span>
          </Link>
          <Link
            href="/news"
            className={`sidebar-nav-link${
              typeof window !== "undefined" &&
              window.location.pathname === "/news"
                ? " active"
                : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <NewspaperIcon className="sidebar-icon" width={24} height={24} />
            <span className="sidebar-title">Nieuws</span>
          </Link>
          <Link
            href="/community"
            className={`sidebar-nav-link${
              typeof window !== "undefined" &&
              window.location.pathname === "/community"
                ? " active"
                : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ChatBubbleLeftRightIcon
              className="sidebar-icon"
              width={24}
              height={24}
            />
            <span className="sidebar-title">Community</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <nav className="sidebar-nav">
            <Link
              href="/settings"
              className={`sidebar-nav-link${
                typeof window !== "undefined" &&
                window.location.pathname === "/settings"
                  ? " active"
                  : ""
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Cog6ToothIcon className="sidebar-icon" width={24} height={24} />
              <span className="sidebar-title">Instellingen</span>
            </Link>
            <Link
              href="/profile"
              className={`sidebar-nav-link${
                typeof window !== "undefined" &&
                window.location.pathname === "/profile"
                  ? " active"
                  : ""
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <UserCircleIcon className="sidebar-icon" width={24} height={24} />
              <span className="sidebar-title">Profiel</span>
            </Link>
            <button onClick={logout} className="sidebar-logout">
              <ArrowRightOnRectangleIcon
                className="sidebar-icon"
                width={24}
                height={24}
              />
              <span>Log uit</span>
            </button>
          </nav>
          <div className="sidebar-profile-block">
            <img
              src={user.profilePicture || "/default-avatar.png"}
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

      <style jsx>{`
        .header {
          position: relative;
        }

        /* Desktop Styles */
        .desktop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
        }

        .profile-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .profile-picture {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-name {
          font-weight: 600;
          margin: 0;
        }

        .user-role {
          color: #666;
          margin: 0;
          font-size: 0.875rem;
        }

        .desktop-nav {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        /* Mobile Styles */
        .mobile-header {
          display: flex;
          align-items: center;
          padding: 1rem;
          position: relative;
        }
        @media (min-width: 769px) {
          .mobile-header {
            display: none;
          }
        }
        .mobile-header-left {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }
        .mobile-profile {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
          z-index: 998;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .sidebar-title {
          font-size: 1.5rem;
          font-weight: 500;
          color: #62789b;
          letter-spacing: 0.02em;
          line-height: 1.3;
          margin-left: 0.2rem;
          transition: color 0.18s;
          padding: 10px;
        }

        .sidebar-overlay.active {
          display: block;
          opacity: 1;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: -300px;
          width: 300px;
          height: 100vh;
          background-color: #fff;
          z-index: 999;
          padding: 2.2rem 1.5rem 1.5rem 1.5rem;
          box-shadow: 2px 0 12px rgba(0, 0, 0, 0.07);
          border-radius: 0 24px 24px 0;
          display: flex;
          flex-direction: column;
          transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar.active {
          left: 0;
        }

        .sidebar-logo-row {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 1.2rem;
          margin-bottom: 1.2rem;
        }

        .logo-img {
          height: 200px;
          width: auto;
        }

        .logo-arrow {
          color: #2563eb;
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

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sidebar-nav-link span {
          display: inline-block;
          font-size: 1.08rem;
          line-height: 1.2;
        }

        .sidebar-icon {
          display: inline-block;
          vertical-align: middle;
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
          border: 1px solid black;
          text-align: center;
          color: #6b7a99;
          text-align: left;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          font-size: 1.15rem;
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

        @media (max-width: 768px) {
          .desktop-header {
            display: none;
          }
          .mobile-header {
            display: flex;
            justify-content: space-between;
          }
        }
      `}</style>
    </header>
  );
}
