import React, { useEffect, useState } from "react";
import { fetchUsers, fetchClubById } from "../services/api";
import { Link, useParams } from "react-router-dom";
import "../assets/styles/pages/ClubMembersPage.css";

const ClubMembersPage = () => {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clubData, usersData] = await Promise.all([
          fetchClubById(clubId),
          fetchUsers(),
        ]);
        setClub(clubData);
        setUsers(usersData);
      } catch (error) {
        console.error("Fout bij het ophalen van data:", error);
      }
    };

    loadData();
  }, [clubId]);

  // Formatteer de geboortedatum naar een leesbaar formaat (bijv. 15-06-1985)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Maanden zijn 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const filteredFighters = users.filter(
    (user) =>
      user.club === clubId &&
      user.role.toLowerCase() === "vechter" &&
      `${user.voornaam} ${user.achternaam}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const trainers = users.filter(
    (user) => user.club === clubId && user.role.toLowerCase() === "trainer"
  );

  if (!club) {
    return <div>Laden...</div>;
  }

  return (
    <div className="club-members-page">
      <h1 className="page-title">Leden van {club.naam}</h1>

      {/* Trainers boven de zoekbalk */}
      <div className="trainers-section">
        <h2>Trainers</h2>
        {trainers.length > 0 ? (
          <div className="trainers-list">
            {trainers.map((trainer) => (
              <div key={trainer._id} className="trainer-card">
                <img
                  src={trainer.profielfoto}
                  alt={`${trainer.voornaam} ${trainer.achternaam}`}
                  className="trainer-profile-img"
                />
                <div className="trainer-info">
                  <p className="trainer-name">
                    {trainer.voornaam} {trainer.achternaam}
                  </p>
                  <p className="trainer-birthdate">
                    Geboortedatum: {formatDate(trainer.geboortedatum)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Geen trainers gevonden</p>
        )}
      </div>

      {/* Zoekbalk */}
      <input
        type="text"
        placeholder="Zoek op naam..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Ledenlijst Tabel */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Profielfoto</th>
              <th>Naam</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {filteredFighters.length > 0 ? (
              filteredFighters.map((user) => (
                <tr key={user._id}>
                  <td>
                    <img
                      src={user.profielfoto}
                      alt={user.voornaam}
                      className="profile-img"
                    />
                  </td>
                  <td>
                    {user.voornaam} {user.achternaam}
                  </td>
                  <td>
                    <Link to={`/member/${user._id}`} className="view-button">
                      Bekijk
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-results">
                  Geen vechters gevonden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Terugknop */}
      <Link to="/clubs" className="back-button">
        Terug naar Cluboverzicht
      </Link>
    </div>
  );
};

export default ClubMembersPage;
