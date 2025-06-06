"use client";

import { useAuth } from "../../src/services/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUsers } from "../../src/services/api";
import VechterDashboard from "../../components/dashboards/VechterDashboard";
import VKBMODashboard from "../../components/dashboards/VKBMODashboard";
import Loading from "../../components/Loading";
import {
  UsersIcon,
  UserIcon,
  CalendarDaysIcon,
  ChartBarIcon,
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

  if (loading) return <Loading />;
  if (!user) return null;

  if (user.role === "Vechter") return <VechterDashboard />;
  if (user.role === "VKBMO-lid") return <VKBMODashboard />;

  const totalMembers = clubMembers.length;
  const totalFighters = clubMembers.filter((u) => u.role === "Vechter").length;
  const upcomingEvents = 3;

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
        <div className="notification-card">
          <div className="notif-icon purple">
            <UsersIcon className="h-5 w-5 text-[#6c63ff]" />
          </div>
          <div className="notif-content">
            <p>
              De verzekering van <strong>Amine El Boujadaini</strong> is <span className="expired">verlopen</span>.
            </p>
            <p className="subtext">
              Gelieve dit zo snel mogelijk in orde te brengen of zijn profiel te raadplegen voor verdere details.
            </p>
          </div>
          <div className="notif-dot" />
        </div>

        <div className="notification-card">
          <div className="notif-icon red">
            <UserIcon className="h-5 w-5 text-[#e74c3c]" />
          </div>
          <div className="notif-content">
            <p>
              <strong>Zayd Maadal</strong> heeft volgende week een partij in <strong>“Night Of The Champs 2”</strong> in Boom.
            </p>
            <p className="subtext">Raadpleeg de agenda of zijn profiel voor meer informatie.</p>
          </div>
          <div className="notif-dot" />
        </div>

        <div className="notification-card">
          <div className="notif-icon purple">
            <UsersIcon className="h-5 w-5 text-[#6c63ff]" />
          </div>
          <div className="notif-content">
            <p>U heeft <strong>2 nieuwe berichten</strong> gemist in Uw Club.</p>
            <p className="subtext">Ga naar de <strong>"Mijn Club"</strong> pagina om op de hoogte te blijven van alle activiteiten.</p>
          </div>
          <div className="notif-dot" />
        </div>
      </div>

      {/* --- Result Banner --- */}
      <div className="result-banner">
        <img
          src="/images/banner.png"
          alt="resultaat"
          className="result-image"
        />
        <div className="result-overlay">
          <div className="result-text">
            <h3>Ontdek jouw Resultaten</h3>
            <p>Bekijk prestaties en activiteiten van jouw club.</p>
            <button>Ontdek →</button>
          </div>
        </div>
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
          padding: 2rem;        /* <-- hier aangepast naar 3rem */
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

        .notif-dot {
          width: 12px;
          height: 12px;
          background-color: red;
          border-radius: 50%;
          margin-left: 1rem;
          margin-top: 0.25rem;
          flex-shrink: 0;
        }

        /* Result Banner */
        .result-banner {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .result-image {
          width: 100%;
          height: 350px;
          object-fit: cover;
        }

        .result-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.4);
        }

        .result-text {
          color: white;
          max-width: 400px;
        }

        .result-text h3 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
        }

        .result-text p {
          margin-top: 0.5rem;
        }

        .result-text button {
          margin-top: 1rem;
          background-color: transparent;
          border: 2px solid white;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }

        .result-text button:hover {
          background: white;
          color: #2c3e50;
        }
      `}</style>
    </div>
  );
}
