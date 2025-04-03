import React, { useEffect, useState } from "react";
import { fetchClubs, fetchUsers } from "../services/api";

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const clubsData = await fetchClubs();
        setClubs(clubsData);
      } catch (error) {
        console.error("Fout bij het ophalen van clubs:", error);
      }
    };

    loadClubs();
  }, []);

  const filteredClubs = clubs.filter((club) =>
    club.naam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="clubs-page">
      <h1 className="page-title">Cluboverzicht</h1>

      {/* Zoekbalk */}
      <input
        type="text"
        placeholder="Zoek op clubnaam..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Cluboverzicht Tabel */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Club Logo</th>
              <th>Club Naam</th>
              <th>Locatie</th>
              <th>Aantal Leden</th>
            </tr>
          </thead>
          <tbody>
            {filteredClubs.length > 0 ? (
              filteredClubs.map((club) => (
                <tr key={club._id}>
                  <td>
                    <img
                      src={club.clublogo}
                      alt={club.naam}
                      className="club-logo"
                    />
                  </td>
                  <td>{club.naam}</td>
                  <td>{club.locatie}</td>
                  <td>{club.leden.length}</td>
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
      </div>
      <style jsx>{`
        .clubs-page {
          padding: 20px;
          color: #333;
        }

        .page-title {
          font-size: 2rem;
          margin-bottom: 20px;
        }

        .search-bar {
          width: 100%;
          padding: 10px;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #f9fafb;
          color: #333;
        }

        .table-container {
          overflow-x: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th,
        .table td {
          padding: 12px;
          text-align: center;
          border-bottom: 1px solid #ddd;
        }

        .table th {
          background-color: #f4f4f4;
        }

        .club-logo {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: contain;
        }

        .view-button {
          padding: 8px 12px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          text-decoration: none;
          cursor: pointer;
        }

        .view-button:hover {
          background-color: #0056b3;
        }

        .no-results {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 18px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default ClubsPage;
