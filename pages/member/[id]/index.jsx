"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchUsers, fetchClubs } from "../../../src/services/api";
import Link from "next/link";

const MemberDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    const loadMember = async () => {
      try {
        const [allUsers, clubsData] = await Promise.all([
          fetchUsers(),
          fetchClubs(),
        ]);
        setUsers(allUsers);
        setClubs(clubsData);

        const selectedUser = allUsers.find((user) => user._id === id);
        if (selectedUser) {
          setMember(selectedUser);
        }
      } catch (error) {
        console.error("Fout bij het ophalen van lid:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMember();
    }
  }, [id]);

  const getClubName = (clubId) => {
    if (!clubs.length) return "Laden...";
    const club = clubs.find((c) => c._id === clubId);
    return club ? club.naam : "Onbekende club";
  };
  if (loading) return <p>Gegevens worden geladen...</p>;
  if (!member) return <p>Geen gegevens gevonden voor dit lid.</p>;

  const calculateAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  };

  const getOpponentDetails = (opponentId) => {
    return users.find((user) => user._id === opponentId);
  };

  if (loading) return <p>Gegevens worden geladen...</p>;
  if (!member) return <p>Geen gegevens gevonden voor dit lid.</p>;

  return (
    <div className="profile-page">
      <div className="back-button-container">
        <Link href={`/ledenlijst`} className="back-button">
          ← Terug naar ledenoverzicht
        </Link>
      </div>

      <div className="profile-container">
        <div className="left">
          <img
            className="fighter-photo"
            src={member.profielfoto}
            alt={member.voornaam}
          />
        </div>

        <div className="right">
          <h1>
            {member.voornaam} {member.achternaam}
          </h1>
          <h2>"{member.vechterInfo.bijnaam}"</h2>
          <p className="record">24-9-5 (W-L-D)</p>
          <div className="tags">
            <span>Champion lightweight</span>
            <span>#3</span>
            <span>Actief</span>
            <span>{getClubName(member.club)}</span>
          </div>
          <div className="stats-grid">
            <div>
              <strong>{member.vechterInfo.koWins || 0}</strong>
              <p>KO Wins</p>
            </div>
            <div>
              <strong>{calculateAge(member.geboortedatum)}</strong>
              <p>Leeftijd</p>
            </div>
            <div>
              <strong>{member.vechterInfo.klasse}</strong>
              <p>Klasse</p>
            </div>
            <div>
              <strong>{member.vechterInfo.gewicht} kg</strong>
              <p>Gewicht</p>
            </div>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="info-block">
          <h3>Info</h3>
          <table>
            <tbody>
              <tr>
                <td>Verzekering</td>
                <td
                  className={
                    member.vechterInfo.verzekering ? "valid" : "invalid"
                  }
                >
                  {member.vechterInfo.verzekering ? "Geldig" : "Niet geldig"}
                </td>
              </tr>
              <tr>
                <td>Fighting Ready</td>
                <td
                  className={
                    member.vechterInfo.fightingReady ? "valid" : "invalid"
                  }
                >
                  {member.vechterInfo.fightingReady ? "Ja" : "Nee"}
                </td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{member.email}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="fight-history">
          <h3>Fight history</h3>
          {member.vechterInfo.fights.length > 0 ? (
            <table className="fight-table">
              <tbody>
                {member.vechterInfo.fights.map((fight, index) => {
                  const opponent = getOpponentDetails(fight.tegenstander);
                  return (
                    <tr key={index}>
                      <td>{new Date(fight.datum).toLocaleDateString()}</td>
                      <td>{fight.event}</td>
                      <td>{fight.locatie}</td>
                      <td>
                        {opponent ? (
                          <>
                            <img
                              className="opponent-img"
                              src={opponent.profielfoto}
                              alt={opponent.voornaam}
                            />
                            {opponent.voornaam} {opponent.achternaam}
                          </>
                        ) : (
                          "Onbekend"
                        )}
                      </td>
                      <td
                        className={
                          fight.resultaat === "Winnaar" ? "win" : "loss"
                        }
                      >
                        {fight.resultaat}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>Geen gevechten gevonden</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          padding: 40px;
          background-color: #f9f9f9;
        }

        .back-button-container {
          margin-bottom: 20px;
        }

        .back-button {
          padding: 10px 20px;
          background-color: #3483fe;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 500;
        }

        .profile-container {
          display: flex;
          background: transparent;
        }

        .left {
          flex: 1;
        }

        .fighter-photo {
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        .right {
          flex: 1;
          padding: 0 30px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .tags span {
          background-color: #e7f0ff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          margin-top: 20px;
          gap: 24px;
          margin-top: 24px;
        }

        .stats-grid div {
          text-align: center;
          background: #f0f4ff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .stats-grid strong {
          font-size: 2.4rem;
          display: block;
          color: #222;
        }

        .stats-grid p {
          font-weight: 600;
          margin-top: 8px;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-block table {
          width: 100%;
          border-spacing: 0 10px;
        }

        .info-block td {
          padding: 8px 10px;
          font-weight: 500;
        }

        .info-block td:first-child {
          color: #666;
          width: 150px;
        }

        .info-section {
          display: flex;
          margin-top: 40px;
          gap: 40px;
        }

        .info-block,
        .fight-history {
          flex: 1;
        }

        .fight-table {
          width: 100%;
        }

        .opponent-img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          margin-right: 6px;
          vertical-align: middle;
        }

        .valid {
          color: #10b981;
          font-weight: bold;
        }

        .invalid {
          color: #ef4444;
          font-weight: bold;
        }

        .win {
          color: #10b981;
        }

        .loss {
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .info-block td {
            font-size: 0.9rem;
          }

          .stats-grid strong {
            font-size: 1.6rem;
          }
        }

        @media (max-width: 768px) {
          .profile-container,
          .info-section {
            flex-direction: column;
          }

          .right {
            padding: 20px 0 0 0;
          }
        }
      `}</style>
    </div>
  );
};

export default MemberDetails;
