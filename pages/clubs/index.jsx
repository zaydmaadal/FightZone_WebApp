"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { fetchClubs } from "../../src/services/api";
import { useAuth } from "../../src/services/auth";
import { FunnelIcon, UserPlusIcon } from "@heroicons/react/24/solid";

const ClubsPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchClubs();
        setClubs(data);
      } catch (error) {
        console.error("Fout bij laden van clubs:", error);
      }
    };

    if (!loading && user) {
      loadData();
    }
  }, [loading, user]);

  const handleRowClick = (id) => {
    router.push(`/clubs/${id}/leden`);
  };

  if (loading || !user) {
    return <div style={{ textAlign: "center" }}>Laden...</div>;
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
        <div className="button-group">
          <button className="filter-button">
            <FunnelIcon className="button-icon" width={20} height={20} />
            Filter
          </button>
          <Link href="/clubs/add-club" className="add-member-button">
            <UserPlusIcon className="button-icon" width={20} height={20} />+
            Voeg club toe
          </Link>
        </div>
      </div>
      <input
        type="text"
        className="search-input"
        placeholder="Zoek op clubnaam"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table className="leden-tabel">
        <thead>
          <tr>
            <th>Club Logo</th>
            <th>Clubnaam</th>
            <th>Locatie</th>
            <th>Aantal Leden</th>
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
                <td>
                  <img
                    src={club.clublogo}
                    alt={club.naam}
                    className="club-logo"
                  />
                </td>
                <td>{club.naam}</td>
                <td>{club.locatie || "Onbekend"}</td>
                <td>{club.leden?.length || 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-results">
                Geen clubs gevonden
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <style jsx>{`
        .leden-container {
          padding: 2rem;
          border-radius: 12px;
          font-family: "Inter", sans-serif;
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
          padding: 12px 24px;
          background-color: var(--filter-yellow);
          color: #000;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 16px;
        }

        .filter-button:hover {
          background-color: #e6c05f;
        }

        .add-member-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 12px 24px;
          background-color: var(--primary-blue);
          color: white;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .add-member-button:hover {
          background-color: var(--hover-blue);
        }

        .button-icon {
          width: 20px;
          height: 20px;
        }

        .leden-title {
          font-size: 2rem;
          color: var(--text-color);
          margin-bottom: 10px;
        }

        .search-input {
          width: 100%;
          padding: 10px 15px;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 15px;
        }

        .leden-tabel {
          width: 100%;
          font-size: 15px;
          border-collapse: separate;
          border-spacing: 0;
          background-color: #fff;
          border: 1px solid #d5d5d5;
          border-radius: 8px;
          overflow: hidden;
        }

        .leden-tabel th {
          padding: 14px 20px;
          background-color: #f4f7fb;
          color: #333;
          font-weight: 750;
          text-transform: uppercase;
          border-bottom: 1px solid #d5d5d5;
        }

        .leden-tabel td {
          padding: 18px 20px;
          text-align: center;
          font-weight: 500;
          color: var(--light-text-color);
          border-bottom: 1px solid #d5d5d5;
        }

        .leden-tabel tr:last-child td {
          border-bottom: none;
        }

        .leden-tabel tr:hover {
          background-color: #f9fbff;
        }

        .club-logo {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: contain;
        }

        .insurance-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 14px;
        }

        .insurance-ok {
          background-color: rgba(0, 182, 155, 0.2);
          color: #00b69b;
        }

        .no-results {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        @media (max-width: 768px) {
          .leden-container {
            padding: 1rem;
          }

          .button-group {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-button,
          .add-member-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ClubsPage;
