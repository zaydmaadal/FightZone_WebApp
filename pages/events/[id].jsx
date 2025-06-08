import { useAuth } from "../../src/services/auth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchEventById, deleteEvent } from "../../src/services/api";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Loading from "../../components/Loading";

export default function EventDetail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await fetchEventById(id);
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadEvent();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteEvent(id);
      router.push('/agenda');
    } catch (error) {
      console.error("Error deleting event:", error);
      alert('Er is een fout opgetreden bij het verwijderen van het event.');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="event-detail-page">
        <div className="loading">Laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-detail-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail-page">
        <div className="error">Event niet gevonden</div>
      </div>
    );
  }

  const canDelete = (user?.role === "Trainer" && event.type === "training") || (user?.role === "VKBMO-lid" && event.type === "vkbmo");

  return (
    <div className="event-detail-page">
      <div className="page-header">
        <Link href="/agenda" className="back-link">
          <ArrowLeftIcon className="back-icon" width={20} height={20} />
        </Link>
        <h1>{event.title}</h1>
      </div>

      <div className="event-content">
        <div className="event-info">
          <div className="info-section">
            <div className="info-item">
              <span className="info-label">Beschrijving</span>
              <span className="info-value">
                {event.description || "Geen beschrijving"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Locatie</span>
              <span className="info-value">{event.location || "Onbekend"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Start</span>
              <span className="info-value">
                {event.start
                  ? new Date(event.start).toLocaleString()
                  : "Onbekend"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Einde</span>
              <span className="info-value">
                {event.end ? new Date(event.end).toLocaleString() : "Onbekend"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Type</span>
              <span className="info-value">{event.type || "Onbekend"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Aangemaakt door</span>
              <span className="info-value">
                {event.createdBy || "Onbekend"}
              </span>
            </div>
            {event.club && (
              <div className="info-item">
                <span className="info-label">Club</span>
                <span className="info-value">{event.club}</span>
              </div>
            )}
            {event.trainer && (
              <div className="info-item">
                <span className="info-label">Trainer</span>
                <span className="info-value">{event.trainer}</span>
              </div>
            )}
          </div>

          {canDelete && (
            <div className="event-actions">
              <button
                className="btn-danger"
                onClick={() => setShowDeleteModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '1rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '1rem'
                }}
              >
                Verwijder event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Event verwijderen</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Weet je zeker dat je dit event wilt verwijderen?</p>
              <p className="warning-text">Deze actie kan niet ongedaan worden gemaakt.</p>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuleren
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .event-detail-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-color);
          text-decoration: none;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .back-icon {
          width: 20px;
          height: 20px;
        }

        .page-header h1 {
          color: var(--text-color);
          font-size: 2rem;
          margin: 0;
        }

        .event-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 600;
          color: #666;
          min-width: 150px;
        }

        .info-value {
          color: #333;
          text-align: right;
          flex: 1;
          margin-left: 1rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .error-message {
          text-align: center;
          padding: 2rem;
          color: #ef4444;
          background: #fef2f2;
          border-radius: 8px;
          margin: 2rem 0;
        }

        .event-actions {
          margin-top: 2rem;
          text-align: center;
        }

        .btn-danger {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 1rem;
          background: #ef4444;
          color: white;
          border: none;
          cursor: pointer;
          width: 100%;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          animation: modalSlideIn 0.3s ease;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #1f2937;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .modal-close:hover {
          background: #f0f0f0;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-body p {
          margin: 0;
          color: #4b5563;
        }

        .warning-text {
          margin-top: 0.5rem;
          color: #ef4444;
          font-size: 0.875rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #eee;
        }

        .modal-actions button {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        @keyframes modalSlideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .event-detail-page {
            padding: 1rem;
          }

          .event-content {
            padding: 1rem;
          }

          .info-item {
            flex-direction: column;
            gap: 0.5rem;
          }

          .info-label {
            min-width: auto;
          }

          .info-value {
            text-align: left;
            margin-left: 0;
          }

          .modal-content {
            max-width: none;
            margin: 1rem;
          }

          .modal-actions {
            flex-direction: column;
          }

          .modal-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
