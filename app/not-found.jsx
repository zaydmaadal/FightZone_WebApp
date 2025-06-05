"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404 - Pagina niet gevonden</h1>
        <p>De pagina die u zoekt bestaat niet of is verplaatst.</p>
        <Link href="/dashboard" className="home-button">
          Terug naar home
        </Link>
      </div>

      <style jsx>{`
        .not-found-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
          background-color: #f5f5f5;
        }

        .not-found-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 400px;
          width: 100%;
        }

        h1 {
          color: #1f2937;
          font-size: 1.5rem;
          margin: 0 0 1rem 0;
        }

        p {
          color: #4b5563;
          margin: 0 0 1.5rem 0;
        }

        .home-button {
          display: inline-block;
          background: var(--primary-color, #3b82f6);
          color: white;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .home-button:hover {
          background: var(--primary-color-dark, #2563eb);
        }
      `}</style>
    </div>
  );
}
