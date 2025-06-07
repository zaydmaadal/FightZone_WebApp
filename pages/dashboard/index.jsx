"use client";

import { useAuth } from "../../src/services/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUsers, fetchEvents } from "../../src/services/api";
import VechterDashboard from "../../components/dashboards/VechterDashboard";
import VKBMODashboard from "../../components/dashboards/VKBMODashboard";
import Loading from "../../components/Loading";
import {
  UsersIcon,
  UserIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clubMembers, setClubMembers] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); 
    }
  }, [loading, user, router]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const allUsers = await fetchUsers();
        const filtered = allUsers.filter((u) => u.club === user?.club);
        setClubMembers(filtered);
      } catch (err) {
        console.error("Fout bij het laden van clubleden:", err);
      }
    };

    if (user?.role === "Trainer") {
      loadMembers();
    }
  }, [user]);

  const checkInsuranceStatus = (vechterInfo) => {
    if (!vechterInfo?.vervalDatum) {
      return { text: "Niet in orde", type: "error" };
    }
    const today = new Date();
    const expiryDate = new Date(vechterInfo.vervalDatum);
    if (isNaN(expiryDate.getTime())) {
      return { text: "Niet in orde", type: "error" };
    }
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) {
      return { text: "Niet in orde", type: "error" };
    } else if (daysUntilExpiry <= 30) {
      return { text: `Verloopt over ${daysUntilExpiry} dagen`, type: "warning" };
    } else {
      return { text: "In Orde", type: "ok" };
    }
  };

  if (loading) return <Loading />;
  if (!user) return null;

  if (user.role === "Vechter") return <VechterDashboard />;
  if (user.role === "VKBMO-lid") return <VKBMODashboard />;

  const totalMembers = clubMembers.length;
  const totalFighters = clubMembers.filter((u) => u.role === "Vechter").length;
  const upcomingEvents = 3;

  const insuranceNotifications = clubMembers
    .filter((u) => {
      if (u.role !== "Vechter") return false;
      const status = checkInsuranceStatus(u.vechterInfo);
      return status.type === "error" || status.type === "warning";
    })
    .map((u) => {
      const status = checkInsuranceStatus(u.vechterInfo);
      return {
        name: u.voornaam && u.achternaam ? `${u.voornaam} ${u.achternaam}` : u.naam || u.email,
        status,
      };
    });

  return (
    <div className="trainer-dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* --- Stats Grid --- */}
      <div className="stats-grid">
        {/* Leden */}
        <div className="stat-card">
          <div className="icon-box bg-[#e7eafe] text-[#6366f1]">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="stat-content">
            <p className="stat-title">Leden</p>
            <p className="stat-sub">Ingeschreven</p>
            <p className="stat-number">{totalMembers}</p>
            <p className="stat-growth text-emerald-500">
              <span style={{ color: "green" }}>▲ 8.5%</span> Sinds September
            </p>
          </div>
        </div>

        {/* Vechters */}
        <div className="stat-card">
          <div className="icon-box bg-[#fdeaea] text-[#e74c3c]">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="stat-content">
            <p className="stat-title">Vechters</p>
            <p className="stat-sub">Ingeschreven</p>
            <p className="stat-number">{totalFighters}</p>
            <p className="stat-growth text-emerald-500">
              <span style={{ color: "green" }}>▲ {Math.round((totalFighters / totalMembers) * 100)}%</span> van uw leden
            </p>
          </div>
        </div>

        {/* Events */}
        <div className="stat-card">
          <div className="icon-box bg-[#fff4e6] text-[#f39c12]">
            <CalendarDaysIcon className="h-4 w-4" />
          </div>
          <div className="stat-content">
            <p className="stat-title">Events</p>
            <p className="stat-sub">Ingeschreven</p>
            <p className="stat-number">{upcomingEvents}</p>
            <p className="stat-growth text-emerald-500">
              <span style={{ color: "green" }}>▲ 5</span> meer dan 2023
            </p>
          </div>
        </div>
      </div>

      {/* --- Meldingen --- */}
      <h2 className="notifications-title">Meldingen</h2>
      <div className="notifications">
        {insuranceNotifications.length === 0 && (
          <div className="notification-card">
            <div className="notif-icon purple">
              <UsersIcon className="h-5 w-5 text-[#6c63ff]" />
            </div>
            <div className="notif-content">
              <p>Geen belangrijke verzekeringsmeldingen voor uw leden.</p>
            </div>
            <div className="notif-dot" style={{ background: '#ccc' }} />
          </div>
        )}
        {insuranceNotifications.map((notif, idx) => (
          <div className="notification-card" key={idx}>
            <div > 
              <UsersIcon className={`h-5 w-5 ${notif.status.type === 'error' ? 'text-[#e74c3c]' : 'text-[#f39c12]'}`} />
            </div>
            <div className="notif-content">
              <p>
                De verzekering van <strong>{notif.name}</strong> is{' '}
                <span
                  className={
                    notif.status.type === 'error'
                      ? 'expired'
                      : 'almost-expired'
                  }
                  style={{ color: notif.status.type === 'warning' ? '#f39c12' : undefined }}
                >
                  {notif.status.type === 'error'
                    ? 'verlopen'
                    : `bijna verlopen (${notif.status.text})`}
                </span>.
              </p>
              <p className="subtext">
                Gelieve dit zo snel mogelijk in orde te brengen of het profiel te raadplegen voor verdere details.
              </p>
            </div>
            <div
              className="notif-dot"
              style={{ background: notif.status.type === 'warning' ? '#f39c12' : '#e74c3c' }}
            />
          </div>
        ))}
      </div>

      {/* --- Activiteiten & Agenda --- */}
      <div className="dashboard-events-list">
        <h2 className="activities-title">Komende Activiteiten</h2>
        <CombinedEventsList />
        <a href="/agenda" className="agenda-link">Bekijk volledige agenda →</a>
      </div>

      {/* --- Stijlen --- */}
      <style jsx>{`
        .trainer-dashboard {
          padding: 2rem;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: bold;
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

        .stat-growth {
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        /* Meldingen */
        .notifications {
          display: flex;
          flex-direction: column;
          gap: 0rem;
          margin-bottom: 2rem;
        }

        .notification-card {
          display: flex;
          align-items: flex-start;
          background: #fff;
          padding: 1.25rem 1.5rem;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .notif-icon {
          padding: 0.6rem;
          border-radius: 8px;
          margin-right: 1rem;
        }

        .notif-icon.purple {
          background-color: #eef0ff;
        }

        .notif-icon.red {
          background-color: #fdeaea;
        }

        .notif-content {
          flex-grow: 1;
        }

        .notif-content p {
          margin: 0;
          font-size: 0.95rem;
          color: #333;
        }

        .notif-content .subtext {
          font-size: 0.85rem;
          color: #555;
          margin-top: 0.25rem;
        }

        .expired {
          color: #e74c3c;
          font-weight: 500;
        }

        .almost-expired {
          color: #f39c12;
          font-weight: 500;
        }

        .notif-dot {
          width: 12px;
          height: 12px;
          background-color: red;
          border-radius: 50%;
          margin-left: 1rem;
          margin-top: 0.25rem;
          flex-shrink: 0;
        }

        /* Activiteiten & Agenda */
        .dashboard-events-list {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          padding: 2rem;
          margin-bottom: 2rem;
          max-width: 1200px;
        }

        .activities-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1.5rem;
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
        
        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-activities-row {
            flex-direction: column;
          }

          .dashboard-activities-half {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}

// --- Combined events & trainingen component ---
function CombinedEventsList() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetchEvents().then((data) => {
      if (Array.isArray(data)) {
        const now = new Date();
        const upcoming = data
          .filter(e => new Date(e.start) > now)
          .sort((a, b) => new Date(a.start) - new Date(b.start))
          .slice(0, 5); // max 5 tonen
        setItems(upcoming);
      }
    });
  }, []);
  
  if (items.length === 0) return (
    <div className="no-events">
      <CalendarDaysIcon className="no-events-icon" />
      <p className="no-events-text">Geen komende events of trainingen</p>
    </div>
  );
  
  return (
    <div className="event-list-container">
      {items.map((item) => {
        const dateObj = new Date(item.start);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('nl-BE', { month: 'short' });
        const weekday = dateObj.toLocaleDateString('nl-BE', { weekday: 'short' });
        
        // Determine color for type
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
        
        .no-events-icon {
          width: 2rem;
          height: 2rem;
          margin-bottom: 1rem;
          color: #d1d5db;
        }
        
        .no-events-text {
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}