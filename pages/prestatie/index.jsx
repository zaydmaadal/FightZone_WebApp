"use client";

import React, { useEffect, useState } from "react";
import {
  fetchCurrentUser,
  fetchClubs,
  fetchUserById,
  updateVechter,
} from "../../src/services/api";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/solid/index.js";
import { PencilSquareIcon } from "@heroicons/react/24/outline/index.js";
import Loading from "../../components/Loading";

const PrestatiePage = () => {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState([]);
  const [opponents, setOpponents] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const loadMember = async () => {
      try {
        const [userData, clubsData] = await Promise.all([
          fetchCurrentUser(),
          fetchClubs(),
        ]);
        setMember(userData);
        setClubs(clubsData);

        // Fetch opponent details for each fight
        if (userData?.vechterInfo?.fights) {
          const opponentPromises = userData.vechterInfo.fights.map(
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
        console.error("Fout bij het ophalen van gegevens:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, []);

  const getClubName = (clubId) => {
    if (!clubs.length) return "Laden...";
    const club = clubs.find((c) => c._id === clubId);
    return club ? club.naam : "Onbekende club";
  };

  const calculateAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  };

  const getOpponentInfo = (tegenstanderId) => {
    if (!tegenstanderId) return null;
    return opponents[tegenstanderId] || null;
  };

  const handleEditClick = (field) => {
    setEditingField(field);
    setEditValue(member.vechterInfo[field] || "");
  };

  const handleSave = async (field) => {
    try {
      // Validate empty values
      if (!editValue.trim()) {
        alert("Waarde mag niet leeg zijn");
        return;
      }

      // Validate numeric fields
      if (field === "gewicht" || field === "lengte") {
        const numValue = Number(editValue);
        if (isNaN(numValue)) {
          alert("Ongeldige numerieke waarde");
          return;
        }

        // Add specific validation for weight and height
        if (field === "gewicht" && (numValue < 40 || numValue > 150)) {
          alert("Gewicht moet tussen 40 en 150 kg liggen");
          return;
        }
        if (field === "lengte" && (numValue < 140 || numValue > 220)) {
          alert("Lengte moet tussen 140 en 220 cm liggen");
          return;
        }
      }

      // Create update data object
      const updateData = {
        [field]:
          field === "gewicht" || field === "lengte"
            ? Number(editValue)
            : editValue.trim(),
      };

      // Show loading state
      setEditingField(null); // Temporarily hide edit UI

      // API call
      const response = await updateVechter(member._id, updateData);

      // Update local state with response data
      setMember(
        response.updatedUser || {
          ...member,
          vechterInfo: {
            ...member.vechterInfo,
            [field]: updateData[field],
          },
        }
      );

      // Show success message
    } catch (error) {
      console.error("Error updating field:", error);
      // Show error message to user
      alert(error.message || "Update mislukt");
      // Restore edit UI
      setEditingField(field);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
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
    } else if (daysUntilExpiry <= 30) {
      // Within 1 month
      return {
        text: `Verloopt over ${daysUntilExpiry} dagen`,
        type: "warning",
      };
    } else {
      return { text: "In Orde", type: "ok" };
    }
  };

  if (loading) return <Loading />;
  if (!member) return <p>Geen gegevens gevonden.</p>;

  return (
    <div className="profile-page">
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
              <h2>"{member.vechterInfo?.bijnaam}"</h2>
              <p className="record">{member.vechterInfo?.record || "0-0-0"}</p>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <button
                  className="edit-button"
                  onClick={() => handleEditClick("lengte")}
                  aria-label="Bewerk lengte"
                >
                  <PencilSquareIcon
                    style={{ width: "12px", height: "12px", color: "#000000" }}
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
                        aria-label="Opslaan"
                      >
                        <span className="button-text">Opslaan</span>
                        <CheckCircleIcon className="save-icon" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="cancel-button"
                        aria-label="Annuleren"
                      >
                        <span className="button-text">Annuleren</span>
                        <XMarkIcon className="cancel-icon" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="stat-number">
                    {member.vechterInfo?.lengte || "-"} cm
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
                <span className="stat-number">
                  {member.vechterInfo?.klasse?.charAt(0) || "-"}
                </span>
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
                        aria-label="Opslaan"
                      >
                        <span className="button-text">Opslaan</span>
                        <CheckCircleIcon className="save-icon" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="cancel-button"
                        aria-label="Annuleren"
                      >
                        <span className="button-text">Annuleren</span>
                        <XMarkIcon className="cancel-icon" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="stat-number">
                    {member.vechterInfo?.gewicht} kg
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
              className={`insurance-badge insurance-${
                checkInsuranceStatus(member.vechterInfo).type
              }`}
            >
              {checkInsuranceStatus(member.vechterInfo).text}
            </span>
          </div>
          <div className="divider"></div>
          <div className="info-item">
            <span className="info-label">Fighting Ready</span>
            <span className="info-value">
              {member.vechterInfo?.fightingReady ? (
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
          {member.vechterInfo?.fights?.length > 0 ? (
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
                          {member.vechterInfo?.record || "0-0-0"}
                        </span>
                      </div>
                    </div>
                    <div className="fighter-right">
                      <div className="fighter-details">
                        <span className="fighter-name">
                          {opponent
                            ? `${opponent.voornaam} ${opponent.achternaam}`
                            : fight.tegenstander}
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
                              : fight.tegenstander
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

      <style jsx global>{`
        .check-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #00b69b;
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
          padding-top: 12px;
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

        /* Add divider lines */
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
          background-color: #00b69b;
          color: white;
        }

        .insurance-warning {
          background-color: #ffc42f;
          color: black;
        }

        .insurance-error {
          background-color: #ef3826;
          color: white;
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

        .vs-circle {
          background-color: #f0f0f0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #666;
          flex-shrink: 0;
        }

        .fight-result {
          text-align: center;
          font-weight: bold;
          margin-top: 8px;
        }

        .win {
          color: #10b981;
        }

        .loss {
          color: #ef4444;
        }

        .no-fights {
          text-align: center;
          color: #666;
          padding: 16px;
        }

        .edit-button {
          position: absolute;
          top: 2px;
          right: 2px;
          background-color: #ffd56a;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
          z-index: 5;
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
          width: 20px !important;
          height: 20px !important;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
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

        .button-text {
          display: inline;
        }

        .save-icon,
        .cancel-icon {
          display: none;
          width: 20px;
          height: 20px;
        }

        .save-icon {
          color: white;
        }

        .cancel-icon {
          color: #666;
        }

        /* Mobile styles (unchanged) */
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

          .vs-circle {
            margin: 8px auto;
          }

          .edit-button {
            top: -2px;
            right: -2px;
            padding: 2px;
            min-width: 24px;
            min-height: 24px;
            box-shadow: none;
            z-index: 5;
          }

          .edit-button svg {
            width: 14px !important;
            height: 14px !important;
            color: #000000 !important;
            stroke: #000000 !important;
            fill: none !important;
          }

          .edit-container {
            flex-direction: column;
            align-items: center;
            gap: 4px;
            margin-top: 4px;
          }

          .edit-input {
            width: 60%;
            padding: 6px;
            font-size: 0.9rem;
            margin: 0;
          }

          .edit-actions {
            gap: 4px;
            flex: 1;
          }

          .save-button,
          .cancel-button {
            padding: 6px;
            min-width: 36px;
            min-height: 36px;
            border-radius: 50%;
          }

          .button-text {
            display: none;
          }

          .save-icon,
          .cancel-icon {
            display: block;
          }

          .save-icon {
            color: white;
          }

          .cancel-icon {
            color: #666;
          }

          .stat-item {
            padding-top: 16px;
          }
        }

        /* Tablet styles */
        @media (min-width: 768px) {
          .edit-button {
            top: 2px;
            right: 2px;
            padding: 6px;
            min-width: 24px;
            min-height: 24px;
            -webkit-box-shadow: none;
            -moz-box-shadow: none;
            box-shadow: none;
            z-index: 5;
          }
          .edit-button svg {
            width: 16px !important;
            height: 16px !important;
          }
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

        /* Desktop styles */
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
            font-size: 1.8rem;
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
            font-size: 1.6rem;
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

          .edit-button {
            padding: 8px;
          }
          .edit-button svg {
            width: 24px !important;
            height: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrestatiePage;
