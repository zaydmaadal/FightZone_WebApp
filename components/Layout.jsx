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
      // Check token validity every minute
      const interval = setInterval(async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            logout();
            return;
          }

          // Validate token by making a request to get current user
          await axios.get("https://fightzone-api.onrender.com/api/v1/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          if (error.response?.status === 401) {
            logout();
          }
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
