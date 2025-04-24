"use client";
import React, { useEffect, useState } from "react";
import { fetchUsers, fetchClubById } from "../../../services/api";
import { useRouter } from "next/router";
import Link from "next/link";

const ClubMembersPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [club, setClub] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clubData, usersData] = await Promise.all([
          fetchClubById(id),
          fetchUsers(),
        ]);
        setClub(clubData);
        setUsers(usersData);
      } catch (error) {
        console.error("Fout bij het ophalen van data:", error);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const filteredFighters = users.filter(
    (user) =>
      user.club === id &&
      user.role.toLowerCase() === "vechter" &&
      `${user.voornaam} ${user.achternaam}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const trainers = users.filter(
    (user) => user.club === id && user.role.toLowerCase() === "trainer"
  );

  const exportToCSV = () => {
    const headers = ["Naam", "Geboortedatum", "Gewicht", "Lengte", "Klasse"];
    const rows = filteredFighters.map((user) => [
      `${user.voornaam} ${user.achternaam}`,
      formatDate(user.geboortedatum),
      user.vechterInfo?.gewicht || "N/A",
      user.vechterInfo?.lengte || "N/A",
      user.vechterInfo?.klasse || "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vechters_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!club) {
    return <div className="loading">Laden...</div>;
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
              <th>Klasse</th>
            </tr>
          </thead>
          <tbody>
            {filteredFighters.length > 0 ? (
              filteredFighters.map((user) => (
                <tr
                  key={user._id}
                  className="clickable-row"
                  onClick={() => router.push(`/member/${user._id}`)}
                >
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
                  <td>{user.vechterInfo?.klasse || "N/A"}</td>
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

      <div className="button-container">
        {/* Terugknop */}
        <Link href="/clubs" className="back-button">
          Terug naar Cluboverzicht
        </Link>

        {/* CSV Export Knop */}
        <button onClick={exportToCSV} className="export-csv-button">
          Exporteer naar CSV
        </button>
      </div>

      <style jsx>{`
        .search-bar {
          width: 100%;
          padding: 10px;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #f9fafb;
          color: #333;
        }
        .club-members-page {
          padding: 20px;
          color: #333;
        }

        .page-title {
          font-size: 2rem;
          margin-bottom: 20px;
        }

        .trainers-section {
          margin-bottom: 30px;
        }

        .trainers-section h2 {
          font-size: 1.5em;
          margin-bottom: 20px;
          color: #333;
        }

        .trainers-list {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }

        .trainer-card {
          display: flex;
          align-items: center;
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 15px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          width: 300px;
        }

        .trainer-profile-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-right: 15px;
          object-fit: cover;
        }

        .trainer-info {
          flex: 1;
        }

        .trainer-name {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 5px;
          color: #333;
        }

        .trainer-birthdate {
          font-size: 0.9em;
          color: #666;
        }

        .search-bar {
          width: 100%;
          padding: 10px;
          font-size: 1.2em;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        .table-container {
          margin-top: 20px;
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

        .profile-img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: contain;
        }

        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .clickable-row:hover {
          background-color: #f8f9fa;
        }

        .back-button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-size: 1em;
        }

        .back-button:hover {
          background-color: #0056b3;
        }

        .export-csv-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #10b981;
          color: white;
          font-size: 1rem;
          font-weight: bold;
          text-align: center;
          text-decoration: none;
          border-radius: 0.375rem;
          transition: background-color 0.3s;
          border: none;
          cursor: pointer;
          margin-bottom: 20px;
        }

        .export-csv-button:hover {
          background-color: #059669;
        }

        .button-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
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

export default ClubMembersPage;
