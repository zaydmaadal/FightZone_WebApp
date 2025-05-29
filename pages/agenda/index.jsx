"use client";
import { useAuth } from "../../src/services/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import nlLocale from "@fullcalendar/core/locales/nl";
import { fetchEvents, createEvent } from "../../src/services/api";

export default function Agenda() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const calendarRef = useRef();
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    location: "",
    type: "training",
  });
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      let eventToCreate = { ...newEvent };
      if (user.role === 'trainer') {
        eventToCreate.club = user.club; // of user.clubId, afhankelijk van je model
        eventToCreate.visibleFor = 'club';
      } else if (user.role === 'vkbmo') {
        eventToCreate.visibleFor = 'all';
        eventToCreate.club = null;
      }
      await createEvent(eventToCreate);
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
    info.jsEvent.preventDefault();
    // Haptic feedback voor mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    const calendarApi = calendarRef.current?.getApi();
    // Alleen op mobiel én in maandweergave: naar dagview
    if (isMobile && info.view.type === 'dayGridMonth' && calendarApi) {
      calendarApi.changeView('timeGridDay', info.event.start);
    } else {
      // Op desktop of in andere views: direct naar detailpagina
      router.push(`/events/${info.event.id}`);
    }
  };

  // Klik op een dag in maandweergave: ga naar dagweergave
  const handleDateClick = (arg) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView('timeGridDay', arg.date);
    }
  };

  // Swipe handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    e.currentTarget.startX = touch.clientX;
  };

  const handleTouchEnd = (e) => {
    if (!e.currentTarget.startX) return;
    
    const touch = e.changedTouches[0];
    const diff = e.currentTarget.startX - touch.clientX;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        if (diff > 0) {
          calendarApi.next(); // Swipe left = next
        } else {
          calendarApi.prev(); // Swipe right = prev
        }
      }
    }
  };

  // Mobile event content renderer
  const renderEventContent = (arg) => {
    if (isMobile && arg.view.type === 'dayGridMonth') {
      // Alleen dot op mobiel
      return {
        html: `<div class="fc-event-dot" style="background-color: ${arg.event.backgroundColor}"></div>`
      };
    }
    // Desktop: dot + ellipsis titel
    return {
      html: `
        <span class="fc-event-dot" style="background-color: ${arg.event.backgroundColor}"></span>
        <span class="fc-event-title-ellipsis">${arg.event.title}</span>
      `
    };
  };

  // Filter events op zichtbaarheid en type
  const filteredEvents = events
    .filter(event => {
      // VKBMO ziet alles
      if (user?.role === 'vkbmo') return true;
      // Events zonder visibleFor/club (oude events) zijn zichtbaar voor iedereen
      if (!event.visibleFor && !event.club) return true;
      // Events die voor iedereen zichtbaar zijn
      if (event.visibleFor === 'all') return true;
      // Events van de eigen club
      if (event.club && user?.club && event.club === user.club) return true;
      return false;
    })
    .filter(e => eventTypeFilter === 'all' ? true : (e.type || e.extendedProps?.type) === eventTypeFilter);

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

  const canAddEvents = user?.role === "Trainer" || user?.role === "VKBMO-lid";

  return (
    <div className="agenda-page">
      {/* Toolbar voor filter en voeg event toe knop */}
      <div className="agenda-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', minHeight: '40px' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
          <select
            className="agenda-filter-select"
            value={eventTypeFilter}
            onChange={e => setEventTypeFilter(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '1rem', minWidth: '120px' }}
          >
            <option value="all">Alle types</option>
            <option value="training">Training</option>
            <option value="vkbmo">VKBMO</option>
            <option value="club">Club</option>
          </select>
        </div>
        {canAddEvents && (
          <button
            className="btn-primary"
            style={{ minWidth: '120px', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: 500, fontSize: '1rem', background: 'linear-gradient(135deg, var(--primary-color, #3B82F6), #4285f4)', color: 'white', border: 'none', cursor: 'pointer' }}
            onClick={() => setShowAddEvent(true)}
          >
            + Voeg event toe
          </button>
        )}
      </div>

      <div 
        className="calendar-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Toon 'Terug naar maand' knop alleen in dagweergave */}
        {currentView === 'timeGridDay' && (
          <button
            className="btn-back-to-month"
            onClick={() => {
              const calendarApi = calendarRef.current.getApi();
              calendarApi.changeView('dayGridMonth', calendarApi.getDate());
            }}
            style={{ marginBottom: '1rem' }}
          >
            ←
          </button>
        )}
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={isMobile ? "dayGridMonth" : "dayGridMonth"}
          height="auto"
          aspectRatio={isMobile ? 1.0 : 1.35}
          contentHeight="auto"
          handleWindowResize={true}
          headerToolbar={
            isMobile
              ? {
                  left: "prev,next",
                  center: "title",
                  right: "today",
                }
              : {
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }
          }
          footerToolbar={
            isMobile
              ? {
                  center: "dayGridMonth,timeGridWeek,listWeek",
                }
              : {}
          }
          views={{
            dayGridMonth: {
              dayMaxEventRows: isMobile ? 2 : 4,
              eventDisplay: "block",
            },
            timeGridWeek: {
              slotMinTime: "06:00:00",
              slotMaxTime: "22:00:00",
              allDaySlot: false,
            },
            listWeek: {
              buttonText: "Lijst",
            },
          }}
          locale={nlLocale}
          selectable={canAddEvents}
          selectMirror={true}
          dayMaxEvents={isMobile ? 2 : true}
          weekends={true}
          events={filteredEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          eventMouseEnter={(info) => {
            // Disable hover on touch devices
            if ('ontouchstart' in window) return;
          }}
          moreLinkClick={(arg) => {
            const calendarApi = calendarRef.current?.getApi();
            if (calendarApi) {
              calendarApi.changeView('timeGridDay', arg.date);
            }
            return 'none';
          }}
          dateClick={handleDateClick}
          viewDidMount={(arg) => setCurrentView(arg.view.type)}
        />
      </div>

      {canAddEvents && (
        <button 
          className="fab-add-event"
          onClick={() => setShowAddEvent(true)}
          aria-label="Nieuw event toevoegen"
        >
          +
        </button>
      )}

      {showAddEvent && (
        <div className="add-event-modal" onClick={(e) => {
          if (e.target === e.currentTarget) setShowAddEvent(false);
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nieuw Event</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddEvent(false)}
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>
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
                  {user?.role === "Trainer" && (
                    <>
                      <option value="training">Training</option>
                      <option value="club">Club</option>
                    </>
                  )}
                  {user?.role === "VKBMO-lid" && (
                    <>
                      <option value="vkbmo">VKBMO</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Datum</label>
                <input
                  type="date"
                  id="startDate"
                  value={newEvent.start ? newEvent.start.slice(0, 10) : ""}
                  onChange={e => {
                    const date = e.target.value;
                    const time = newEvent.start ? newEvent.start.slice(11, 16) : "12:00";
                    setNewEvent({
                      ...newEvent,
                      start: date && time ? `${date}T${time}` : "",
                      end: date && time ? `${date}T${time}` : ""
                    });
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="startTime">Tijd</label>
                <input
                  type="time"
                  id="startTime"
                  value={newEvent.start ? newEvent.start.slice(11, 16) : ""}
                  onChange={e => {
                    const time = e.target.value;
                    const date = newEvent.start ? newEvent.start.slice(0, 10) : "";
                    setNewEvent({
                      ...newEvent,
                      start: date && time ? `${date}T${time}` : "",
                      end: date && time ? `${date}T${time}` : ""
                    });
                  }}
                  required
                />
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
          position: relative;
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
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          touch-action: pan-y;
        }

        .fab-add-event {
          position: fixed;
          bottom: 100px;
          right: 1rem;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-color, #3B82F6), #4285f4);
          color: white;
          border: none;
          font-size: 1.5rem;
          font-weight: 300;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 100;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .fab-add-event:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }

        .fab-add-event:active {
          transform: scale(0.95);
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
          padding: 1rem;
        }

        .modal-content {
          background: white;
          padding: 0;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem 1rem;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--text-color);
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

        form {
          padding: 1.5rem 2rem 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-color);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
          background: #fafafa;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-color, #3B82F6);
          background: white;
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .form-actions button {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.2s;
          min-height: 48px;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary-color, #3B82F6), #4285f4);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .loading {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-color-light);
          font-size: 1.1rem;
        }

        /* FullCalendar Mobile Overrides */
        :global(.fc-toolbar) {
          margin-bottom: 1rem !important;
        }

        :global(.fc-toolbar-chunk) {
          display: flex;
          align-items: center;
        }

        :global(.fc-button-group .fc-button) {
          padding: 0.5rem 0.75rem !important;
          font-size: 0.875rem !important;
          border-radius: 6px !important;
          margin: 0 2px !important;
        }

        :global(.fc-button-primary) {
          background: var(--primary-color, #3B82F6) !important;
          border-color: var(--primary-color, #3B82F6) !important;
        }

        :global(.fc-event-dot) {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
          vertical-align: middle;
        }

        :global(.fc-event-title-ellipsis) {
          display: inline-block;
          max-width: 110px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
        }

        :global(.fc-daygrid-event) {
          font-size: 0.75rem !important;
          padding: 2px 4px !important;
          border-radius: 4px !important;
          margin: 1px 0 !important;
        }

        :global(.fc-col-header-cell) {
          padding: 0.5rem 0.25rem !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
        }

        :global(.fc-daygrid-day-number) {
          font-size: 0.9rem !important;
          font-weight: 500 !important;
          padding: 0.25rem !important;
        }

        :global(.fc-more-link) {
          font-size: 0.7rem !important;
          color: var(--primary-color, #3B82F6) !important;
          font-weight: 500 !important;
        }

        @media (max-width: 768px) {
          .agenda-page {
            padding: 0.5rem;
          }
          
          .page-header {
            margin-bottom: 1rem;
            padding: 0 0.5rem;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }
          
          .calendar-container {
            padding: 0.5rem;
            margin: 0;
            border-radius: 8px;
          }

          .fab-add-event {
            bottom: 80px;
          }

          .modal-content {
            width: 100%;
            max-width: none;
            margin: 0;
            border-radius: 12px 12px 0 0;
            position: fixed;
            bottom: 0;
            top: 10%;
            animation: slideUp 0.3s ease;
          }

          .modal-header {
            padding: 1rem 1.5rem 0.5rem;
          }

          form {
            padding: 1rem 1.5rem 1.5rem;
          }

          .form-group {
            margin-bottom: 1rem;
          }

          .form-actions {
            margin-top: 1.5rem;
            flex-direction: column;
          }

          .form-actions button {
            min-height: 44px;
          }

          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }

          /* Mobile FullCalendar Overrides */
          :global(.fc-toolbar) {
            flex-direction: column !important;
            gap: 0.5rem !important;
            align-items: center !important;
          }

          :global(.fc-toolbar-chunk) {
            display: flex !important;
            justify-content: center !important;
          }

          :global(.fc-button-group .fc-button) {
            padding: 0.375rem 0.5rem !important;
            font-size: 0.75rem !important;
            min-height: 32px !important;
          }

          :global(.fc-daygrid-day) {
            min-height: 60px !important;
          }

          :global(.fc-col-header-cell) {
            padding: 0.375rem 0.125rem !important;
            font-size: 0.75rem !important;
          }

          :global(.fc-daygrid-day-number) {
            font-size: 0.8rem !important;
            padding: 0.25rem !important;
          }

          :global(.fc-daygrid-event) {
            font-size: 0.65rem !important;
            padding: 1px 2px !important;
            margin: 0.5px 0 !important;
          }

          :global(.fc-event-title) {
            font-weight: 500 !important;
          }

          :global(.fc-more-link) {
            font-size: 0.65rem !important;
            padding: 2px 4px !important;
          }

          :global(.fc-popover) {
            font-size: 0.8rem !important;
          }
        }

        @media (max-width: 480px) {
          :global(.fc-toolbar-title) {
            font-size: 1.1rem !important;
          }

          :global(.fc-button-group .fc-button) {
            padding: 0.25rem 0.375rem !important;
            font-size: 0.7rem !important;
            min-height: 28px !important;
          }

          :global(.fc-daygrid-day) {
            min-height: 50px !important;
          }
        }

        .btn-back-to-month {
          display: inline-block;
          margin-bottom: 1rem;
          padding: 0.5rem 1.2rem;
          background: #f3f4f6;
          color: #2563eb;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-back-to-month:hover {
          background: #e0e7ef;
        }
      `}</style>
    </div>
  );
}