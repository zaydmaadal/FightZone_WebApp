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
      [
        `${user.voornaam} ${user.achternaam}`,
        `${user.vechterInfo?.gewicht || "Onbekend"} kg`,
        calculateAge(user.geboortedatum),
        user.vechterInfo?.klasse || "Onbekend",
      ]
        .join(" ")
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
          <h1 className="leden-title">{club.naam}</h1>
          <Link href="/clubs" className="back-button">
            <svg
              className="arrow-left-circle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              width="24"
              height="24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
              />
            </svg>
            Terug
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

      <div className="button-group">
        <button onClick={exportToCSV} className="filter-button">
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

      <input
        type="text"
        className="search-input"
        placeholder={
          isMobile
            ? "Zoek lid..."
            : "Zoek op naam, gewicht, leeftijd of klasse..."
        }
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="table-responsive">
        <table className="leden-tabel">
          <thead>
            <tr>
              <th className="name-column">Naam</th>
              {!isMobile && <th className="weight-column">Gewicht</th>}
              <th className="age-column">Leeftijd</th>
              {!isMobile && <th className="class-column">Klasse</th>}
              <th className="insurance-column">Verzekering</th>
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
                  <td className="name-column">
                    {user.voornaam} {user.achternaam}
                  </td>
                  {!isMobile && (
                    <td className="weight-column">
                      -{user.vechterInfo?.gewicht || "Onbekend"} kg
                    </td>
                  )}
                  <td className="age-column">
                    {calculateAge(user.geboortedatum)}
                  </td>
                  {!isMobile && (
                    <td className="class-column">
                      {user.vechterInfo?.klasse || "Onbekend"}
                    </td>
                  )}
                  <td className="insurance-column">
                    <span
                      className={`insurance-badge insurance-${
                        checkInsuranceStatus(user.vechterInfo).type
                      }`}
                    >
                      {isMobile
                        ? checkInsuranceStatus(user.vechterInfo)
                            .text.replace("Verloopt over", "")
                            .replace("dagen", "Dagen")
                        : checkInsuranceStatus(user.vechterInfo).text}
                    </span>
                  </td>
                  <td className="action-column">
                    <button
                      onClick={(e) => handleDelete(e, user._id)}
                      className="delete-button"
                      title="Verwijder lid"
                    >
                      <TrashIcon
                        className="delete-icon"
                        width={20}
                        height={20}
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isMobile ? "4" : "6"} className="no-results">
                  Geen vechters gevonden
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
          margin-bottom: 20px;
        }

        .title-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          background-color: #3483fe;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .back-button:hover {
          background-color: #2a6cd6;
        }

        .arrow-left-circle {
          width: 24px;
          height: 24px;
        }

        @media (max-width: 768px) {
          .back-button {
            padding: 0.6rem 1.2rem;
            font-size: 14px;
          }

          .arrow-left-circle {
            width: 20px;
            height: 20px;
          }
        }

        .leden-title {
          font-size: 1.5rem;
          color: var(--text-color);
          margin: 0;
        }

        @media (min-width: 768px) {
          .leden-title {
            font-size: 2rem;
          }
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

        .button-group {
          display: flex;
          width: 100%;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 25px;
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

        .search-input {
          width: 100%;
          padding: 10px 15px;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 15px;
          background-color: #f9fafb;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 80px;
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
          padding: 24px 8px;
          border-bottom: 1px solid rgba(213, 213, 213, 0.5);
          white-space: nowrap;
        }

        .leden-tabel td {
          padding: 24px 8px;
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
        .name-column {
          width: 35%;
          min-width: 100px;
        }

        .weight-column {
          width: 15%;
          min-width: 60px;
          display: none;
        }

        .age-column {
          width: 12%;
          min-width: 50px;
        }

        .class-column {
          width: 15%;
          min-width: 70px;
          display: none;
        }

        .insurance-column {
          width: 30%;
          min-width: 90px;
        }

        .action-column {
          width: 8%;
          min-width: 30px;
        }

        .insurance-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 13px;
          white-space: nowrap;
        }

        @media (max-width: 944px) {
          .leden-tabel {
            font-size: 14px;
          }

          .leden-tabel th,
          .leden-tabel td {
            padding: 20px 6px;
            text-align: center;
          }

          .leden-tabel th {
            padding: 20px 8px;
          }

          .insurance-badge {
            padding: 6px 10px;
            font-size: 12px;
          }

          .trainers-list {
            flex-direction: column;
          }

          .trainer-card {
            width: 100%;
          }
        }

        @media (min-width: 945px) {
          .leden-tabel {
            font-size: 15px;
          }

          .leden-tabel th,
          .leden-tabel td {
            padding: 24px 12px;
            text-align: center;
          }

          .name-column {
            width: 25%;
          }

          .weight-column,
          .class-column {
            display: table-cell;
          }

          .age-column {
            width: 10%;
          }

          .class-column {
            width: 15%;
          }

          .insurance-column {
            width: 25%;
          }

          .action-column {
            width: 8%;
          }

          .insurance-badge {
            padding: 8px 14px;
            font-size: 14px;
          }
        }

        @media (max-width: 360px) {
          .leden-tabel th,
          .leden-tabel td {
            padding: 20px 6px;
            font-size: 11px;
          }

          .insurance-badge {
            padding: 5px 8px;
            font-size: 11px;
          }

          .delete-icon {
            width: 16px;
            height: 16px;
          }

          .trainer-card {
            padding: 10px;
          }

          .trainer-profile-img {
            width: 60px;
            height: 60px;
          }

          .trainer-name {
            font-size: 1em;
          }

          .trainer-birthdate {
            font-size: 0.8em;
          }
        }

        .insurance-ok {
          background-color: rgba(0, 182, 155, 0.2);
          color: #00b69b;
        }

        .insurance-warning {
          background-color: rgba(255, 196, 47, 0.2);
          color: #ffc42f;
        }

        .insurance-error {
          background-color: rgba(239, 56, 38, 0.2);
          color: #ef3826;
        }

        .delete-button {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .delete-button:hover {
          background-color: rgba(239, 56, 38, 0.1);
        }

        .delete-icon {
          color: #ef3826;
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
      `}</style>
    </div>
  );
};

export default ClubMembersPage;
