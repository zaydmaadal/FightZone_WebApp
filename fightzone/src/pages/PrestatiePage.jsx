import React, { useEffect, useState } from "react";
import { fetchCurrentUser, fetchClubs } from "../services/api";
import "../assets/styles/pages/MemberDetails.css";

const PrestatiePage = () => {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    const loadMember = async () => {
      try {
        const [currentUser, clubsData] = await Promise.all([
          fetchCurrentUser(), // Haal de huidige gebruiker op
          fetchClubs(),
        ]);
        setMember(currentUser);
        setClubs(clubsData);
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

  if (loading) return <p>Gegevens worden geladen...</p>;
  if (!member) return <p>Geen gegevens gevonden voor dit lid.</p>;

  const calculateAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  };

  // Functie om tegenstander details op te halen
  const getOpponentDetails = (opponentId) => {
    // Omdat we geen `users`-lijst hebben, kunnen we dit alleen doen als de tegenstander in de gevechten is opgenomen
    return member.vechterInfo.fights.find(
      (fight) => fight.tegenstander.$oid === opponentId
    );
  };

  return (
    <div className="member-details">
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

        {/* ✅ Vechtgeschiedenis Sectie */}
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
                  const opponent = getOpponentDetails(fight.tegenstander.$oid);
                  return (
                    <tr key={index}>
                      <td>
                        {new Date(fight.datum.$date).toLocaleDateString()}
                      </td>
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
    </div>
  );
};

export default PrestatiePage;
