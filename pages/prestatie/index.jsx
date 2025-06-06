"use client";

import React, { useEffect, useState } from "react";
import {
  fetchCurrentUser,
  fetchClubs,
  fetchUserById,
} from "../../src/services/api";
import { CheckCircleIcon } from "@heroicons/react/24/solid/index.js";
import Loading from "../../components/Loading";

const PrestatiePage = () => {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState([]);
  const [opponents, setOpponents] = useState({});

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
                <span className="stat-number">
                  {member.vechterInfo?.koWins || 0}
                </span>
                <span className="stat-name">KO Wins</span>
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
                <span className="stat-number">
                  {member.vechterInfo?.gewicht} kg
                </span>
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
                member.vechterInfo?.verzekering
                  ? "insurance-ok"
                  : "insurance-error"
              }`}
            >
              {member.vechterInfo?.verzekering ? "Geldig" : "Niet geldig"}
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

      <style jsx>{`
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
        }

        /* Tablet styles */
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
      `}</style>
    </div>
  );
};

export default PrestatiePage;
