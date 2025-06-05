"use client";
import { useAuth } from "../../src/services/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchEvents } from "../../src/services/api";

const JuryPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    if (user) {
      loadEvents();
    }
  }, [user]);

  if (loading || loadingEvents) {
    return (
      <div className="jury-page">
        <div className="loading">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="jury-page">
      <div className="page-header">
        <h1>Jury Overzicht</h1>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <div className="no-events">
            <p>Geen aankomende events gevonden.</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-info">
                <h2>{event.name}</h2>
                <p className="event-date">
                  {new Date(event.date).toLocaleDateString("nl-NL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="event-location">{event.location}</p>
              </div>
              <div className="event-actions">
                <Link href={`/jury/${event._id}`} className="view-matches-btn">
                  Bekijk Matchmaking
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .jury-page {
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

        .events-list {
          display: grid;
          gap: 1.5rem;
        }

        .event-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .event-info h2 {
          margin: 0 0 0.5rem 0;
          color: var(--text-color);
          font-size: 1.25rem;
        }

        .event-date {
          color: var(--text-color);
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
        }

        .event-location {
          color: var(--placeholder-color);
          margin: 0;
          font-size: 0.9rem;
        }

        .event-actions {
          display: flex;
          gap: 1rem;
        }

        .view-matches-btn {
          background: var(--primary-color);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .view-matches-btn:hover {
          background: var(--primary-color-dark);
        }

        .no-events {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--placeholder-color);
        }

        @media (max-width: 768px) {
          .jury-page {
            padding: 1rem;
          }

          .event-card {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .event-actions {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default JuryPage;
