"use client";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="layout">
      {!isLoginPage && <Sidebar />}
      <main className={`main-content ${isLoginPage ? "full-width" : ""}`}>
        {children}
      </main>
      <style jsx>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          padding: 20px;
          background-color: #f5f5f5;
        }

        .main-content.full-width {
          margin-left: 0;
        }

        .main-content:not(.full-width) {
          margin-left: 250px;
        }
      `}</style>
    </div>
  );
}
