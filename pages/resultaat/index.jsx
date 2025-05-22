"use client";
import { useAuth } from "../../src/services/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ResultaatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="resultaat-page">
        <div className="loading">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="resultaat-page">
      <div className="page-header">
        <h1>Wedstrijd Resultaten</h1>
      </div>

      <div className="results-content">
        <div className="placeholder-content">
          <div className="placeholder-icon">📊</div>
          <h2>Resultaten Overzicht</h2>
          <p>Deze pagina is momenteel in ontwikkeling.</p>
          <p className="placeholder-subtext">
            Hier komt binnenkort een overzicht van alle wedstrijdresultaten.
          </p>
        </div>
      </div>

      <style jsx>{`
        .resultaat-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          color: var(--text-color);
          font-size: 2rem;
          margin: 0;
        }

        .results-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 3rem;
          text-align: center;
        }

        .placeholder-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .placeholder-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .placeholder-content h2 {
          color: var(--text-color);
          font-size: 1.5rem;
          margin: 0;
        }

        .placeholder-content p {
          color: var(--text-color);
          margin: 0;
        }

        .placeholder-subtext {
          color: var(--placeholder-color);
          font-size: 0.9rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--placeholder-color);
        }

        @media (max-width: 768px) {
          .resultaat-page {
            padding: 1rem;
          }

          .results-content {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
