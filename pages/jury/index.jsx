"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpTrayIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

const JuryPage = () => {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [events, setEvents] = useState([
    {
      _id: "event1",
      name: "Night Of The Champs",
      date: "2025-06-15T18:00:00Z",
      location: "Rotterdam Arena, Nederland",
      hasMatchmaking: true,
      fightersCount: 3,
      status: "Alles voltooid",
    },
    {
      _id: "event2",
      name: "Muay Thai Championship",
      date: "2025-07-20T19:00:00Z",
      location: "Amsterdam RAI, Nederland",
      hasMatchmaking: false,
      fightersCount: 0,
      status: "Nog te plannen",
    },
  ]);

  const handleFakeImport = () => {
    setImportSuccess(true);
    setTimeout(() => {
      setImportModalOpen(false);
      setImportSuccess(false);
      // Add a new event
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          _id: "event3",
          name: "Vechtersgala Antwerpen",
          date: "2025-08-10T17:00:00Z",
          location: "Sportpaleis Antwerpen, België",
          hasMatchmaking: true,
          fightersCount: 5,
          status: "Aan de gang",
        },
      ]);
    }, 2000);
  };

  return (
    <div className="jury-page">
      <div className="hero-section">
        <img
          src="/images/banner.png"
          alt="FightZone Hero"
          className="hero-image"
        />
        <div className="hero-content">
          <h1 className="hero-title">Opkomende event</h1>
          <Link href="/agenda" className="hero-cta">
            Ontdek{" "}
            <ArrowRightIcon className="hero-cta-icon" width={20} height={20} />
          </Link>
        </div>
      </div>
      <div className="page-header">
        <h1>Jury Overzicht</h1>
        <button
          onClick={() => setImportModalOpen(true)}
          className="import-button"
        >
          <ArrowUpTrayIcon className="button-icon" width={20} height={20} />
          Importeer Matchmaking
        </button>
      </div>

      {importModalOpen && (
        <div
          className="modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setImportModalOpen(false);
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>Importeer Matchmaking</h3>
              <button
                className="modal-close"
                onClick={() => setImportModalOpen(false)}
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="instructions">
                Voor de demo wordt een voorbeeld event toegevoegd.
              </p>

              {importSuccess && (
                <div className="success-message">
                  Import succesvol! Venster sluit automatisch...
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setImportModalOpen(false)}
                className="btn-secondary"
              >
                Annuleren
              </button>
              <button onClick={handleFakeImport} className="btn-primary">
                Demo Import
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="events-list">
        {events.map((event) => (
          <div key={event._id} className="event-card">
            <div className="event-card-left">
              <div className="event-icon-container">
                <svg
                  width="26"
                  height="34"
                  viewBox="0 0 26 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.2595 7.59018C23.9559 7.59018 24.9493 12.6363 23.3599 15.9578C22.649 17.4436 21.4191 18.7491 20.4344 20.0642C19.4901 21.3253 19.018 21.9558 18.3973 22.3971C17.0133 23.3808 15.4111 23.3327 13.7767 23.3327H12.1436C8.12351 23.3327 6.11344 23.3327 4.78531 22.2091C3.45719 21.0858 3.13205 19.152 2.48179 15.2846C2.12426 13.1582 1.87257 11.0337 1.92484 8.97398C2.02054 5.20199 4.90857 2.02534 8.80929 1.40152C10.6675 1.10436 12.9555 1.07499 14.8149 1.39056C18.1348 1.95412 20.4757 4.81431 20.2436 8.02362C20.1021 9.98076 19.3079 11.9956 18.8121 13.8871"
                    stroke="#0B48AB"
                    stroke-width="2.32367"
                    stroke-linecap="round"
                  />
                  <path
                    d="M5.08984 22.5417V26.5C5.08984 29.4855 5.08984 30.9783 6.01733 31.9058C6.94483 32.8333 8.43761 32.8333 11.4232 32.8333H13.0065C15.992 32.8333 17.4848 32.8333 18.4123 31.9058C19.3398 30.9783 19.3398 29.4855 19.3398 26.5V21.75"
                    stroke="#0B48AB"
                    stroke-width="2.32367"
                    stroke-linecap="round"
                  />
                  <path
                    d="M5.08984 28.082H9.83983"
                    stroke="#0B48AB"
                    stroke-width="2.32367"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div className="event-info">
                <h2>{event.name}</h2>
                <div className="event-details">
                  <p>
                    <CalendarIcon width={16} height={16} />
                    {new Date(event.date).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <div className="event-details-separator"></div>
                  <p>
                    <UserGroupIcon width={16} height={16} />
                    {event.fightersCount} Vechters
                  </p>
                  <div className="event-details-separator"></div>
                  <p
                    className={`event-status ${
                      event.status === "Nog te plannen"
                        ? "not-available"
                        : event.status === "Aan de gang"
                        ? "in-progress"
                        : ""
                    }`}
                  >
                    {event.status === "Alles voltooid" && (
                      <CheckCircleIcon width={16} height={16} />
                    )}
                    {event.status}
                  </p>
                </div>
              </div>
            </div>
            <div className="event-actions">
              {event.hasMatchmaking && (
                <Link href={`/jury/${event._id}`} className="view-matches-btn">
                  <ArrowRightIcon
                    className="arrow-icon"
                    width={20}
                    height={20}
                  />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .jury-page {
          padding: 0rem; /* Adjusted padding */
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-section {
          position: relative;
          width: 100%;
          height: 300px; /* Adjust as needed */
          overflow: hidden;
          margin-bottom: 2rem;
          border-radius: 8px; /* Added border-radius */
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.6); /* Darken the image */
        }

        .hero-content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end; /* Align content to bottom-left */
          padding: 2rem;
          color: white;
        }

        .hero-title {
          font-size: 2.5rem;
          margin: 0 0 1rem 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .hero-cta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(
            255,
            255,
            255,
            0.2
          ); /* Semi-transparent background */
          color: white;
          border: 1px solid white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px; /* Pill shape */
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .hero-cta:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .hero-cta-icon {
          width: 20px;
          height: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 0 2rem; /* Add padding to match event cards */
        }

        .page-header h1 {
          color: var(--text-color);
          font-size: 2rem;
          margin: 0;
        }

        .import-button {
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

        .import-button:hover {
          background: #2b6cd9;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }

        .button-icon {
          width: 20px;
          height: 20px;
        }

        .instructions {
          margin-bottom: 1rem;
          color: #666;
        }

        .success-message {
          color: #38a169;
          padding: 0.5rem;
          background: #f0fff4;
          border-radius: 4px;
          margin-top: 1rem;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #333;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
          padding: 0.5rem;
          line-height: 1;
        }

        .modal-close:hover {
          color: #333;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-primary {
          background: #3483fe;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-primary:hover {
          background: #2b6cd9;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #4b5563;
          border: 1px solid #e5e7eb;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 0 2rem;
          margin-bottom: 3rem;
        }

        .event-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100px;
          transition: all 0.2s;
          width: 100%;
        }

        .event-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .event-card-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .event-icon-container {
          background: #e0f2fe;
          padding: 0.75rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
        }

        .event-icon {
          width: 30px;
          height: 30px;
          color: #3483fe;
        }

        .event-info {
          display: flex;
          flex-direction: column;
        }

        .event-info h2 {
          margin: 0;
          color: var(--text-color);
          font-size: 1.1rem;
          font-weight: 600;
        }

        .event-details {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.25rem;
          color: #666;
          font-size: 0.85rem;
        }

        .event-details p {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .event-details-separator {
          width: 4px;
          height: 4px;
          background-color: #ccc;
          border-radius: 50%;
        }

        .event-status {
          color: #38a169;
          font-weight: 500;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.85rem;
        }
        .event-status.not-available {
          color: #d39e00;
        }
        .event-status.in-progress {
          color: #007bff;
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
          background: none;
          color: #3483fe;
          padding: 0.75rem 0.5rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .view-matches-btn:hover {
          color: #2b6cd9;
        }

        .arrow-icon {
          width: 20px;
          height: 20px;
          color: #3483fe;
        }

        @media (max-width: 768px) {
          .jury-page {
            padding: 0rem;
          }

          .hero-section {
            height: 200px;
          }

          .hero-content {
            padding: 1rem;
          }

          .hero-title {
            font-size: 1.8rem;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 0 1rem;
          }

          .events-list {
            padding: 0 1rem;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
          }

          .event-card {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
            height: auto;
            padding: 1rem;
            width: calc(50% - 0.5rem);
          }

          .event-card-left {
            flex-direction: column;
            gap: 0.5rem;
          }

          .event-info {
            align-items: center;
          }

          .event-details {
            flex-direction: column;
            gap: 0.25rem;
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
