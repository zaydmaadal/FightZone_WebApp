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
import Loading from "../../components/Loading";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";

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

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://fightzone-api.onrender.com/api/v1/jury/events/${eventId}/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Excel export mislukt");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `matchmaking-${event?.name || eventId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert(`Er is een fout opgetreden bij het exporteren: ${error.message}`);
    }
  };

  if (loading || authLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="event-matches-page">
      <div className="page-header">
        <div className="header-content">
          <Link href="/jury" className="back-button">
            <ArrowLeftCircleIcon className="w-6 h-6" width={24} height={24} />
            Terug
          </Link>
          <h1>{event?.name || "Matchmaking"}</h1>
          {event && event.start && (
            <p className="event-date">
              {new Date(event.start).toLocaleDateString("nl-NL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="export-container">
        <button onClick={handleExportExcel} className="export-button">
          <ArrowDownTrayIcon className="button-icon" width={20} height={20} />
          Exporteer naar Excel
        </button>
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
                      {match.fighters[0]?.user?.voornaam}{" "}
                      {match.fighters[0]?.user?.achternaam}
                    </td>
                    <td>
                      <div className="weight-confirmation">
                        {match.fighters[0]?.weightConfirmed ? (
                          <span className="confirmed">✅</span>
                        ) : (
                          <button
                            onClick={() => handleConfirmWeight(match._id, 0)}
                            className="confirm-btn"
                          >
                            Bevestig
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="vs-cell">VS</td>
                    <td>
                      {match.fighters[1]?.user?.voornaam}{" "}
                      {match.fighters[1]?.user?.achternaam}
                    </td>
                    <td>
                      <div className="weight-confirmation">
                        {match.fighters[1]?.weightConfirmed ? (
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
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-content {
          align-items: center;
          justify-content: space-between;
          display: flex;
          -webkit-box-flex: 1;
          -webkit-flex: 1;
          -moz-box-flex: 1;
          -ms-flex: 1;
          flex: 1;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          background-color: #3483fe;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .back-button:hover {
          background-color: #2b6cd9;
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

        .export-container {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #3483fe;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .export-button:hover {
          background: #2b6cd9;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }

        .button-icon {
          width: 20px;
          height: 20px;
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

          .export-container {
            flex-direction: column;
            align-items: stretch;
          }

          .export-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
