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

  return (
    <div className="member-details">
      <div className="back-button-container">
        <Link href={`/clubs/${member.club}/leden`} className="back-button">
          ← Terug naar ledenoverzicht
        </Link>
      </div>
      <div className="member-card">
        <div className="member-header">
          <img
            src={member.profielfoto}
            alt={member.voornaam}
            className="profile-image"
          />
          <div className="details">
            <h1>
              {member.voornaam} {member.achternaam}
            </h1>
            <p className="nickname">"{member.vechterInfo.bijnaam}"</p>
            <p className="club">{getClubName(member.club)}</p>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <h2>{member.vechterInfo.gewicht} kg</h2>
            <p>Gewicht</p>
          </div>
          <div className="stat">
            <h2>{member.vechterInfo.lengte} cm</h2>
            <p>Lengte</p>
          </div>
          <div className="stat">
            <h2>{calculateAge(member.geboortedatum)}</h2>
            <p>Leeftijd</p>
          </div>
          <div className="stat">
            <h2>{member.vechterInfo.klasse}</h2>
            <p>Klasse</p>
          </div>
        </div>

        <div className="info">
          <h2>Informatie</h2>
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
          <h2>Vechtgeschiedenis</h2>
          {member.vechterInfo.fights.length > 0 ? (
            <table className="fight-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Event</th>
                  <th>Locatie</th>
                  <th>Tegenstander</th>
                  <th>Resultaat</th>
                </tr>
              </thead>
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
                              src={opponent.profielfoto}
                              alt={opponent.voornaam}
                              className="opponent-img"
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
        body {
          color: #00000;
          background-color: #f9fafb;
        }
        .member-details {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .back-button-container {
          width: 100%;
          max-width: 800px;
          margin-bottom: 20px;
        }

        .back-button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #3483fe;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .back-button:hover {
          background-color: #2962cc;
        }

        .member-card {
          width: 100%;
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .member-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .profile-image {
          width: 120px;
          height: 120px;
          object-fit: contain;
          border-radius: 50%;
        }

        .details h1 {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }

        .nickname {
          font-style: italic;
          color: #555;
        }

        .club {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .stats {
          display: flex;
          gap: 1rem;
          margin: 2rem 0;
        }

        .stat {
          flex: 1;
          text-align: center;
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
        }

        .info {
          background: #fff;
          padding: 1rem;
          border-radius: 8px;
        }

        .info table {
          width: 100%;
        }

        .info td {
          padding: 0.5rem;
        }

        .valid {
          color: #10b981;
        }

        .invalid {
          color: #ef4444;
        }

        .fight-history {
          background: white;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          margin-top: 2rem;
        }

        .fight-history h2 {
          margin-bottom: 1rem;
        }

        .fight-table {
          width: 100%;
          border-collapse: collapse;
        }

        .fight-table th,
        .fight-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
        }

        .fight-table th {
          background: #f3f4f6;
          font-weight: bold;
        }

        .opponent-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: contain;
          margin-right: 8px;
          vertical-align: middle;
        }

        .win {
          color: #10b981;
          font-weight: bold;
        }

        .loss {
          color: #ef4444;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default MemberDetails;
