"use client";
import { useAuth } from "../../src/services/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchEvents } from "../../src/services/api";
import Loading from "../../components/Loading";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";

const JuryPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        // Filter alleen events met matchmaking
        const eventsWithMatchmaking = data.filter(
          (event) => event.hasMatchmaking
        );
        setEvents(eventsWithMatchmaking);
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

  const handleImportExcel = async () => {
    if (!importFile) {
      setImportError("Selecteer eerst een Excel bestand");
      return;
    }

    // Verify file type
    if (!importFile.name.endsWith(".xlsx")) {
      setImportError("Alleen .xlsx bestanden zijn toegestaan");
      return;
    }

    setImportLoading(true);
    setImportError(null);
    setImportSuccess(false);

    // Debug: Log file details
    console.log("File details:", {
      name: importFile.name,
      type: importFile.type,
      size: importFile.size,
      lastModified: new Date(importFile.lastModified).toISOString(),
    });

    const formData = new FormData();
    // Try both field names that might be expected by the server
    formData.append("file", importFile);
    formData.append("excelFile", importFile);
    formData.append("matchmakingFile", importFile);

    // Debug: Log FormData contents
    console.log("FormData contents:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Geen toegangstoken gevonden");
      }

      // Debug: Log token (first 10 chars only for security)
      console.log("Token (first 10 chars):", token.substring(0, 10) + "...");

      // Create a new request with explicit headers
      const request = new Request(
        "https://fightzone-api.onrender.com/api/v1/import/matchmaking",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type, let the browser set it with boundary
            // 'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      // Debug: Log request details
      console.log("Request method:", request.method);
      console.log(
        "Request headers:",
        Object.fromEntries(request.headers.entries())
      );

      const response = await fetch(request);

      // Debug: Log response details
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Try to get response as text first for debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed response:", data);
      } catch (e) {
        console.error("Failed to parse response as JSON:", responseText);
        throw new Error("Ongeldige server response");
      }

      if (!response.ok) {
        throw new Error(data.message || "Import mislukt");
      }

      setImportSuccess(true);
      setTimeout(() => {
        setImportModalOpen(false);
        setImportSuccess(false);
        loadEvents();
      }, 3000);
    } catch (error) {
      console.error("Import error:", error);
      setImportError(
        error.message || "Er is een fout opgetreden bij het importeren"
      );
    } finally {
      setImportLoading(false);
    }
  };

  if (loading || loadingEvents) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="jury-page">
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
                Upload een Excel-bestand met matchmaking gegevens. Zorg dat de
                event naam in de eerste rij staat.
              </p>

              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="file-input"
              />

              {importFile && (
                <div className="file-info">
                  Geselecteerd bestand: {importFile.name}
                </div>
              )}

              {importError && (
                <div className="error-message">{importError}</div>
              )}

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
              <button
                onClick={handleImportExcel}
                disabled={importLoading || !importFile || importSuccess}
                className="btn-primary"
              >
                {importLoading ? "Importeren..." : "Importeren"}
              </button>
            </div>
          </div>
        </div>
      )}

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
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
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

        .file-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px dashed #ddd;
          border-radius: 4px;
          background: #f9f9f9;
          cursor: pointer;
          margin-bottom: 1rem;
        }

        .file-info {
          padding: 0.5rem;
          background: #f0f7ff;
          border-radius: 4px;
          border-left: 4px solid #3483fe;
        }

        .error-message {
          color: #e53e3e;
          padding: 0.5rem;
          background: #fff5f5;
          border-radius: 4px;
          margin-top: 1rem;
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

        .btn-primary:hover:not(:disabled) {
          background: #2b6cd9;
        }

        .btn-primary:disabled {
          background: #a0aec0;
          cursor: not-allowed;
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

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
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
