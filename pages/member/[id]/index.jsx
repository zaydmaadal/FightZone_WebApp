"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  fetchUsers,
  fetchClubs,
  fetchUserById,
  fetchCurrentUser,
} from "../../../src/services/api";
import Link from "next/link";
import {
  CheckCircleIcon,
  ArrowLeftCircleIcon,
} from "@heroicons/react/24/solid/index.js";
import { PencilSquareIcon } from "@heroicons/react/24/outline/index.js";
import { ArrowLeftCircleIcon as OutlineArrowLeftCircleIcon } from "@heroicons/react/24/outline/index.js";
import Loading from "../../../components/Loading";

const MemberDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [member, setMember] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [opponents, setOpponents] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [memberData, currentUserData] = await Promise.all([
          fetchUserById(id),
          fetchCurrentUser(),
        ]);
        setMember(memberData);
        setCurrentUser(currentUserData);

        // Fetch opponent details for each fight
        if (memberData?.vechterInfo?.fights) {
          const opponentPromises = memberData.vechterInfo.fights.map(
            async (fight) => {
              if (fight.tegenstander) {
                try {
                  const opponentData = await fetchUserById(fight.tegenstander);
                  return { [fight.tegenstander]: opponentData };
                } catch (error) {
                  console.error(
                    `Fout bij ophalen tegenstander ${fight.tegenstander}:`,
                    error
                  );
                  return null;
                }
              }
              return null;
            }
          );

          const opponentResults = await Promise.all(opponentPromises);
          const opponentMap = opponentResults.reduce((acc, curr) => {
            if (curr) {
              return { ...acc, ...curr };
            }
            return acc;
          }, {});
          setOpponents(opponentMap);
        }
      } catch (error) {
        console.error("Error loading member:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const getClubName = (clubId) => {
    if (!clubs.length) return "Laden...";
    const club = clubs.find((c) => c._id === clubId);
    return club ? club.naam : "Onbekende club";
  };

  if (loading) return <Loading />;
  if (!member) return <p>Geen gegevens gevonden voor dit lid.</p>;

  const calculateAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  };

  const getOpponentInfo = (tegenstanderId) => {
    if (!tegenstanderId) return null;
    return opponents[tegenstanderId] || null;
  };

  const getBackLink = () => {
    if (!currentUser) return "/ledenlijst"; // Fallback if current user not loaded

    const userRole = currentUser.role.toLowerCase();
    if (userRole === "trainer" || userRole === "vkbmo") {
      return "/ledenlijst";
    }
    return `/clubs/${member.club}/leden`;
  };

  const getBackText = () => {
    if (!currentUser) return "Terug naar ledenoverzicht"; // Fallback if current user not loaded

    const userRole = currentUser.role.toLowerCase();
    if (userRole === "trainer" || userRole === "vkbmo") {
      return "Terug naar ledenoverzicht";
    }
    return "Terug naar club leden";
  };

  const handleEditClick = (field) => {
    setEditingField(field);
    setEditValue(member.vechterInfo[field] || "");
  };

  const handleSave = async (field) => {
    try {
      // Here you would typically make an API call to update the value
      // For now, we'll just update the local state
      const updatedMember = {
        ...member,
        vechterInfo: {
          ...member.vechterInfo,
          [field]: editValue,
        },
      };
      setMember(updatedMember);
      setEditingField(null);
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  return (
    <div className="profile-page">
      <div className="back-button-container">
        <Link href={getBackLink()} className="back-button">
          <OutlineArrowLeftCircleIcon
            style={{ width: "24px", height: "24px" }}
          />
          Terug
        </Link>
      </div>

      <div className="page-content">
        <div className="profile-header">
          <div className="fighter-photo-container">
            <img
              className="fighter-photo"
              src={member.profielfoto}
              alt={member.voornaam}
            />
          </div>
          <div className="fighter-right-info">
            <div className="fighter-info">
              <h1>
                {member.voornaam} {member.achternaam}
              </h1>
              <h2>"{member.vechterInfo.bijnaam}"</h2>
              <p className="record">24-9-5 (W-L-D)</p>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <button
                  className="edit-button"
                  onClick={() => handleEditClick("lengte")}
                  aria-label="Bewerk lengte"
                >
                  <PencilSquareIcon
                    style={{ width: "20px", height: "20px", color: "#000000" }}
                  />
                </button>
                {editingField === "lengte" ? (
                  <div className="edit-container">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                      placeholder="Lengte in cm"
                    />
                    <div className="edit-actions">
                      <button
                        onClick={() => handleSave("lengte")}
                        className="save-button"
                      >
                        Opslaan
                      </button>
                      <button onClick={handleCancel} className="cancel-button">
                        Annuleren
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="stat-number">
                    {member.vechterInfo.lengte || "-"} cm
                  </span>
                )}
                <span className="stat-name">Lengte</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {calculateAge(member.geboortedatum)}
                </span>
                <span className="stat-name">Leeftijd</span>
              </div>
              <div className="stat-item">
                <button
                  className="edit-button"
                  onClick={() => handleEditClick("klasse")}
                  aria-label="Bewerk klasse"
                >
                  <PencilSquareIcon
                    style={{ width: "20px", height: "20px", color: "#000000" }}
                  />
                </button>
                {editingField === "klasse" ? (
                  <div className="edit-container">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                      placeholder="Klasse"
                    />
                    <div className="edit-actions">
                      <button
                        onClick={() => handleSave("klasse")}
                        className="save-button"
                      >
                        Opslaan
                      </button>
                      <button onClick={handleCancel} className="cancel-button">
                        Annuleren
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="stat-number">
                    {member.vechterInfo.klasse?.charAt(0) || "-"}
                  </span>
                )}
                <span className="stat-name">Klasse</span>
              </div>
              <div className="stat-item">
                <button
                  className="edit-button"
                  onClick={() => handleEditClick("gewicht")}
                  aria-label="Bewerk gewicht"
                >
                  <PencilSquareIcon
                    style={{ width: "20px", height: "20px", color: "#000000" }}
                  />
                </button>
                {editingField === "gewicht" ? (
                  <div className="edit-container">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                      placeholder="Gewicht in kg"
                    />
                    <div className="edit-actions">
                      <button
                        onClick={() => handleSave("gewicht")}
                        className="save-button"
                      >
                        Opslaan
                      </button>
                      <button onClick={handleCancel} className="cancel-button">
                        Annuleren
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="stat-number">
                    {member.vechterInfo.gewicht} kg
                  </span>
                )}
                <span className="stat-name">Gewicht</span>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3 className="section-title">Info</h3>
          <div className="info-item">
            <span className="info-label">Verzekering</span>
            <span
              className={`insurance-badge ${
                member.vechterInfo.verzekering
                  ? "insurance-ok"
                  : "insurance-error"
              }`}
            >
              {member.vechterInfo.verzekering ? "Geldig" : "Niet geldig"}
            </span>
          </div>
          <div className="divider"></div>
          <div className="info-item">
            <span className="info-label">Fighting Ready</span>
            <span className="info-value">
              {member.vechterInfo.fightingReady ? (
                <div className="check-icon-wrapper">
                  <CheckCircleIcon className="check-icon" />
                </div>
              ) : (
                "Nee"
              )}
            </span>
          </div>
          <div className="divider"></div>
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{member.email}</span>
          </div>
        </div>

        <div className="fight-history">
          <h3 className="section-title">Fight History</h3>
          {member.vechterInfo.fights.length > 0 ? (
            member.vechterInfo.fights.map((fight, index) => {
              const opponent = getOpponentInfo(fight.tegenstander);
              return (
                <div key={index} className="fight-card">
                  <div className="fight-header">
                    <span className="fight-event">{fight.event}</span>
                    <span className="fight-date-location">
                      {new Date(fight.datum).toLocaleDateString()} -{" "}
                      {fight.locatie}
                    </span>
                  </div>
                  <div className="fighters-container">
                    <div className="fighter-left">
                      <div className="fighter-photo-small">
                        <img src={member.profielfoto} alt={member.voornaam} />
                      </div>
                      <div className="fighter-details">
                        <span className="fighter-name">
                          {member.voornaam} {member.achternaam}
                        </span>
                        <span className="fighter-record">
                          {member.vechterInfo.record || "0-0-0"}
                        </span>
                      </div>
                    </div>
                    <div className="fighter-right">
                      <div className="fighter-details">
                        <span className="fighter-name">
                          {opponent
                            ? `${opponent.voornaam} ${opponent.achternaam}`
                            : "Onbekend"}
                        </span>
                        <span className="fighter-record">
                          {opponent?.vechterInfo?.record || "0-0-0"}
                        </span>
                      </div>
                      <div className="fighter-photo-small">
                        <img
                          src={opponent?.profielfoto || "/default-avatar.png"}
                          alt={
                            opponent
                              ? `${opponent.voornaam} ${opponent.achternaam}`
                              : "Onbekend"
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="divider"></div>
                </div>
              );
            })
          ) : (
            <p className="no-fights">Geen gevechten gevonden</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .back-button-container {
          margin-bottom: 20px;
          padding: 0 20px;
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

        .fighter-right-info {
          display: flex;
          flex-direction: column;
          margin: auto;
        }

        .profile-page {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .page-content {
          max-width: 100%;
          padding: 20px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .profile-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0px;
          width: 100%;
        }

        .fighter-photo-container {
          min-width: 80px;
          width: 80px;
          height: 80px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .fighter-photo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .fighter-info {
          flex: 1;
          min-width: 0;
          margin-top: 18px;
        }

        .fighter-info h1 {
          font-size: 1.5rem;
          margin: 0;
          color: #222;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fighter-info h2 {
          font-size: 1rem;
          margin: 4px 0;
          color: #666;
          font-weight: normal;
          font-style: italic;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .record {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          width: 100%;
          margin: 0px;
          position: relative;
        }

        .stat-item {
          padding: 4px;
          text-align: center;
          position: relative;
        }

        .stat-number {
          display: block;
          font-size: 1.1rem;
          font-weight: bold;
          color: #222;
          margin-bottom: 4px;
          position: relative;
        }

        .stat-number:after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 25%;
          right: 25%;
          height: 3px;
          background-color: black;
          border-radius: 2px;
        }

        .stat-name {
          display: block;
          font-size: 0.8rem;
          color: #666;
          margin-top: 8px;
        }

        .stat-item:nth-child(1)::after,
        .stat-item:nth-child(3)::after {
          content: "";
          position: absolute;
          right: 0;
          top: 30%;
          bottom: 30%;
          width: 1px;
          background-color: rgba(0, 0, 0, 0.1);
        }

        .stat-item:nth-child(1)::before,
        .stat-item:nth-child(2)::before {
          content: "";
          position: absolute;
          left: 30%;
          right: 30%;
          bottom: 0;
          height: 1px;
          background-color: rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: 1.2rem;
          color: #222;
          margin: 0px 0 16px 0;
          padding-bottom: 8px;
        }

        .info-section {
          border-radius: 8px;
          padding: 0px;
          margin-bottom: 24px;
          width: 100%;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
        }

        .info-label {
          font-weight: 800;
          color: #222;
          font-size: 0.9em;
          color: #37393a;
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

        .insurance-error {
          background-color: rgba(239, 56, 38, 0.2);
          color: #ef3826;
        }

        .info-value {
          color: #444;
          display: flex;
          align-items: center;
        }

        .divider {
          height: 1px;
          background-color: rgba(32, 34, 36, 0.1);
          margin: 0 -16px;
        }

        .fight-card {
          border-radius: 8px;
          padding: 0px;
          margin-bottom: 16px;
          width: 100%;
        }

        .fight-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .fight-event {
          font-weight: bold;
          color: #222;
        }

        .fight-date-location {
          color: #666;
          font-size: 0.9rem;
        }

        .fighters-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 16px 0;
          flex-wrap: wrap;
          gap: 12px;
        }

        .fighter-left,
        .fighter-right {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }

        .fighter-right {
          text-align: right;
        }

        .fighter-photo-small {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 8px;
          flex-shrink: 0;
        }

        .fighter-photo-small img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .fighter-details {
          min-width: 0;
          flex: 1;
          padding: 0 8px;
        }

        .fighter-name {
          display: block;
          font-weight: bold;
          color: #222;
          font-size: 0.8em;
          white-space: normal;
          word-wrap: break-word;
          line-height: 1.2;
        }

        .fight-history {
          margin-bottom: 60px;
        }

        .fighter-record {
          display: block;
          font-size: 0.8rem;
          color: #666;
        }

        .no-fights {
          text-align: center;
          color: #666;
          padding: 16px;
        }

        .edit-button {
          position: absolute;
          top: 8px;
          right: 8px;
          background-color: #ffd56a;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          min-width: 36px;
          min-height: 36px;
        }

        .edit-button:hover {
          background-color: #ffc94a;
          transform: scale(1.05);
        }

        .edit-button svg {
          width: 20px;
          height: 20px;
          color: #000000 !important;
          stroke: #000000 !important;
          fill: none !important;
        }

        .edit-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .edit-input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          width: 100%;
          text-align: center;
        }

        .edit-actions {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .save-button,
        .cancel-button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }

        .save-button {
          background-color: #3483fe;
          color: white;
        }

        .save-button:hover {
          background-color: #2a6cd6;
        }

        .cancel-button {
          background-color: #f5f5f5;
          color: #666;
        }

        .cancel-button:hover {
          background-color: #e5e5e5;
        }

        @media (max-width: 767px) {
          .profile-header {
            align-items: center;
          }
          .check-icon-wrapper {
            width: 22px;
            height: 22px;
          }
          .page-content {
            padding: 15px;
          }

          .fighter-photo-container {
            width: 50%;
            height: 100%;
            min-width: 70px;
          }

          .fighter-info h1 {
            font-size: 1.1rem;
          }
          .fighter-info h2 {
            font-size: 1rem;
          }
          .fighter-info p {
            font-size: 0.9rem;
          }

          .fight-header {
            flex-direction: column;
            gap: 4px;
          }

          .fight-event,
          .fight-date-location {
            width: 100%;
            text-align: left;
          }

          .fighters-container {
            flex-direction: row;
            align-items: stretch;
          }

          .fighter-left,
          .fighter-right {
            justify-content: center;
            margin: 8px 0;
          }

          .edit-button {
            top: 4px;
            right: 4px;
            padding: 6px;
            min-width: 32px;
            min-height: 32px;
          }

          .edit-button svg {
            width: 18px;
            height: 18px;
            color: #000000 !important;
            stroke: #000000 !important;
            fill: none !important;
          }

          .edit-input {
            font-size: 0.9rem;
            padding: 6px;
          }

          .save-button,
          .cancel-button {
            padding: 4px 8px;
            font-size: 0.8rem;
          }
        }

        @media (min-width: 768px) {
          .check-icon-wrapper {
            width: 24px;
            height: 24px;
          }
          .page-content {
            max-width: 95%;
            padding: 30px 20px;
          }

          .profile-header {
            align-items: center;
          }

          .fighter-photo-container {
            width: 45%;
            height: 100%;
            min-width: 120px;
          }

          .fighter-info h1 {
            font-size: 1.8rem;
            white-space: normal;
          }

          .fighter-info h2 {
            font-size: 1.2rem;
            white-space: normal;
          }

          .record {
            font-size: 1.1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 15px;
          }

          .stat-item {
            padding: 15px;
          }

          .stat-number {
            font-size: 1.3rem;
          }

          .stat-name {
            font-size: 0.9rem;
          }

          .section-title {
            font-size: 1.4rem;
          }

          .fighter-photo-small {
            width: 60px;
            height: 60px;
          }

          .fighter-name {
            font-size: 0.9em;
          }

          .stat-item:nth-child(1)::after,
          .stat-item:nth-child(3)::after {
            top: 25%;
            bottom: 25%;
          }

          .stat-item:nth-child(1)::before,
          .stat-item:nth-child(2)::before {
            left: 25%;
            right: 25%;
          }
        }

        @media (min-width: 1024px) {
          .check-icon-wrapper {
            width: 24px;
            height: 24px;
          }
          .page-content {
            max-width: 95%;
          }

          .profile-header {
            margin-bottom: 30px;
          }

          .fighter-photo-container {
            width: 52%;
            height: 100%;
          }

          .fighter-info h1 {
            font-size: 2rem;
          }

          .fighter-info h2 {
            font-size: 1.4rem;
          }

          .record {
            font-size: 1.2rem;
          }

          .stats-grid {
            gap: 5px;
            margin-top: 25px;
          }

          .stat-item {
            padding: 30px;
            position: relative;
            z-index: 1;
          }

          .stat-number {
            font-size: 2rem;
            margin-bottom: 12px;
            font-weight: 700;
          }

          .stat-number:after {
            height: 4px;
            bottom: -8px;
            left: 20%;
            right: 20%;
          }

          .stat-name {
            font-size: 1.8rem;
            margin-top: 16px;
            font-weight: 700;
            color: black;
          }

          .section-title {
            font-size: 1.6rem;
            margin-bottom: 20px;
          }

          .info-section {
            padding: 0px;
          }

          .info-item {
            padding: 15px 0;
          }

          .info-label {
            font-size: 1em;
          }

          .fighter-photo-small {
            width: 70px;
            height: 70px;
          }

          .fighter-name {
            font-size: 1em;
          }

          .stat-item:nth-child(1)::after,
          .stat-item:nth-child(3)::after {
            top: 20%;
            bottom: 20%;
          }

          .stat-item:nth-child(1)::before,
          .stat-item:nth-child(2)::before {
            left: 20%;
            right: 20%;
          }
        }

        @media (max-width: 768px) {
          .back-button {
            padding: 0.6rem 1.2rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MemberDetails;
