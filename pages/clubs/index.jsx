"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { fetchClubs } from "../../src/services/api";
import { useAuth } from "../../src/services/auth";
import { FunnelIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import Loading from "../../components/Loading";

const ClubsPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 945); // Match the breakpoint from ledenlijst
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is a trainer and redirect
        if (user?.role === "Trainer") {
          router.push("/ledenlijst");
          return;
        }
        if (user?.role === "Vechter") {
          router.push("/dashboard");
          return;
        }

        const data = await fetchClubs();
        setClubs(data);
      } catch (error) {
        console.error("Fout bij laden van clubs:", error);
        console.log("Error state - User:", user);
        console.log("Error state - User role:", user?.role);
      }
    };

    if (!loading && user) {
      console.log("loadData triggered - User exists and not loading");
      loadData();
    } else {
      console.log("loadData not triggered - Loading:", loading, "User:", user);
    }
  }, [loading, user, router]);

  const handleRowClick = (id) => {
    router.push(`/clubs/${id}/leden`);
  };

  if (loading || !user) {
    return <Loading />;
  }

  const filteredClubs = clubs.filter((club) =>
    club.naam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="leden-container">
      <div className="header-section">
        <div>
          <h1 className="leden-title">Club Overzicht</h1>
        </div>
      </div>
      <input
        type="text"
        className="search-input"
        placeholder="Zoek op clubnaam"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="table-responsive">
        <table className="leden-tabel">
          <thead>
            <tr>
              <th className="logo-column">Club Logo</th>
              <th className="name-column">Clubnaam</th>
              {!isMobile && <th className="location-column">Locatie</th>}
              <th className="members-column">Aantal Leden</th>
            </tr>
          </thead>
          <tbody>
            {filteredClubs.length > 0 ? (
              filteredClubs.map((club) => (
                <tr
                  key={club._id}
                  onClick={() => handleRowClick(club._id)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="logo-column">
                    <img
                      src={club.clublogo}
                      alt={club.naam}
                      className="club-logo"
                    />
                  </td>
                  <td className="name-column">{club.naam}</td>
                  {!isMobile && (
                    <td className="location-column">
                      {club.locatie || "Onbekend"}
                    </td>
                  )}
                  <td className="members-column">{club.leden?.length || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isMobile ? "3" : "4"} className="no-results">
                  Geen clubs gevonden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .leden-container {
          padding: 1rem;
          border-radius: 12px;
          font-family: "Inter", sans-serif;
          width: 100%;
          box-sizing: border-box;
          max-width: 100%;
        }

        @media (min-width: 768px) {
          .leden-container {
            padding: 2rem;
          }
        }

        .header-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 30px;
        }

        .button-group {
          display: flex;
          width: 100%;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
        }

        .filter-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 12px;
          background-color: var(--filter-yellow);
          color: #000;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 16px;
        }

        @media (min-width: 768px) {
          .filter-button {
            padding: 12px 24px;
          }
        }

        .filter-button:hover {
          background-color: #e6c05f;
        }

        .add-member-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 12px;
          background-color: var(--primary-blue);
          color: white;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        @media (min-width: 768px) {
          .add-member-button {
            padding: 12px 24px;
          }
        }

        .add-member-button:hover {
          background-color: var(--hover-blue);
        }

        .button-icon {
          width: 20px;
          height: 20px;
        }

        .leden-title {
          font-size: 1.5rem;
          color: var(--text-color);
          margin-bottom: 10px;
        }

        @media (min-width: 768px) {
          .leden-title {
            font-size: 2rem;
          }
        }

        .search-input {
          width: 100%;
          padding: 10px 15px;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 15px;
        }

        .table-responsive {
          width: 100%;
          margin-bottom: 90px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .leden-tabel {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background-color: #fff;
          border: 1px solid rgba(213, 213, 213, 0.5);
          border-radius: 8px;
          table-layout: auto;
        }

        .leden-tabel th {
          background-color: #d4e4fd;
          color: #333;
          font-weight: 750;
          text-transform: uppercase;
          padding: 16px 8px;
          border-bottom: 1px solid rgba(213, 213, 213, 0.5);
          white-space: nowrap;
        }

        .leden-tabel td {
          padding: 12px 8px;
          border-bottom: 1px solid rgba(213, 213, 213, 0.3);
          line-height: 1.3;
          text-align: center;
        }

        .leden-tabel td:last-child {
          border: none;
        }

        .leden-tabel tr:hover {
          background-color: #f9fbff;
        }

        /* Column widths */
        .logo-column {
          width: 15%;
          min-width: 60px;
        }

        .name-column {
          width: 45%;
          min-width: 120px;
        }

        .location-column {
          width: 25%;
          min-width: 100px;
          display: none;
        }

        .members-column {
          width: 15%;
          min-width: 80px;
        }

        .club-logo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: contain;
        }

        @media (max-width: 944px) {
          .leden-tabel {
            font-size: 14px;
          }

          .leden-tabel th,
          .leden-tabel td {
            padding: 24px 6px;
          }

          .leden-tabel th {
            padding: 20px 8px;
          }

          .club-logo {
            width: 35px;
            height: 35px;
          }
        }

        @media (min-width: 945px) {
          .leden-tabel {
            font-size: 15px;
          }

          .leden-tabel th,
          .leden-tabel td {
            padding: 24px 12px;
          }

          .location-column {
            display: table-cell;
          }

          .name-column {
            width: 35%;
            text-align: center;
          }

          .club-logo {
            width: 40px;
            height: 40px;
          }
        }

        @media (max-width: 360px) {
          .leden-tabel th,
          .leden-tabel td {
            padding: 6px;
            font-size: 11px;
          }

          .club-logo {
            width: 30px;
            height: 30px;
          }
        }

        .no-results {
          text-align: center;
          padding: 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default ClubsPage;
