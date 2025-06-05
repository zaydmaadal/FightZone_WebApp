"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../src/services/auth";
import {
  fetchEventMatches,
  confirmWeight,
  fetchEventById,
} from "../../src/services/api";

export default function EventMatches() {
  const router = useRouter();
  const { eventId } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;

      try {
        const [matchesData, eventData] = await Promise.all([
          fetchEventMatches(eventId),
          fetchEventById(eventId),
        ]);
        setMatches(Array.isArray(matchesData) ? matchesData : []);
        setEvent(eventData);
      } catch (error) {
        console.error("Error loading event data:", error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && eventId) {
      loadEventData();
    }
  }, [eventId, user]);

  const handleConfirmWeight = async (matchId, fighterNumber) => {
    try {
      await confirmWeight(matchId, fighterNumber);
      const updatedMatches = await fetchEventMatches(eventId);
      setMatches(Array.isArray(updatedMatches) ? updatedMatches : []);
    } catch (error) {
      console.error("Error confirming weight:", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      console.log("Starting PDF export for event:", {
        eventId,
        eventData: event,
        hasName: !!event?.name,
        hasDate: !!event?.date,
        eventFields: event ? Object.keys(event) : [],
      });

      const response = await fetch(`/api/events/${eventId}/export-pdf`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("PDF export failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          eventData: event, // Log the event data when export fails
        });
        throw new Error(
          errorData.details || errorData.message || "PDF export failed"
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `matchmaking-${event?.name || eventId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert(
        `Er is een fout opgetreden bij het exporteren van de PDF: ${error.message}`
      );
    }
  };

  if (loading || authLoading) {
    return (
      <div className="event-matches-page">
        <div className="loading">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="event-matches-page">
      <div className="page-header">
        <Link href="/jury" className="back-link">
          ← Terug naar overzicht
        </Link>
        <h1>{event?.name || "Matchmaking"}</h1>
        {event && (
          <p className="event-date">
            {new Date(event.date).toLocaleDateString("nl-NL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="matches-table-container">
        {!Array.isArray(matches) || matches.length === 0 ? (
          <div className="no-matches">
            <p>Geen matches gevonden voor dit event.</p>
          </div>
        ) : (
          <>
            <table className="matches-table">
              <thead>
                <tr>
                  <th>Vechter 1</th>
                  <th>Gewicht</th>
                  <th>VS</th>
                  <th>Vechter 2</th>
                  <th>Gewicht</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match._id}>
                    <td>
                      {match.fighter1.voornaam} {match.fighter1.achternaam}
                    </td>
                    <td>
                      <div className="weight-confirmation">
                        {match.weight1Confirmed ? (
                          <span className="confirmed">✅</span>
                        ) : (
                          <button
                            onClick={() => handleConfirmWeight(match._id, 1)}
                            className="confirm-btn"
                          >
                            Bevestig
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="vs-cell">VS</td>
                    <td>
                      {match.fighter2.voornaam} {match.fighter2.achternaam}
                    </td>
                    <td>
                      <div className="weight-confirmation">
                        {match.weight2Confirmed ? (
                          <span className="confirmed">✅</span>
                        ) : (
                          <button
                            onClick={() => handleConfirmWeight(match._id, 2)}
                            className="confirm-btn"
                          >
                            Bevestig
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <Link
                        href={`/jury/match/${match._id}`}
                        className="details-link"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="export-actions">
              <button onClick={handleExportPDF} className="export-btn">
                Exporteer naar PDF
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .event-matches-page {
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

        .event-date {
          color: var(--placeholder-color);
          margin: 0;
          font-size: 0.9rem;
        }

        .matches-table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .matches-table {
          width: 100%;
          border-collapse: collapse;
        }

        .matches-table th,
        .matches-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .matches-table th {
          background: var(--background-color);
          font-weight: 600;
          color: var(--text-color);
        }

        .vs-cell {
          text-align: center;
          font-weight: 600;
          color: var(--primary-color);
        }

        .weight-confirmation {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .confirm-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }

        .confirm-btn:hover {
          background: var(--primary-color-dark);
        }

        .confirmed {
          color: var(--success-color);
          font-size: 1.2rem;
        }

        .details-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
        }

        .details-link:hover {
          text-decoration: underline;
        }

        .export-actions {
          padding: 1rem;
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid var(--border-color);
        }

        .export-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .export-btn:hover {
          background: var(--primary-color-dark);
        }

        .no-matches {
          text-align: center;
          padding: 3rem;
          color: var(--placeholder-color);
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--placeholder-color);
        }

        @media (max-width: 768px) {
          .event-matches-page {
            padding: 1rem;
          }

          .matches-table {
            display: block;
            overflow-x: auto;
          }

          .matches-table th,
          .matches-table td {
            padding: 0.75rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
