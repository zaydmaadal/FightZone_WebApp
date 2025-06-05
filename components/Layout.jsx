"use client";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { usePathname } from "next/navigation";
import { useAuth } from "../src/services/auth";
import { useEffect } from "react";
import axios from "axios";

export default function Layout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!isLoginPage && user) {
      let isChecking = false; // Prevent multiple simultaneous checks

      // Check token validity every minute
      const interval = setInterval(async () => {
        if (isChecking) return; // Skip if already checking
        isChecking = true;

        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.log("No token found, logging out");
            await logout();
            return;
          }

          // Validate token by making a request to get current user
          await axios.get("https://fightzone-api.onrender.com/api/v1/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.log("Token validation error:", {
            status: error.response?.status,
            message: error.message,
          });

          // Only logout on 401 (Unauthorized) errors
          if (error.response?.status === 401) {
            console.log("Token expired, logging out");
            await logout();
          }
        } finally {
          isChecking = false;
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [isLoginPage, user, logout]);

  return (
    <div className="layout">
      {!isLoginPage && <Sidebar />}

      <main className={`main-content ${isLoginPage ? "full-width" : ""}`}>
        {!isLoginPage && <Header />}
        {children}
      </main>
      <style jsx>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;

          background-color: #f5f5f5;
        }

        .main-content.full-width {
          margin-left: 0;
        }

        .main-content:not(.full-width) {
          margin-left: 250px;
        }
        @media (max-width: 768px) {
          .main-content:not(.full-width) {
            margin-left: 0px;
          }
          .main-content {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
