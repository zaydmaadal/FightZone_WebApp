"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>Er is iets misgegaan</h1>
        <p>Er is een fout opgetreden bij het laden van de pagina.</p>
        <div className="error-actions">
          <button onClick={() => reset()} className="retry-button">
            Probeer opnieuw
          </button>
          <Link href="/dashboard" className="home-button">
            Terug naar home
          </Link>
        </div>
      </div>

      <style jsx>{`
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
          background-color: #f5f5f5;
        }

        .error-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 400px;
          width: 100%;
        }

        h1 {
          color: #dc2626;
          font-size: 1.5rem;
          margin: 0 0 1rem 0;
        }

        p {
          color: #4b5563;
          margin: 0 0 1.5rem 0;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .retry-button,
        .home-button {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .retry-button {
          background: var(--primary-color, #3b82f6);
          color: white;
          border: none;
        }

        .retry-button:hover {
          background: var(--primary-color-dark, #2563eb);
        }

        .home-button {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .home-button:hover {
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
}
