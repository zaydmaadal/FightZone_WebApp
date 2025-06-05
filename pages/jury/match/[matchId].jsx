"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../../src/services/auth";
import { fetchMatchDetails } from "../../../src/services/api";

export default function MatchDetails() {
  const router = useRouter();
  const { matchId } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadMatchDetails = async () => {
      if (!matchId) return;

      try {
        const data = await fetchMatchDetails(matchId);
        setMatch(data);
      } catch (error) {
        console.error("Error loading match details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && matchId) {
      loadMatchDetails();
    }
  }, [matchId, user]);

  if (loading || authLoading) {
    return (
      <div className="match-details-page">
        <div className="loading">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!match) {
    return (
      <div className="match-details-page">
        <div className="error-message">
          <p>Match niet gevonden.</p>
          <Link href="/jury" className="back-link">
            Terug naar overzicht
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="match-details-page">
      <div className="page-header">
        {match?.event?._id ? (
          <Link href={`/jury/${match.event._id}`} className="back-link">
            ← Terug naar event
          </Link>
        ) : (
          <Link href="/jury" className="back-link">
            ← Terug naar overzicht
          </Link>
        )}
        <h1>Match Details</h1>
        <p className="event-name">
          {match?.event?.name || "Event details niet beschikbaar"}
        </p>
      </div>

      <div className="match-details-container">
        <div className="fighters-section">
          <div className="fighter-card fighter1">
            <h2>Vechter 1</h2>
            <div className="fighter-info">
              <p className="fighter-name">
                {match?.fighter1?.voornaam} {match?.fighter1?.achternaam}
              </p>
              <div className="fighter-details">
                <div className="detail-item">
                  <span className="label">Gewicht:</span>
                  <span className="value">
                    {match?.weight1Confirmed ? (
                      <span className="confirmed">✓ Bevestigd</span>
                    ) : (
                      <span className="pending">Niet bevestigd</span>
                    )}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Leeftijd:</span>
                  <span className="value">
                    {match?.fighter1?.leeftijd || "-"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Club:</span>
                  <span className="value">{match?.fighter1?.club || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="vs-badge">VS</div>

          <div className="fighter-card fighter2">
            <h2>Vechter 2</h2>
            <div className="fighter-info">
              <p className="fighter-name">
                {match?.fighter2?.voornaam} {match?.fighter2?.achternaam}
              </p>
              <div className="fighter-details">
                <div className="detail-item">
                  <span className="label">Gewicht:</span>
                  <span className="value">
                    {match?.weight2Confirmed ? (
                      <span className="confirmed">✓ Bevestigd</span>
                    ) : (
                      <span className="pending">Niet bevestigd</span>
                    )}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Leeftijd:</span>
                  <span className="value">
                    {match?.fighter2?.leeftijd || "-"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Club:</span>
                  <span className="value">{match?.fighter2?.club || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="match-info-section">
          <h2>Match Informatie</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Categorie:</span>
              <span className="value">{match?.category || "-"}</span>
            </div>
            <div className="info-item">
              <span className="label">Gewichtsklasse:</span>
              <span className="value">{match?.weightClass || "-"}</span>
            </div>
            <div className="info-item">
              <span className="label">Status:</span>
              <span
                className={`value status-${(
                  match?.status || ""
                ).toLowerCase()}`}
              >
                {match?.status || "Onbekend"}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Ronde:</span>
              <span className="value">{match?.round || "-"}</span>
            </div>
          </div>
        </div>

        {match?.notes && (
          <div className="notes-section">
            <h2>Notities</h2>
            <p className="notes-content">{match.notes}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .match-details-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .back-link {
          display: inline-block;
          color: var(--text-color);
          text-decoration: none;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .page-header h1 {
          color: var(--text-color);
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
        }

        .event-name {
          color: var(--placeholder-color);
          margin: 0;
          font-size: 0.9rem;
        }

        .match-details-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .fighters-section {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
          align-items: center;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .fighter-card {
          padding: 1.5rem;
          border-radius: 6px;
          background: var(--background-color);
        }

        .fighter-card h2 {
          color: var(--text-color);
          font-size: 1.25rem;
          margin: 0 0 1rem 0;
        }

        .fighter-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0 0 1rem 0;
        }

        .fighter-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .label {
          color: var(--placeholder-color);
          font-size: 0.9rem;
        }

        .value {
          color: var(--text-color);
          font-weight: 500;
        }

        .confirmed {
          color: var(--success-color);
        }

        .pending {
          color: var(--warning-color);
        }

        .vs-badge {
          background: var(--primary-color);
          color: white;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .match-info-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .match-info-section h2 {
          color: var(--text-color);
          font-size: 1.25rem;
          margin: 0 0 1.5rem 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .status-scheduled {
          color: var(--info-color);
        }

        .status-in-progress {
          color: var(--warning-color);
        }

        .status-completed {
          color: var(--success-color);
        }

        .notes-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .notes-section h2 {
          color: var(--text-color);
          font-size: 1.25rem;
          margin: 0 0 1rem 0;
        }

        .notes-content {
          color: var(--text-color);
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
        }

        .error-message {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .error-message p {
          color: var(--error-color);
          margin: 0 0 1rem 0;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--placeholder-color);
        }

        @media (max-width: 768px) {
          .match-details-page {
            padding: 1rem;
          }

          .fighters-section {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 1.5rem;
          }

          .vs-badge {
            margin: 0 auto;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
