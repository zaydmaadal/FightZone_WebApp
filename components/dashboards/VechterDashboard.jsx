import { useAuth } from "../../src/services/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUsers, fetchEvents, fetchClubs } from "../../src/services/api";
import Loading from "../Loading";
import {
  UsersIcon,
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  TrophyIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/solid";

export default function VechterDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fighterDetails, setFighterDetails] = useState({
    info: null,
    insuranceStatus: { text: "Onbekend", type: "error", expiryDate: null },
    clubName: "",
  });
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const loadFighterData = async () => {
      if (!user || user.role !== "Vechter") {
        setIsDataLoading(false);
        return;
      }
      try {
        const allUsers = await fetchUsers();
        const events = await fetchEvents();
        const clubsList = await fetchClubs();

        console.log("Fetched events:", events);
        console.log("Current user club:", user.club);

        const currentUserData = allUsers.find((u) => u._id === user._id);

        // Clubnaam ophalen
        const currentClub = clubsList.find(club => club._id === currentUserData?.club);
        const clubDisplayName = currentClub ? (currentClub.naam || currentClub.name || currentClub._id) : "Onbekend";

        // Verzekeringsstatus
        const insurance = checkInsuranceStatus(currentUserData?.vechterInfo);

        setFighterDetails({
          info: currentUserData,
          insuranceStatus: insurance,
          clubName: clubDisplayName,
        });

        // Filter relevante activiteiten voor de vechter
        const now = new Date();
        const relevantActivities = events
          .filter(e => {
            const eventDate = new Date(e.start);
            const isFuture = eventDate > now;
            const isTraining = e.type === "training";
            const isClubTraining = e.club === user.club;
            console.log(`Event: ${e.title}, Type: ${e.type}, Club: ${e.club}, IsFuture: ${isFuture}, IsTraining: ${isTraining}, IsClubTraining: ${isClubTraining}, Result: ${isFuture && isTraining && isClubTraining}`);
            return isFuture && isTraining && isClubTraining;
          })
          .sort((a, b) => new Date(a.start) - new Date(b.start))
          .slice(0, 5); // Max 5 tonen
        setUpcomingActivities(relevantActivities);
        console.log("Upcoming activities after filter:", relevantActivities);

      } catch (err) {
        console.error("Fout bij het laden van vechter data:", err);
      } finally {
        setIsDataLoading(false);
      }
    };
    console.log("User object:", user);
    loadFighterData();
  }, [user]);

  const checkInsuranceStatus = (vechterInfo) => {
    if (!vechterInfo?.vervalDatum) {
      return { text: "Niet in orde", type: "error", expiryDate: null };
    }
    const today = new Date();
    const expiryDate = new Date(vechterInfo.vervalDatum);
    if (isNaN(expiryDate.getTime())) {
      return { text: "Niet in orde", type: "error", expiryDate: null };
    }
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    let statusText = "In Orde";
    let statusType = "ok";

    if (daysUntilExpiry < 0) {
      statusText = "Verlopen";
      statusType = "error";
    } else if (daysUntilExpiry <= 30) {
      statusText = `Verloopt over ${daysUntilExpiry} dagen`;
      statusType = "warning";
    }
    return { text: statusText, type: statusType, expiryDate: expiryDate.toLocaleDateString('nl-BE') };
  };

  if (loading || isDataLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Laden...</p>
      </div>
    );
  }

  if (!user || user.role !== "Vechter") {
    return null; // Of redirect naar ander dashboard/pagina
  }

  const { info, insuranceStatus, clubName } = fighterDetails;
  const fighterRecord = info?.vechterInfo?.record || { wins: 0, losses: 0 };

  return (
    <div className="vechter-dashboard">

      <div className="stats-grid">
        {/* Verzekeringsstatus */}
        <div className="stat-card">
          <div className={`icon-box ${insuranceStatus.type === 'error' ? 'bg-[#fdeaea] text-[#e74c3c]' : (insuranceStatus.type === 'warning' ? 'bg-[#fff4e6] text-[#f39c12]' : 'bg-[#e6f4ea] text-[#34a853]')}`}>
            <UsersIcon className="h-4 w-4" />
          </div>
          <div className="stat-content">
            <p className="stat-title">Verzekering</p>
            <p className="stat-sub">{insuranceStatus.expiryDate ? `Vervaldatum: ${insuranceStatus.expiryDate}` : "Geen vervaldatum"}</p>
            <p className="stat-number" style={{ color: insuranceStatus.type === 'error' ? '#e74c3c' : (insuranceStatus.type === 'warning' ? '#f39c12' : '#34a853') }}>
              {insuranceStatus.text}
            </p>
          </div>
        </div>

        {/* Huidige Club */}
        <div className="stat-card">
          <div className="icon-box bg-[#e7eafe] text-[#6366f1]">
            <BuildingOfficeIcon className="h-4 w-4" />
          </div>
          <div className="stat-content">
            <p className="stat-title">Club</p>
            <p className="stat-sub">Huidige club</p>
            <p className="stat-number">{clubName || "Onbekend"}</p>
          </div>
        </div>

        {/* Record */}
        <div className="stat-card">
          <div className="icon-box bg-[#eef0ff] text-[#6c63ff]">
            <TrophyIcon className="h-4 w-4" />
          </div>
          <div className="stat-content">
            <p className="stat-title">Record</p>
            <p className="stat-sub">Winsten / Verliezen</p>
            <p className="stat-number">{`${fighterRecord.wins} / ${fighterRecord.losses}`}</p>
          </div>
        </div>
      </div>

      {/* --- Komende Activiteiten --- */}
      <div className="dashboard-events-list">
        <h2 className="activities-title">Komende Activiteiten</h2>
        <VechterEventsList events={upcomingActivities} />
        <a href="/agenda" className="agenda-link">Bekijk volledige agenda →</a>
      </div>

      {/* --- Stijlen --- */}
      <style jsx>{`
        .activities-title {
          margin-bottom: 1rem;
        }

        .vechter-dashboard {
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
          .vechter-dashboard {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// --- Vechter Events List Component ---
function VechterEventsList({ events }) {
  if (events.length === 0) {
    return (
      <div className="no-events">
        <p className="no-events-text">Geen komende events of trainingen</p>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      {events.map((item) => {
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
        } else if (item.type === 'club') {
          typeClass = 'club';
          typeLabel = 'Club Event';
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
          margin: 10px;
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
        
        .event-type.club {
          background-color: #9333ea;
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
