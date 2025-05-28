import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { fetchEventById } from '../../src/services/api';

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

  if (loading) return <div>Laden...</div>;
  if (error) return <div>{error}</div>;
  if (!event) return <div>Geen event gevonden.</div>;

  return (
    <div className="event-detail-page">
      <h1>{event.title}</h1>
      <p><strong>Beschrijving:</strong> {event.description || 'Geen beschrijving'}</p>
      <p><strong>Locatie:</strong> {event.location || 'Onbekend'}</p>
      <p><strong>Start:</strong> {event.start ? new Date(event.start).toLocaleString() : 'Onbekend'}</p>
      <p><strong>Einde:</strong> {event.end ? new Date(event.end).toLocaleString() : 'Onbekend'}</p>
      <p><strong>Type:</strong> {event.type || 'Onbekend'}</p>
      <p><strong>Aangemaakt door:</strong> {event.createdBy || 'Onbekend'}</p>
      {event.club && <p><strong>Club:</strong> {event.club}</p>}
      {event.trainer && <p><strong>Trainer:</strong> {event.trainer}</p>}
    </div>
  );
} 