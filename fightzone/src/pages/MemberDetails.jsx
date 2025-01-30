import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserById, fetchUsers } from "../services/api";
import "../assets/styles/pages/MemberDetails.css";

const MemberDetails = () => {
  const { id } = useParams(); // ID van de gebruiker uit de URL
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); // Om tegenstanders op te halen

  useEffect(() => {
    const loadMember = async () => {
      try {
        const allUsers = await fetchUsers(); // Haal alle gebruikers op
        setUsers(allUsers);

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

    loadMember();
  }, [id]);

  if (loading) return <p>Gegevens worden geladen...</p>;
  if (!member) return <p>Geen gegevens gevonden voor dit lid.</p>;

  // Leeftijd berekenen
  const calculateAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  };

  // Functie om tegenstander details op te halen
  const getOpponentDetails = (opponentId) => {
    return users.find((user) => user._id === opponentId);
  };

  return (
    <div className="member-details">
      {/* Header */}
      <div className="header">
        <img src={member.profielfoto} alt={member.voornaam} className="profile-image" />
        <div className="details">
          <h1>{member.voornaam} {member.achternaam}</h1>
          <p className="nickname">"{member.vechterInfo.bijnaam}"</p>
          <p className="record">Leeftijd: {calculateAge(member.geboortedatum)}</p>
          <p className="highlight">{member.club}</p>
        </div>
      </div>

      {/* Stats */}
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
          <h2>{member.vechterInfo.klasse}</h2>
          <p>Klasse</p>
        </div>
      </div>

      {/* Info */}
      <div className="info">
        <h2>Info</h2>
        <table>
          <tbody>
            <tr>
              <td>Verzekering</td>
              <td className={member.vechterInfo.verzekering ? "valid" : "invalid"}>
                {member.vechterInfo.verzekering ? "Geldig" : "Niet geldig"}
              </td>
            </tr>
            <tr>
              <td>Fighting Ready</td>
              <td className={member.vechterInfo.fightingReady ? "valid" : "invalid"}>
                {member.vechterInfo.fightingReady ? "Ja" : "Nee"}
              </td>
            </tr>
            <tr>
              <td>Club</td>
              <td>{member.club}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{member.email}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Fight History */}
      <div className="fight-history">
        <h2>Fight History</h2>
        {member.vechterInfo.fights.length > 0 ? (
          member.vechterInfo.fights.map((fight, index) => {
            const opponent = getOpponentDetails(fight.tegenstander.$oid);
            return (
              <div key={index} className="fight">
                <p>
                  <strong>{new Date(fight.datum.$date).toLocaleDateString()}</strong> - {fight.event}
                </p>
                <p>Locatie: {fight.locatie}</p>
                {opponent ? (
                  <p>
                    Tegenstander: <strong>{opponent.voornaam} {opponent.achternaam}</strong>
                  </p>
                ) : (
                  <p>Tegenstander: Onbekend</p>
                )}
                <p>Resultaat: <strong>{fight.resultaat}</strong></p>
              </div>
            );
          })
        ) : (
          <p>Geen gevechten gevonden</p>
        )}
      </div>
    </div>
  );
};

export default MemberDetails;
