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
              <th>Acties</th>
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
                  <td>
                    {/* < to={`/club/${club._id}`} className="view-button">
                      Bekijk Leden
                    </Link> */}
                  </td>
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
    </div>
  );
};

export default ClubsPage;
