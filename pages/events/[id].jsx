import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { fetchEventById } from '../../src/services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function EventDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const getEvent = async () => {
      try {
        const data = await fetchEventById(id);
        setEvent(data);
      } catch (err) {
        setError('Event niet gevonden');
      } finally {
        setLoading(false);
      }
    };
    getEvent();
  }, [id]);

  if (loading) return (
    <div className="event-detail-page">
      <div className="loading">Laden...</div>
    </div>
  );
  
  if (error) return (
    <div className="event-detail-page">
      <div className="error-message">{error}</div>
    </div>
  );
  
  if (!event) return (
    <div className="event-detail-page">
      <div className="error-message">Geen event gevonden.</div>
    </div>
  );

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
              <span className="info-value">{event.description || 'Geen beschrijving'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Locatie</span>
              <span className="info-value">{event.location || 'Onbekend'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Start</span>
              <span className="info-value">{event.start ? new Date(event.start).toLocaleString() : 'Onbekend'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Einde</span>
              <span className="info-value">{event.end ? new Date(event.end).toLocaleString() : 'Onbekend'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type</span>
              <span className="info-value">{event.type || 'Onbekend'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Aangemaakt door</span>
              <span className="info-value">{event.createdBy || 'Onbekend'}</span>
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
        </div>
      </div>

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
        }
      `}</style>
    </div>
  );
} 