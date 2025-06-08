import { useEffect, useState } from "react";
import { fetchUsers, fetchEvents, fetchClubs } from "../../src/services/api";
import {
  UsersIcon,
  UserIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/solid";

export default function VKBMODashboard() {
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalMembers: 0,
    totalFighters: 0,
    totalEvents2025: 0,
    upcomingEvents: 0,
  });

  const [clubStats, setClubStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const users = await fetchUsers();
        const events = await fetchEvents();
        const clubsList = await fetchClubs();
        // Maak een mapping van clubId naar clubnaam
        const clubIdToName = {};
        clubsList.forEach(club => {
          clubIdToName[club._id] = club.naam || club.name || club._id;
        });
        // Bereken statistieken
        const clubs = [...new Set(users.map(user => user.club))].filter(Boolean);
        const fighters = users.filter(user => user.role === "Vechter");
        const trainers = users.filter(user => user.role === "Trainer");
        // Club-specifieke statistieken + meest recente activiteit
        const clubData = clubs.map(clubId => {
          const clubMembers = users.filter(user => user.club === clubId);
          const clubFighters = clubMembers.filter(user => user.role === "Vechter");
          const clubTrainers = clubMembers.filter(user => user.role === "Trainer");
          // Zoek de meest recente activiteit (createdAt of updatedAt)
          const mostRecent = clubMembers.reduce((latest, user) => {
            const userDate = new Date(user.updatedAt || user.createdAt || 0);
            return userDate > latest ? userDate : latest;
          }, new Date(0));
          return {
            id: clubId,
            name: clubIdToName[clubId] || clubId,
            totalMembers: clubMembers.length,
            fighters: clubFighters.length,
            trainers: clubTrainers.length,
            lastActivity: mostRecent,
          };
        });
        // Sorteer op meest recente activiteit en neem de top 3
        const sortedClubs = clubData
          .filter(c => c.lastActivity > new Date(0))
          .sort((a, b) => b.lastActivity - a.lastActivity)
          .slice(0, 3);
        // Tel alleen vkbmo events in 2025
        const events2025 = events.filter(e => {
          const d = new Date(e.start);
          return e.type === "vkbmo" && d.getFullYear() === 2025;
        }).length;
        setStats({
          totalClubs: clubs.length,
          totalMembers: users.length,
          totalFighters: fighters.length,
          totalEvents2025: events2025,
          upcomingEvents: events.filter(e => new Date(e.start) > new Date()).length,
        });
        setClubStats(sortedClubs);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Laden...</p>
      </div>
    );
  }

  return (
    <div className="vkbm-dashboard">
      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Clubs */}
        <div className="stat-card">
          <div className="icon-box bg-[#e7eafe] text-[#6366f1]">
            <BuildingOfficeIcon className="h-4 w-4" />
          </div>
          <div className="stat-content">
            <p className="stat-title">Clubs</p>
            <p className="stat-sub">Aangesloten</p>
            <p className="stat-number">{stats.totalClubs}</p>
          </div>
        </div>

        {/* Totaal Leden */}
        <div className="stat-card">
          <div className="icon-box bg-[#fdeaea] text-[#e74c3c]">
            <UsersIcon className="h-4 w-4" />
          </div>
          <div className="stat-content">
            <p className="stat-title">Leden</p>
            <p className="stat-sub">Totaal</p>
            <p className="stat-number">{stats.totalMembers}</p>
          </div>
        </div>

        {/* Vechters */}
        <div className="stat-card">
          <div className="icon-box bg-[#fff4e6] text-[#f39c12]">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="stat-content">
            <p className="stat-title">Vechters</p>
            <p className="stat-sub">Actief</p>
            <p className="stat-number">{stats.totalFighters}</p>
          </div>
        </div>

        {/* Trainers vervangen door Events 2025 */}
        <div className="stat-card">
          <div className="icon-box bg-[#e6f4ea] text-[#34a853]">
            <CalendarDaysIcon className="h-4 w-4" />
          </div>
          <div className="stat-content">
            <p className="stat-title">Events</p>
            <p className="stat-sub">in 2025</p>
            <p className="stat-number">{stats.totalEvents2025}</p>
          </div>
        </div>
      </div>

      {/* Club Overzicht */}
      <div className="clubs-overview">
        <h2 className="section-title">Club Overzicht</h2>
        <div className="clubs-grid">
          {clubStats.map((club, index) => (
            <div key={index} className="club-card">
              <h3 className="club-name">{club.name}</h3>
              <div className="club-stats">
                <div className="club-stat">
                  <span className="stat-label">Leden</span>
                  <span className="stat-value">{club.totalMembers}</span>
                </div>
                <div className="club-stat">
                  <span className="stat-label">Vechters</span>
                  <span className="stat-value">{club.fighters}</span>
                </div>
                <div className="club-stat">
                  <span className="stat-label">Trainers</span>
                  <span className="stat-value">{club.trainers}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Komende Events */}
      <div className="dashboard-events-list">
        <h2 className="section-title">Komende Events</h2>
        <CombinedEventsList />
        <a href="/agenda" className="agenda-link">Bekijk volledige agenda →</a>
      </div>

      <style jsx>{`
        .vkbm-dashboard {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1.5rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          border: 1px solid #eee;
          gap: 1rem;
        }

        .icon-box {
          width: 2rem;
          height: 2rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }

        .stat-sub {
          font-size: 0.8rem;
          color: #888;
          margin: 0.25rem 0;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 0;
        }

        /* Clubs Overview */
        .clubs-overview {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }

        .clubs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .club-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
        }

        .club-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 1rem 0;
        }

        .club-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .club-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #64748b;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
        }

        /* Events List */
        .dashboard-events-list {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }

        .agenda-link {
          display: block;
          text-align: right;
          margin-top: 1rem;
          color: #6366f1;
          font-weight: 500;
          text-decoration: none;
        }

        .agenda-link:hover {
          text-decoration: underline;
        }

        /* Loading State */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .vkbm-dashboard {
            padding: 1rem;
          }

          .stats-grid,
          .clubs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Events List Component
function CombinedEventsList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchEvents().then((data) => {
      if (Array.isArray(data)) {
        const now = new Date();
        const upcoming = data
          .filter(e => e.type === 'vkbmo' && new Date(e.start) > now)
          .sort((a, b) => new Date(a.start) - new Date(b.start))
          .slice(0, 5);
        setItems(upcoming);
      }
    });
  }, []);

  if (items.length === 0) {
    return (
      <div className="no-events">
        <p className="no-events-text">Geen komende events</p>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      {items.map((item) => {
        const dateObj = new Date(item.start);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('nl-BE', { month: 'short' });
        const weekday = dateObj.toLocaleDateString('nl-BE', { weekday: 'short' });

        let typeClass = '';
        let typeLabel = 'Event';
        if (item.type === 'training') {
          typeClass = 'training';
          typeLabel = 'Training';
        } else if (item.type === 'vkbmo') {
          typeClass = 'vkbmo';
          typeLabel = 'VKBMO';
        }

        return (
          <div key={item._id} className="event-item">
            <div className="event-date">
              <div className="event-day">{day}</div>
              <div className="event-month-weekday">
                <span>{month}</span>
                <span>{weekday}</span>
              </div>
            </div>
            <div className="event-info">
              <div className="event-title">{item.title}</div>
              <div className="event-details">
                {item.location && (
                  <div className="event-location">
                    
                    <span>{item.location}</span>
                  </div>
                )}
                <div className="event-time">
                  <ClockIcon className="event-icon" />
                  <span>
                    {dateObj.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
            <div className={`event-type ${typeClass}`}>
              {typeLabel}
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .event-list-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .event-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-radius: 8px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
        }

        .event-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 60px;
          margin-right: 1.5rem;
        }

        .event-day {
          font-size: 1.5rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .event-month-weekday {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.8rem;
          color: #6b7280;
          text-transform: uppercase;
        }

        .event-info {
          flex-grow: 1;
        }

        .event-title {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.25rem;
        }

        .event-details {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .event-location,
        .event-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .event-icon {
          width: 0.9rem;
          height: 0.9rem;
          color: #9ca3af;
        }

        .event-type {
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
        }

        .event-type.training {
          background-color: #10b981;
        }

        .event-type.vkbmo {
          background-color: #3b82f6;
        }

        .event-type.event {
          background-color: #f59e0b;
        }

        .no-events {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: #6b7280;
        }

        .no-events-text {
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}
