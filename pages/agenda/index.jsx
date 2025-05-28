"use client";
import { useAuth } from "../../src/services/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import nlLocale from "@fullcalendar/core/locales/nl";
import { fetchEvents, createEvent } from "../../src/services/api";

export default function Agenda() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    location: "",
    type: "training",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const data = await fetchEvents();

      if (!Array.isArray(data)) {
        console.error("Expected array of events but got:", data);
        setEvents([]);
        return;
      }

      const transformedEvents = data.map((event) => ({
        id: event._id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        description: event.description,
        location: event.location,
        type: event.type,
        backgroundColor:
          event.type === "vkbmo"
            ? "#3B82F6"
            : event.type === "training"
            ? "#10B981"
            : "#8B5CF6",
        borderColor:
          event.type === "vkbmo"
            ? "#2563EB"
            : event.type === "training"
            ? "#059669"
            : "#7C3AED",
        extendedProps: {
          description: event.description,
          location: event.location,
          type: event.type,
          createdBy: event.createdBy,
          trainer: event.trainer,
          club: event.club,
        },
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "vkbmo":
        return "#2563eb"; // Blue
      case "training":
        return "#16a34a"; // Green
      case "club":
        return "#9333ea"; // Purple
      default:
        return "#6b7280"; // Gray
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await createEvent(newEvent);
      setShowAddEvent(false);
      setNewEvent({
        title: "",
        description: "",
        start: "",
        end: "",
        location: "",
        type: "training",
      });
      loadEvents();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo);
    setNewEvent({
      ...newEvent,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
    setShowAddEvent(true);
  };

  const handleEventClick = (info) => {
    const event = info.event;
    const eventDetails = `
      ${event.title}
      ${event.extendedProps.description}
      Locatie: ${event.extendedProps.location}
      Type: ${event.extendedProps.type}
    `;
    alert(eventDetails);
  };

  if (loading) {
    return (
      <div className="agenda-page">
        <div className="loading">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const canAddEvents = user?.role === "vkbmo" || user?.role === "trainer";

  return (
    <div className="agenda-page">
      <div className="page-header">
        <h1>Agenda</h1>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale={nlLocale}
          selectable={canAddEvents}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
        />
      </div>

      {showAddEvent && (
        <div className="add-event-modal">
          <div className="modal-content">
            <h2>Nieuw Event</h2>
            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label htmlFor="title">Titel</label>
                <input
                  type="text"
                  id="title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Beschrijving</label>
                <textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Locatie</label>
                <input
                  type="text"
                  id="location"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, type: e.target.value })
                  }
                  required
                >
                  <option value="training">Training</option>
                  <option value="vkbmo">VKBMO</option>
                  <option value="club">Club</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Toevoegen
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddEvent(false)}
                >
                  Annuleren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .agenda-page {
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

        .calendar-container {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .add-event-modal {
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
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-color);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .form-group textarea {
          min-height: 100px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .form-actions button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .form-actions button[type="submit"] {
          background-color: var(--primary-color);
          color: white;
        }

        .form-actions button[type="button"] {
          background-color: #ddd;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--text-color-light);
        }

        @media (max-width: 768px) {
          .agenda-page {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
