"use client";
import React, { useEffect, useState } from "react";
import {
  fetchUsers,
  fetchClubById,
  deleteUserById,
} from "../../../../src/services/api";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeftCircleIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";

// Helper function to calculate age
const calculateAge = (birthDate) => {
  if (!birthDate) return "Onbekend";

  const birth = new Date(birthDate);
  const today = new Date();

  // Check if date is valid
  if (isNaN(birth.getTime())) return "Onbekend";

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return `${age}J`;
};

// Helper function to check insurance status
const checkInsuranceStatus = (vechterInfo) => {
  // If using old system (no vervalDatum), always return "Niet in orde"
  if (!vechterInfo?.vervalDatum) {
    return { text: "Niet in orde", type: "error" };
  }

  const today = new Date();
  const expiryDate = new Date(vechterInfo.vervalDatum);

  // Check if date is valid
  if (isNaN(expiryDate.getTime())) {
    return { text: "Niet in orde", type: "error" };
  }

  // Calculate days until expiry
  const daysUntilExpiry = Math.ceil(
    (expiryDate - today) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) {
    return { text: "Niet in orde", type: "error" };
  } else if (daysUntilExpiry <= 60) {
    // Within 2 months
    return { text: `Verloopt over ${daysUntilExpiry} dagen`, type: "warning" };
  } else {
    return { text: "In Orde", type: "ok" };
  }
};

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

  const handleDelete = async (e, userId) => {
    e.stopPropagation(); // Prevent row click event
    if (window.confirm("Weet je zeker dat je dit lid wilt verwijderen?")) {
      try {
        await deleteUserById(userId);
        // Refresh the list after deletion
        setUsers(users.filter((user) => user._id !== userId));
      } catch (error) {
        console.error("Fout bij verwijderen lid:", error);
        alert("Er is een fout opgetreden bij het verwijderen van het lid");
      }
    }
  };

  const exportToCSV = () => {
    const headers = ["Naam", "Gewichtscategorie", "Leeftijd", "Klasse"];
    const rows = filteredFighters.map((user) => [
      `${user.voornaam} ${user.achternaam}`,
      `${user.vechterInfo?.gewicht || "Onbekend"} kg`,
      calculateAge(user.geboortedatum),
      user.vechterInfo?.klasse || "Onbekend",
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
    <div className="leden-container">
      <div className="header-section">
        <div className="title-section">
          <Link href="/clubs" className="back-link">
            <ArrowLeftCircleIcon className="back-icon" width={24} height={24} />
          </Link>
          <h1 className="leden-title">Leden van {club.naam}</h1>
        </div>
        <div className="button-group">
          <button onClick={exportToCSV} className="export-button">
            <ArrowDownTrayIcon className="button-icon" width={20} height={20} />
            Exporteer naar CSV
          </button>
          <Link
            href={`/clubs/${id}/leden/add-member`}
            className="add-member-button"
          >
            + Voeg lid toe
          </Link>
        </div>
      </div>

      {/* Trainers sectie */}
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
                    Leeftijd: {calculateAge(trainer.geboortedatum)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Geen trainers gevonden</p>
        )}
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Zoek op naam, gewicht, leeftijd of klasse..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="leden-tabel">
        <thead>
          <tr>
            <th>Naam</th>
            <th>Gewichtscategorie</th>
            <th>Leeftijd</th>
            <th>Klasse</th>
            <th>Verzekering</th>
            <th className="action-column"></th>
          </tr>
        </thead>
        <tbody>
          {filteredFighters.length > 0 ? (
            filteredFighters.map((user) => (
              <tr
                key={user._id}
                onClick={() => router.push(`/member/${user._id}`)}
                className="clickable-row"
              >
                <td>
                  {user.voornaam} {user.achternaam}
                </td>
                <td>-{user.vechterInfo?.gewicht || "Onbekend"} kg</td>
                <td>{calculateAge(user.geboortedatum)}</td>
                <td>{user.vechterInfo?.klasse || "Onbekend"}</td>
                <td>
                  <span
                    className={`insurance-badge insurance-${
                      checkInsuranceStatus(user.vechterInfo).type
                    }`}
                  >
                    {checkInsuranceStatus(user.vechterInfo).text}
                  </span>
                </td>
                <td className="action-column">
                  <button
                    onClick={(e) => handleDelete(e, user._id)}
                    className="delete-button"
                    title="Verwijder lid"
                  >
                    <TrashIcon className="delete-icon" width={20} height={20} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-results">
                Geen vechters gevonden
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

        .title-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
        }

        .back-link {
          display: flex;
          align-items: center;
          color: var(--text-color);
          text-decoration: none;
        }

        .back-icon {
          width: 24px;
          height: 24px;
          color: var(--text-color);
        }

        .button-group {
          display: flex;
          width: 100%;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
        }

        .export-button {
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

        .export-button:hover {
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

        .leden-title {
          font-size: 2rem;
          color: var(--text-color);
          margin: 0;
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

        .search-input {
          width: 100%;
          padding: 10px 15px;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 15px;
          background-color: #f9fafb;
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

        .insurance-warning {
          background-color: rgba(255, 171, 0, 0.2);
          color: #ffab00;
        }

        .insurance-error {
          background-color: rgba(255, 71, 87, 0.2);
          color: #ff4757;
        }

        .action-column {
          width: 50px;
          text-align: center;
          padding: 0;
        }

        .delete-button {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .delete-button:hover {
          background-color: rgba(255, 71, 87, 0.1);
        }

        .delete-icon {
          color: #ff4757;
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

        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .button-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .leden-container {
            padding: 1rem;
          }

          .button-group {
            flex-direction: column;
            align-items: stretch;
          }

          .export-button,
          .add-member-button {
            width: 100%;
            justify-content: center;
          }

          .trainers-list {
            flex-direction: column;
          }

          .trainer-card {
            width: 100%;
          }

          .leden-tabel {
            font-size: 14px;
          }

          .leden-tabel th,
          .leden-tabel td {
            padding: 12px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ClubMembersPage;
