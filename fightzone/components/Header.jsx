// components/Header.jsx
"use client";
import { useAuth } from "../pages/services/auth";
import Link from "next/link";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

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
            src={user.profilePicture || "/default-avatar.png"}
            alt="Profile"
            className="profile-picture"
          />
          <div>
            <p className="user-name">{user.name}</p>
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
        <button
          className="hamburger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {!isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
          <Bars3Icon className="h-6 w-6" />
        </button>

        <div className="mobile-menu">
          <div className="mobile-profile">
            <img
              src={user.profilePicture || "/default-avatar.png"}
              alt="Profile"
              className="profile-picture"
            />
            <div>
              <p className="user-name">{user.name}</p>
              <p className="user-role">{user.role}</p>
            </div>
          </div>
          {isMobileMenuOpen && (
            <nav className="mobile-nav">
              <Link href="/dashboard" className="mobile-nav-link">
                Dashboard
              </Link>
              <Link href="/settings" className="mobile-nav-link">
                Instellingen
              </Link>
              <button onClick={logout} className="mobile-logout">
                Uitloggen
              </button>
            </nav>
          )}
        </div>
      </div>

      <style jsx>{`
        .header {
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
          display: none;
          padding: 1rem;
          position: relative;
        }

        .hamburger {
          background: none;
          border: none;
          cursor: pointer;
        }

        .mobile-menu {
        }

        .mobile-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .desktop-header {
            display: none;
          }
          .mobile-header {
            display: block;
          }
        }
      `}</style>
    </header>
  );
}
